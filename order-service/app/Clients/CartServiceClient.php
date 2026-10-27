<?php

namespace App\Clients;

use App\Exceptions\DownstreamServiceException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class CartServiceClient
{
    public function getCart(int $userId): array
    {
        $baseUrl = rtrim(
            (string) config('services.cart.url'),
            '/'
        );

        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->get("{$baseUrl}/carts/{$userId}");
        } catch (ConnectionException $exception) {
            throw new DownstreamServiceException(
                'Cart Service tidak dapat dihubungi.',
                0,
                $exception
            );
        }

        if ($response->failed()) {
            throw new DownstreamServiceException(
                'Gagal mengambil data keranjang.'
            );
        }

        $cart = $response->json('data');

        if (! is_array($cart)) {
            throw new DownstreamServiceException(
                'Format respons Cart Service tidak valid.'
            );
        }

        return $cart;
    }

    public function clearCart(int $userId): bool
    {
        $baseUrl = rtrim(
            (string) config('services.cart.url'),
            '/'
        );

        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->delete("{$baseUrl}/carts/{$userId}");
        } catch (ConnectionException $exception) {
            throw new DownstreamServiceException(
                'Gagal menghubungi Cart Service untuk mengosongkan keranjang.',
                0,
                $exception
            );
        }

        if ($response->failed()) {
            throw new DownstreamServiceException(
                'Gagal mengosongkan keranjang.'
            );
        }

        return true;
    }
}
