import { Logger } from '@nestjs/common';

export function LogExecutionTime() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const logger = new Logger(target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      logger.log(`Method "${propertyKey}" executed in ${end - start}ms`);
      return result;
    };
    return descriptor;
  };
}
