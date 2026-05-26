import { Global, Module, } from '@nestjs/common';
import {
    ThrottlerModule as NestThrottlerModule,
} from '@nestjs/throttler';
import { ThrottlerConfig } from '@/config';
import { PasswordSecurityGuard } from '@/modules/iam/presentation/guards/passsword-security.guard';
import { IamModule } from '@/modules/iam/iam.module';


@Global()
@Module({
    imports: [
        IamModule,
        NestThrottlerModule.forRootAsync(ThrottlerConfig.asProvider()),
    ],
    providers: [PasswordSecurityGuard],
    exports: [PasswordSecurityGuard],
})
export class ThrottleModule { }
