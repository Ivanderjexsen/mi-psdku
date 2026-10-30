# Order Service

## 1. Deskripsi
Order Service merupakan layanan microservices yang bertanggung jawab untuk mengelola proses pemesanan dalam sistem e-commerce.

Layanan ini dibangun menggunakan Laravel 13 dan menggunakan MySQL sebagai database.

## 2. Teknologi
- Laravel 13
- PHP 8.3
- MySQL 8
- Docker
- HTTP Client

## 3. Fitur Utama
- Membuat pesanan melalui proses checkout.
- Mengambil informasi produk dari Product Service.
- Mengambil data keranjang dari Cart Service.
- Memvalidasi ketersediaan stok produk.
- Menyimpan data pesanan dan detail pesanan.
- Menampilkan detail pesanan.
- Menampilkan riwayat pesanan pengguna.
- Memproses pembayaran dan memperbarui status pesanan.

## 4. Integrasi Microservices

| Service | Alamat |
|---|---|
| Cart Service | http://cart-service:3001 |
| Product Service | http://product-service:3000 |

## 5. API Endpoints

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /orders | Membuat pesanan |
| GET | /orders/{id} | Detail pesanan |
| GET | /orders/user/{userId} | Riwayat pesanan |
| PATCH | /orders/{id}/pay | Memproses pembayaran |

## 6. Status Pesanan
- PENDING: Pesanan menunggu pembayaran.
- PAID: Pesanan telah dibayar.

## 7. Menjalankan Service

Jalankan melalui root project menggunakan Docker Compose:

```bash
docker compose up -d --build order-service
```

Untuk menjalankan pengujian:

```bash
php artisan test
```

## 8. Pengujian
Pengujian dilakukan terhadap validasi checkout dan endpoint Order Service untuk memastikan layanan berjalan sesuai fungsinya.