import { Gender } from '@prisma/client';
import { ArrayMinSize, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductDto {
    @IsString({
        message: 'Название обязательно',
    })
    @IsNotEmpty({ message: 'Название не может быть пустым' })
    title: string;

    @IsString({ message: 'Описание обязательно' })
    @IsNotEmpty({ message: 'Описание не может быть пустым' })
    description: string;

    @IsNumber({}, { message: 'Цена должна быть числом' })
    @IsNotEmpty({ message: 'Цена не может быть пустой' })
    price: number;

    @IsString({
        message: 'Укажите хотя бы одну картинку',
        each: true,
    })
    @ArrayMinSize(1, { message: 'Должна быть хотя бы одна картинка' })
    @IsNotEmpty({
        each: true,
        message: 'Путь к картинке не может быть пустым',
    })
    images: string[];

    @IsEnum(Gender)
    @IsOptional()
    gender: Gender;

    @IsString({ message: 'Бренд обязателен' })
    @IsNotEmpty({ message: 'Бренд не может быть пустым' })
    brand: string;

    @IsString({ message: 'Цвет обязателен' })
    @IsNotEmpty({ message: 'Цвет не может быть пустым' })
    color: string;
}
