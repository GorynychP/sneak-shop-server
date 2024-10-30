import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}
    @Auth()
    @Post()
    create(@CurrentUser('id') userId: string, @Body() createWishlistDto: CreateWishlistDto) {
        return this.wishlistService.syncWishlist(userId, createWishlistDto);
    }

    @Get()
    @Auth()
    findAll(@CurrentUser('id') userId: string) {
        return this.wishlistService.findAll(userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.wishlistService.remove(+id);
    }
}
