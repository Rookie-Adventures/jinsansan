import { auditHandlers } from './audit';
import { authHandlers } from './auth';

export const handlers = [...authHandlers, ...auditHandlers];
