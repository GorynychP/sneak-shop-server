import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';
import { Role } from '@prisma/client';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @HttpCode(200)
    @Auth([Role.ADMIN, Role.MANAGER])
    @Get()
    async getAll() {
        return this.reviewService.getAll();
    }

    @HttpCode(200)
    @Get(':productId')
    async getAllForProduct(@Param('productId') productId: string) {
        return this.reviewService.getAllByProductId(productId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Auth()
    @Post(':productId')
    async create(
        @CurrentUser('id') userId: string,
        @Param('productId') productId: string,
        @Body() dto: ReviewDto,
    ) {
        return this.reviewService.create(userId, productId, dto);
    }

    @HttpCode(200)
    @Auth([Role.USER, Role.ADMIN])
    @Delete(':id')
    async delete(
        @CurrentUser('id') userId: string,
        @CurrentUser('rights') rights: Role[],
        @Param('id') id: string,
    ) {
        return this.reviewService.delete(id, userId, rights);
    }
}
