import { http, HttpResponse } from 'msw';
import type { ApiResponse } from '@/types/api';
import type { AuditLog } from '@/types/audit';

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
