import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    avatarPath?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(Role)
    @IsOptional()
    rights?: Role[];
}

export type UpdateUserDto = Partial<CreateUserDto>;
