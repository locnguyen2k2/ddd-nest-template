import { ConfigType, registerAs } from '@nestjs/config';

import { env } from '@/utils/env';

export const databaseConfigKey = 'database';

export const DatabaseConfig = registerAs(databaseConfigKey, () => ({
    rbac: {
        url: env.str('PG_RBAC_DATABASE_URL')
    }
}))

export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>;
