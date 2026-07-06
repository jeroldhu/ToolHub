import { Clock3 } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { TimestampConverter } from './Component';

export const tool: ToolDefinition = {
  id: 'timestamp-converter',
  name: '时间戳转换',
  description: 'Unix 秒/毫秒时间戳和可读时间互转。',
  category: '时间',
  icon: Clock3,
  component: TimestampConverter,
};
