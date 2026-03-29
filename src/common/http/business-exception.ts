import { successCode } from '@/common/constant';
import { ErrorEnum } from '@/common/exception.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  private readonly errorCode: number;

  constructor(error: ErrorEnum | string, value: number | string = '') {
    if (!error.includes('|')) {
      super(
        HttpException.createBody({
          code: successCode,
          message: error,
        }),
        HttpStatus.OK,
      );

      this.errorCode = successCode;
      return;
    }

    const [code, message] = error.split('|');
    super(
      HttpException.createBody({
        code: code,
        message: `${value} ${message}`,
      }),
      parseInt(code),
    );

    this.errorCode = Number(code);
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}

export { BusinessException as BizException };
