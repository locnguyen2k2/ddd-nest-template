import { Inject } from "@nestjs/common";
import { USER_REPO } from "../repositories/user.repository";
import { REGEX } from "@/common/constant";
import * as bcrypt from 'bcrypt';
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";

export class UserService {
    constructor(@Inject(USER_REPO) private readonly userRepository: any) { }

    async usernameIsExisted(username: string): Promise<boolean> {
        const validate = (value: string) => {
            return typeof value === 'string' && REGEX.regValidUsername.test(value);
        }
        const isValid = validate(username);
        if (!isValid) {
            throw new Error('Invalid username');
        }
        const user = await this.userRepository.findByUsername(username);
        return user !== null;
    }

    async validatePassword(password: string): Promise<boolean> {
        const validate = (value: string) => {
            return typeof value === 'string' && REGEX.regValidPassword.test(value);
        }
        const isValid = validate(password);
        if (!isValid) {
            throw new BusinessException('400|Invalid password');
        }
        return true;
    }

    async hashPassword(password: string): Promise<string> {
        const salt = 10;
        return await bcrypt.hash(password, salt) as string;
    }

    async compareAndHash(password: string, hashedPassword: string): Promise<string> {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
            throw new BusinessException(ErrorEnum.PASSWORD_INCORRECT);
        }
        return await this.hashPassword(password);
    }
}
