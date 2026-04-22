import { ApiProperty } from '@nestjs/swagger';
import { Loan as PrismaLoan, LoanStatus } from '@prisma/client';

export class Loan implements PrismaLoan {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  renterId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  expectedReturnDate: Date;

  @ApiProperty({ required: false, nullable: true })
  actualReturnDate: Date | null;

  @ApiProperty({ example: 46.5 })
  totalPrice: number;

  @ApiProperty({ enum: LoanStatus, example: LoanStatus.REQUESTED })
  status: LoanStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
