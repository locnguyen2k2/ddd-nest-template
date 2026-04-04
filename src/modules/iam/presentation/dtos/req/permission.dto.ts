import { PermissionAction } from "@/common/enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePermissionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    description?: string;

    @ApiProperty({ type: 'string', enum: Object.values(PermissionAction) })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @IsEnum(PermissionAction)
    action!: PermissionAction;
}

export class UpdatePermissionDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    description?: string;

    @ApiProperty({ type: 'string', enum: Object.values(PermissionAction) })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @IsEnum(PermissionAction)
    action?: PermissionAction;
}