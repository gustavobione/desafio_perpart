import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { multerOptions } from './multer.config';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Faz upload da imagem de um produto (jogo).
   */
  @ApiOperation({ summary: 'Upload de imagem do produto' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem do produto (jpg, jpeg, png, webp — máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagem enviada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Post('product/:id')
  uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadProductImage(id, file);
  }

  /**
   * Faz upload do avatar do usuário autenticado.
   */
  @ApiOperation({ summary: 'Upload de avatar do usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de avatar (jpg, jpeg, png, webp — máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Post('avatar')
  uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadAvatar(userId, file);
  }
}
