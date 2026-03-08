<?php

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;

class AdminPaymentController
{
    public function index(Request $request){ return ApiResponse::success(["data"=>[]]); }
}
