<?php

namespace App\Services;

use App\Clients\CartServiceClient;
use App\Clients\ProductServiceClient;
use App\Exceptions\CheckoutConflictException;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderService
{
    public function __construct(
        private CartServiceClient $cartClient,
        private ProductServiceClient $productClient
    ) {
    }

    public function checkout(int $userId): Order
    {
        // Ambil keranjang dari Cart Service.
        $cart = $this->cartClient->getCart($userId);
        $items = $cart['items'] ?? [];

        if (! is_array($items) || count($items) === 0) {
            throw new CheckoutConflictException(
                'Keranjang kosong atau tidak memiliki item.'
            );
        }

        // Validasi produk dan stok sebelum menyimpan pesanan.
        $validatedItems = [];
        $totalCents = 0;

        foreach ($items as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);

            if ($productId < 1 || $quantity < 1) {
                throw new CheckoutConflictException(
                    'Data item keranjang tidak valid.'
                );
            }

            $product = $this->productClient->getProduct($productId);

            if ($product === null) {
                throw new CheckoutConflictException(
                    "Produk dengan ID {$productId} tidak ditemukan."
                );
            }

            $stock = (int) ($product['stock'] ?? -1);

            if ($stock < 0) {
                throw new \App\Exceptions\DownstreamServiceException(
                    'Data stok dari Product Service tidak valid.'
                );
            }

            if ($stock < $quantity) {
                throw new CheckoutConflictException(
                    "Stok produk {$productId} tidak mencukupi."
                );
            }

            $productName = $product['name'] ?? null;
            $price = $product['price'] ?? null;

            if (
                ! is_string($productName)
                || trim($productName) === ''
                || ! is_numeric($price)
                || (float) $price < 0
            ) {
                throw new \App\Exceptions\DownstreamServiceException(
                    'Data produk dari Product Service tidak valid.'
                );
            }

            // Hitung dalam satuan sen agar total tidak bergantung
            // pada penjumlahan angka pecahan floating point.
            $unitPriceCents = (int) round((float) $price * 100);
            $subtotalCents = $unitPriceCents * $quantity;
            $totalCents += $subtotalCents;

            $validatedItems[] = [
                'product_id' => $productId,
                'product_name' => $productName,
                'unit_price' => number_format(
                    $unitPriceCents / 100,
                    2,
                    '.',
                    ''
                ),
                'quantity' => $quantity,
                'subtotal' => number_format(
                    $subtotalCents / 100,
                    2,
                    '.',
                    ''
                ),
            ];
        }

        // Simpan order dan seluruh item dalam satu transaksi database.
        $order = DB::transaction(function () use (
            $userId,
            $validatedItems,
            $totalCents
        ): Order {
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'PENDING',
                'total_amount' => number_format(
                    $totalCents / 100,
                    2,
                    '.',
                    ''
                ),
            ]);

            foreach ($validatedItems as $validatedItem) {
                $order->items()->create($validatedItem);
            }

            return $order->load('items');
        });

        // Keranjang dibersihkan setelah order berhasil disimpan.
        // Kegagalan mengosongkan keranjang tidak membatalkan order.
        try {
            $this->cartClient->clearCart($userId);
        } catch (Throwable $exception) {
            Log::error('Order tersimpan, tetapi keranjang gagal dikosongkan.', [
                'order_id' => $order->id,
                'user_id' => $userId,
                'exception' => $exception->getMessage(),
            ]);
        }

        return $order;
    }

    
    public function getOrderById(int $orderId): ?Order
    {
        return Order::with('items')->find($orderId);
    }

    public function getOrdersByUser(
        int $userId,
        ?string $status = null
    ) {
        $query = Order::with('items')
            ->where('user_id', $userId)
            ->orderByDesc('created_at');

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    
    public function payOrder(int $orderId): ?Order
    {
        return DB::transaction(function () use ($orderId): ?Order {
            $order = Order::whereKey($orderId)
                ->lockForUpdate()
                ->first();

            if ($order === null) {
                return null;
            }

            if ($order->status !== 'PENDING') {
                throw new CheckoutConflictException(
                    'Pesanan tidak dapat dibayar karena statusnya bukan PENDING.'
                );
            }

            $order->status = 'PAID';
            $order->save();

            return $order->load('items');
        });
    }


}
