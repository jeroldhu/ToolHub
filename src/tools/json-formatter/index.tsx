import { Braces } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { JsonFormatter } from './Component';

export const tool: ToolDefinition = {
  id: 'json-formatter',
  name: 'JSON 格式化',
  description: '格式化、校验和复制 JSON。',
  category: '编码',
  icon: Braces,
  component: JsonFormatter,
};
