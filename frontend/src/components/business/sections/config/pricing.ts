export interface PricingTier {
  title: string;
  subheader?: string;
  price: string | number;
  description: string[];
  buttonText: string;
  buttonVariant: 'outlined' | 'contained';
}

export const pricingTiers: PricingTier[] = [
  {
    title: '免费版',
    price: '0',
    description: ['每日固定调用次数', '基础模型支持', '标准响应速度', '社区支持'],
    buttonText: '立即使用',
    buttonVariant: 'outlined',
  },
  {
    title: '专业版',
    subheader: '最受欢迎',
    price: '99',
    description: ['无限制调用次数', '所有模型支持', '优先响应速度', '专属客服支持'],
    buttonText: '立即订阅',
    buttonVariant: 'contained',
  },
  {
    title: '企业版',
    price: '联系我们',
    description: ['定制化解决方案', 'API 独享配置', '企业级 SLA 保障', '7×24小时技术支持'],
    buttonText: '联系销售',
    buttonVariant: 'outlined',
  },
]; 