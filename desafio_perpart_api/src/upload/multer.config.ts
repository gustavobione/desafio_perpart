import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

/**
 * Tipos de arquivo de imagem permitidos.
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Filtro para validar o tipo de arquivo.
 */
export const imageFileFilter = (
  req: any,
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
  filename: (req, file, callback) => {
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
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
