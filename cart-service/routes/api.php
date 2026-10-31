<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CartController;

Route::post('/debug-request', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'content_type' => $request->header('Content-Type'),
        'raw_body' => $request->getContent(),
        'all_input' => $request->all(),
        'json_input' => $request->json()->all(),
    ]);
});

// Menampilkan keranjang
Route::get('/carts/{userId}', [CartController::class, 'show'])
    ->whereNumber('userId');

// Menambahkan item ke keranjang
Route::post('/carts', [CartController::class, 'store']);

// Mengubah jumlah item
Route::put('/carts/items/{id}', [CartController::class, 'update'])
    ->whereNumber('id');

// Menghapus satu item
Route::delete('/carts/items/{id}', [CartController::class, 'destroy'])
    ->whereNumber('id');

// Mengosongkan seluruh keranjang
Route::delete('/carts/{userId}', [CartController::class, 'clear'])
    ->whereNumber('userId');