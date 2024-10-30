import { IsOptional, IsString } from 'class-validator';

export class PopularArgsDto {
    @IsOptional()
    @IsString()
    isRating?: string;

    @IsOptional()
    @IsString()
    isNew?: string;
}
