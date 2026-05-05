import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isJsonLogic', async: false })
export class JsonLogicValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const keys = Object.keys(value);
    return keys.length > 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid JsonLogic object`;
  }
}

export function IsJsonLogic(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: JsonLogicValidator,
    });
  };
}
