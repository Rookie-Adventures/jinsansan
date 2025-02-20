import {
  AutoMode as StreamIcon,
  Psychology as ContextIcon,
  Apps as ModelsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import type { SvgIconComponent } from '@mui/icons-material';

export interface Feature {
  title: string;
  description: string;
  icon: SvgIconComponent;
  delay: number;
}

export const features: Feature[] = [
  {
    title: '流式响应',
    description: '支持流式输出，实时响应，提供更自然的对话体验',
    icon: StreamIcon,
    delay: 0,
  },
  {
    title: '智能上下文',
    description: '智能管理对话上下文，实现连贯的多轮对话',
    icon: ContextIcon,
    delay: 0.1,
  },
  {
    title: '多模型支持',
    description: '支持多种主流模型，满足不同场景需求',
    icon: ModelsIcon,
    delay: 0.2,
  },
  {
    title: '安全可控',
    description: '数据安全有保障，支持自定义敏感词过滤',
    icon: SecurityIcon,
    delay: 0.3,
  },
]; 