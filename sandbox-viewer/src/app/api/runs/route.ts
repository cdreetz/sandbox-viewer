import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { RunMetadata } from '@/types'

const DEBUG_OUTPUT_PATH = path.join(process.cwd(), 'debug_output', 'runs')

export async function GET() {
  try {
    const runsDir = DEBUG_OUTPUT_PATH

    try {
      await fs.access(runsDir)
    } catch {
      return NextResponse.json([])
    }

    const entries = await fs.readdir(runsDir, { withFileTypes: true })
    const runDirs = entries.filter(e => e.isDirectory())

    const runs: RunMetadata[] = []

    for (const dir of runDirs) {
      const metadataPath = path.join(runsDir, dir.name, 'metadata.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      const metadata = JSON.parse(content) as RunMetadata
      runs.push(metadata)
    }

    // Sort by started_at descending (newest first)
    runs.sort((a, b) => {
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    })

    return NextResponse.json(runs)
  } catch (error) {
    console.error('Error reading runs:', error)
    return NextResponse.json({ error: 'Failed to read runs' }, { status: 500 })
  }
}
