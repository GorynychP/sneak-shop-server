import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { OrderDto } from './dto/order.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @Auth()
    async getAllForUser(@CurrentUser('id') userId: string) {
        return this.orderService.getAllForUser(userId);
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('place')
    @Auth()
    async checkout(@Body() dto: OrderDto, @CurrentUser('id') userId: string) {
        return this.orderService.createPayment(dto, userId);
    }

    @HttpCode(200)
    @Post('status')
    async updateStatus(@Body() dto: PaymentStatusDto) {
        return this.orderService.updateStatus(dto);
    }
}
