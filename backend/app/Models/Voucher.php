<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'delivery_fee_id',
        'prepaid_fee',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'prepaid_fee' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function deliveryFee(): BelongsTo
    {
        return $this->belongsTo(DeliveryFee::class);
    }

    public function voucherItems(): HasMany
    {
        return $this->hasMany(VoucherItem::class);
    }
}
