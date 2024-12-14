import {
    Body,
    Controller,
    Delete,
    HttpCode,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
    UsePipes,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { FileService } from './file.service';
import { FolderValidationPipe } from './pipes/folder.validation.pipe';
import { FileValidationPipe } from './pipes/file.validation.pipe';
import { IFile } from './file.interface';
import { Role } from '@prisma/client';

@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @HttpCode(200)
    @Post()
    @UseInterceptors(FilesInterceptor('files'))
    @UsePipes(new FolderValidationPipe())
    @Auth()
    async uploadMediaFile(
        @UploadedFiles(FileValidationPipe) files: IFile[],
        @Query('folder') folder?: string,
    ) {
        return this.fileService.saveFiles(files, folder);
    }

    @HttpCode(200)
    @Delete()
    @Auth([Role.ADMIN])
    async deleteFile(@Body() images: string[]) {
        return this.fileService.deleteFiles('', images);
    }
}
