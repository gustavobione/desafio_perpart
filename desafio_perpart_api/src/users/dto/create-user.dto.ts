import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {

    @ApiProperty({
        example: "Gustavo",
        description: "Nome do usuario",
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "email@email.com",
        description: "Email do usuario",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "123456",
        description: "Senha do usuario",
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: "ADMIN",
        description: "Role do usuario",
        enum: Role,
        required: false,
    })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
