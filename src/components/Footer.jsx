import React from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span>AI Trading Dashboard v1.0</span>
        <span className={styles.sep}>/</span>
        <span>LSTM 30% + XGBoost 25% + Transformer 25% + GARCH 20%</span>
        <span className={styles.sep}>/</span>
        <span>15-min auto-update</span>
      </div>
      <div className={styles.right}>
        <span className={styles.disclaimer}>Educational only. Not financial advice.</span>
      </div>
    </footer>
  )
}
