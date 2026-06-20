import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const API_BASE = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals'

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

export default function ReferralDetailPage() {
  const { id } = useParams()
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      try {
        const token = Cookies.get('jwt_token')
        const res = await fetch(`${API_BASE}?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()

        if (!res.ok) { setNotFound(true); return }

        const d = json.data || json
        let row = null

        if (d && d.id !== undefined) {
          row = String(d.id) === String(id) ? d : null
        } else if (d && Array.isArray(d.referrals)) {
          row = d.referrals.find(r => String(r.id) === String(id)) || null
        }

        row ? setReferral(row) : setNotFound(true)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {loading && <div className="loading-state">Loading…</div>}

        {!loading && notFound && (
          <div className="not-found-section">
            <h1>Referral not found</h1>
            <Link to="/" className="back-link">← Back to dashboard</Link>
          </div>
        )}

        {!loading && referral && (
          <div className="detail-card">
            <Link to="/" className="back-link">← Back to dashboard</Link>
            <h1 className="detail-heading">Referral Details</h1>
            <h2 className="detail-name">{referral.name}</h2>
            <dl className="detail-list">
              <div className="dl-row">
                <dt>Referral ID</dt>
                <dd>{referral.id}</dd>
              </div>
              <div className="dl-row">
                <dt>Service Name</dt>
                <dd>{referral.serviceName}</dd>
              </div>
              <div className="dl-row">
                <dt>Date</dt>
                <dd>{formatDate(referral.date)}</dd>
              </div>
              <div className="dl-row">
                <dt>Profit</dt>
                <dd>{formatProfit(referral.profit)}</dd>
              </div>
            </dl>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}