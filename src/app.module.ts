import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { FileModule } from './file/file.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        UserModule,
        OrderModule,
        FileModule,
        ProductModule,
        ReviewModule,
        WishlistModule,
        SharedModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
