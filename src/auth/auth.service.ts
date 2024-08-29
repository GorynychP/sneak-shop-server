import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { verify } from 'argon2';
import { Role, type User } from '@prisma/client';
import { omit } from 'lodash';

@Injectable()
export class AuthService {
    constructor(
        // private prisma: PrismaService,
        private jwt: JwtService,
        private userService: UserService,
        // private emailService: EmailService
    ) {}

    private readonly TOKEN_EXPIRATION_ACCESS = '1h';
    private readonly TOKEN_EXPIRATION_REFRESH = '7d';

    async login(dto: AuthDto) {
        const user = await this.validateUser(dto);
        return this.buildResponseObject(user);
    }

    async register(dto: AuthDto) {
        const userExists = await this.userService.findByEmail(dto.email);
        if (userExists) {
            throw new BadRequestException('Такой пользователь уже существует');
        }
        const user = await this.userService.create(dto);

        // await this.emailService.sendVerification(
        //     user.email,
        //     `http://localhost:4200/verify-email?token=${user.verificationToken}`,
        // );

        return this.buildResponseObject(user);
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync(refreshToken);
        if (!result) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const user = await this.userService.findById(result.id);
        return this.buildResponseObject(user);
    }

    // async verifyEmail(token: string) {
    //     const user = await this.prisma.user.findFirst({
    //         where: {
    //             verificationToken: token,
    //         },
    //     });

    //     if (!user) throw new NotFoundException('Token not exists!');

    //     await this.userService.update(user.id, {
    //         verificationToken: null,
    //     });

    //     return 'Email verified!';
    // }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Email or password invalid');
        }
        const isValid = await verify(user.password, dto.password);
        if (!isValid) {
            throw new UnauthorizedException('Email or password invalid');
        }
        return user;
    }
    async buildResponseObject(user: User) {
        const tokens = await this.issueTokens(user.id, user.rights);
        return { user: this.omitPassword(user), ...tokens };
    }

    private async issueTokens(userId: number, rights: Role[]) {
        const payload = { id: userId, rights };
        const accessToken = this.jwt.sign(payload, {
            expiresIn: this.TOKEN_EXPIRATION_ACCESS,
        });
        const refreshToken = this.jwt.sign(payload, {
            expiresIn: this.TOKEN_EXPIRATION_REFRESH,
        });
        return { accessToken, refreshToken };
    }

    private omitPassword(user: User) {
        return omit(user, ['password']);
    }
}
