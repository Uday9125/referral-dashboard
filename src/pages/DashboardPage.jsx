import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const API_BASE = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'
const PAGE_SIZE = 10

function formatDate(iso) {
  return iso ? iso.replace(/-/g, '/') : ''
}

function formatProfit(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState({ link: false, code: false })
  const navigate = useNavigate()

  const fetchReferrals = useCallback(async (q, s) => {
    setLoading(true)
    setError('')
    try {
      const token = Cookies.get('jwt_token')
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (s) params.set('sort', s)
      const url = `${API_BASE}${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) {
        setError(`${json.message || 'Failed to load'} (${res.status})`)
        return
      }
      setData(json.data || json)
      setPage(1)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferrals(search, sort)
  }, [search, sort])

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(c => ({ ...c, [key]: true }))
      setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000)
    })
  }

  const referrals = data?.referrals || []
  const totalPages = Math.ceil(referrals.length / PAGE_SIZE)
  const from = referrals.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, referrals.length)
  const pageRows = referrals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="dashboard-header">
          <h1>Referral Dashboard</h1>
          <p className="subtitle">Track your referrals, earnings, and partner activity in one place.</p>
        </div>

        {loading && <div className="loading-state">Loading…</div>}
        {error && <div className="error-banner" role="alert">{error}</div>}

        {!loading && !error && data && (
          <>
            {/* Overview */}
            <section className="card-section" role="region" aria-label="Overview metrics">
              <h2 className="section-title">Overview</h2>
              <div className="metrics-grid">
                {(data.metrics || []).map(m => (
                  <div key={m.id} className="metric-card">
                    <span className="metric-label">{m.label}</span>
                    <span className="metric-value">{m.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Service Summary */}
            <section className="card-section" role="region" aria-label="Service summary">
              <h2 className="section-title">Service summary</h2>
              {data.serviceSummary && (
                <div className="service-summary-grid">
                  <div className="ss-item">
                    <span className="ss-label">Service</span>
                    <span className="ss-value">{data.serviceSummary.service}</span>
                  </div>
                  <div className="ss-item">
                    <span className="ss-label">Your Referrals</span>
                    <span className="ss-value">{data.serviceSummary.yourReferrals}</span>
                  </div>
                  <div className="ss-item">
                    <span className="ss-label">Active Referrals</span>
                    <span className="ss-value">{data.serviceSummary.activeReferrals}</span>
                  </div>
                  <div className="ss-item">
                    <span className="ss-label">Total Ref. Earnings</span>
                    <span className="ss-value">{data.serviceSummary.totalRefEarnings}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Share Referral */}
            <section className="card-section" role="region" aria-label="Share referral">
              <h2 className="section-title">Refer friends and earn more</h2>
              {data.referral && (
                <div className="share-grid">
                  <div className="share-field">
                    <label className="share-label">Your Referral Link</label>
                    <div className="share-input-row">
                      <input readOnly value={data.referral.link} className="share-input" />
                      <button className="btn-copy" onClick={() => copyToClipboard(data.referral.link, 'link')}>
                        {copied.link ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="share-field">
                    <label className="share-label">Your Referral Code</label>
                    <div className="share-input-row">
                      <input readOnly value={data.referral.code} className="share-input" />
                      <button className="btn-copy" onClick={() => copyToClipboard(data.referral.code, 'code')}>
                        {copied.code ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* All Referrals Table */}
            <section className="card-section">
              <div className="table-header-row">
                <h2 className="section-title">All referrals</h2>
                <div className="table-controls">
                  <input
                    type="text"
                    placeholder="Name or service…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
                    aria-label="Search referrals"
                  />
                  <label className="sort-label">
                    Sort by date
                    <select value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="referrals-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-state">No matching entries</td>
                      </tr>
                    ) : (
                      pageRows.map(row => (
                        <tr
                          key={row.id}
                          className="table-row clickable"
                          onClick={() => navigate(`/referral/${row.id}`)}
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && navigate(`/referral/${row.id}`)}
                        >
                          <td>{row.name}</td>
                          <td>{row.serviceName}</td>
                          <td>{formatDate(row.date)}</td>
                          <td>{formatProfit(row.profit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {referrals.length > 0 && (
                <div className="pagination-row">
                  <span className="pagination-info">
                    Showing {from}–{to} of {referrals.length} entries
                  </span>
                  <div className="pagination-controls">
                    <button className="btn-page" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`btn-page ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="btn-page"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}