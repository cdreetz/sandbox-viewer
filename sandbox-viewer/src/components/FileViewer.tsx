'use client'

import styles from './FileViewer.module.css'

interface FileViewerProps {
  filePath: string | null
  content: string | null
  loading?: boolean
  onClose: () => void
}

function getLanguage(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase()
  if (!ext) return undefined
  const langMap: Record<string, string> = {
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    html: 'html',
    css: 'css',
    sql: 'sql',
    rs: 'rust',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    rb: 'ruby',
  }
  return langMap[ext]
}

export default function FileViewer({ filePath, content, loading, onClose }: FileViewerProps) {
  if (!filePath) return null

  const fileName = filePath.split('/').pop() || filePath

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.pathInfo}>
          <span className={styles.fileName}>{fileName}</span>
          <span className={styles.fullPath}>{filePath}</span>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading file...</div>
        ) : content === null ? (
          <div className={styles.loading}>Failed to load file</div>
        ) : (
          <pre className={styles.code}>
            <code>{content}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
