<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLoginRequest;
use App\Http\Requests\UpdateAdminProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * Authenticate an admin and return a JWT.
     */
    public function login(AdminLoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! $token = auth('admin')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $admin = auth('admin')->user();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('admin')->factory()->getTTL() * 60,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    /**
     * Return the currently authenticated admin.
     */
    public function me(): JsonResponse
    {
        $admin = auth('admin')->user();

        return response()->json([
            'success' => true,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    /**
     * Invalidate the current JWT (adds it to the blacklist).
     */
    public function logout(): JsonResponse
    {
        auth('admin')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }


   public function updateProfile(UpdateAdminProfileRequest $request): JsonResponse
{
    $admin = auth('admin')->user();
    $data = $request->validated();

    // If user wants to change password, verify current password first
    if (!empty($data['new_password'])) {
        if (!Hash::check($data['current_password'], $admin->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided current password does not match our records.'],
            ]);
        }

        // Setting new password triggers setPasswordAttribute mutator in Admin Model
        $admin->password = $data['new_password'];
    }

    $admin->name = $data['name'];
    $admin->email = $data['email'];
    $admin->save();

    return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully.',
        'admin' => [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
        ],
    ]);
}
}