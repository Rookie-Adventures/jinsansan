export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertRuleType = 'threshold' | 'trend' | 'anomaly';

export interface AlertRule {
  id: string;
  name: string;
  type: AlertRuleType;
  metric: string;
  condition: {
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
  };
  severity: AlertSeverity;
  enabled: boolean;
  notification: {
    email?: string[];
  };
}

export interface Alert {
  id: string;
  ruleId: string;
  value: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'resolved';
}

export interface AlertNotification {
  type: 'trigger' | 'resolve';
  rule: AlertRule;
  value?: number;
  timestamp: number;
}
