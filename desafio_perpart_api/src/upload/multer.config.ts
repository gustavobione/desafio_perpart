import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Tipos de arquivo de imagem permitidos.
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Filtro para validar o tipo de arquivo.
 */
export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return callback(
      new BadRequestException(
        `Formato de arquivo não suportado. Use: ${ALLOWED_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }

  callback(null, true);
};

/**
 * Configuração do storage do Multer.
 * Salva os arquivos na pasta uploads/ com nome único (UUID).
 */
export const multerStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, callback) => {
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${randomUUID()}${ext}`;
    callback(null, filename);
  },
});

/**
 * Opções padrão do Multer para upload de imagens.
 */
export const multerOptions = {
  storage: multerStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};
