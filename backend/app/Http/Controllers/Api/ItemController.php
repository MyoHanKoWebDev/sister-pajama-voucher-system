<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class ItemController extends Controller
{
    /**
     * Display a listing of items.
     */
    public function index(): JsonResponse
    {
        $items = Item::latest()->get();

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created item.
     */
    public function store(StoreItemRequest $request): JsonResponse
    {
        $item = Item::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully.',
            'item' => $item,
        ], 201);
    }

    /**
     * Display the specified item.
     */
    public function show(Item $item): JsonResponse
    {
        return response()->json([
            'success' => true,
            'item' => $item,
        ]);
    }

    /**
     * Update the specified item.
     */
    public function update(
        UpdateItemRequest $request,
        Item $item
    ): JsonResponse {
        $item->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully.',
            'item' => $item->fresh(),
        ]);
    }

    /**
     * Remove the specified item.
     */
   public function destroy(Item $item): JsonResponse
{
    try {
        // --- Auto-delete items older than 6 days ---
        Item::where('created_at', '<=', Carbon::now()->subDays(6))->delete();

        // Perform current item deletion
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully.',
        ]);
    } catch (QueryException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot delete this item because it is referenced in existing vouchers.',
        ], 400);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete item.',
        ], 500);
    }
}
}
