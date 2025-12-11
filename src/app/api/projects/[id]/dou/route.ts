import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjectService } from '@/lib/services/projectService';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, AppError } from '@/lib/utils/apiResponse';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await ProjectService.getById(id);

        // Combine all assets into one context
        const assetsContent = project.assets.map(a => `Type: ${a.type}\nContent: ${a.content}`).join('\n\n');
        if (!assetsContent) throw new AppError('INVALID_INPUT', 'No assets found to generate DOU');

        const douContent = await AIService.generateDOU(assetsContent);

        // Save generated DOU
        const dou = await prisma.dOU.upsert({
            where: { projectId: id },
            update: { content: douContent, status: 'DRAFT' },
            create: { projectId: id, content: douContent, status: 'DRAFT' }
        });

        await ProjectService.updateStatus(id, 'DOU_REVIEW');

        return successResponse(dou);
    } catch (error) {
        return errorResponse(error);
    }
}

const approveSchema = z.object({
    status: z.literal('APPROVED'),
});

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = approveSchema.parse(body);

        const dou = await prisma.dOU.update({
            where: { projectId: id },
            data: { status }
        });

        // Advance project status
        await ProjectService.updateStatus(id, 'RTM_BUILD');

        return successResponse(dou);
    } catch (error) {
        return errorResponse(error);
    }
}
