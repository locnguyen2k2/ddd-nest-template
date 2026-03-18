import { ConfigType, registerAs } from '@nestjs/config'
import { env } from '@/utils/env'


export const swaggerConfigKey = 'swagger'

export const SwaggerConfig = registerAs(swaggerConfigKey, () => ({
    enable: env.bool('SWAGGER_ENABLE'),
    path: env.str('SWAGGER_PATH'),
    serverUrl: env.str('SWAGGER_SERVER_URL', env.str('APP_BASE_URL')),
}))

export type ISwaggerConfig = ConfigType<typeof SwaggerConfig>
