<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\DeliveryFeeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware('auth:admin')->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::put('/profile', [AdminAuthController::class, 'updateProfile']); // <-- ADD THIS
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        Route::get('/delivery-fees', [DeliveryFeeController::class, 'index']);
        Route::apiResource('items', ItemController::class);
        Route::apiResource('vouchers', VoucherController::class);
    });
});
