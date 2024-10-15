import { Gender } from '@prisma/client';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationArgsDto {
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    priceFrom?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    priceTo?: number;

    @IsOptional()
    @IsString()
    size?: string;

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
    skip?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    take?: number;
}

export class PaginationArgsWithSearchTerm extends PaginationArgsDto {
    @IsString()
    @IsOptional()
    searchTerm?: string;
}
