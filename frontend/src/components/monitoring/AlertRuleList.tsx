import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Chip,
  Tooltip,
} from '@mui/material';
import React from 'react';

import type { AlertRule, AlertSeverity } from '@/infrastructure/monitoring/types';

interface AlertRuleListProps {
  rules: AlertRule[];
  onEdit: (rule: AlertRule) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (ruleId: string, enabled: boolean) => void;
}

const severityColors: Record<AlertSeverity, 'default' | 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  critical: 'error',
};

export const AlertRuleList: React.FC<AlertRuleListProps> = ({
  rules,
  onEdit,
  onDelete,
  onToggle,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>状态</TableCell>
            <TableCell>规则名称</TableCell>
            <TableCell>监控指标</TableCell>
            <TableCell>条件</TableCell>
            <TableCell>级别</TableCell>
            <TableCell>通知</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rules.map(rule => (
            <TableRow key={rule.id}>
              <TableCell>
                <Switch
                  size="small"
                  checked={rule.enabled}
                  onChange={e => onToggle(rule.id, e.target.checked)}
                />
              </TableCell>
              <TableCell>{rule.name}</TableCell>
              <TableCell>{rule.metric}</TableCell>
              <TableCell>
                {rule.metric} {rule.condition.operator} {rule.condition.value}
              </TableCell>
              <TableCell>
                <Chip label={rule.severity} size="small" color={severityColors[rule.severity]} />
              </TableCell>
              <TableCell>
                {rule.notification.email?.length ? (
                  <Tooltip title={rule.notification.email.join(', ')}>
                    <Chip label={`${rule.notification.email.length} 个接收人`} size="small" />
                  </Tooltip>
                ) : (
                  '未设置'
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => onEdit(rule)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(rule.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
