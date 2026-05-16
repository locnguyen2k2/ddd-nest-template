import { env } from "@/utils/env";

export const providers = {
  REDIS: 'REDIS_CLIENT',
};

export const successCode = 200;
export const KEYS = {
  ABLY: `ably`,
  PERMISSIONS: 'permissions',
  HEADERS: 'headers',
};

export const HeaderKeys = {
  ORG_ID: 'organization-id',
  ORG_SLUG: 'organization-slug',
  PROJECT_ID: 'project-id',
};

export const StorageKeys = {
  ORG_ID: 'org_id',
  ORG_SLUG: 'org_slug',
  PROJECT_ID: 'project_id',
  ORG: 'org',
} as const;

export const API_VERS = {
  V1: 'apis/v1',
};

export const REGEX = {
  // Includes: 8 -> 20 characters, english lowercase letters, numbers, _, ., Not accepted: __, .., _., ._, start or and width: _, . .
  regValidUsername: /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
  regValidPassword: /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Za-z])\S*$/,
  regValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const RABBITMQ = {
  EXCHANGE_BASE_NAME: {
    NOTIFICATION_MODULE: `${env.str('NODE_ENV')}_cjool_exchange_notification`,
    IAM_MODULE: `${env.str('NODE_ENV')}_cjool_exchange_iam`,
  },
  QUEUE_BASE_NAME: {
    NOTIFICATION_MODULE: `${env.str('NODE_ENV')}_cjool_queue_notification`,
    IAM_MODULE: `${env.str('NODE_ENV')}_cjool_queue_iam`,
  },
};

export const RABBITMQ_EXCHANGE = {
  NOTIFICATIONS: `${RABBITMQ.EXCHANGE_BASE_NAME.NOTIFICATION_MODULE}.notifications`,
  IAM: `${RABBITMQ.EXCHANGE_BASE_NAME.IAM_MODULE}.iam`,
} as const;

export const RABBITMQ_QUEUE = {
  NOTIFICATIONS: `${RABBITMQ.QUEUE_BASE_NAME.NOTIFICATION_MODULE}.notifications:2`,
  IAM: `${RABBITMQ.QUEUE_BASE_NAME.IAM_MODULE}.iam:2`,
} as const;

export const RABBITMQ_ROUTING_KEY = {
  USER_CREATED: 'user.created',
} as const;

export const SETTING_KEYS = {
  PASSWORD_SECURITY: 'password_attempts_policy',
  CODE_EXPIRE: 'code_expire',
} as const;

export interface IAttemptPolicy {
  failed_attempts: number;
  lock_duration: number;
}

export const SETTINGS = {
  [SETTING_KEYS.PASSWORD_SECURITY]: {
    cooldown_period: 60, // Cooldown period in seconds before retrying 
    attempts: [
      {
        failed_attempts: 5, // Maximum failed login attempts before lockout
        lock_duration: 60, // Lockout duration in seconds (5 minutes)
      },
      {
        failed_attempts: 10, // Maximum failed login attempts before lockout
        lock_duration: 120, // Lockout duration in seconds (10 minutes)
      },
    ] as IAttemptPolicy[],
  },
  [SETTING_KEYS.CODE_EXPIRE]: {
    mail_confirmation: 5 * 60, // 5 minutes
  },
} as const;
