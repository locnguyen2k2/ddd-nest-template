import {
  PasswordValidator,
  UsernameValidator,
} from '@/common/validators/user.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

class UserBaseArgs {
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

export class RegisterUserArgs extends UserBaseArgs {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  constructor(
    username: string,
    password: string,
    first_name: string,
    last_name: string,
    email: string,
  ) {
    super(username, password);
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
  }
}

export class LoginUserArgs extends UserBaseArgs {}

export class UpdateProfileArgs {
  @ApiProperty()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;

  constructor(first_name?: string, last_name?: string) {
    this.first_name = first_name;
    this.last_name = last_name;
  }
}

export class UpdatePasswordArgs {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  current_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidator)
  new_password: string;

  constructor(password: string, new_password: string) {
    this.current_password = password;
    this.new_password = new_password;
  }
}
