
import { Link } from 'react-router-dom'
import { formatRupiah } from '../utils/format'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const { id, name, price, stock, rating, image } = product

  const imageSrc = image
    ? image.startsWith('data:')
      ? image
      : `data:${image.startsWith('iVBOR') ? 'image/png' : 'image/jpeg'};base64,${image}`
    : null

  return (
    <article className="card product-card">
      <Link
        to={`/products/${id}`}
        className="product-card-image-link"
      >
        {imageSrc ? (
          <div className="product-image-frame">
            <img
              src={imageSrc}
              alt={name}
              className="product-card-image"
            />
          </div>
        ) : (
          <div className="product-card-image-placeholder">
            Gambar tidak tersedia
          </div>
        )}
      </Link>

      <div className="product-card-content">
        <h3>
          <Link to={`/products/${id}`}>
            {name}
          </Link>
        </h3>

        <p className="price">
          {formatRupiah(price)}
        </p>

        <p className="muted">
          Stok: {stock}
        </p>

        {rating ? (
          <StarRating
            average={rating.average_rating}
            total={rating.total_reviews}
          />
        ) : (
          <span className="muted">
            Rating tidak tersedia
          </span>
        )}
      </div>
    </article>
  )
}
