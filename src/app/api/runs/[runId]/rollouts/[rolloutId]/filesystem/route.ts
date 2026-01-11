import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import * as tar from 'tar'
import { createReadStream } from 'fs'
import { createGunzip } from 'zlib'
import { FileNode } from '@/types'

const DEBUG_OUTPUT_PATH = path.join(process.cwd(), 'debug_output', 'runs')

interface TarEntry {
  path: string;
  type: string;
  size?: number;
}

export async function GET(
  request: Request,
  { params }: { params: { runId: string; rolloutId: string } }
) {
  try {
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

    // Parse the tar.gz to get file listing
    const entries: TarEntry[] = []

    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(tarPath)
        .pipe(createGunzip())
        .pipe(new tar.Parser())

      stream.on('entry', (entry: tar.ReadEntry) => {
        entries.push({
          path: entry.path,
          type: entry.type === 'Directory' ? 'directory' : 'file',
          size: entry.size,
        })
        entry.resume()
      })

      stream.on('end', resolve)
      stream.on('error', reject)
    })

    // Build tree structure
    const root: FileNode = {
      name: '/',
      path: '/',
      type: 'directory',
      children: [],
    }

    for (const entry of entries) {
      const parts = entry.path.split('/').filter(p => p)
      let current = root

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isLast = i === parts.length - 1
        const currentPath = '/' + parts.slice(0, i + 1).join('/')

        let child = current.children?.find(c => c.name === part)

        if (!child) {
          child = {
            name: part,
            path: currentPath,
            type: isLast ? (entry.type as 'file' | 'directory') : 'directory',
            children: isLast && entry.type === 'file' ? undefined : [],
            size: isLast ? entry.size : undefined,
          }
          current.children!.push(child)
        }

        current = child
      }
    }

    // Sort children: directories first, then files, alphabetically
    const sortChildren = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
        node.children.forEach(sortChildren)
      }
    }
    sortChildren(root)

    return NextResponse.json(root)
  } catch (error) {
    console.error('Error reading filesystem:', error)
    return NextResponse.json({ error: 'Failed to read filesystem' }, { status: 500 })
  }
}
