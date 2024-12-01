import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductDto } from './dto/product.dto';
import { PaginationArgsDto } from './base/pagination/pagination.args';
import { isHasMorePagination } from './base/pagination/is-has-more';
import { Prisma } from '@prisma/client';

import { PopularArgsDto } from './base/pagination/popular.args';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

    async getAll(args?: PaginationArgsDto) {
        const { filters, orderBy } = await this.getFilters(args);

        const products = await this.prisma.product.findMany({
            skip: +args?.skip || 0,
            take: +args?.take || 9,
            where: filters,
            orderBy,
        });

        const totalCount = await this.prisma.product.count({
            where: filters,
        });

        const isHasMore = isHasMorePagination(totalCount, +args?.skip, +args.take);

        return { items: products, isHasMore, totalCount };
    }
    async getAllProducts(args?: PaginationArgsDto) {
        const searchTermQuery = await this.getSearchTermFilter(args?.searchTerm);

        const products = await this.prisma.product.findMany({
            where: searchTermQuery,
        });

        return products;
    }

    private async getFilters(args?: PaginationArgsDto) {
        const searchTermQuery = await this.getSearchTermFilter(args?.searchTerm);

        const priceFilter =
            args?.priceFrom !== undefined && args?.priceTo !== undefined
                ? { price: { gte: +args?.priceFrom, lte: +args?.priceTo } }
                : {};

        const gender: Prisma.ProductWhereInput = args?.gender ? { gender: args?.gender } : {};

        const isSale: Prisma.ProductWhereInput = args?.isSale ? { discount: { gt: 0 } } : {};

        function transformStringToArray(sizes: string) {
            if (!sizes || typeof sizes !== 'string') {
                return [];
            }
            try {
                const sizesIsArray = JSON.parse(sizes);
                // const sizesIsArray = sizes.split(',').map((size) => +size);
                return sizesIsArray;
            } catch (error) {
                console.log('error', error);
            }
        }
        const sizesArray = transformStringToArray(args?.sizes);

        const sizes: Prisma.ProductWhereInput = args?.sizes ? { sizes: { hasSome: sizesArray } } : {};

        const orderBy = args?.sortBy
            ? {
                  [args?.sortBy]: args?.sortOrder,
              }
            : {};

        const filters = { ...searchTermQuery, ...priceFilter, ...isSale, ...gender, ...sizes };

        return { filters, orderBy };
    }
    private async getSearchTermFilter(searchTerm: string) {
        if (!searchTerm || typeof searchTerm !== 'string') {
            return {};
        }
        return {
            OR: [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive' as Prisma.QueryMode,
                    },
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive' as Prisma.QueryMode,
                    },
                },
            ],
        };
    }

    async getById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: {
                id,
            },
            include: {
                review: {
                    orderBy: {
                        createdAt: 'desc',
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
                },
            },
        });
        if (!product) throw new NotFoundException('Товар не найден');

        // const averageRating = await this.prisma.review.aggregate({
        //     where: {
        //         productId: id,
        //     },
        //     _avg: {
        //         rating: true,
        //     },
        // });
        // await this.prisma.product.update({
        //     where: {
        //         id,
        //     },
        //     data: {
        //         rating: averageRating._avg.rating || 0,
        //     },
        // });

        return product;
    }

    async getMostPopular(args?: PopularArgsDto) {
        // const mostPopularProducts = await this.prisma.orderItem.groupBy({
        //     by: ['productId'],
        //     _count: {
        //         id: true,
        //     },
        //     orderBy: {
        //         _count: {
        //             id: 'desc',
        //         },
        //     },
        // });

        // const productIds = mostPopularProducts.map((item) => item.productId);
        // const newProducts = args.isNew ? { createAt: 'desc' } : {};
        const rating = args?.isRating === 'true' ? { rating: { gt: 3 } } : {};

        const products = await this.prisma.product.findMany({
            where: {
                ...rating,
                // id: {
                //     in: productIds,
                // },
            },
            take: 30,
            orderBy: { createdAt: 'desc' },
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
                discount: dto.discount,
                price: dto.price,
                images: dto.images,
                gender: dto.gender,
                brand: 'Nike',
                color: 'red',
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
