import { Copy, Plus, Shuffle } from 'lucide-react';
import { useState } from 'react';

const createUuid = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex: string[] = [];
  for (const b of bytes) hex.push(b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};

export function UuidGenerator() {
  const [uuids, setUuids] = useState(() => Array.from({ length: 5 }, createUuid));
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="tool-panel">
      <div className="tool-controls">
        <button className="command-button" onClick={() => setUuids(Array.from({ length: 5 }, createUuid))}>
          <Shuffle size={18} />
          重新生成
        </button>
        <button className="command-button" onClick={() => setUuids([...uuids, createUuid()])}>
          <Plus size={18} />
          增加一个
        </button>
        <button className="command-button" onClick={copyAll}>
          <Copy size={18} />
          {copied ? '已复制' : '复制全部'}
        </button>
      </div>
      <div className="uuid-list">
        {uuids.map((uuid) => (
          <button key={uuid} onClick={() => navigator.clipboard.writeText(uuid)} title="点击复制">
            {uuid}
          </button>
        ))}
      </div>
    </div>
  );
}
