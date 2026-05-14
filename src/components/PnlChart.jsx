import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import styles from './Panel.module.css'
import chartStyles from './PnlChart.module.css'

Chart.register(...registerables)

function buildMockHistory(snapshot) {
  const base = snapshot?.portfolio_value ?? 100000
  const points = 48
  const now = Date.now()
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now - (points - 1 - i) * 15 * 60 * 1000)
    const drift = (Math.sin(i * 0.4) * 250 + Math.sin(i * 0.15) * 150 + (Math.random() - 0.5) * 80)
    return {
      t: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      v: base + drift,
    }
  })
}

export default function PnlChart({ history, snapshot }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !snapshot) return

    const points = history.length > 1
      ? history.map(h => ({
          t: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          v: h.portfolio_value,
        }))
      : buildMockHistory(snapshot)

    const labels = points.map(p => p.t)
    const values = points.map(p => p.v)
    const base = values[0]
    const last = values[values.length - 1]
    const isUp = last >= base
    const lineColor = isUp ? '#22d3a0' : '#f05252'

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: lineColor,
          backgroundColor: isUp ? 'rgba(34,211,160,0.06)' : 'rgba(240,82,82,0.06)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: lineColor,
          borderWidth: 1.5,
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
              label: (item) => `$${item.raw.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#3d5068',
              font: { family: 'JetBrains Mono', size: 10 },
              callback: (v) => `$${(v / 1000).toFixed(0)}k`,
            },
            border: { color: '#1e2d45' },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#3d5068',
              font: { family: 'JetBrains Mono', size: 10 },
              maxTicksLimit: 8,
            },
            border: { color: '#1e2d45' },
          }
        },
        animation: { duration: 600, easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
      }
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [history, snapshot])

  const base = snapshot?.portfolio_value ?? 100000
  const change = 0 // Would calculate from first history point

  return (
    <div className={`${styles.panel} ${chartStyles.wrapper}`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Portfolio P&L Evolution</h3>
        </div>
        <div className={chartStyles.meta}>
          <span className={chartStyles.interval}>15-min intervals</span>
          <span className={chartStyles.badge2}>12h window</span>
        </div>
      </div>
      <div className={styles.body}>
        <div style={{ height: 180 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  )
}
