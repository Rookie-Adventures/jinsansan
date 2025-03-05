export const AUTH_CONSTANTS = {
    USER: {
        MIN_USERNAME_LENGTH: 3,
        MAX_USERNAME_LENGTH: 20,
        MIN_EMAIL_LENGTH: 5,
        MAX_EMAIL_LENGTH: 100,
        MIN_PASSWORD_LENGTH: 8,
        MAX_PASSWORD_LENGTH: 32,
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 32,
        SALT_ROUNDS: 10,
    },
    TOKEN: {
        ACCESS_EXPIRES_IN: 15 * 60 * 1000, // 15 minutes
        REFRESH_EXPIRES_IN: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    ROLES: {
        ADMIN: 'admin',
        USER: 'user',
        GUEST: 'guest',
    },
    PERMISSIONS: {
        READ: 'read',
        WRITE: 'write',
        DELETE: 'delete',
        MANAGE: 'manage',
    },
};
