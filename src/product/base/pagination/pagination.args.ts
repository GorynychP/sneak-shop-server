import { Gender } from '@prisma/client';
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class PaginationArgsDto {
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    priceFrom?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    priceTo?: number;

    @IsOptional()
    @IsString()
    size?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isSale?: boolean;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsIn(['price', 'createdAt'])
    sortBy?: 'price' | 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    skip?: number;

    @IsOptional()
    @IsString()
    sizes?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    take?: number;
}

export class PaginationArgsWithSearchTerm extends PaginationArgsDto {
    @IsString()
    @IsOptional()
    searchTerm?: string;
}
