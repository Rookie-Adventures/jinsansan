import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Typography,
  FormHelperText
} from '@mui/material';
import type { AlertRule, AlertRuleType, AlertSeverity, MetricType } from '@/infrastructure/monitoring/types';
import { sanitizeInput } from '../../utils/security';

interface AlertRuleFormProps {
  rule?: AlertRule;
  onSubmit: (rule: Omit<AlertRule, 'id'>) => void;
  onCancel: () => void;
}

const METRIC_TYPES: MetricType[] = [
  'page_load',
  'resource',
  'long_task',
  'interaction',
  'custom',
  'api_call'
];

const RULE_TYPES: AlertRuleType[] = ['threshold', 'trend', 'anomaly'];
const SEVERITIES: AlertSeverity[] = ['info', 'warning', 'error', 'critical'];
const OPERATORS = ['>', '<', '>=', '<=', '==', '!='];

export const AlertRuleForm: React.FC<AlertRuleFormProps> = ({
  rule,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = React.useState<Omit<AlertRule, 'id'>>({
    name: sanitizeInput(rule?.name || ''),
    type: rule?.type || 'threshold',
    metric: rule?.metric || 'page_load',
    condition: rule?.condition || { operator: '>', value: 0 },
    severity: rule?.severity || 'warning',
    enabled: rule?.enabled ?? true,
    notification: rule?.notification || {}
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 验证规则名称
    if (!formData.name.trim()) {
      newErrors.name = '规则名称不能为空';
    }

    // 验证阈值
    if (formData.condition.value < 0) {
      newErrors.threshold = '阈值不能为负数';
    }

    // 验证邮箱
    if (formData.notification.email?.length) {
      const invalidEmails = formData.notification.email.filter(
        email => !validateEmail(email)
      );
      if (invalidEmails.length > 0) {
        newErrors.email = '邮箱格式不正确';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // 在提交前净化所有文本输入
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name)
      };
      onSubmit(sanitizedData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 600 }}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          {rule ? '编辑告警规则' : '新建告警规则'}
        </Typography>

        <TextField
          fullWidth
          label="规则名称"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          required
        />

        <FormControl fullWidth>
          <InputLabel>规则类型</InputLabel>
          <Select
            value={formData.type}
            label="规则类型"
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {RULE_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>监控指标</InputLabel>
          <Select
            value={formData.metric}
            label="监控指标"
            onChange={(e) => handleChange('metric', e.target.value)}
          >
            {METRIC_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ flex: 1 }} error={!!errors.threshold}>
            <InputLabel>操作符</InputLabel>
            <Select
              value={formData.condition.operator}
              label="操作符"
              onChange={(e) =>
                handleChange('condition', {
                  ...formData.condition,
                  operator: e.target.value
                })
              }
            >
              {OPERATORS.map(op => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            sx={{ flex: 1 }}
            type="number"
            label="阈值"
            value={formData.condition.value}
            onChange={(e) =>
              handleChange('condition', {
                ...formData.condition,
                value: Number(e.target.value)
              })
            }
            error={!!errors.threshold}
            helperText={errors.threshold}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel>告警级别</InputLabel>
          <Select
            value={formData.severity}
            label="告警级别"
            onChange={(e) => handleChange('severity', e.target.value)}
          >
            {SEVERITIES.map(severity => (
              <MenuItem key={severity} value={severity}>
                {severity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="通知邮箱"
          placeholder="多个邮箱用逗号分隔"
          value={formData.notification.email?.join(',') || ''}
          onChange={(e) =>
            handleChange('notification', {
              ...formData.notification,
              email: e.target.value.split(',').map(email => email.trim())
            })
          }
          error={!!errors.email}
          helperText={errors.email}
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
            />
          }
          label="启用规则"
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onCancel}>
            取消
          </Button>
          <Button variant="contained" type="submit">
            保存
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}; 