import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

import type {
  AlertRule,
  AlertRuleType,
  AlertSeverity,
  MetricType,
} from '@/infrastructure/monitoring/types';

import { sanitizeInput } from '../../utils/security';

// 创建带有测试ID的自定义组件
const StyledFormHelperText = styled(FormHelperText, {
  shouldForwardProp: prop => prop !== 'data-testid',
})<{ 'data-testid'?: string }>(({ theme }) => ({
  // 样式定义
  marginTop: theme.spacing(1),
  minHeight: '1.5em',
}));

type AlertRuleFormData = Required<Omit<AlertRule, 'id'>>;

interface AlertRuleFormProps {
  rule?: AlertRule;
  onSubmit: (rule: AlertRuleFormData) => void;
  onCancel: () => void;
}

const METRIC_TYPES: MetricType[] = [
  'page_load',
  'resource',
  'long_task',
  'interaction',
  'custom',
  'api_call',
  'cpu_usage',
];

const RULE_TYPES: AlertRuleType[] = ['threshold', 'trend', 'anomaly'];
const SEVERITIES: AlertSeverity[] = ['info', 'warning', 'error', 'critical'];
type AlertOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
const OPERATORS: AlertOperator[] = ['>', '<', '>=', '<=', '==', '!='];

export const AlertRuleForm: React.FC<AlertRuleFormProps> = ({ rule, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<AlertRuleFormData>({
    name: sanitizeInput(rule?.name || ''),
    type: rule?.type || 'threshold',
    metric: (rule?.metric as MetricType) || 'page_load',
    condition: rule?.condition || { operator: '>', value: 0 },
    severity: rule?.severity || 'warning',
    enabled: rule?.enabled ?? true,
    notification: rule?.notification || { email: [] },
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!formData.name.trim()) {
          error = '规则名称不能为空';
        }
        break;
      case 'threshold':
        if (formData.condition.value < 0) {
          error = '阈值不能为负数';
        }
        break;
      case 'email':
        if (formData.notification.email?.length) {
          const invalidEmails = formData.notification.email.filter(email => !validateEmail(email));
          if (invalidEmails.length > 0) {
            error = '邮箱格式不正确';
          }
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  const validateForm = (): boolean => {
    const fields = ['name', 'threshold', 'email'];
    const validations = fields.map(field => validateField(field));
    return validations.every(Boolean);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setTouched({
      name: true,
      threshold: true,
      email: true,
    });

    const isValid = validateForm();
    if (isValid) {
      const sanitizedData: AlertRuleFormData = {
        ...formData,
        name: sanitizeInput(formData.name),
        notification: {
          ...formData.notification,
          email: formData.notification.email?.map(email => sanitizeInput(email)) || [],
        },
      };
      onSubmit(sanitizedData);
    }
  };

  const handleThresholdChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      condition: {
        ...prev.condition,
        value,
      },
    }));

    setTouched(prev => ({ ...prev, threshold: true }));
  };

  // 使用 useEffect 监听值的变化
  React.useEffect(() => {
    if (touched.threshold) {
      if (formData.condition.value < 0) {
        setErrors(prev => ({
          ...prev,
          threshold: '阈值不能为负数',
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.threshold;
          return newErrors;
        });
      }
    }
  }, [formData.condition.value, touched.threshold]);

  const handleChange = <K extends keyof AlertRuleFormData>(
    field: K,
    value: AlertRuleFormData[K]
  ): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 修改阈值输入部分的渲染
  const renderThresholdField = () => (
    <FormControl fullWidth error={!!errors.threshold}>
      <InputLabel>阈值</InputLabel>
      <TextField
        fullWidth
        type="number"
        value={formData.condition.value}
        onChange={e => handleThresholdChange(Number(e.target.value))}
        onBlur={() => handleBlur('threshold')}
        error={!!errors.threshold}
        inputProps={{
          'aria-label': '阈值',
          'data-testid': 'threshold-input',
        }}
      />
      <StyledFormHelperText error data-testid="threshold-error-text">
        {errors.threshold || '\u200B'}
      </StyledFormHelperText>
    </FormControl>
  );

  // 修改名称输入部分的渲染
  const renderNameField = () => (
    <FormControl fullWidth error={!!errors.name}>
      <TextField
        fullWidth
        label="规则名称"
        value={formData.name}
        onChange={e => {
          handleChange('name', e.target.value);
          validateField('name');
        }}
        onBlur={() => validateField('name')}
        error={!!errors.name}
        required
        inputProps={{
          'aria-label': '规则名称',
        }}
      />
      <StyledFormHelperText error data-testid="name-error-text">
        {errors.name || '\u200B'}
      </StyledFormHelperText>
    </FormControl>
  );

  React.useEffect(() => {
    console.log('Errors state updated:', errors);
  }, [errors]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', maxWidth: 600 }}
      role="form"
      aria-label="告警规则表单"
    >
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          {rule ? '编辑告警规则' : '新建告警规则'}
        </Typography>

        {renderNameField()}

        <FormControl fullWidth>
          <InputLabel id="rule-type-label">规则类型</InputLabel>
          <Select
            labelId="rule-type-label"
            value={formData.type}
            label="规则类型"
            onChange={e => handleChange('type', e.target.value as AlertRuleType)}
            inputProps={{
              'aria-label': '规则类型',
            }}
          >
            {RULE_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="metric-type-label">监控指标</InputLabel>
          <Select
            labelId="metric-type-label"
            value={formData.metric}
            label="监控指标"
            onChange={e => handleChange('metric', e.target.value as MetricType)}
            inputProps={{
              'aria-label': '监控指标',
            }}
          >
            {METRIC_TYPES.map(type => (
              <MenuItem key={type} value={type} aria-label={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="operator-label">操作符</InputLabel>
              <Select
                labelId="operator-label"
                value={formData.condition.operator}
                label="操作符"
                onChange={e =>
                  handleChange('condition', {
                    ...formData.condition,
                    operator: e.target.value as AlertRule['condition']['operator'],
                  })
                }
                inputProps={{
                  'aria-label': '操作符',
                }}
              >
                {OPERATORS.map(op => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {renderThresholdField()}
          </Box>
        </Box>

        <FormControl fullWidth>
          <InputLabel id="severity-label">告警级别</InputLabel>
          <Select
            labelId="severity-label"
            value={formData.severity}
            label="告警级别"
            onChange={e => handleChange('severity', e.target.value as AlertSeverity)}
            inputProps={{
              'aria-label': '告警级别',
            }}
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
          onChange={e =>
            handleChange('notification', {
              ...formData.notification,
              email: e.target.value.split(',').map(email => email.trim()),
            })
          }
          error={!!errors.email}
          helperText={errors.email}
          inputProps={{
            'aria-label': '通知邮箱',
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.enabled}
              onChange={e => handleChange('enabled', e.target.checked)}
              inputProps={{
                'aria-label': '启用规则',
              }}
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
