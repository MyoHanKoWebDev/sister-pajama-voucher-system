<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryFee;
use Illuminate\Http\JsonResponse;

class DeliveryFeeController extends Controller
{
    /**
     * Display a listing of available delivery fees.
     */
    public function index(): JsonResponse
    {
        $deliveryFees = DeliveryFee::orderBy('fee', 'asc')->get();

        return response()->json([
            'success' => true,
            'delivery_fees' => $deliveryFees,
        ]);
    }
}