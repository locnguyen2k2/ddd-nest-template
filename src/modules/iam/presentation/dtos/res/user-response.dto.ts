import { AccessControlStatus } from '@internal/rbac/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TokenResponseDto {
  @ApiProperty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsString()
  refresh_token: string;

  @ApiProperty()
  @IsNumber()
  expires_in: number;

  @ApiProperty()
  @IsString()
  token_type: string;

  constructor(
    access_token: string,
    refresh_token: string,
    expires_in: number,
    token_type: string,
  ) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.expires_in = expires_in;
    this.token_type = token_type;
  }
}

export class UserResponseDto {
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  email: string;
  @ApiProperty()
  @IsString()
  username: string;
  @ApiProperty()
  @IsString()
  first_name: string;
  @ApiProperty()
  @IsString()
  last_name: string;
  @ApiProperty()
  @IsEnum(AccessControlStatus)
  status: AccessControlStatus;
  @ApiProperty()
  @IsString()
  created_at: Date;
  @ApiProperty()
  @IsString()
  updated_at: Date;

  constructor(
    id: string,
    email: string,
    username: string,
    first_name: string,
    last_name: string,
    status: AccessControlStatus,
    created_at: Date,
    updated_at: Date,
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export class AuthResponseDto {
  @ApiProperty()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty()
  @Type(() => TokenResponseDto)
  token: TokenResponseDto;

  constructor(user: UserResponseDto, token: TokenResponseDto) {
    this.user = user;
    this.token = token;
  }
}
