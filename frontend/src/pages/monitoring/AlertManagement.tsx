import React, { useState, useEffect } from 'react';
import { AlertManager } from '@/infrastructure/monitoring/AlertManager';
import type { AlertRule } from '@/infrastructure/monitoring/types';
import { v4 as uuidv4 } from 'uuid';

export const AlertManagement: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const alertManager = AlertManager.getInstance();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    setRules(alertManager.getRules());
  };

  const handleAddRule = (rule: Omit<AlertRule, 'id'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: uuidv4()
    };
    alertManager.addRule(newRule);
    loadRules();
  };

  const handleUpdateRule = (rule: AlertRule) => {
    alertManager.updateRule(rule);
    loadRules();
  };

  const handleDeleteRule = (ruleId: string) => {
    alertManager.deleteRule(ruleId);
    loadRules();
  };

  const handleEnableRule = (ruleId: string, enabled: boolean) => {
    const rule = alertManager.getRule(ruleId);
    if (rule) {
      const updatedRule = { ...rule, enabled };
      alertManager.updateRule(updatedRule);
      loadRules();
    }
  };

  return (
    <div>
      {/* 渲染告警规则列表和表单 */}
    </div>
  );
}; 