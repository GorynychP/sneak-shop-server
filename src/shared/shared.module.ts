// src/shared/shared.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RatingService } from './services/rating.service';

@Module({
    providers: [PrismaService, RatingService],
    exports: [RatingService],
})
export class SharedModule {}
