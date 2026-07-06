import type { ToolDefinition } from './types';
import { tool as aaAssistant } from './aa-assistant';
import { tool as jsonFormatter } from './json-formatter';
import { tool as textCounter } from './text-counter';
import { tool as timestampConverter } from './timestamp-converter';
import { tool as urlCodec } from './url-codec';
import { tool as uuidGenerator } from './uuid-generator';

export const tools: ToolDefinition[] = [
  aaAssistant,
  jsonFormatter,
  urlCodec,
  textCounter,
  timestampConverter,
  uuidGenerator,
];
