export class Attributes {
  private constructor(private readonly _value: Record<string, any>) {}

  static create(value: any): Attributes {
    if (typeof value !== 'object' || value === null) {
      return new Attributes({});
    }
    return new Attributes(value);
  }

  get value(): Record<string, any> {
    return this._value;
  }

  get(key: string): any {
    return this._value[key];
  }

  has(key: string): boolean {
    return key in this._value;
  }
}
