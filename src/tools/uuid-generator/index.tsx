import { Fingerprint } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { UuidGenerator } from './Component';

export const tool: ToolDefinition = {
  id: 'uuid-generator',
  name: 'UUID 生成',
  description: '批量生成 UUID 并一键复制。',
  category: '生成',
  icon: Fingerprint,
  component: UuidGenerator,
};
