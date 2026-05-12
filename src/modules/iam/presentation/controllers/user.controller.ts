import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterUserDto, LoginUserDto, VerifyAccessTokenDto, RefreshTokenDto, LogoutDto } from '@/modules/iam/presentation/dtos/req/user.dto';
import { AuthResponseDto, UserResponseDto, TokenResponseDto, CaptchaResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { UserCmdHandler } from '@/modules/iam/application/services/user/command.handler';
import { AuthCmdHandler } from '@/modules/iam/application/services/auth/command.handler';
import { RegisterUserArgs } from '@/modules/iam/application/dtos/commands/user-cmd.dto';
import { VerifyAccessTokenArgs, RefreshTokenArgs, LogoutArgs } from '@/modules/iam/application/dtos/commands/auth-cmd.dto';
import { LoginArgs } from '@/modules/iam/application/dtos/commands/auth-cmd.dto';
import { API_VERS } from '@/common/constant';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { User } from '@/common/decorators';
import { UserQueryHandler } from '../../application/services/user/query.handler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IPayload } from '../../domain/services/auth.service';

@ApiTags('users')
@Controller(API_VERS.V1 + '/users')
export class UserController {
  constructor(
    private readonly userCmdHandler: UserCmdHandler,
    private readonly authCmdHandler: AuthCmdHandler,
    private readonly userQueryHandler: UserQueryHandler,
  ) { }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully',
    type: UserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async me(
    @User() user: IPayload,
  ): Promise<UserResponseDto> {
    return await this.userQueryHandler.profile(user.sub);
  }

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
    const command: RegisterUserArgs = {
      username: registerUserDto.username,
      password: registerUserDto.password,
      first_name: registerUserDto.first_name,
      last_name: registerUserDto.last_name,
      email: registerUserDto.email,
    };

    return await this.userCmdHandler.register(command);
  }

  @Post('captcha')
  @ApiOperation({ summary: 'Get captcha' })
  @ApiResponse({
    status: 200,
    description: 'Captcha retrieved successfully',
    type: CaptchaResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async captcha(): Promise<CaptchaResponseDto> {
    return await this.authCmdHandler.reCaptcha();
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
      const command: LoginArgs = {
        username: loginUserDto.username,
        password: loginUserDto.password,
        captchaId: loginUserDto.captcha_id,
        captcha: loginUserDto.captcha,
      };

      return await this.authCmdHandler.login(command);
    } catch (error: any) {
      console.log(error)
      throw new BusinessException(ErrorEnum.UNAUTHORIZED, error?.message);
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
      const command: VerifyAccessTokenArgs = {
        accessToken: verifyAccessTokenDto.access_token,
      };
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
      const command: RefreshTokenArgs = {
        refreshToken: refreshTokenDto.refresh_token,
      };
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
      const userResponse = await this.authCmdHandler.verifyAccessToken({
        accessToken: logoutDto.access_token,
      });

      const command = {
        accessToken: logoutDto.access_token,
        refreshToken: logoutDto.refresh_token,
      };
      await this.authCmdHandler.logout(userResponse.id, command);
    } catch (error) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }
}
