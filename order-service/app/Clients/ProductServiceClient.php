<?php

namespace App\Clients;

use App\Exceptions\DownstreamServiceException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class ProductServiceClient
{
    public function getProduct(int $productId): ?array
    {
        $baseUrl = rtrim(
            (string) config('services.product.url'),
            '/'
        );

        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->get("{$baseUrl}/products/{$productId}");
        } catch (ConnectionException $exception) {
            throw new DownstreamServiceException(
                'Product Service tidak dapat dihubungi.',
                0,
                $exception
            );
        }

        if ($response->status() === 404) {
            return null;
        }

        if ($response->failed()) {
            throw new DownstreamServiceException(
                'Gagal mengambil data produk.'
            );
        }

        $product = $response->json('data');

        if (! is_array($product)) {
            throw new DownstreamServiceException(
                'Format respons Product Service tidak valid.'
            );
        }

        return $product;
    }
}
