import { http, HttpResponse } from 'msw';

import type { ApiResponse } from '@/types/api';
import { AuditLogType, AuditLogLevel } from '@/utils/security/audit';

interface AuditLog {
  id: string;
  timestamp: number;
  type: AuditLogType;
  level: AuditLogLevel;
  userId?: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export const auditHandlers = [
  // 创建审计日志
  http.post<never, AuditLog>('/api/audit-logs', async ({ request }) => {
    const log = await request.json();

    return HttpResponse.json(
      {
        code: 200,
        message: '审计日志创建成功',
        data: log,
        timestamp: Date.now(),
      } as ApiResponse<AuditLog>,
      { status: 200 }
    );
  }),

  // 查询审计日志
  http.get('/api/audit-logs', () => {
    return HttpResponse.json(
      {
        code: 200,
        message: '获取审计日志成功',
        data: [],
        timestamp: Date.now(),
      } as ApiResponse<AuditLog[]>,
      { status: 200 }
    );
  }),
];
