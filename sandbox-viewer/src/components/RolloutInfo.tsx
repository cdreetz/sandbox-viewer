'use client'

import { RolloutMetadata } from '@/types'
import styles from './RolloutInfo.module.css'

interface RolloutInfoProps {
  rollout: RolloutMetadata | null
}

export default function RolloutInfo({ rollout }: RolloutInfoProps) {
  if (!rollout) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Select a rollout to view details</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Rollout Info</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.label}>Prompt</div>
          <div className={styles.value}>
            {rollout.question || <span className={styles.empty}>Not available</span>}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Ground Truth</div>
          <div className={styles.value}>
            {rollout.answer || <span className={styles.empty}>Not available</span>}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Tools</div>
          <div className={styles.value}>
            {rollout.tools && rollout.tools.length > 0 ? (
              <div className={styles.toolsList}>
                {rollout.tools.map((tool, i) => (
                  <span key={i} className={styles.toolBadge}>{tool}</span>
                ))}
              </div>
            ) : (
              <span className={styles.empty}>Not available</span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Reward</div>
          <div className={styles.value}>
            {rollout.reward !== null ? (
              <span className={styles.reward}>{rollout.reward.toFixed(2)}</span>
            ) : (
              <span className={styles.empty}>Not available</span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Sandbox ID</div>
          <div className={styles.valueSmall}>{rollout.sandbox_id}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Commands</div>
          <div className={styles.value}>{rollout.commands_count}</div>
        </div>
      </div>
    </div>
  )
}
