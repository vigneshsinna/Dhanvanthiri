<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Banner;
use Illuminate\Http\Request;

class BannerController
{
    public function index(Request $request)
    {
        $query = Banner::active()->orderBy('sort_order');

        if ($position = $request->input('position')) {
            $query->where('position', $position);
        }

        $banners = $query->get();

        return ApiResponse::success(['data' => $banners]);
    }
}
