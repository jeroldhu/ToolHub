import { ReceiptText } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { AaAssistant } from './Component';

export const tool: ToolDefinition = {
  id: 'aa-assistant',
  name: 'AA 助手',
  description: '按总价或运费 AA 计算每个人应收应付。',
  category: '生活',
  icon: ReceiptText,
  component: AaAssistant,
};
