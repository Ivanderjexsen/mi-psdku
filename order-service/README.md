# Order Service

Order Service adalah microservice untuk mengelola proses checkout dan pesanan pada sistem e-commerce.

## Teknologi
- Laravel 13
- MySQL
- HTTP Client untuk komunikasi antar-service

## Arsitektur
- Routes: mendefinisikan endpoint API.
- Form Requests: memvalidasi input.
- Controllers: menangani HTTP request dan response.
- Services: menjalankan logika bisnis pemesanan.
- Models: mengelola representasi data pesanan.
- Clients: berkomunikasi dengan Cart Service dan Product Service.

## Fitur
- Checkout pesanan dari keranjang.
- Validasi produk dan stok.
- Penyimpanan pesanan dan detail pesanan.
- Melihat detail serta riwayat pesanan.
- Pembayaran simulasi dengan perubahan status pesanan.
