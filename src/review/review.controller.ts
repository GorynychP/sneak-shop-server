import { Body, Controller, Delete, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

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
    @Auth()
    @Delete(':id')
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.reviewService.delete(id, userId);
    }
}
