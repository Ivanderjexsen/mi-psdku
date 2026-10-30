<?php

namespace App\Http\Controllers;

use App\Exceptions\CheckoutConflictException;
use App\Exceptions\DownstreamServiceException;
use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {
    }

    /**
     * Membuat pesanan baru melalui checkout.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $userId = (int) $request->validated()['user_id'];

        try {
            $order = $this->orderService->checkout($userId);

            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'data' => $order,
            ], 201);

        } catch (CheckoutConflictException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'data' => null,
            ], 409);

        } catch (DownstreamServiceException $exception) {
            Log::error('Layanan pendukung gagal saat checkout.', [
                'user_id' => $userId,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Layanan pendukung sedang tidak tersedia.',
                'data' => null,
            ], 503);

        } catch (QueryException $exception) {
            Log::error('Database gagal saat checkout.', [
                'user_id' => $userId,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan pesanan.',
                'data' => null,
            ], 500);

        } catch (Throwable $exception) {
            Log::error('Kesalahan tidak terduga saat checkout.', [
                'user_id' => $userId,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan internal.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * Mengambil detail pesanan berdasarkan ID.
     */
    public function show(string $id): JsonResponse
    {
        if (! ctype_digit($id) || (int) $id < 1) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        try {
            $order = $this->orderService->getOrderById((int) $id);

            if ($order === null) {
                return response()->json([
                    'message' => 'Pesanan tidak ditemukan.',
                    'data' => null,
                ], 404);
            }

            return response()->json([
                'message' => 'Detail pesanan berhasil diambil.',
                'data' => $order,
            ], 200);

        } catch (Throwable $exception) {
            Log::error('Gagal mengambil detail pesanan.', [
                'order_id' => (int) $id,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil detail pesanan.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * Mengambil riwayat pesanan berdasarkan ID pengguna.
     */
    public function history(string $userId): JsonResponse
    {
        if (! ctype_digit($userId) || (int) $userId < 1) {
            return response()->json([
                'message' => 'Pengguna tidak valid.',
                'data' => null,
            ], 404);
        }

        $status = request()->query('status');

        if (
            $status !== null
            && ! in_array($status, ['PENDING', 'PAID'], true)
        ) {
            return response()->json([
                'message' => 'Status tidak valid.',
                'errors' => [
                    'status' => [
                        'Status harus PENDING atau PAID.',
                    ],
                ],
            ], 422);
        }

        try {
            $orders = $this->orderService->getOrdersByUser(
                (int) $userId,
                $status
            );

            return response()->json([
                'message' => 'Riwayat pesanan berhasil diambil.',
                'data' => $orders,
            ], 200);

        } catch (Throwable $exception) {
            Log::error('Gagal mengambil riwayat pesanan.', [
                'user_id' => (int) $userId,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil riwayat pesanan.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * Memproses pembayaran pesanan.
     */
    public function pay(string $id): JsonResponse
    {
        if (! ctype_digit($id) || (int) $id < 1) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        try {
            $order = $this->orderService->payOrder((int) $id);

            if ($order === null) {
                return response()->json([
                    'message' => 'Pesanan tidak ditemukan.',
                    'data' => null,
                ], 404);
            }

            return response()->json([
                'message' => 'Pesanan berhasil dibayar.',
                'data' => $order,
            ], 200);

        } catch (CheckoutConflictException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'data' => null,
            ], 409);

        } catch (Throwable $exception) {
            Log::error('Gagal memproses pembayaran pesanan.', [
                'order_id' => (int) $id,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat memproses pembayaran.',
                'data' => null,
            ], 500);
        }
    }
}
