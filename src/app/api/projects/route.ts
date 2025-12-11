import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjectService } from '@/lib/services/projectService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name } = createProjectSchema.parse(body);
        const project = await ProjectService.create(name);
        return successResponse(project, 201);
    } catch (error) {
        return errorResponse(error);
    }
}

export async function GET() {
    try {
        const projects = await ProjectService.getAll();
        return successResponse(projects);
    } catch (error) {
        return errorResponse(error);
    }
}
