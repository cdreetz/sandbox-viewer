'use client'

import { useState } from 'react'
import { FileNode } from '@/types'
import styles from './FilesystemBrowser.module.css'

interface FilesystemBrowserProps {
  filesystem: FileNode | null
  loading?: boolean
  onSelectFile: (path: string) => void
  selectedFilePath: string | null
}

interface TreeNodeProps {
  node: FileNode
  depth: number
  expandedPaths: Set<string>
  onToggle: (path: string) => void
  onSelectFile: (path: string) => void
  selectedFilePath: string | null
}

function TreeNode({ node, depth, expandedPaths, onToggle, onSelectFile, selectedFilePath }: TreeNodeProps) {
  const isExpanded = expandedPaths.has(node.path)
  const isDirectory = node.type === 'directory'
  const isSelected = selectedFilePath === node.path

  const handleClick = () => {
    if (isDirectory) {
      onToggle(node.path)
    } else {
      onSelectFile(node.path)
    }
  }

  return (
    <div className={styles.treeNode}>
      <button
        className={`${styles.nodeButton} ${isSelected ? styles.selected : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleClick}
      >
        <span className={styles.icon}>
          {isDirectory ? (isExpanded ? '▼' : '▶') : ''}
        </span>
        <span className={styles.fileIcon}>
          {isDirectory ? '📁' : '📄'}
        </span>
        <span className={styles.name}>{node.name}</span>
        {node.size !== undefined && !isDirectory && (
          <span className={styles.size}>{formatSize(node.size)}</span>
        )}
      </button>
      {isDirectory && isExpanded && node.children && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelectFile={onSelectFile}
              selectedFilePath={selectedFilePath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`
}

export default function FilesystemBrowser({ filesystem, loading, onSelectFile, selectedFilePath }: FilesystemBrowserProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']))

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filesystem</h3>
      </div>
      <div className={styles.tree}>
        {loading ? (
          <div className={styles.empty}>Loading filesystem...</div>
        ) : !filesystem ? (
          <div className={styles.empty}>Select a rollout to view filesystem</div>
        ) : (
          filesystem.children?.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={0}
              expandedPaths={expandedPaths}
              onToggle={handleToggle}
              onSelectFile={onSelectFile}
              selectedFilePath={selectedFilePath}
            />
          ))
        )}
      </div>
    </div>
  )
}
