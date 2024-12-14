import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/prisma.service';
import { FileService } from 'src/file/file.service';

@Module({
    controllers: [ProductController],
    providers: [ProductService, PrismaService, FileService],
})
export class ProductModule {}
