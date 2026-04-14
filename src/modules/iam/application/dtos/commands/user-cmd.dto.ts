interface UserBaseArgs {
  username: string;
  password: string;
}

export interface RegisterUserArgs extends UserBaseArgs {
  first_name: string;
  last_name: string;
  email: string;
}

export interface LoginUserArgs extends UserBaseArgs { }

export interface UpdateProfileArgs {
  first_name?: string;
  last_name?: string;
}

export interface UpdatePasswordArgs {
  current_password: string;
  new_password: string;
}
