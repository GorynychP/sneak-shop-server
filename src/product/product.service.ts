import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

    async getAll(searchTerm?: string) {
        if (typeof searchTerm === 'string') return this.getSearchTermFilter(searchTerm);

        return this.prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    private async getSearchTermFilter(searchTerm: string) {
        // if (!searchTerm || typeof searchTerm !== 'string') {
        //     return {};
        // }
        return this.prisma.product.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        });
    }

    async getById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: {
                id,
            },
            include: {
                review: {
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
                },
            },
        });

        if (!product) throw new NotFoundException('Товар не найден');

        return product;
    }

    async getMostPopular() {
        const mostPopularProducts = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });

        const productIds = mostPopularProducts.map((item) => item.productId);

        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
            },
        });

        return products;
    }

    async getSimilar(id: string) {
        const currentProduct = await this.getById(id);

        if (!currentProduct) throw new NotFoundException('Текущий товар не найден');

        const products = await this.prisma.product.findMany({
            where: {
                NOT: {
                    id: currentProduct.id,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return products;
    }

    async create(dto: ProductDto) {
        return this.prisma.product.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: dto.price,
                images: dto.images,
                gender: dto.gender,
                brand: dto.brand,
                color: dto.color,
            },
        });
    }

    async update(id: string, dto: ProductDto) {
        await this.getById(id);

        return this.prisma.product.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string) {
        await this.getById(id);
        await this.prisma.product.delete({
            where: { id },
        });
        return { massage: `Товар c id:${id} был удален` };
    }
}
