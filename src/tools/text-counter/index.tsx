import { FileText } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { TextCounter } from './Component';

export const tool: ToolDefinition = {
  id: 'text-counter',
  name: '文本统计',
  description: '统计字符、行、字节和片段数量。',
  category: '文本',
  icon: FileText,
  component: TextCounter,
};
