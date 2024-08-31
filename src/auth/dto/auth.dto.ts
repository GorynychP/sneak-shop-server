import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @IsString({ message: 'Почта обязательна' })
    @IsEmail()
    email: string;

    @MinLength(6, {
        message: 'Password must be at least 6 characters long',
    })
    @IsString({ message: 'Пароль обязателен' })
    password: string;
}
