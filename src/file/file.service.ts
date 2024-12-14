import { BadRequestException, Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile, unlink } from 'fs-extra';
import { IFile, IMediaResponse } from './file.interface';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FileService {
    constructor(private readonly prisma: PrismaService) {}
    async createFiles(productId: string, images: string[]) {
        const files = await this.prisma.image.createMany({
            data: images.map((image) => ({
                url: image,
                productId,
            })),
        });
        return files;
    }

    async deleteFiles(productId: string, imagesArray?: string[]) {
        if (imagesArray) {
            for (const image of imagesArray) {
                const filePath = `${path}${image}`;

                try {
                    await unlink(filePath);
                    console.log(`Файл ${filePath} успешно удален.`);
                } catch (error) {
                    console.error(`Ошибка при удалении файла ${filePath}:`, error.message);
                }
            }
            return;
        }
        const images = await this.prisma.image.findMany({
            where: { productId },
        });

        if (images.length === 0) {
            console.log('Нет файлов для удаления.');
            return;
        }

        await this.prisma.image.deleteMany({
            where: { productId },
        });

        for (const image of images) {
            const filePath = `${path}${image.url}`;

            try {
                await unlink(filePath);
                console.log(`Файл ${filePath} успешно удален.`);
            } catch (error) {
                console.error(`Ошибка при удалении файла ${filePath}:`, error.message);
            }
        }
    }

    async saveFiles(files: IFile[], folder: string = 'products'): Promise<IMediaResponse[]> {
        const folderLowerCase = folder.toLowerCase();

        const uploadedFolder = `${path}/uploads/${folderLowerCase}`;

        await ensureDir(uploadedFolder);

        const response: IMediaResponse[] = await Promise.all(
            files.map(async (file: IFile) => {
                const uniqueName = `${randomBytes(6).toString('hex')}_${file.originalname}`;

                try {
                    await writeFile(`${uploadedFolder}/${uniqueName}`, file.buffer);
                } catch (e) {
                    throw new BadRequestException(`Failed to save file, error: ${e}`);
                }
                return {
                    url: `/uploads/${folderLowerCase}/${uniqueName}`,
                    name: uniqueName,
                };
            }),
        );

        return response;
    }
}
