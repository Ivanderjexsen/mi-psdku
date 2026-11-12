// Halaman detail: informasi produk, tombol masuk keranjang,
// dan daftar review.

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductDetail } from '../api/aggregate'
import { addToCart } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import ReviewForm from '../components/ReviewForm'
import StarRating from '../components/StarRating'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'

export default function ProductDetailPage({ userId }) {
  const { id } = useParams()

  const { loading, data, error, reload } = useAsync(
    () => getProductDetail(id),
    [id],
  )

  const [quantity, setQuantity] = useState('1')
  const [cartMessage, setCartMessage] = useState(null)

  async function handleAddToCart() {
    const amount = Math.max(1, Number(quantity) || 1)

    try {
      await addToCart(userId, Number(id), amount)
      setCartMessage({
        type: 'success',
        text: 'Produk masuk ke keranjang.',
      })
    } catch (err) {
      setCartMessage({
        type: 'error',
        text: describeError(err),
      })
    }
  }

  return (
    <section>
      <Link to="/">&larr; Kembali ke daftar produk</Link>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <h1>{data.product.name}</h1>

            <p>{data.product.description}</p>

            <p className="price">
              {formatRupiah(data.product.price)}
            </p>

            <p className="muted">
              Stok: {data.product.stock}
            </p>

            {data.reviews && (
              <StarRating
                average={data.reviews.summary.average_rating}
                total={data.reviews.summary.total_reviews}
              />
            )}

            <div className="add-cart">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <button type="button" onClick={handleAddToCart}>
                Tambah ke keranjang
              </button>
            </div>

            {cartMessage && (
              <p
                className={
                  cartMessage.type === 'success'
                    ? 'alert alert-success'
                    : 'alert alert-error'
                }
              >
                {cartMessage.text}
              </p>
            )}

            <hr />

            <h2>Ulasan pelanggan</h2>

            {data.reviews?.reviews?.length ? (
              data.reviews.reviews.map((review) => (
                <article className="review" key={review.id}>
                  <StarRating
                    average={review.rating}
                    total={1}
                    compact
                  />
                  <p>{review.comment}</p>
                  <small className="muted">
                    User {review.user_id}
                  </small>
                </article>
              ))
            ) : (
              <p className="muted">Belum ada ulasan.</p>
            )}

            <ReviewForm
              productId={Number(id)}
              userId={userId}
              onCreated={reload}
            />
          </>
        )}
      </AsyncView>
    </section>
  )
}