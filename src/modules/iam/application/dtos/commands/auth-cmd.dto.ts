import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import {
  PasswordValidator,
  UsernameValidator,
} from '@/common/validators/user.validator';

export class LoginArgs {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(UsernameValidator)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

export class LogoutArgs {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

export class RefreshTokenArgs {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}

export class VerifyAccessTokenArgs {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
