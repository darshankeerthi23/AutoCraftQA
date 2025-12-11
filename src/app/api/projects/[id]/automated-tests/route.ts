import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AIService } from '@/lib/services/aiService';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, AppError } from '@/lib/utils/apiResponse';

const generateSchema = z.object({
    testCaseId: z.string().uuid(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { testCaseId } = generateSchema.parse(body);
        const { id } = await params;

        const testCase = await prisma.testCase.findUnique({ where: { id: testCaseId } });
        if (!testCase) throw new AppError('NOT_FOUND', 'Test Case not found', 404);

        const context = `Title: ${testCase.title}\nPreconditions: ${testCase.preconditions}\nSteps: ${testCase.steps}\nExpected: ${testCase.expectedResult}`;
        const code = await AIService.generateAutomatedTest(context);

        // We append or replace? Usually one automated test per case.
        const savedTest = await prisma.$transaction(async (tx) => {
            await tx.automatedTest.deleteMany({ where: { testCaseId } });

            return tx.automatedTest.create({
                data: {
                    code,
                    testCaseId
                }
            });
        });

        return successResponse(savedTest);

    } catch (error) {
        return errorResponse(error);
    }
}
