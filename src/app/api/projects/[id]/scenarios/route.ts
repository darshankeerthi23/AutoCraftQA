import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, AppError } from '@/lib/utils/apiResponse';

const generateSchema = z.object({
    rtmItemId: z.string().uuid(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { rtmItemId } = generateSchema.parse(body);
        const { id } = await params;

        const rtmItem = await prisma.rTMItem.findUnique({ where: { id: rtmItemId } });
        if (!rtmItem) throw new AppError('NOT_FOUND', 'RTM Item not found', 404);

        const scenarios = await AIService.generateScenarios(rtmItem.description);

        // Transactional save to replace old scenarios for this item
        const savedScenarios = await prisma.$transaction(async (tx) => {
            await tx.testScenario.deleteMany({ where: { rtmItemId } });

            const created = [];
            for (const scen of scenarios) {
                created.push(await tx.testScenario.create({
                    data: {
                        title: scen.title,
                        steps: scen.steps,
                        rtmItemId
                    }
                }));
            }
            return created;
        });

        await prisma.project.update({
            where: { id },
            data: { status: 'TEST_BUILD' }
        });

        return successResponse(savedScenarios);

    } catch (error) {
        return errorResponse(error);
    }
}
