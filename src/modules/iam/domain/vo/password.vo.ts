export class Password {
  constructor(private readonly _hashedPassword: string) {}

  static create(hashed: string): Password {
    return new Password(hashed);
  }

  get value(): string {
    return this._hashedPassword;
  }
}
