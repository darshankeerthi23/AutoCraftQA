import { NextRequest } from 'next/server';
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

        if (!project.dou || project.dou.status !== 'APPROVED') {
            throw new AppError('UNAUTHORIZED', 'DOU must be approved before generating RTM');
        }

        const rtmItems = await AIService.generateRTM(project.dou.content);

        // Transactional save
        await prisma.$transaction(async (tx) => {
            // Clear existing RTM items for clean regeneration
            await tx.rTMItem.deleteMany({ where: { douId: project.dou!.id } });

            for (const item of rtmItems) {
                await tx.rTMItem.create({
                    data: {
                        reqId: item.reqId,
                        description: item.description,
                        douId: project.dou!.id
                    }
                });
            }
        });

        const savedRtm = await prisma.rTMItem.findMany({ where: { douId: project.dou.id } });
        return successResponse(savedRtm);

    } catch (error) {
        return errorResponse(error);
    }
}
