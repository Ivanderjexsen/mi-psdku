
import { useState } from 'react'
import { getProductsWithRating } from '../api/aggregate'
import AsyncView from '../components/AsyncView'
import ProductCard from '../components/ProductCard'
import { useAsync } from '../hooks/useAsync'

export default function ProductListPage() {
  const { loading, data, error, reload } =
    useAsync(getProductsWithRating)
  const [searchTerm, setSearchTerm] = useState('')
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredProducts = (data ?? []).filter((product) =>
    String(product.name ?? '').toLowerCase().includes(normalizedSearch),
  )

  return (
    <section className="catalog-page">
      <header className="storefront-hero">
        <p className="storefront-eyebrow">GOODSPACE</p>
        <h1>Find Your Good Things.</h1>
        <p className="storefront-description">
          Temukan perlengkapan pilihan untuk kebutuhan kerja dan keseharian.
        </p>
      </header>

      <div className="catalog-toolbar">
        <h2>Jelajahi produk</h2>

        <label className="catalog-search">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari nama produk"
            aria-label="Cari produk berdasarkan nama"
          />
        </label>
      </div>

      <AsyncView
        loading={loading}
        error={error}
        onRetry={reload}
      >
        {data && (filteredProducts.length > 0 ? (
          <>
            {normalizedSearch && (
              <p className="catalog-search-count" role="status">
                {filteredProducts.length} produk ditemukan
              </p>
            )}
            <div className="grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="catalog-empty-state" role="status">
            {normalizedSearch
              ? `Tidak ada produk dengan nama "${searchTerm.trim()}".`
              : 'Belum ada produk.'}
          </p>
        ))}
      </AsyncView>
    </section>
  )
}
