import React from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { AlertRuleForm } from '@/components/monitoring/AlertRuleForm';
import { AlertRuleList } from '@/components/monitoring/AlertRuleList';
import { AlertManager } from '@/infrastructure/monitoring/AlertManager';
import type { AlertRule } from '@/infrastructure/monitoring/types';

const AlertManagement: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const alertManager = AlertManager.getInstance();

  const [rules, setRules] = React.useState<AlertRule[]>([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<AlertRule | undefined>();

  // 加载规则列表
  React.useEffect(() => {
    const config = alertManager.getConfig();
    setRules(config.rules);
  }, []);

  // 处理添加/编辑规则
  const handleSubmit = (rule: Omit<AlertRule, 'id'>) => {
    if (editingRule) {
      // 更新规则
      const updatedRule = { ...rule, id: editingRule.id };
      alertManager.updateRule(updatedRule);
      setRules(prev =>
        prev.map(r => (r.id === editingRule.id ? updatedRule : r))
      );
    } else {
      // 添加新规则
      const newRule = alertManager.addRule(rule);
      setRules(prev => [...prev, newRule]);
    }
    handleCloseDialog();
  };

  // 处理删除规则
  const handleDelete = (ruleId: string) => {
    alertManager.deleteRule(ruleId);
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  // 处理启用/禁用规则
  const handleToggle = (ruleId: string, enabled: boolean) => {
    alertManager.toggleRule(ruleId, enabled);
    setRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    );
  };

  // 打开编辑对话框
  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setOpenDialog(true);
  };

  // 打开添加对话框
  const handleAdd = () => {
    setEditingRule(undefined);
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRule(undefined);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          告警规则管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          添加规则
        </Button>
      </Box>

      <AlertRuleList
        rules={rules}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <AlertRuleForm
            rule={editingRule}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default AlertManagement; 