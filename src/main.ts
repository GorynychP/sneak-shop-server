import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('');
    app.use(cookieParser());
    app.enableCors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        exposedHeaders: ['set-cookie'],
    });
    await app.listen(4200);
    console.log('Server started on port 4200');
}
bootstrap();
