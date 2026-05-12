export interface LoginArgs {
  username: string;
  password: string;
  captchaId: string;
  captcha: string;
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
