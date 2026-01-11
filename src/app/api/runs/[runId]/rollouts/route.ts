import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { RolloutMetadata } from '@/types'

const DEBUG_OUTPUT_PATH = path.join(process.cwd(), 'debug_output', 'runs')

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const rolloutsDir = path.join(DEBUG_OUTPUT_PATH, params.runId, 'rollouts')

    try {
      await fs.access(rolloutsDir)
    } catch {
      return NextResponse.json([])
    }

    const entries = await fs.readdir(rolloutsDir, { withFileTypes: true })
    const rolloutDirs = entries.filter(e => e.isDirectory())

    const rollouts: RolloutMetadata[] = []

    for (const dir of rolloutDirs) {
      const metadataPath = path.join(rolloutsDir, dir.name, 'metadata.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      const metadata = JSON.parse(content) as RolloutMetadata
      rollouts.push(metadata)
    }

    // Sort by started_at ascending
    rollouts.sort((a, b) => {
      return new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
    })

    return NextResponse.json(rollouts)
  } catch (error) {
    console.error('Error reading rollouts:', error)
    return NextResponse.json({ error: 'Failed to read rollouts' }, { status: 500 })
  }
}
