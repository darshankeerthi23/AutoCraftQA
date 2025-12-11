import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, AppError } from '@/lib/utils/apiResponse';

const generateSchema = z.object({
    scenarioId: z.string().uuid(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { scenarioId } = generateSchema.parse(body);
        // id param not strictly needed but good to have context if we want to validate project ownership
        const { id } = await params;

        const scenario = await prisma.testScenario.findUnique({ where: { id: scenarioId } });
        if (!scenario) throw new AppError('NOT_FOUND', 'Scenario not found', 404);

        const context = `Title: ${scenario.title}\nDescription: ${scenario.description || ''}\nSteps: ${scenario.steps}`;
        const testCases = await AIService.generateTestCases(context);

        const savedCases = await prisma.$transaction(async (tx) => {
            await tx.testCase.deleteMany({ where: { scenarioId } });

            const created = [];
            for (const tc of testCases) {
                created.push(await tx.testCase.create({
                    data: {
                        title: tc.title,
                        preconditions: tc.preconditions,
                        steps: tc.steps,
                        expectedResult: tc.expectedResult,
                        scenarioId
                    }
                }));
            }
            return created;
        });

        return successResponse(savedCases);

    } catch (error) {
        return errorResponse(error);
    }
}
