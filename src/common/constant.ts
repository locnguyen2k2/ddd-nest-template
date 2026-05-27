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
  USER_NOTIFIED: 'user.notified',
} as const;

export const SETTING_KEYS = {
  PASSWORD_SECURITY: 'password_attempts_policy',
  CODE_EXPIRE: 'code_expire',
  POOL_SIZE: 'pool_size',
} as const;

export interface IAttemptPolicy {
  failed_attempts: number;
  lock_duration: number;
}

export const CACHED_KEYS = {
  COUNT: {
    POOLED_USERS: 'pooled_users_count',
  },
  POOLED_USERS: 'pooled_users',
} as const;

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
    mail_confirmation: 1 * 60, // 1 minute
  },
  [SETTING_KEYS.POOL_SIZE]: {
    max: 50,
    min: 10,
    fetch_ratio: 0.6,
  },
} as const;

export const DefaultPolicies = [
  {
    name: 'Org Owner has full access to everything in their org',
    effect: 'ALLOW' as const,
    action: '*',
    resource: '*',
    condition: { "==": [{ "var": "subject.context_attributes.is_org_owner" }, true] }
  },
  {
    name: 'Users can manage their own profile',
    effect: 'ALLOW' as const,
    action: '*',
    resource: 'User',
    condition: { "==": [{ "var": "subject.id" }, { "var": "resource.id" }] }
  },
  {
    name: 'Locked roles cannot be modified or deleted',
    effect: 'DENY' as const,
    action: ['UPDATE', 'DELETE'],
    resource: 'Role',
    condition: { "==": [{ "var": "resource.attributes.is_locked" }, true] }
  },
  {
    name: 'Users can only access projects matching their clearance',
    effect: 'ALLOW' as const,
    action: 'READ',
    resource: 'Project',
    condition: { ">=": [{ "var": "subject.context_attributes.clearance" }, { "var": "resource.attributes.sensitivity" }] }
  },
  {
    name: 'Internal network required for Top Secret Project',
    effect: 'DENY' as const,
    action: 'READ',
    resource: 'Project',
    condition: {
      "and": [
        { "==": [{ "var": "resource.slug" }, "top-secret-project"] },
        { "!!": { "var": "env.ip" } },
        { "!": { "in": ["192.168.", { "var": "env.ip" }] } }
      ]
    }
  },
  {
    name: 'Resource owners can update their resources',
    effect: 'ALLOW' as const,
    action: 'UPDATE',
    resource: '*',
    condition: { "==": [{ "var": "subject.id" }, { "var": "resource.attributes.owner_id" }] }
  },
  {
    name: 'MFA is required for Top Secret Project access',
    effect: 'DENY' as const,
    action: 'READ',
    resource: 'Project',
    condition: {
      "and": [
        { "==": [{ "var": "resource.attributes.sensitivity" }, 4] },
        { "==": [{ "var": "env.mfa_authenticated" }, false] }
      ]
    }
  },
  {
    name: 'Department managers can manage projects in their department',
    effect: 'ALLOW' as const,
    action: '*',
    resource: 'Project',
    condition: {
      "and": [
        { "==": [{ "var": "subject.context_attributes.role" }, "manager"] },
        { "==": [{ "var": "subject.id" }, { "var": "resource.department.attributes.owner_id" }] }
      ]
    }
  },
  {
    name: 'AI Core feature requires Enterprise plan',
    effect: 'DENY' as const,
    action: '*',
    resource: 'Feature',
    condition: {
      "and": [
        { "==": [{ "var": "resource.slug" }, "ai-core"] },
        { "!=": [{ "var": "organization.attributes.plan_tier" }, "ENTERPRISE"] }
      ]
    }
  },
  {
    name: 'Only Org Owners can manage staff',
    effect: 'ALLOW' as const,
    action: ['CREATE', 'DELETE', 'UPDATE'],
    resource: 'Staff',
    condition: { "==": [{ "var": "subject.context_attributes.is_org_owner" }, true] }
  },
  {
    name: 'Production deployments require high clearance',
    effect: 'DENY' as const,
    action: 'UPDATE',
    resource: 'Feature',
    condition: {
      "and": [
        { "==": [{ "var": "resource.attributes.environment" }, "PRODUCTION"] },
        { "<": [{ "var": "subject.context_attributes.clearance" }, 4] }
      ]
    }
  },
  {
    name: "Members can view features for joined projects",
    effect: 'ALLOW' as const,
    action: 'READ',
    resource: 'Feature',
    condition: { "in": [{ "var": "resource.id" }, { "map": [{ "var": "subject.members" }, { "var": "project_id" }] }] },
  },
  {
    name: "Only Org Owners can view logs and audit trails",
    effect: 'ALLOW' as const,
    action: 'READ',
    resource: 'Log',
    condition: { "==": [{ "var": "subject.context_attributes.is_org_owner" }, true] }
  },
  {
    name: "User can only read their own logs",
    effect: 'ALLOW' as const,
    action: 'READ',
    resource: 'Log',
    condition: { "==": [{ "var": "resource.created_by" }, { "var": "subject.id" }] }
  }
];