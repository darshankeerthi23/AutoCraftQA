import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjectService } from '@/lib/services/projectService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

const ingestSchema = z.object({
    content: z.string().min(10, 'Content must be at least 10 chars'),
    type: z.string().min(1),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { content, type } = ingestSchema.parse(body);
        const { id } = await params; // Next.js 13/14 params are strictly typed in recent versions, but for safety in this setup:

        // Note: in Next.js 15 params is a promise, but in 14 it's an object. 
        // Assuming standard 14 behaviour or 15 with await if needed. 
        // For now treating as object, but if build fails I will adjust.

        const asset = await ProjectService.addAsset(id, content, type);
        return successResponse(asset, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
