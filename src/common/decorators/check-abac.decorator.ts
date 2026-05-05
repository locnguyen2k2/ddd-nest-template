import { SetMetadata } from '@nestjs/common';

export const CHECK_ABAC_KEY = 'check_abac';

export interface AbacMetadata {
  action: string;
  resource: string;
}

export const CheckAbac = (action: string, resource: string) => 
  SetMetadata(CHECK_ABAC_KEY, { action, resource });
