import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';
import { ReviewDto } from './dto/review.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ReviewService {
    constructor(
        private prisma: PrismaService,
        private productService: ProductService,
    ) {}

    async getById(id: string) {
        const review = await this.prisma.review.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });

        // if (!review) throw new NotFoundException('Отзыв не найден или вы не являетесь его владельцем');

        return review;
    }

    async getAllByProductId(productId: string) {
        const reviews = await this.prisma.review.findMany({
            where: {
                productId,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        avatarPath: true,
                        rights: true,
                    },
                },
            },
        });

        return reviews;
    }
    async getAll() {
        const reviews = await this.prisma.review.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        avatarPath: true,
                        rights: true,
                    },
                },
            },
        });

        return reviews;
    }

    async create(userId: string, productId: string, dto: ReviewDto) {
        // await this.productService.getById(productId);

        return this.prisma.review.create({
            data: {
                ...dto,
                product: {
                    connect: {
                        id: productId,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async delete(id: string, userId: string, rights: Role[]) {
        const review = await this.getById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (review.userId !== userId && !rights.includes(Role.ADMIN)) {
            throw new ForbiddenException('У вас нет прав для удаления отзыва');
        }
        return this.prisma.review.delete({
            where: {
                id,
            },
        });
    }
}
