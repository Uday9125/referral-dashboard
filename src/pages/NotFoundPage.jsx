import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="notfound-bg">
      <div className="notfound-card">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-msg">Page not found</p>
        <Link to="/" className="btn-primary notfound-link">Back to dashboard</Link>
      </div>
    </div>
  )
}