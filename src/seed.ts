import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import { hash } from 'argon2';
const prisma = new PrismaClient();

async function main() {
    const NUM = 10;
    const NUM_USERS = 2;

    const userIds: string[] = [];

    for (let i = 0; i < NUM_USERS; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                password: await hash('123456'),
            },
        });
        userIds.push(user.id);
    }

    const productIds: string[] = [];

    for (let i = 0; i < NUM; i++) {
        const createdAt = faker.date.past({ years: 1 });

        const product = await prisma.product.create({
            data: {
                description: faker.commerce.productDescription(),
                rating: +faker.helpers.arrayElement([0, 1, 2, 3, 4, 5]),
                discount: +faker.helpers.arrayElement([5, 10, 15, 20, 25, 50]),
                color: faker.color.human(),
                sizes: [36, 37, 38, 39, 40, 41],
                stock: +faker.helpers.arrayElement([1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]),
                images: [faker.image.urlPicsumPhotos()],
                gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'UNISEX']),
                title: faker.commerce.productName(),
                price: +faker.commerce.price({ min: 800, max: 10000 }),
                brand: faker.commerce.productAdjective(),
                createdAt,
            },
        });

        productIds.push(product.id);
    }

    for (const productId of productIds) {
        const numReviews = faker.helpers.arrayElement([1, 2, 3, 4]);

        for (let i = 0; i < numReviews; i++) {
            const reviewCreatedAt = faker.date.past({ years: 1 });
            const randomUserId = faker.helpers.arrayElement(userIds);
            await prisma.review.create({
                data: {
                    text: faker.commerce.productDescription(),
                    rating: faker.helpers.arrayElement([4, 5]),
                    createdAt: reviewCreatedAt,
                    productId, // Привязка к продукту
                    userId: randomUserId,
                },
            });
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
