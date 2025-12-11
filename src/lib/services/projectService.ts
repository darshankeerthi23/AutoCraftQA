import { prisma } from '@/lib/db';
import { AppError } from '@/lib/utils/apiResponse';

export class ProjectService {
    static async create(name: string) {
        return prisma.project.create({
            data: { name },
        });
    }

    static async getById(id: string) {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                assets: true,
                dou: {
                    include: {
                        rtmItems: {
                            include: {
                                scenarios: {
                                    include: {
                                        testCases: {
                                            include: {
                                                automatedTests: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
        });
        if (!project) throw new AppError('NOT_FOUND', 'Project not found', 404);
        return project;
    }

    static async getAll() {
        return prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    static async addAsset(projectId: string, content: string, type: string) {
        return prisma.rawAsset.create({
            data: { projectId, content, type },
        });
    }

    static async updateStatus(id: string, status: string) {
        return prisma.project.update({
            where: { id },
            data: { status }
        });
    }
}
