import { Binary } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { UrlCodec } from './Component';

export const tool: ToolDefinition = {
  id: 'url-codec',
  name: 'URL 编解码',
  description: '快速 encodeURIComponent / decodeURIComponent。',
  category: '编码',
  icon: Binary,
  component: UrlCodec,
};
