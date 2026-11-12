
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
    <section>
      <h1>Keranjang Belanja</h1>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            {!data.items.length ? (
              <p className="muted">Keranjang masih kosong.</p>
            ) : (
              <>
                {data.items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    {item.product ? (
                      <>
                        <div className="cart-product">
                          <strong>{item.product.name}</strong>
                          <p className="muted">
                            {formatRupiah(item.product.price)}
                          </p>
                        </div>

                        <input
                          className="cart-quantity"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const quantity = Number(e.target.value)

                            if (quantity >= 1) {
                              run(() =>
                                updateCartItem(item.id, quantity),
                              )
                            }
                          }}
                        />
                      </>
                    ) : (
                      <p>Produk tidak tersedia</p>
                    )}

                    <button
                      className="cart-delete"
                      type="button"
                      onClick={() => handleRemove(item)}
                    >
                      Hapus
                    </button>
                  </article>
                ))}

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
