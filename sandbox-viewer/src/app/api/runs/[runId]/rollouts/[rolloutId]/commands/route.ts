import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Command } from '@/types'

const DEBUG_OUTPUT_PATH = path.join(process.cwd(), 'debug_output', 'runs')

export async function GET(
  request: Request,
  { params }: { params: { runId: string; rolloutId: string } }
) {
  try {
    const commandsPath = path.join(
      DEBUG_OUTPUT_PATH,
      params.runId,
      'rollouts',
      params.rolloutId,
      'commands.jsonl'
    )

    const content = await fs.readFile(commandsPath, 'utf-8')
    const lines = content.trim().split('\n').filter(line => line.trim())
    const commands: Command[] = lines.map(line => JSON.parse(line) as Command)

    return NextResponse.json(commands)
  } catch (error) {
    console.error('Error reading commands:', error)
    return NextResponse.json({ error: 'Failed to read commands' }, { status: 500 })
  }
}
