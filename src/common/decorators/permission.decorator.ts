import { applyDecorators, SetMetadata } from '@nestjs/common';
import { KEYS } from '../constant';

export const Permissions = (...permissions: string[]) =>
    applyDecorators(SetMetadata(KEYS.PERMISSIONS, permissions));
