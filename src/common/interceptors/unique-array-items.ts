import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class UniqueArrValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    return Array.isArray(value) && new Set(value).size === value.length;
  }
}
