import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ToolCategory = '文本' | '编码' | '时间' | '生成';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  component: ComponentType;
}
