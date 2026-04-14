import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AttributeResponseDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  entity_type: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  data_type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(id: string, entity_type: string, key: string, data_type: string, description?: string | null) {
    this.id = id;
    this.entity_type = entity_type;
    this.key = key;
    this.data_type = data_type;
    this.description = description ?? undefined;
  }
}
