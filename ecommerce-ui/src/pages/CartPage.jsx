
import { getCartDetail } from '../api/aggregate'
import { clearCart, removeCartItem, updateCartItem } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'

export default function CartPage({ userId }) {
  const { loading, data, error, reload } = useAsync(
    () => getCartDetail(userId),
    [userId],
  )

  async function run(action, successMessage) {
    try {
      await action()
      reload()

      if (successMessage) {
        window.alert(successMessage)
      }
    } catch (err) {
      window.alert(describeError(err))
    }
  }

  function handleQuantityChange(item, change) {
    const currentQuantity = Number(item.quantity) || 1
    const stock = Number(item.product?.stock)
    const hasStockLimit = Number.isFinite(stock) && stock >= 0

    const newQuantity = currentQuantity + change
    const maximum = hasStockLimit ? stock : Infinity

    if (newQuantity < 1 || newQuantity > maximum) return

    run(() => updateCartItem(item.id, newQuantity))
  }

  function handleRemove(item) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus "${item.product?.name || 'produk ini'}" dari keranjang?`,
    )

    if (!confirmed) return

    run(
      () => removeCartItem(item.id),
      'Produk berhasil dihapus dari keranjang.',
    )
  }

  function handleClearCart() {
    const confirmed = window.confirm(
      'Apakah kamu yakin ingin mengosongkan seluruh keranjang belanja?',
    )

    if (!confirmed) return

    run(
      () => clearCart(userId),
      'Keranjang berhasil dikosongkan.',
    )
  }

  return (
    <section className="cart-page">
      <h1>Keranjang Belanja</h1>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            {!data.items.length ? (
              <p className="muted">Keranjang masih kosong.</p>
            ) : (
              <>
                <div className="cart-list">
                  {data.items.map((item) => {
                    const image = item.product?.image

                    const imageSrc = image
                      ? image.startsWith('data:')
                        ? image
                        : `data:image/jpeg;base64,${image}`
                      : null

                    const quantity = Number(item.quantity) || 1
                    const stock = Number(item.product?.stock)
                    const hasStockLimit = Number.isFinite(stock) && stock >= 0

                    return (
                      <article className="cart-item" key={item.id}>
                        {item.product ? (
                          <>
                            <div className="cart-product-image-wrapper">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={item.product.name}
                                  className="cart-product-image"
                                />
                              ) : (
                                <div className="cart-image-placeholder">
                                  Gambar tidak tersedia
                                </div>
                              )}
                            </div>

                            <div className="cart-product">
                              <strong>{item.product.name}</strong>
                              <p className="muted">
                                {formatRupiah(item.product.price)}
                              </p>
                            </div>
                          </>
                        ) : (
                          <p>Produk tidak tersedia</p>
                        )}

                        <div className="cart-item-actions">
                          {item.product && (
                            <div className="quantity-control cart-quantity-control">
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(item, -1)}
                                disabled={quantity <= 1}
                                aria-label={`Kurangi jumlah ${item.product.name}`}
                              >
                                −
                              </button>

                              <span className="quantity-value">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(item, 1)}
                                disabled={hasStockLimit && quantity >= stock}
                                aria-label={`Tambah jumlah ${item.product.name}`}
                              >
                                +
                              </button>
                            </div>
                          )}

                          <button
                            className="cart-delete"
                            type="button"
                            onClick={() => handleRemove(item)}
                          >
                            Hapus
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <p className="total">
                  Total: <strong>{formatRupiah(data.totalPrice)}</strong>
                </p>

                <button
                  type="button"
                  onClick={handleClearCart}
                >
                  Kosongkan keranjang
                </button>
              </>
            )}
          </>
        )}
      </AsyncView>
    </section>
  )
}
