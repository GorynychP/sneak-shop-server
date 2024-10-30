import { Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) {}

    async syncWishlist(userId: string, createWishlistDto: CreateWishlistDto) {
        const { productIds } = createWishlistDto;

        // 1. Найти существующий Wishlist пользователя
        let wishlist = await this.prisma.wishlist.findFirst({
            where: { userId },
            include: { items: true },
        });

        if (!wishlist) {
            // Если Wishlist нет, создать его
            wishlist = await this.prisma.wishlist.create({
                data: { userId },
                include: { items: true },
            });
        }

        // 2. Получить текущие ID продуктов в Wishlist, чтобы избежать дубликатов
        const existingProductIds = new Set(wishlist.items.map((item) => item.productId));

        // 3. Определить, какие productIds нужно удалить
        const productIdsToDelete = wishlist.items
            .filter((item) => !productIds.includes(item.productId))
            .map((item) => item.id);

        // 4. Отфильтровать новые productIds, чтобы добавить только уникальные
        const newItems = productIds
            .filter((productId) => !existingProductIds.has(productId))
            .map((productId) => ({
                wishlistId: wishlist.id,
                productId,
            }));

        // 5. Удалить устаревшие WishlistItem из базы данных
        await this.prisma.wishlistItem.deleteMany({
            where: {
                id: { in: productIdsToDelete },
            },
        });

        // 6. Добавить уникальные WishlistItem в базу данных
        if (newItems.length > 0) {
            await this.prisma.wishlistItem.createMany({
                data: newItems,
            });
        }

        // 7. Обновить и вернуть актуальный Wishlist
        const wishlistUnique = await this.prisma.wishlist.findUnique({
            where: { id: wishlist.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        const productWishlist = wishlistUnique.items.map((item) => item.product);
        return { wishlist: productWishlist };
    }
    // async create(userId?: string, createWishlistDto?: CreateWishlistDto) {
    //     const { productIds } = createWishlistDto;

    //     // const wishlistOne = await this.getById(userId);
    //     if (wishlistOne) {
    //         // await this.remove(wishlistOne);
    //     }
    //     console.log('wishlistOne', wishlistOne);
    //     const wishlist = await this.prisma.wishlist.create({
    //         data: {
    //             userId,
    //         },
    //     });

    //     const wishlistItems = productIds.map((productId) => ({
    //         wishlistId: wishlist.id,
    //         productId,
    //     }));

    //     await this.prisma.wishlistItem.createMany({
    //         data: wishlistItems,
    //     });

    //     console.log('createWishlistDto', { ...wishlist, items: wishlistItems });
    //     return 'This action adds a new wishlist';
    // }

    async getById(wishlistId?: number) {
        return await this.prisma.wishlist.findUnique({
            where: {
                id: wishlistId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async findAll(userId: string) {
        const wishlist = await this.prisma.wishlist.findFirst({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const productWishlist = wishlist.items.map((item) => item.product);

        return { wishlist: productWishlist };
    }

    async remove(id: number) {
        await this.prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: id,
            },
        });
    }
}
