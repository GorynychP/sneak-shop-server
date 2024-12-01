// import { Role } from '@prisma/client';
import { Role } from '@prisma/client';
import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsOptional } from 'class-validator';

export class EditUserDto {
    @IsOptional({ message: 'Роли обязательны' })
    @IsArray({ message: 'Роли должны быть массивом' })
    @IsEnum(Role, { each: true, message: 'Указанные роли не существуют' })
    @ArrayUnique({ message: 'Роли должны быть уникальными' })
    @ArrayMinSize(1, { message: 'Должна быть хотя бы одна роль' })
    rights: Role[];
}
