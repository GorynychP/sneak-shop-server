import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'argon2';
import 'dotenv/config';
const prisma = new PrismaClient();
// enum Gender {
//     MALE,
//     FEMALE,
//     UNISEX,
// }
// const genderEnum = {
//     male: Gender.MALE,
//     female: Gender.FEMALE,
//     unisex: Gender.UNISEX,
// };
// const gender = ['MALE', 'FEMALE', 'UNISEX'];
const countries = ['Russia', 'Ukraine', 'China', 'Belarus', 'Kazakhstan', 'Turkey '];

async function main() {
    const NUM_USERS = 25;

    for (let i = 0; i < NUM_USERS; i++) {
        const email = faker.internet.email();
        const password = await hash('123456');
        const name = faker.person.firstName();
        const avatarPath = faker.image.avatar();
        const country = faker.helpers.arrayElement(countries);
        const createdAt = faker.date.past({ years: 1 });

        const updatedAt = new Date(
            createdAt.getTime() + Math.random() * (new Date().getTime() - createdAt.getTime()),
        );

        await prisma.user.create({
            data: {
                email,
                password,
                country,
                name,
                avatarPath,
                updatedAt,
                createdAt,
            },
        });
    }
    for (let i = 0; i < NUM_USERS; i++) {
        const createdAt = faker.date.past({ years: 1 });

        await prisma.sneaker.create({
            data: {
                description: faker.commerce.productDescription(),
                rating: +faker.helpers.arrayElement([0, 1, 2, 3, 4, 5]),
                discount: +faker.helpers.arrayElement([5, 10, 15, 20, 25, 50]),
                color: faker.color.human(),
                stock: +faker.helpers.arrayElement([1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]),
                image: faker.image.urlPicsumPhotos(),
                gender: 'MALE',
                name: faker.commerce.productName(),
                price: +faker.commerce.price({ min: 800, max: 10000 }),
                brand: faker.commerce.productAdjective(),
                createdAt,
            },
        });
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
