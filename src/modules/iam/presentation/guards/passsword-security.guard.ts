import { CACHE_PORT, CachePort } from "@/shared/application/ports/cache.port";
import { ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from "@nestjs/throttler";
import { IPayload } from "../../domain/services/auth.service";
import { BusinessException } from "@/common/http/business-exception";
import { countdown } from "@/utils/date";
import { IAttemptPolicy, SETTING_KEYS, SETTINGS } from "@/common/constant";
import { UserRepository } from "../../infrastructure/persistence/repositories/user.repository";

export const PASSWORD_SECURITY_THROTTLE = 'password-security-throttle';
export interface IPasswordSecurityInfo {
    value?: number;
    lock_duration: number;
    failed_attempts: number;
    expired?: number;
    nextPolicy?: IAttemptPolicy;
    is_last_one?: boolean;
}
@Injectable()
export class PasswordSecurityGuard extends ThrottlerGuard {
    constructor(
        readonly options: ThrottlerModuleOptions,
        readonly storageService: ThrottlerStorage,
        readonly reflector: Reflector,
        private readonly userRepo: UserRepository,
        @Inject(CACHE_PORT) private readonly cache: CachePort,
    ) {
        super(options, storageService, reflector);
    }

    async handleRequest(data: {
        context: ExecutionContext;
        limit: number;
        ttl: number;
    }): Promise<boolean> {
        const { context, ttl, limit } = data;
        const client = context.switchToWs().getClient();
        let uid: string = '';
        const { user }: { user: IPayload } = client;
        if (!user) {
            const req = context.switchToHttp().getRequest();
            const username = req?.body && req?.body?.username;
            if (username) {
                const user = await this.userRepo.findByUsername(username);
                if (user) {
                    uid = user.id.value;
                }
            }
        } else {
            uid = user.sub;
        }
        if (!uid) return true;
        const key = this.generateKey(context, uid);
        const info: IPasswordSecurityInfo | null = await this.cache.get<IPasswordSecurityInfo>(key);

        let currentPolicy = info;
        let nextPolicy = info?.nextPolicy;
        const counter = info?.value || 0;
        const cooldownPeriod = SETTINGS[SETTING_KEYS.PASSWORD_SECURITY].cooldown_period;

        const policies = SETTINGS[SETTING_KEYS.PASSWORD_SECURITY].attempts;
        const policiesArray: IAttemptPolicy[] = Array.isArray(policies) ? policies : [policies];
        const sortedPolicies = policiesArray
            .slice()
            .sort((a: IAttemptPolicy, b: IAttemptPolicy) => a.failed_attempts - b.failed_attempts);

        if (!info || !info.lock_duration) {
            for (let i = 0; i < sortedPolicies.length; i++) {
                if (counter <= sortedPolicies[i].failed_attempts) {
                    currentPolicy = sortedPolicies[i];
                    nextPolicy = info?.nextPolicy || sortedPolicies[i + 1];
                    break;
                }
                if (i === sortedPolicies.length - 1) currentPolicy = sortedPolicies[i];
            }
        }

        if (!currentPolicy) return true;
        const record = await this.storageService.increment(
            key,
            ttl,
            counter >= currentPolicy.failed_attempts ? 0 : limit,
            currentPolicy.lock_duration,
            '',
        );
        if (currentPolicy.is_last_one) return true;
        if (record.isBlocked) {
            const dateVal = new Date().valueOf();
            if (nextPolicy && currentPolicy && currentPolicy.expired) {
                if (
                    currentPolicy.failed_attempts !== nextPolicy.failed_attempts &&
                    currentPolicy.expired <= dateVal
                ) {
                    await this.cache.set(
                        key,
                        {
                            ...info,
                            nextPolicy,
                            expired: dateVal + nextPolicy.lock_duration,
                            failed_attempts: nextPolicy.failed_attempts,
                            lock_duration: nextPolicy.lock_duration,
                            value: counter,
                        },
                        cooldownPeriod,
                    );
                    return true;
                } else {
                    if (
                        nextPolicy.failed_attempts ===
                        currentPolicy.failed_attempts &&
                        currentPolicy.expired < dateVal
                    ) {
                        await this.cache.delete(key);
                        return true;
                    }
                }
            }
            const expirationTime = info?.expired || (dateVal + currentPolicy.lock_duration);
            const remainingTime = countdown(0, expirationTime);
            if (!nextPolicy && remainingTime === 0) {
                await this.cache.delete(key);
                return true;
            }

            const policedPasscode = {
                ...info,
                nextPolicy,
                value: counter,
                lock_duration: currentPolicy.lock_duration,
                failed_attempts: currentPolicy.failed_attempts,
                expired: expirationTime,
            };

            await this.cache.set(
                key,
                policedPasscode,
                currentPolicy.lock_duration + cooldownPeriod,
            );

            throw new BusinessException(
                `Too many requests. Please try again later in ${remainingTime}.`
            );
        }
        return true;
    }

    // Override the default tracking logic
    protected getTracker(req: Record<string, any>): Promise<string> {
        // Use the user's ID for tracking if authenticated, else use the IP
        return req.user?.id || req.ip;
    }

    protected generateKey(context: ExecutionContext, userId: string): string {
        return `${PASSWORD_SECURITY_THROTTLE}:${userId}`;
    }
}