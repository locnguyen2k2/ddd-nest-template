import {
  PasswordValidator,
  UsernameValidator,
} from '@/common/validators/user.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional, Validate } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(UsernameValidator)
  username!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(UsernameValidator)
  username!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  password!: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  last_name?: string;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  current_password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  new_password!: string;
}

export class VerifyAccessTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refresh_token!: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refresh_token!: string;
}
