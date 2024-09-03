import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { FileModule } from './file/file.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UserModule,
        OrderModule,
        FileModule,
        ProductModule,
        ReviewModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
