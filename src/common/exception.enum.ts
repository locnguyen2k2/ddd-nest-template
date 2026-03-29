export enum ErrorEnum {
  RECORD_NOT_FOUND = '404|Record not found',
  RECORD_ALREADY_EXISTS = '409|Record already exists',
  RECORD_CREATE_FAILED = '500|Record create failed',
  RECORD_UPDATE_FAILED = '500|Record update failed',
  RECORD_DELETE_FAILED = '500|Record delete failed',

  ACCESS_DENIED = '403|Access denied',

  REQUEST_VALIDATION_ERROR = '400|Request validation error',

  REQUIRED_FIELD_MISSING = '400|Required field missing',
  TOKEN_IS_REQUIRED = '401|Token is required',
  TOKEN_IS_INVALID = '401|Token is invalid',

  REQUEST_FAILED_TO_EXECUTE = '400|Request failed to execute',
  REQUEST_FAILED_TO_QUERY = '400|Request failed to query',

  FAILED_TO_CONVERT_TO_PERSISTENCE = '400|Failed to convert to persistence',

  PASSWORD_INCORRECT = '400|Password is incorrect',
  USERNAME_OR_PASSWORD_INCORRECT = '400|Username or password is incorrect',
  USERNAME_ALREADY_EXISTS = '409|Username already exists',
  EMAIL_ALREADY_EXISTS = '409|Email already exists',
  USERNAME_INVALID = '400|Username is invalid',
  PASSWORD_INVALID = '400|Password is invalid',

  UNAUTHORIZED = '401|Unauthorized',
}
