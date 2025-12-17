import { prisma } from '@/lib/db';
import { AppError } from '@/lib/utils/apiResponse';

export class ProjectService {
    static async create(name: string) {
        return prisma.project.create({
            data: { name },
        });
    }

    static async getById(id: string) {
        const project = await prisma.project.findFirst({
            where: { id, deletedAt: null },
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
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async addAsset(projectId: string, content: string, type: string) {
        return prisma.rawAsset.create({
            data: { projectId, content, type },
        });
    }

    static async updateStatus(id: string, status: string) {
        // updateMany allows filtering by non-unique fields like deletedAt
        return prisma.project.updateMany({
            where: { id, deletedAt: null },
            data: { status }
        });
    }

    static async softDelete(id: string) {
        return prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
