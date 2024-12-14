// rating.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RatingService {
    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async calculateAverageRatings() {
        // const updatedUser = await this.prisma.user.update({
        //     where: { id: 'cm3k1pyxf0000nzlc2hix3109' },
        //     data: {
        //         rights: { set: ['ADMIN','USER'] },
        //     },
        // });
        // console.log('updatedUser', updatedUser);
        const products = await this.prisma.product.findMany({
            include: {
                review: {
                    select: {
                        rating: true,
                    },
                },
            },
        });

        for (const product of products) {
            const totalRatings = product.review.reduce((acc, review) => acc + review.rating, 0);
            const rating = product.review.length ? totalRatings / product.review.length : 0;

            await this.prisma.product.update({
                where: { id: product.id },
                data: { rating: +rating.toFixed(1) },
            });
        }

        // console.log('Средний рейтинг всех продуктов обновлён.');
    }
}
