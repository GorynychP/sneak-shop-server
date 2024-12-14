import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { FileService } from 'src/file/file.service';

@Module({
    controllers: [ReviewController],
    providers: [ReviewService, PrismaService, ProductService, FileService],
})
export class ReviewModule {}
