import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {

    @ApiProperty({
        example: "Produto 1",
        description: "Nome do produto",
    })
    name: string;

    @ApiProperty({
        example: "Produto 1",
        description: "Descrição do produto",
    })
    description: string;

    @ApiProperty({
        example: 1,
        description: "Id da categoria",
    })
    categoryId: number;

    @ApiProperty({
        example: 1,
        description: "Id do usuario",
    })
    userId: number;

    @ApiProperty({
        example: 100,
        description: "Preço do produto",
    })
    price: number;

    @ApiProperty({
        example: 100,
        description: "Quantidade do produto",
    })
    quantity: number;

    @ApiProperty({
        example: "ATIVO",
        description: "Status do produto",
    })
    status: string | "ATIVO" | "INATIVO";
}
