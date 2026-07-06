import { ArrowDownUp, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';

export function UrlCodec() {
  const [mode, setMode] = useState<Mode>('encode');
  const [value, setValue] = useState('https://example.com/search?q=小工具&sort=latest');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      return mode === 'encode' ? encodeURIComponent(value) : decodeURIComponent(value);
    } catch (error) {
      return error instanceof Error ? error.message : '转换失败';
    }
  }, [mode, value]);

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="tool-panel">
      <div className="tool-controls">
        <div className="segmented" aria-label="转换模式">
          <button className={mode === 'encode' ? 'active' : ''} onClick={() => setMode('encode')}>
            Encode
          </button>
          <button className={mode === 'decode' ? 'active' : ''} onClick={() => setMode('decode')}>
            Decode
          </button>
        </div>
        <button className="icon-button" onClick={() => setMode(mode === 'encode' ? 'decode' : 'encode')} title="切换模式">
          <ArrowDownUp size={18} />
        </button>
        <button className="command-button" onClick={copyResult}>
          <Copy size={18} />
          {copied ? '已复制' : '复制结果'}
        </button>
      </div>
      <div className="split-grid">
        <label className="field stretch">
          <span>输入</span>
          <textarea value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
        <label className="field stretch">
          <span>输出</span>
          <textarea value={result} readOnly />
        </label>
      </div>
    </div>
  );
}
