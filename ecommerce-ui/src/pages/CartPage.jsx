// Halaman keranjang: isi keranjang beserta detail produk.

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

  async function run(action) {
    try {
      await action()
      reload()
    } catch (err) {
      alert(describeError(err))
    }
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
                        <div>
                          <strong>{item.product.name}</strong>
                          <p className="muted">
                            {formatRupiah(item.product.price)}
                          </p>
                        </div>

                        <input
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
                      type="button"
                      onClick={() =>
                        run(() => removeCartItem(item.id))
                      }
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
                  onClick={() => run(() => clearCart(userId))}
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