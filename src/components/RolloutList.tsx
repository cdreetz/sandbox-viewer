'use client'

import { RolloutMetadata } from '@/types'
import styles from './RolloutList.module.css'

interface RolloutListProps {
  rollouts: RolloutMetadata[]
  selectedRolloutId: string | null
  onSelectRollout: (rolloutId: string) => void
  loading?: boolean
}

function formatDuration(startedAt: string, finishedAt: string): string {
  if (!startedAt || !finishedAt) return '-'
  const start = new Date(startedAt).getTime()
  const end = new Date(finishedAt).getTime()
  const durationMs = end - start

  if (durationMs < 1000) return `${durationMs}ms`
  if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`
  return `${(durationMs / 60000).toFixed(1)}m`
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function RolloutList({ rollouts, selectedRolloutId, onSelectRollout, loading }: RolloutListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Rollouts</h2>
        <span className={styles.count}>{rollouts.length}</span>
      </div>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : rollouts.length === 0 ? (
          <div className={styles.empty}>No rollouts</div>
        ) : (
          rollouts.map((rollout, index) => (
            <button
              key={rollout.rollout_id}
              className={`${styles.item} ${selectedRolloutId === rollout.rollout_id ? styles.selected : ''}`}
              onClick={() => onSelectRollout(rollout.rollout_id)}
            >
              <div className={styles.indexBadge}>{index + 1}</div>
              <div className={styles.content}>
                <div className={styles.rolloutId}>{rollout.rollout_id}</div>
                <div className={styles.meta}>
                  <span>{rollout.commands_count} cmds</span>
                  <span>{formatDuration(rollout.started_at, rollout.finished_at)}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
