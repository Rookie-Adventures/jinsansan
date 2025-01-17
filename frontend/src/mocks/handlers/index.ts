import { authHandlers } from './auth'
import { auditHandlers } from './audit'

export const handlers = [
  ...authHandlers,
  ...auditHandlers
] 