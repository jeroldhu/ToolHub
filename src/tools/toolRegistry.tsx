import { Binary, Braces, Clock3, FileText, Fingerprint } from 'lucide-react';
import { JsonFormatter } from './JsonFormatter';
import { TextCounter } from './TextCounter';
import { TimestampConverter } from './TimestampConverter';
import type { ToolDefinition } from './types';
import { UrlCodec } from './UrlCodec';
import { UuidGenerator } from './UuidGenerator';

export const tools: ToolDefinition[] = [
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化、校验和复制 JSON。',
    category: '编码',
    icon: Braces,
    component: JsonFormatter,
  },
  {
    id: 'url-codec',
    name: 'URL 编解码',
    description: '快速 encodeURIComponent / decodeURIComponent。',
    category: '编码',
    icon: Binary,
    component: UrlCodec,
  },
  {
    id: 'text-counter',
    name: '文本统计',
    description: '统计字符、行、字节和片段数量。',
    category: '文本',
    icon: FileText,
    component: TextCounter,
  },
  {
    id: 'timestamp-converter',
    name: '时间戳转换',
    description: 'Unix 秒/毫秒时间戳和可读时间互转。',
    category: '时间',
    icon: Clock3,
    component: TimestampConverter,
  },
  {
    id: 'uuid-generator',
    name: 'UUID 生成',
    description: '批量生成 UUID 并一键复制。',
    category: '生成',
    icon: Fingerprint,
    component: UuidGenerator,
  },
];
