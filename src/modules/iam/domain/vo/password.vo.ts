import { REGEX } from "@/common/constant";
import { BusinessException } from "@/common/http/business-exception";
import * as bcrypt from 'bcrypt';

export class Password {
    constructor(private readonly _hashedPassword: string) { }

    static create(hashed: string): Password {
        return new Password(hashed);
    }

    static hash(password: string): Password {
        this.validatePassword(password);
        const salt = 10;
        const hashed = bcrypt.hashSync(password, salt);
        return new Password(hashed);
    }

    get value(): string {
        return this._hashedPassword;
    }

    match(plainPassword: string): boolean {
        return bcrypt.compareSync(plainPassword, this._hashedPassword);
    }

    private static validatePassword(password: string): boolean {
        const validate = (value: string) => {
            return typeof value === 'string' && REGEX.regValidPassword.test(value);
        };
        const isValid = validate(password);
        if (!isValid) {
            throw new BusinessException('400|Invalid password');
        }
        return true;
    }
}
