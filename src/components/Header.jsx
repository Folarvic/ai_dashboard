import React from 'react'
import styles from './Header.module.css'

function formatTime(date) {
  if (!date) return '--:--:--'
  return date.toLocaleTimeString('en-US', { hour12: false })
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Header({ lastUpdated, countdown }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>
          <span className={styles.logoBar} style={{ height: 12 }} />
          <span className={styles.logoBar} style={{ height: 18 }} />
          <span className={styles.logoBar} style={{ height: 14 }} />
          <span className={styles.logoBar} style={{ height: 20 }} />
          <span className={styles.logoBar} style={{ height: 10 }} />
        </div>
        <div>
          <h1 className={styles.title}>AI Trading Dashboard</h1>
          <p className={styles.subtitle}>ML/DL Ensemble Engine &bull; 4-Model Signal System</p>
        </div>
      </div>

      <div className={styles.statusRow}>
        <div className={styles.statusItem}>
          <span className={styles.dot} />
          <span className={styles.statusLabel}>Live</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Updated</span>
          <span className={styles.statusValue}>{formatTime(lastUpdated)}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Next</span>
          <span className={styles.statusValue}>{formatCountdown(countdown)}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Assets</span>
          <span className={styles.statusValue}>7</span>
        </div>
      </div>
    </header>
  )
}
