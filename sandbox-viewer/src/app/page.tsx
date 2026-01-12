'use client'

import { useState, useEffect, useCallback } from 'react'
import RunList from '@/components/RunList'
import RolloutList from '@/components/RolloutList'
import FilesystemBrowser from '@/components/FilesystemBrowser'
import CommandLog from '@/components/CommandLog'
import FileViewer from '@/components/FileViewer'
import RolloutInfo from '@/components/RolloutInfo'
import { RunMetadata, RolloutMetadata, Command, FileNode } from '@/types'
import styles from './page.module.css'

type SidebarView = 'runs' | 'rollouts'

export default function Home() {
  // State for data
  const [runs, setRuns] = useState<RunMetadata[]>([])
  const [rollouts, setRollouts] = useState<RolloutMetadata[]>([])
  const [commands, setCommands] = useState<Command[]>([])
  const [filesystem, setFilesystem] = useState<FileNode | null>(null)

  // Selection state
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [selectedRolloutId, setSelectedRolloutId] = useState<string | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)

  // Sidebar view state
  const [sidebarView, setSidebarView] = useState<SidebarView>('runs')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Loading states
  const [loadingRuns, setLoadingRuns] = useState(true)
  const [loadingRollouts, setLoadingRollouts] = useState(false)
  const [loadingCommands, setLoadingCommands] = useState(false)
  const [loadingFilesystem, setLoadingFilesystem] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)

  // Fetch runs on mount
  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const res = await fetch('/api/runs')
        const data = await res.json()
        setRuns(data)
      } catch (error) {
        console.error('Failed to fetch runs:', error)
      } finally {
        setLoadingRuns(false)
      }
    }
    fetchRuns()
  }, [])

  // Fetch rollouts when run is selected
  useEffect(() => {
    if (!selectedRunId) {
      setRollouts([])
      return
    }

    const fetchRollouts = async () => {
      setLoadingRollouts(true)
      setSelectedRolloutId(null)
      setCommands([])
      setFilesystem(null)
      setSelectedFilePath(null)
      setFileContent(null)

      try {
        const res = await fetch(`/api/runs/${selectedRunId}/rollouts`)
        const data = await res.json()
        setRollouts(data)
      } catch (error) {
        console.error('Failed to fetch rollouts:', error)
      } finally {
        setLoadingRollouts(false)
      }
    }
    fetchRollouts()
  }, [selectedRunId])

  // Fetch commands and filesystem when rollout is selected
  useEffect(() => {
    if (!selectedRunId || !selectedRolloutId) {
      setCommands([])
      setFilesystem(null)
      setSelectedFilePath(null)
      setFileContent(null)
      return
    }

    const fetchData = async () => {
      setLoadingCommands(true)
      setLoadingFilesystem(true)
      setSelectedFilePath(null)
      setFileContent(null)

      try {
        const [commandsRes, filesystemRes] = await Promise.all([
          fetch(`/api/runs/${selectedRunId}/rollouts/${selectedRolloutId}/commands`),
          fetch(`/api/runs/${selectedRunId}/rollouts/${selectedRolloutId}/filesystem`),
        ])

        if (!commandsRes.ok) {
          throw new Error(`Commands API failed: ${commandsRes.status}`)
        }
        const commandsData = await commandsRes.json()
        setCommands(commandsData)

        if (filesystemRes.ok) {
          const filesystemData = await filesystemRes.json()
          setFilesystem(filesystemData)
        } else {
          setFilesystem(null)
        }
      } catch (error) {
        console.error('Failed to fetch rollout data:', error)
      } finally {
        setLoadingCommands(false)
        setLoadingFilesystem(false)
      }
    }
    fetchData()
  }, [selectedRunId, selectedRolloutId])

  // Handle file selection
  const handleSelectFile = useCallback(async (path: string) => {
    if (!selectedRunId || !selectedRolloutId) return

    setSelectedFilePath(path)
    setLoadingFile(true)

    try {
      const res = await fetch(
        `/api/runs/${selectedRunId}/rollouts/${selectedRolloutId}/file?path=${encodeURIComponent(path)}`
      )
      if (res.ok) {
        const data = await res.json()
        setFileContent(data.content)
      } else {
        setFileContent(null)
      }
    } catch (error) {
      console.error('Failed to fetch file:', error)
      setFileContent(null)
    } finally {
      setLoadingFile(false)
    }
  }, [selectedRunId, selectedRolloutId])

  const handleCloseFile = useCallback(() => {
    setSelectedFilePath(null)
    setFileContent(null)
  }, [])

  const handleSelectRun = useCallback((runId: string) => {
    setSelectedRunId(runId)
    setSidebarView('rollouts')
  }, [])

  const handleSelectRollout = useCallback((rolloutId: string) => {
    setSelectedRolloutId(rolloutId)
  }, [])

  return (
    <main className={styles.main}>
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {sidebarCollapsed ? (
          <button
            className={styles.expandButton}
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
          >
            &rsaquo;
          </button>
        ) : (
          <>
            <div className={styles.sidebarHeader}>
              <button
                className={`${styles.sidebarTab} ${sidebarView === 'runs' ? styles.active : ''}`}
                onClick={() => setSidebarView('runs')}
              >
                Runs
              </button>
              <span className={styles.sidebarDivider}>/</span>
              <button
                className={`${styles.sidebarTab} ${sidebarView === 'rollouts' ? styles.active : ''}`}
                onClick={() => setSidebarView('rollouts')}
                disabled={!selectedRunId}
              >
                Rollouts
              </button>
              <button
                className={styles.collapseButton}
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse sidebar"
              >
                &lsaquo;
              </button>
            </div>
            <div className={styles.sidebarContent}>
              {sidebarView === 'runs' ? (
                <RunList
                  runs={runs}
                  selectedRunId={selectedRunId}
                  onSelectRun={handleSelectRun}
                />
              ) : (
                <RolloutList
                  rollouts={rollouts}
                  selectedRolloutId={selectedRolloutId}
                  onSelectRollout={handleSelectRollout}
                  loading={loadingRollouts}
                />
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.content}>
        {selectedRolloutId ? (
          <>
            <div className={styles.topRow}>
              <div className={styles.filesystemSection}>
                <FilesystemBrowser
                  filesystem={filesystem}
                  loading={loadingFilesystem}
                  onSelectFile={handleSelectFile}
                  selectedFilePath={selectedFilePath}
                />
              </div>
              <div className={styles.fileViewerSection}>
                {selectedFilePath ? (
                  <FileViewer
                    filePath={selectedFilePath}
                    content={fileContent}
                    loading={loadingFile}
                    onClose={handleCloseFile}
                  />
                ) : (
                  <div className={styles.fileViewerPlaceholder}>
                    Select a file to view
                  </div>
                )}
              </div>
            </div>
            <div className={styles.commandsSection}>
              <CommandLog commands={commands} loading={loadingCommands} />
            </div>
          </>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderText}>
              {!selectedRunId
                ? 'Select a run to get started'
                : 'Select a rollout to view details'}
            </div>
          </div>
        )}
      </div>
      <div className={styles.rightSidebar}>
        <div className={styles.themeToggle}>
          <button
            className={styles.themeButton}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀' : '☾'}
          </button>
        </div>
        <RolloutInfo rollout={rollouts.find(r => r.rollout_id === selectedRolloutId) || null} />
      </div>
    </main>
  )
}
