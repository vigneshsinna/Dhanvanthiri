<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Faq;

class FaqController
{
    public function index()
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        $grouped = $faqs->groupBy('category');

        return ApiResponse::success(['data' => $grouped]);
    }
}
