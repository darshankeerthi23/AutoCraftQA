import { NextResponse } from 'next/server';
import { z } from 'zod';

type ErrorCode = 'INVALID_INPUT' | 'NOT_FOUND' | 'INTERNAL_ERROR' | 'UNAUTHORIZED';

interface ApiError {
    code: ErrorCode;
    message: string;
    details?: unknown;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export class AppError extends Error {
    public code: ErrorCode;
    public statusCode: number;
    public details?: unknown;

    constructor(code: ErrorCode, message: string, statusCode = 400, details?: unknown) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}

export function successResponse<T>(data: T, statusCode = 200) {
    return NextResponse.json({ success: true, data }, { status: statusCode });
}

export function errorResponse(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof AppError) {
        return NextResponse.json(
            {
                success: false,
                error: { code: error.code, message: error.message, details: error.details },
            },
            { status: error.statusCode }
        );
    }

    if (error instanceof z.ZodError) {
        return NextResponse.json(
            {
                success: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error: { code: 'INVALID_INPUT', message: 'Validation failed', details: (error as any).errors },
            },
            { status: 400 }
        );
    }

    return NextResponse.json(
        {
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
        },
        { status: 500 }
    );
}
