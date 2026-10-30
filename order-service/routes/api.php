<?php

use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'message' => 'Order Service berjalan.',
        'data' => [
            'service' => 'order-service',
            'status' => 'UP',
        ],
    ], 200);
});

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/user/{userId}', [OrderController::class, 'history']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::patch('/orders/{id}/pay', [OrderController::class, 'pay']);