import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAttributeDto {
  @ApiProperty({ example: 'USER' })
  @IsString()
  @IsNotEmpty()
  entity_type: string;

  @ApiProperty({ example: 'department' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'STRING' })
  @IsString()
  @IsNotEmpty()
  data_type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAttributeDto {
  @ApiProperty({ example: 'USER', required: false })
  @IsString()
  @IsOptional()
  entity_type?: string;

  @ApiProperty({ example: 'department', required: false })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiProperty({ example: 'STRING', required: false })
  @IsString()
  @IsOptional()
  data_type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
