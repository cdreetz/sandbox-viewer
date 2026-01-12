'use client'

import { useState } from 'react'
import { Command } from '@/types'
import styles from './CommandLog.module.css'

interface CommandLogProps {
  commands: Command[]
  loading?: boolean
}

interface CommandItemProps {
  command: Command
  index: number
}

function formatTime(timestamp: string): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function CommandItem({ command, index }: CommandItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasOutput = command.stdout || command.stderr || command.error
  const hasError = command.error || command.stderr

  return (
    <div className={`${styles.commandItem} ${hasError ? styles.hasError : ''}`}>
      <button
        className={styles.commandHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.index}>{index + 1}</span>
        {command.turn !== null && (
          <span className={styles.turn}>T{command.turn}</span>
        )}
        <span className={styles.time}>{formatTime(command.timestamp)}</span>
        <span className={styles.commandText}>{command.command}</span>
        <span className={styles.duration}>{command.duration_ms}ms</span>
        <span className={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div className={styles.output}>
          {command.tool_response ? (
            <div className={styles.stdout}>
              <div className={styles.outputLabel}>response</div>
              <pre className={styles.outputContent}>{command.tool_response}</pre>
            </div>
          ) : command.stdout ? (
            <div className={styles.stdout}>
              <div className={styles.outputLabel}>stdout</div>
              <pre className={styles.outputContent}>{command.stdout}</pre>
            </div>
          ) : null}
          {command.stderr && (
            <div className={styles.stderr}>
              <div className={styles.outputLabel}>stderr</div>
              <pre className={styles.outputContent}>{command.stderr}</pre>
            </div>
          )}
          {command.error && (
            <div className={styles.error}>
              <div className={styles.outputLabel}>error</div>
              <pre className={styles.outputContent}>{command.error}</pre>
            </div>
          )}
          {!hasOutput && !command.tool_response && (
            <div className={styles.noOutput}>(no output)</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CommandLog({ commands, loading }: CommandLogProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Commands</h3>
        <span className={styles.count}>{commands.length}</span>
      </div>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>Loading commands...</div>
        ) : commands.length === 0 ? (
          <div className={styles.empty}>No commands</div>
        ) : (
          commands.map((cmd, index) => (
            <CommandItem key={index} command={cmd} index={index} />
          ))
        )}
      </div>
    </div>
  )
}
