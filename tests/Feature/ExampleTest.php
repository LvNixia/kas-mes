<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

test('guests are sent straight to the login screen', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});

test('signed in users are sent to the kas dashboard', function () {
    actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertRedirect(route('kas'));
});
