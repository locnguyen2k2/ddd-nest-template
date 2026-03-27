import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { REGEX } from "../constant";
import { ErrorEnum } from "../exception.enum";

@ValidatorConstraint()
export class UsernameValidator implements ValidatorConstraintInterface{
    
    validate = (value: any): boolean => {
        return REGEX.regValidUsername.test(value);
    }
    
    defaultMessage(validationArguments?: ValidationArguments): string {
        return ErrorEnum.USERNAME_INVALID;
    }
}

@ValidatorConstraint()
export class PasswordValidator implements ValidatorConstraintInterface{
    
    validate = (value: any): boolean => {
        return REGEX.regValidPassword.test(value);
    }
    
    defaultMessage(validationArguments?: ValidationArguments): string {
        return ErrorEnum.PASSWORD_INVALID;
    }
}