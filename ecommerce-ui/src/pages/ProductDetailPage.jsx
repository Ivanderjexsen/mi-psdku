
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductDetail } from '../api/aggregate'
import { addToCart } from '../api/cartApi'
import { deleteReview } from '../api/reviewApi'
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

  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showReviewSuccess, setShowReviewSuccess] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [reviewDeleteError, setReviewDeleteError] = useState(null)
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(
    'Ulasan berhasil ditambahkan!',
  )

  const timeoutRef = useRef(null)
  const reviewTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (reviewTimeoutRef.current) {
        clearTimeout(reviewTimeoutRef.current)
      }
    }
  }, [])

  function showSuccessPopup() {
    setShowSuccess(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  function showReviewSuccessPopup(message) {
    setReviewSuccessMessage(message)
    setShowReviewSuccess(true)

    if (reviewTimeoutRef.current) {
      clearTimeout(reviewTimeoutRef.current)
    }

    reviewTimeoutRef.current = setTimeout(() => {
      setShowReviewSuccess(false)
    }, 3000)
  }

  async function handleAddToCart() {
    const stock = Number(data?.product?.stock) || 0
    const amount = Math.min(
      stock,
      Math.max(1, Number(quantity) || 1),
    )

    if (amount < 1 || adding) return

    try {
      setAdding(true)

      await addToCart(userId, Number(id), amount)

      showSuccessPopup()
    } catch (err) {
      window.alert(describeError(err))
    } finally {
      setAdding(false)
    }
  }

  function handleReviewCreated() {
    showReviewSuccessPopup('Ulasan berhasil ditambahkan!')
    reload()
  }

  async function handleDeleteReview(review) {
    if (
      deletingReviewId ||
      !window.confirm('Hapus ulasan ini? Tindakan ini tidak dapat dibatalkan.')
    ) {
      return
    }

    setDeletingReviewId(review.id)
    setReviewDeleteError(null)

    try {
      await deleteReview(review.id, userId)
      showReviewSuccessPopup('Ulasan berhasil dihapus.')
      reload()
    } catch (err) {
      setReviewDeleteError(err)
    } finally {
      setDeletingReviewId(null)
    }
  }

  const productImage = data?.product?.image

  const imageSrc = productImage
    ? productImage.startsWith('data:')
      ? productImage
      : `data:image/jpeg;base64,${productImage}`
    : null

  return (
    <section className="product-detail-page">
      {/* Pop-up berhasil menambahkan produk ke keranjang */}
      {showSuccess && (
        <div className="cart-success-popup" role="status">
          <span className="success-icon">✓</span>

          <span className="success-message">
            Produk berhasil ditambahkan ke keranjang
          </span>

          <button
            type="button"
            className="success-close"
            onClick={() => {
              setShowSuccess(false)
              clearTimeout(timeoutRef.current)
            }}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      )}

      {/* Pop-up berhasil menambahkan ulasan */}
      {showReviewSuccess && (
        <div className="cart-success-popup review-success-popup" role="status">
          <span className="success-icon">✓</span>

          <span className="success-message">
            {reviewSuccessMessage}
          </span>

          <button
            type="button"
            className="success-close"
            onClick={() => {
              setShowReviewSuccess(false)
              clearTimeout(reviewTimeoutRef.current)
            }}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      )}

      <Link to="/" className="product-back-link">
        <span className="back-arrow">←</span>
        <span>Kembali ke Produk</span>
      </Link>

      <AsyncView
        loading={loading}
        error={error}
        onRetry={reload}
      >
        {data && (
          <>
            <div className="product-detail-layout">
              <div className="product-detail-image">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={data.product.name}
                  />
                ) : (
                  <div className="product-detail-image-placeholder">
                    Gambar tidak tersedia
                  </div>
                )}
              </div>

              <div className="product-detail-info">
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
                  <div className="quantity-control">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.max(1, current - 1),
                        )
                      }
                      disabled={quantity <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      −
                    </button>

                    <span className="quantity-value">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(
                            Number(data.product.stock) || 1,
                            current + 1,
                          ),
                        )
                      }
                      disabled={
                        quantity >= Number(data.product.stock) ||
                        Number(data.product.stock) <= 0
                      }
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={
                      adding || Number(data.product.stock) <= 0
                    }
                  >
                    {adding ? 'Memproses...' : 'Tambah ke keranjang'}
                  </button>
                </div>
              </div>
            </div>

            <hr />

            <h2>Ulasan pelanggan</h2>

            {reviewDeleteError && (
              <p className="alert alert-error" role="alert">
                {describeError(reviewDeleteError)}
              </p>
            )}

            {data.reviews?.reviews?.length ? (
              data.reviews.reviews.map((review) => (
                <article className="review" key={review.id}>
                  <div className="review-header">
                    <StarRating
                      average={review.rating}
                      total={1}
                      compact
                    />
                    {Number(review.user_id) === Number(userId) && (
                      <button
                        type="button"
                        className="review-delete"
                        onClick={() => handleDeleteReview(review)}
                        disabled={Boolean(deletingReviewId)}
                        aria-label={`Hapus ulasan User ${review.user_id}`}
                      >
                        {deletingReviewId === review.id
                          ? 'Menghapus...'
                          : 'Hapus'}
                      </button>
                    )}
                  </div>

                  <p>{review.comment}</p>

                  <small className="muted">
                    User {review.user_id}
                  </small>
                </article>
              ))
            ) : (
              <p className="muted">
                Belum ada ulasan.
              </p>
            )}

            <ReviewForm
              productId={Number(id)}
              userId={userId}
              onCreated={handleReviewCreated}
            />
          </>
        )}
      </AsyncView>
    </section>
  )
}
