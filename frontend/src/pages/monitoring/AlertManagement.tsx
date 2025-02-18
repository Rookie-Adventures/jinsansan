import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, IconButton, List, ListItem, ListItemText, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AlertManager } from '@/infrastructure/monitoring/AlertManager';
import type { AlertRule } from '@/infrastructure/monitoring/types';

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
      id: uuidv4(),
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
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          handleAddRule({
            name: '新规则',
            type: 'threshold',
            metric: '',
            condition: { operator: '>', value: 0 },
            severity: 'warning',
            enabled: true,
            notification: {},
          })
        }
      >
        添加规则
      </Button>

      <List>
        {rules.map(rule => (
          <ListItem
            key={rule.id}
            secondaryAction={
              <>
                <Switch
                  edge="end"
                  checked={rule.enabled}
                  onChange={e => handleEnableRule(rule.id, e.target.checked)}
                />
                <IconButton edge="end" onClick={() => handleUpdateRule(rule)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteRule(rule.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={rule.name}
              secondary={`${rule.metric} ${rule.condition.operator} ${rule.condition.value}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
