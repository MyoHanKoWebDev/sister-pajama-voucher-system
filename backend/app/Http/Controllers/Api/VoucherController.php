<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVoucherRequest;
use App\Http\Requests\UpdateVoucherRequest;
use App\Models\Customer;
use App\Models\DeliveryFee;
use App\Models\Item;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    /**
     * Display all vouchers.
     */
    public function index(): JsonResponse
    {
        $vouchers = Voucher::with([
            'customer',
            'deliveryFee',
            'voucherItems.item',
        ])
            ->latest()
            ->get();

        $vouchers = $vouchers->map(function ($voucher) {
            return $this->formatVoucher($voucher);
        });

        return response()->json([
            'success' => true,
            'vouchers' => $vouchers,
        ]);
    }

    /**
     * Store a newly created voucher.
     */
    public function store(StoreVoucherRequest $request): JsonResponse
    {
        $voucher = DB::transaction(function () use ($request) {

            $data = $request->validated();

            // Create customer
            $customer = Customer::create([
                'name' => $data['customer']['name'],
                'address' => $data['customer']['address'],
                'phone' => $data['customer']['phone'],
            ]);

            // Create voucher
            $voucher = Voucher::create([
                'customer_id' => $customer->id,
                'delivery_fee_id' => $data['delivery_fee_id'],
                'prepaid_fee' => $data['prepaid_fee'],
            ]);

            // Create voucher items
            foreach ($data['items'] as $voucherItem) {
                $voucher->voucherItems()->create([
                    'item_id' => $voucherItem['item_id'],
                    'quantity' => $voucherItem['quantity'],
                ]);
            }

            return $voucher;
        });

        $voucher->load([
            'customer',
            'deliveryFee',
            'voucherItems.item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voucher created successfully.',
            'voucher' => $this->formatVoucher($voucher),
        ], 201);
    }

    /**
     * Display a single voucher.
     */
    public function show(Voucher $voucher): JsonResponse
    {
        $voucher->load([
            'customer',
            'deliveryFee',
            'voucherItems.item',
        ]);

        return response()->json([
            'success' => true,
            'voucher' => $this->formatVoucher($voucher),
        ]);
    }

    /**
     * Update a voucher.
     */
    public function update(
        UpdateVoucherRequest $request,
        Voucher $voucher
    ): JsonResponse {
        DB::transaction(function () use ($request, $voucher) {

            $data = $request->validated();

            // Update customer information
            $voucher->customer->update([
                'name' => $data['customer']['name'],
                'address' => $data['customer']['address'],
                'phone' => $data['customer']['phone'],
            ]);

            // Update voucher
            $voucher->update([
                'delivery_fee_id' => $data['delivery_fee_id'],
                'prepaid_fee' => $data['prepaid_fee'],
            ]);

            // Remove existing voucher items
            $voucher->voucherItems()->delete();

            // Create updated voucher items
            foreach ($data['items'] as $voucherItem) {
                $voucher->voucherItems()->create([
                    'item_id' => $voucherItem['item_id'],
                    'quantity' => $voucherItem['quantity'],
                ]);
            }
        });

        $voucher->load([
            'customer',
            'deliveryFee',
            'voucherItems.item',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voucher updated successfully.',
            'voucher' => $this->formatVoucher($voucher),
        ]);
    }

    /**
     * Delete a voucher.
     */
    public function destroy(Voucher $voucher): JsonResponse
{
    try {
        DB::transaction(function () use ($voucher) {

            // --- Auto-delete vouchers and voucher items older than 6 days ---
            $expiredVoucherIds = Voucher::where('created_at', '<=', Carbon::now()->subDays(6))->pluck('id');
            if ($expiredVoucherIds->isNotEmpty()) {
                DB::table('voucher_items')->whereIn('voucher_id', $expiredVoucherIds)->delete();
                Voucher::whereIn('id', $expiredVoucherIds)->delete();
            }

            // Delete current voucher items first
            $voucher->voucherItems()->delete();

            // Delete current voucher
            $voucher->delete();

            // Do NOT delete the customer.
            // A customer may have other vouchers.
        });

        return response()->json([
            'success' => true,
            'message' => 'Voucher deleted successfully.',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete voucher.',
        ], 500);
    }
}

    /**
     * Format voucher response with calculated totals.
     */
    private function formatVoucher(Voucher $voucher): array
    {
        $subtotal = 0;

        $items = $voucher->voucherItems->map(function ($voucherItem) use (&$subtotal) {

            $price = (float) $voucherItem->item->price;
            $quantity = (int) $voucherItem->quantity;

            $amount = $price * $quantity;

            $subtotal += $amount;

            return [
                'id' => $voucherItem->id,
                'item_id' => $voucherItem->item_id,
                'item_name' => $voucherItem->item->name,
                'quantity' => $quantity,
                'unit_price' => $price,
                'amount' => $amount,
            ];
        })->values();

        $deliveryFee = (float) $voucher->deliveryFee->fee;
        $prepaidFee = (float) $voucher->prepaid_fee;

        $total = $subtotal + $deliveryFee;

        $remainingAmount = $total - $prepaidFee;

        return [
            'id' => $voucher->id,

            'customer' => [
                'id' => $voucher->customer->id,
                'name' => $voucher->customer->name,
                'address' => $voucher->customer->address,
                'phone' => $voucher->customer->phone,
            ],

            'items' => $items,

            'delivery_fee' => [
                'id' => $voucher->deliveryFee->id,
                'fee' => $deliveryFee,
            ],

            'subtotal' => $subtotal,
            'total' => $total,
            'prepaid_fee' => $prepaidFee,
            'remaining_amount' => $remainingAmount,

            'created_at' => $voucher->created_at,
            'updated_at' => $voucher->updated_at,
        ];
    }
}