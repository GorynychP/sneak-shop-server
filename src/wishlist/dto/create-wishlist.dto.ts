import { IsNotEmpty, IsArray } from 'class-validator';

export class CreateWishlistDto {
    // @IsString()
    // @IsNotEmpty()
    // userId: string;

    @IsArray()
    @IsNotEmpty({ each: true })
    productIds: string[];
}
