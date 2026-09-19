<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer.name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer.address' => [
                'required',
                'string',
                'max:500',
            ],

            'customer.phone' => [
                'required',
                'string',
                'max:30',
            ],

            'delivery_fee_id' => [
                'required',
                'integer',
                'exists:delivery_fees,id',
            ],
            
            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.item_id' => [
                'required',
                'integer',
                'exists:items,id',
            ],

            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'prepaid_fee' => [
                'required',
                'numeric',
                'min:0',
            ]
        ];
    }
}