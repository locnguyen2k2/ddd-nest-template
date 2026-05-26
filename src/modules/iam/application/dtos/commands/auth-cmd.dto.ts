export interface CaptchaArgs {
  captchaId: string;
  captcha: string;
}

export interface UserBaseArgs {
  username: string;
  password: string;
}

export interface RegisterUserArgs extends UserBaseArgs, CaptchaArgs {
  first_name: string;
  last_name: string;
  email: string;
}

export interface LoginArgs extends UserBaseArgs, CaptchaArgs { }

export interface UpdateProfileArgs {
  first_name?: string;
  last_name?: string;
}

export interface UpdatePasswordArgs {
  current_password: string;
  new_password: string;
}

export interface LogoutArgs {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenArgs {
  refreshToken: string;
}

export interface VerifyAccessTokenArgs {
  accessToken: string;
}

export interface VerifyEmailArgs {
  code: string;
  usernameOrEmail: string;
  captcha: CaptchaArgs;
}
