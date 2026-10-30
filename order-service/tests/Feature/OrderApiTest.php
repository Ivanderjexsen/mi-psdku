<?php

namespace Tests\Feature;

use Tests\TestCase;

class OrderApiTest extends TestCase
{
    public function test_checkout_requires_user_id(): void
    {
        $response = $this->postJson('/orders', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);
    }

    public function test_checkout_rejects_invalid_user_id(): void
    {
        $response = $this->postJson('/orders', [
            'user_id' => 'bukan-angka',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);
    }
}
