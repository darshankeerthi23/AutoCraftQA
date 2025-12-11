import { NextRequest } from 'next/server';
import { ProjectService } from '@/lib/services/projectService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await ProjectService.getById(id);
        return successResponse(project);
    } catch (error) {
        return errorResponse(error);
    }
}
