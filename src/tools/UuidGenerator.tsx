import { Copy, Plus, Shuffle } from 'lucide-react';
import { useState } from 'react';

const createUuid = () => crypto.randomUUID();

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
