import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
// import { isHasMorePagination } from 'src/base/pagination/is-has-more';
// import { UserResponse } from './user.response';
import { PaginationArgsWithSearchTerm } from 'src/base/pagination/pagination';
import { Prisma, Role } from '@prisma/client';
import { hash } from 'argon2';
import { faker } from '@faker-js/faker';
// import { omit } from 'lodash';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    async create({ password, ...dto }: CreateUserDto) {
        const user = {
            ...dto,
            avatarPath: faker.image.avatar(),
            password: await hash(password),
        };
        return await this.prisma.user.create({
            data: user,
        });
    }

    async findAll(args?: PaginationArgsWithSearchTerm) {
        const searchTermQuery = args?.searchTerm ? this.getSearchTermFilter(args?.searchTerm) : {};

        const users = await this.prisma.user.findMany({
            // skip: +args?.skip || 0,
            // take: +args?.take || 20,
            where: searchTermQuery,
        });

        if (!users) throw new NotFoundException('Users not found');

        // const totalCount = await this.prisma.user.count({
        //     where: searchTermQuery,
        // });

        // const isHasMore = isHasMorePagination(totalCount, +args?.skip, +args?.take);

        // return { items: users, isHasMore };
        return users;
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },

            include: {
                favorites: true,
                orders: true,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        // const userOmit = omit(user, ['password', 'createdAt', 'updatedAt']);
        return user;
    }
    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                favorites: true,
                orders: true,
            },
        });
        // if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, { password, ...data }: UpdateUserDto) {
        const currentUser = await this.findById(id);

        if (!currentUser.rights.includes('USER') && !currentUser.rights.includes('ADMIN')) {
            throw new ForbiddenException('У вас недостаточно прав для редактирование');
        }

        const hashedPassword = password
            ? {
                  password: await hash(password),
              }
            : {};
        const updateData = currentUser.rights.includes('ADMIN') ? { ...data } : data;

        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                ...updateData,
                ...hashedPassword,
            },
        });
    }

    async remove(id: string) {
        if (!id) throw new NotFoundException('id is required');
        await this.findById(id);
        return this.prisma.user.delete({
            where: {
                id: id,
            },
        });
    }
    async toggleFavorite(productId: string, userId: string) {
        const user = await this.findById(userId);

        const isExists = user.favorites.some((product) => product.id === productId);

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                favorites: {
                    [isExists ? 'disconnect' : 'connect']: {
                        id: productId,
                    },
                },
            },
        });

        return true;
    }

    async editRolesUser(rights: Role[], userId: string) {
        const user = await this.findById(userId);

        if (!user) throw new NotFoundException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                rights,
            },
        });

        return updatedUser;
    }
    private getSearchTermFilter(searchTerm: string): Prisma.UserWhereInput {
        return {
            OR: [
                {
                    email: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    country: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
            ],
        };
    }
}
