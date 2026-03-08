<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\MediaLibrary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminMediaController
{
    public function upload(Request $request)
    {
        $request->validate(['file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,svg,pdf']);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $dimensions = in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
            ? getimagesize($file->getRealPath()) : null;

        $media = MediaLibrary::create([
            'uploaded_by' => $request->user()->id,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $dimensions ? $dimensions[0] : null,
            'height' => $dimensions ? $dimensions[1] : null,
            'alt_text' => $request->input('alt_text'),
        ]);

        $media->url = Storage::disk('public')->url($path);

        return ApiResponse::success(['data' => $media], 'Media uploaded', 201);
    }

    public function index(Request $request)
    {
        $query = MediaLibrary::orderByDesc('created_at');

        if ($type = $request->input('type')) {
            $query->where('mime_type', 'like', $type . '%');
        }

        $media = $query->paginate($request->integer('per_page', 24));

        return ApiResponse::success([
            'data' => collect($media->items())->map(fn ($m) => array_merge($m->toArray(), [
                'url' => Storage::disk($m->disk)->url($m->path),
            ])),
            'meta' => ['current_page' => $media->currentPage(), 'last_page' => $media->lastPage(), 'total' => $media->total()],
        ]);
    }

    public function destroy(int $id)
    {
        $media = MediaLibrary::findOrFail($id);
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return ApiResponse::success([], 'Media deleted');
    }
}
