import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import styles from './Panel.module.css'

Chart.register(...registerables)

export default function SignalsChart({ signals }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!signals || !canvasRef.current) return

    const labels = Object.keys(signals)
    const values = labels.map(a => signals[a].ensemble)
    const colors = values.map(v =>
      v > 0.5 ? 'rgba(34, 211, 160, 0.9)' :
      v > 0.2 ? 'rgba(34, 211, 160, 0.5)' :
      v < -0.5 ? 'rgba(240, 82, 82, 0.9)' :
      v < -0.2 ? 'rgba(240, 82, 82, 0.5)' :
      'rgba(122, 141, 166, 0.4)'
    )

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace(/[\d.]+\)$/, '1)')),
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111829',
            borderColor: '#1e2d45',
            borderWidth: 1,
            titleColor: '#7a8da6',
            bodyColor: '#e8edf5',
            titleFont: { family: 'JetBrains Mono', size: 11 },
            bodyFont: { family: 'JetBrains Mono', size: 12 },
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => {
                const asset = item.label
                const s = signals[asset]
                return [
                  `Ensemble: ${s.ensemble.toFixed(3)}`,
                  `LSTM: ${s.lstm.toFixed(3)}`,
                  `XGB: ${s.xgboost.toFixed(3)}`,
                  `Transformer: ${s.transformer.toFixed(3)}`,
                  `GARCH: ${s.garch.toFixed(3)}`,
                ]
              }
            }
          }
        },
        scales: {
          y: {
            min: -1,
            max: 1,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#3d5068',
              font: { family: 'JetBrains Mono', size: 10 },
              callback: (v) => v.toFixed(1),
            },
            border: { color: '#1e2d45' },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#7a8da6',
              font: { family: 'JetBrains Mono', size: 11 },
            },
            border: { color: '#1e2d45' },
          }
        },
        animation: { duration: 400, easing: 'easeOutQuart' },
      }
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [signals])

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>ML/DL Ensemble Signals</h3>
        <span className={styles.badge}>Live</span>
      </div>
      <div className={styles.body}>
        <div style={{ height: 220 }}>
          <canvas ref={canvasRef} />
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'rgba(34,211,160,0.9)' }} />
            Bullish
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'rgba(122,141,166,0.5)' }} />
            Neutral
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'rgba(240,82,82,0.9)' }} />
            Bearish
          </span>
        </div>
      </div>
    </div>
  )
}
