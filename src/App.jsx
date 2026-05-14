import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import SignalsChart from './components/SignalsChart.jsx'
import PnlChart from './components/PnlChart.jsx'
import PositionsTable from './components/PositionsTable.jsx'
import RiskPanel from './components/RiskPanel.jsx'
import ModelBreakdown from './components/ModelBreakdown.jsx'
import Footer from './components/Footer.jsx'
import { generateSnapshot } from './lib/signals.js'
import { supabase } from './lib/supabase.js'
import styles from './App.module.css'

const UPDATE_INTERVAL = 15 * 60 * 1000

export default function App() {
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [countdown, setCountdown] = useState(UPDATE_INTERVAL / 1000)

  const refresh = useCallback(async () => {
    const data = generateSnapshot()
    setSnapshot(data)
    setLastUpdated(new Date())
    setCountdown(UPDATE_INTERVAL / 1000)
    setLoading(false)

    // Persist snapshot to Supabase
    try {
      const activePositions = Object.keys(data.positions).length
      const { error } = await supabase.from('portfolio_snapshots').insert({
        portfolio_value: data.portfolio_value,
        portfolio_risk_pct: data.portfolio_risk.total_risk_pct,
        num_positions: activePositions,
        market_regime: 'neutral',
      })
      if (error) console.warn('Supabase insert:', error.message)
    } catch (e) {
      // Supabase not configured — continue silently
    }
  }, [])

  // Load history from Supabase
  const loadHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('timestamp, portfolio_value, portfolio_risk_pct')
        .order('timestamp', { ascending: false })
        .limit(96)
      if (!error && data) {
        setHistory(data.reverse())
      }
    } catch (e) {
      // Supabase not available
    }
  }, [])

  useEffect(() => {
    refresh()
    loadHistory()
  }, [refresh, loadHistory])

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(refresh, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [refresh])

  // Countdown timer
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => (c <= 1 ? UPDATE_INTERVAL / 1000 : c - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className={styles.app}>
      <Header lastUpdated={lastUpdated} countdown={countdown} />

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loader}>
            <div className={styles.loaderDot} />
            <span>Initializing signal engine...</span>
          </div>
        ) : (
          <>
            <SummaryCards snapshot={snapshot} />

            <div className={styles.grid}>
              <div className={styles.leftCol}>
                <SignalsChart signals={snapshot?.signals} />
                <ModelBreakdown signals={snapshot?.signals} />
              </div>
              <div className={styles.rightCol}>
                <PositionsTable snapshot={snapshot} onRefresh={refresh} />
                <RiskPanel snapshot={snapshot} />
              </div>
            </div>

            <PnlChart history={history} snapshot={snapshot} />
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
