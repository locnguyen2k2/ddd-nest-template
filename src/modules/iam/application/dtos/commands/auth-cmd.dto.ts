export interface LoginArgs {
  username: string;
  password: string;
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
