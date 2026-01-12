'use client'

import { RunMetadata } from '@/types'
import styles from './RunList.module.css'

interface RunListProps {
  runs: RunMetadata[]
  selectedRunId: string | null
  onSelectRun: (runId: string) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RunList({ runs, selectedRunId, onSelectRun }: RunListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Runs</h2>
        <span className={styles.count}>{runs.length}</span>
      </div>
      <div className={styles.list}>
        {runs.length === 0 ? (
          <div className={styles.empty}>No runs found</div>
        ) : (
          runs.map((run) => (
            <button
              key={run.run_id}
              className={`${styles.item} ${selectedRunId === run.run_id ? styles.selected : ''}`}
              onClick={() => onSelectRun(run.run_id)}
            >
              <div className={styles.runId}>{run.run_id}</div>
              <div className={styles.meta}>
                <span>{formatDate(run.started_at)}</span>
                <span>{run.rollout_count} rollouts</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
