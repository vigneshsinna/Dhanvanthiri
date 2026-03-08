<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Faq;
use Illuminate\Http\Request;

class AdminFaqController
{
    public function index()
    {
        $faqs = Faq::orderBy('category')->orderBy('sort_order')->get();
        return ApiResponse::success(['data' => $faqs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'nullable|string|max:100',
            'question' => 'required|string|max:300',
            'answer' => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $faq = Faq::create($data);

        return ApiResponse::success(['data' => $faq], 'FAQ created', 201);
    }

    public function show(int $id)
    {
        $faq = Faq::findOrFail($id);
        return ApiResponse::success(['data' => $faq]);
    }

    public function update(Request $request, int $id)
    {
        $faq = Faq::findOrFail($id);

        $data = $request->validate([
            'category' => 'nullable|string|max:100',
            'question' => 'sometimes|string|max:300',
            'answer' => 'sometimes|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $faq->update($data);

        return ApiResponse::success(['data' => $faq->fresh()], 'FAQ updated');
    }

    public function destroy(int $id)
    {
        Faq::findOrFail($id)->delete();
        return ApiResponse::success([], 'FAQ deleted');
    }
}
