import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {

    @ApiProperty({
        example: "Gustavo",
        description: "Nome do usuario",
    })
    name: string;

    @ApiProperty({
        example: "email@email.com",
        description: "Email do usuario",
    })
    email: string;

    @ApiProperty({
        example: "123456",
        description: "Senha do usuario",
    })
    password: string;

    @ApiProperty({
        example: "ADMIN",
        description: "Role do usuario",
    })
    role: string | "ADMIN" | "CLIENT";
}
