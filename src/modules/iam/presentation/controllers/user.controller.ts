import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterUserDto, LoginUserDto, VerifyAccessTokenDto, RefreshTokenDto, LogoutDto } from '@/modules/iam/presentation/dtos/req/user.dto';
import { AuthResponseDto, UserResponseDto, TokenResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { UserCmdHandler } from '@/modules/iam/application/services/user/user.command.handler';
import { AuthCmdHandler } from '@/modules/iam/application/services/auth/auth.command.handler';
import { RegisterUserArgs } from '@/modules/iam/application/dtos/commands/user-cmd.dto';
import { VerifyAccessTokenArgs, RefreshTokenArgs, LogoutArgs } from '@/modules/iam/application/dtos/commands/auth-cmd.dto';
import { LoginArgs } from '@/modules/iam/application/dtos/commands/auth-cmd.dto';
import { API_VERS } from '@/common/constant';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';

@ApiTags('users')
@Controller(API_VERS.V1 + '/users')
export class UserController {
  constructor(
    private readonly userCmdHandler: UserCmdHandler,
    private readonly authCmdHandler: AuthCmdHandler,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Username or email already taken' })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    const command = new RegisterUserArgs(
      registerUserDto.username,
      registerUserDto.password,
      registerUserDto.first_name,
      registerUserDto.last_name,
      registerUserDto.email,
    );

    return await this.userCmdHandler.register(command);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<AuthResponseDto> {
    try {
      const command = new LoginArgs(
        loginUserDto.username,
        loginUserDto.password,
      );

      return await this.authCmdHandler.login(command);
    } catch (error) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }

  @Post('verify-access-token')
  @ApiOperation({ summary: 'Verify access token and get user info' })
  @ApiResponse({
    status: 200,
    description: 'Access token is valid',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @HttpCode(HttpStatus.OK)
  async verifyAccessToken(
    @Body() verifyAccessTokenDto: VerifyAccessTokenDto,
  ): Promise<UserResponseDto> {
    try {
      const command = new VerifyAccessTokenArgs(verifyAccessTokenDto.access_token);
      return await this.authCmdHandler.verifyAccessToken(command);
    } catch (error) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token' })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    try {
      const command = new RefreshTokenArgs(refreshTokenDto.refresh_token);
      return await this.authCmdHandler.refreshToken(command);
    } catch (error) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid tokens' })
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() logoutDto: LogoutDto,
  ): Promise<void> {
    try {
      const userResponse = await this.authCmdHandler.verifyAccessToken(
        new VerifyAccessTokenArgs(logoutDto.access_token)
      );

      const command = new LogoutArgs(logoutDto.access_token, logoutDto.refresh_token);
      await this.authCmdHandler.logout(userResponse.id, command);
    } catch (error) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }
}
