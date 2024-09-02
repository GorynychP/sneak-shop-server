import { BadRequestException, Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { IFile, IMediaResponse } from './file.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class FileService {
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
