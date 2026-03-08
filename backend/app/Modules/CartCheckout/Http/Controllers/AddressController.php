<?php

namespace App\Modules\CartCheckout\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CartCheckout\Models\Address;
use Illuminate\Http\Request;
use App\Modules\CartCheckout\Http\Requests\AddressRequest;

class AddressController
{
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->orderByDesc('updated_at')->get();
        return ApiResponse::success(['data' => $addresses]);
    }

    public function store(AddressRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        if (!empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = Address::create($data);

        return ApiResponse::success(['data' => $address], 'Address created', 201);
    }

    public function show(int $id, Request $request)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        return ApiResponse::success(['data' => $address]);
    }

    public function update(AddressRequest $request, int $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $data = $request->validated();
        if (!empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($data);

        return ApiResponse::success(['data' => $address->fresh()], 'Address updated');
    }

    public function destroy(int $id, Request $request)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return ApiResponse::success([], 'Address deleted');
    }

    public function setDefault(int $id, Request $request)
    {
        $request->user()->addresses()->update(['is_default' => false]);
        $address = $request->user()->addresses()->findOrFail($id);
        $address->is_default = true;
        $address->save();

        return ApiResponse::success(['data' => $address], 'Default address set');
    }
}
