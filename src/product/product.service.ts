import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductDto } from './dto/product.dto';
import { PaginationArgsWithSearchTerm } from './base/pagination/pagination.args';
import { isHasMorePagination } from './base/pagination/is-has-more';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

    async getAll(args?: PaginationArgsWithSearchTerm) {
        const searchTermQuery = args?.searchTerm ? this.getSearchTermFilter(args?.searchTerm) : {};

        const priceFilter =
            args?.priceFrom !== undefined && args?.priceTo !== undefined
                ? { price: { gte: +args?.priceFrom, lte: +args?.priceTo } }
                : {};

        const gender = args?.gender ? { gender: args?.gender } : {};

        const orderBy = args?.sortBy
            ? {
                  [args?.sortBy]: args?.sortOrder,
              }
            : {};

        const filter = { ...searchTermQuery, ...gender, ...priceFilter };

        const products = await this.prisma.product.findMany({
            skip: +args?.skip || 0,
            take: +args?.take || 9,
            where: filter,
            orderBy,
        });
        const totalCount = await this.prisma.product.count({
            where: filter,
        });

        const isHasMore = isHasMorePagination(totalCount, +args?.skip, +args.take);

        return { items: products, isHasMore, totalCount };
    }

    private async getProductFilter(searchTerm: string) {
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
