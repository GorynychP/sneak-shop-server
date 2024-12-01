import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // @Post()
    // create(@Body() createUserDto: CreateUserDto) {
    //     return this.userService.create(createUserDto);
    // }

    @Auth()
    @Get('profile')
    async getProfile(@CurrentUser('id') id: string) {
        return this.userService.findById(id);
    }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.userService.findById(+id);
    // }

    @Auth()
    @Patch('profile')
    update(@CurrentUser('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Auth()
    @Patch('profile/favorites/:productId')
    async toggleFavorite(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
        return this.userService.toggleFavorite(productId, userId);
    }

    @Auth(Role.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.userService.remove(id);
        return 'Юзер удален';
    }

    @Auth([Role.ADMIN, Role.PREMIUM])
    @Get('premium')
    async getPremium() {
        return { text: 'Premium content' };
    }

    @Auth([Role.ADMIN, Role.MANAGER])
    @Get('manager')
    async getManagerContent() {
        return { text: 'Manager content' };
    }

    @Auth(Role.ADMIN)
    @Get('list')
    async getList() {
        return this.userService.findAll();
    }

    @Auth([Role.ADMIN])
    @Patch('edit/:userId')
    async changeRoles(@Body() dto: EditUserDto, @Param('userId') userId: string) {
        return this.userService.editRolesUser(dto.rights, userId);
    }
}
