const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

// Mengubah harga menjadi format Rupiah.
export const formatRupiah = (value) => rupiah.format(Number(value));

// Mengubah error API menjadi pesan yang mudah dibaca.
export function describeError(error) {
  const details = error.errors
    ? Object.values(error.errors).flat()
    : [];

  return details.length
    ? `${error.message}: ${details.join(', ')}`
    : error.message;
}
