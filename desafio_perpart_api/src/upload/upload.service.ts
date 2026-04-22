import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  /**
   * Salva a imagem de um produto (jogo).
   * Atualiza o campo imageUrl no banco.
   */
  async uploadProductImage(productId: string, file: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      // Remove o arquivo que já foi salvo pelo Multer
      this.removeFile(file.path);
      throw new NotFoundException(`Produto com ID "${productId}" não encontrado`);
    }

    // Se já tinha uma imagem anterior, remove do disco
    if (product.imageUrl) {
      this.removeFile(path.join('./uploads', path.basename(product.imageUrl)));
    }

    const imageUrl = `/uploads/${file.filename}`;

    await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
    });

    return {
      message: 'Imagem do produto atualizada com sucesso',
      imageUrl,
    };
  }

  /**
   * Salva o avatar de um usuário.
   * Atualiza o campo avatarUrl no banco.
   */
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.removeFile(file.path);
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado`);
    }

    // Remove avatar anterior se existir
    if (user.avatarUrl) {
      this.removeFile(path.join('./uploads', path.basename(user.avatarUrl)));
    }

    const avatarUrl = `/uploads/${file.filename}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return {
      message: 'Avatar atualizado com sucesso',
      avatarUrl,
    };
  }

  /**
   * Remove um arquivo do disco de forma segura.
   */
  private removeFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Silencia erro de remoção — não deve bloquear a operação principal
    }
  }
}
