// Kerangka aplikasi: navigasi, pemilih user,
// dan peta halaman (routes).

import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartPage from './pages/CartPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'

const CURRENT_YEAR = new Date().getFullYear()

export default function App() {
  // User aktif disimpan di localStorage.
  const [userId, setUserId] = useState(
    () => Number(localStorage.getItem('userId')) || 1,
  )

  function changeUser(value) {
    setUserId(value)
    localStorage.setItem('userId', String(value))
  }

  return (
    <>
      <Navbar userId={userId} onUserChange={changeUser} />

      <main className="container app-main">
        <Routes>
          <Route path="/" element={<ProductListPage />} />

          <Route
            path="/products/:id"
            element={<ProductDetailPage userId={userId} />}
          />

          <Route
            path="/cart"
            element={<CartPage userId={userId} />}
          />

          <Route
            path="*"
            element={<p>Halaman tidak ditemukan.</p>}
          />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <p className="site-footer-brand">GOODSPACE</p>
            <p className="site-footer-tagline">Find Your Good Things.</p>
          </div>
          <p className="site-footer-copyright">
            &copy; {CURRENT_YEAR} GOODSPACE
          </p>
        </div>
      </footer>
    </>
  )
}