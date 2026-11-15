
import { useState } from 'react'
import { createReview } from '../api/reviewApi'
import { describeError } from '../utils/format'

export default function ReviewForm({ productId, userId, onCreated }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await createReview({
        productId,
        userId,
        rating,
        comment,
      })

      setComment('')
      setRating(5)

      // Beri tahu halaman detail bahwa ulasan berhasil dibuat.
      onCreated?.()
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Tulis Ulasan</h3>

      <label>
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          disabled={submitting}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} bintang
            </option>
          ))}
        </select>
      </label>

      <label>
        Komentar
        <textarea
          rows="3"
          maxLength="1000"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          required
        />
      </label>

      {error && (
        <p className="alert alert-error">
          {describeError(error)}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}
