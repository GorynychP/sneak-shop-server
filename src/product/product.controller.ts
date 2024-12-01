import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';

import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';
import { Role } from '@prisma/client';
import { PaginationArgsDto } from './base/pagination/pagination.args';
import { PopularArgsDto } from './base/pagination/popular.args';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    async getAll(@Query() params?: PaginationArgsDto) {
        return this.productService.getAll(params);
    }

    @Get('all')
    async getAllProducts(@Query() params?: PaginationArgsDto) {
        return this.productService.getAllProducts(params);
    }

    @Get('most-popular')
    async getMostPopular(@Query() params?: PopularArgsDto) {
        return this.productService.getMostPopular(params);
    }

    @Get('similar/:id')
    async getSimilar(@Param('id') id: string) {
        return this.productService.getSimilar(id);
    }

    @Get('by-id/:id')
    async getById(@Param('id') id: string) {
        return this.productService.getById(id);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth([Role.ADMIN])
    @Post()
    async create(@Body() dto: ProductDto) {
        return this.productService.create(dto);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth([Role.ADMIN])
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: ProductDto) {
        return this.productService.update(id, dto);
    }

    @HttpCode(200)
    @Auth([Role.ADMIN])
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.productService.delete(id);
    }
}
