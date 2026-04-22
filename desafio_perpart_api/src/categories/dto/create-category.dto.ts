import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {

    @ApiProperty({
        example: "Categoria 1",
        description: "Nome da categoria",
    })
    name: string;

    @ApiProperty({
        example: "Categoria 1",
        description: "Descrição da categoria",
    })
    description: string;

    @ApiProperty({
        example: 1,
        description: "Id da categoria",
    })
    id_category: number;
}
