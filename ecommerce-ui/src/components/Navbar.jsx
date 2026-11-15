
 // Menu navigasi dan pemilih user.
 // Belum ada login, jadi user dipilih manual.

import { Link, NavLink } from 'react-router-dom'

const USERS = [1, 2, 3, 4, 5]

export default function Navbar({ userId, onUserChange }) {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        GOODSPACE
      </Link>

      <nav className="navbar-links" aria-label="Navigasi utama">
        <NavLink to="/" end className="navbar-link">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="4" y="4" width="6" height="6" rx="1" />
            <rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" />
            <rect x="14" y="14" width="6" height="6" rx="1" />
          </svg>
          <span>Produk</span>
        </NavLink>

        <NavLink to="/cart" className="navbar-link">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L21 8H6" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span>Keranjang</span>
        </NavLink>
      </nav>

      <label className="user">
        User ID
        <select
          value={userId}
          onChange={(e) => onUserChange(Number(e.target.value))}
        >
          {USERS.map((id) => (
            <option key={id} value={id}>
              User {id}
            </option>
          ))}
        </select>
      </label>
    </header>
  )
}
