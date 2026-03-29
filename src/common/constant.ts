export const providers = {
  REDIS: 'REDIS_CLIENT',
};

export const successCode = 200;
export const KEYS = {
  ABLY: `ably`,
};

export const API_VERS = {
  V1: 'apis/v1',
};

export const REGEX = {
  // Includes: 8 -> 20 characters, english lowercase letters, numbers, _, ., Not accepted: __, .., _., ._, start or and width: _, . .
  regValidUsername: /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
  regValidPassword: /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Za-z])\S*$/,
  regValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
