<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;
use App\Modules\CMS\Services\SeoAnalysisService;

class AdminSeoController
{
    public function analyze(Request $request, SeoAnalysisService $service){ return ApiResponse::success($service->analyze($request->input("content", ""), ["title"=>$request->input("title"),"description"=>$request->input("description")])); }
}
