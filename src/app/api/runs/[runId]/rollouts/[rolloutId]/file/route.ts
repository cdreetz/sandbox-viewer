import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import * as tar from 'tar'
import { createReadStream } from 'fs'
import { createGunzip } from 'zlib'

const DEBUG_OUTPUT_PATH = path.join(process.cwd(), 'debug_output', 'runs')

export async function GET(
  request: Request,
  { params }: { params: { runId: string; rolloutId: string } }
) {
  try {
    const url = new URL(request.url)
    const filePath = url.searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 })
    }

    const tarPath = path.join(
      DEBUG_OUTPUT_PATH,
      params.runId,
      'rollouts',
      params.rolloutId,
      'filesystem.tar.gz'
    )

    try {
      await fs.access(tarPath)
    } catch {
      return NextResponse.json({ error: 'Filesystem archive not found' }, { status: 404 })
    }

    // Normalize the path (remove leading slash for tar matching)
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath

    // Extract specific file content from tar
    let fileContent: string | null = null
    let isBinary = false

    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(tarPath)
        .pipe(createGunzip())
        .pipe(new tar.Parser())

      stream.on('entry', async (entry: tar.ReadEntry) => {
        const entryPath = entry.path.replace(/\/$/, '')
        const targetPath = normalizedPath.replace(/\/$/, '')

        if (entryPath === targetPath && entry.type === 'File') {
          const chunks: Buffer[] = []

          entry.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
          })

          entry.on('end', () => {
            const buffer = Buffer.concat(chunks)
            // Check if binary
            const nullBytes = buffer.filter(b => b === 0).length
            isBinary = nullBytes > buffer.length * 0.1 // More than 10% null bytes = binary

            if (isBinary) {
              fileContent = `[Binary file, ${buffer.length} bytes]`
            } else {
              fileContent = buffer.toString('utf-8')
            }
          })
        } else {
          entry.resume()
        }
      })

      stream.on('end', resolve)
      stream.on('error', reject)
    })

    if (fileContent === null) {
      return NextResponse.json({ error: 'File not found in archive' }, { status: 404 })
    }

    return NextResponse.json({ content: fileContent, isBinary })
  } catch (error) {
    console.error('Error reading file:', error)
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
  }
}
