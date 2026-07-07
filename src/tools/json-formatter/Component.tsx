import { Clipboard, Copy, RotateCcw, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

const sampleJson = '{"name":"Tools Web","purpose":"quick utilities","enabled":true}';

export function JsonFormatter() {
  const [input, setInput] = useState(sampleJson);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      return {
        ok: true,
        value: JSON.stringify(JSON.parse(input), null, indent),
      };
    } catch (error) {
      return {
        ok: false,
        value: error instanceof Error ? error.message : 'JSON 解析失败',
      };
    }
  }, [indent, input]);

  const copyResult = async () => {
    if (!result.ok) return;
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="tool-panel tool-page-shell json-tool">
      <div className="tool-page-inner">
        <section className="tool-page-hero">
          <div className="tool-copy">
            <span className="tool-eyebrow">Structured data</span>
            <h3>清理接口响应和配置片段</h3>
            <p>左侧粘贴原始 JSON，右侧即时输出格式化结果；错误信息会直接停在结果区，方便快速定位。</p>
          </div>
          <div className="tool-hero-stat">
            <span>缩进宽度</span>
            <strong>{indent}</strong>
          </div>
        </section>

        <div className="tool-controls">
          <label className="field compact">
            <span>缩进</span>
            <input
              min="0"
              max="8"
              type="number"
              value={indent}
              onChange={(event) => setIndent(Number(event.target.value))}
            />
          </label>
          <button className="icon-button" onClick={() => setInput(sampleJson)} title="恢复示例">
            <RotateCcw size={18} />
          </button>
          <button className="command-button primary" onClick={copyResult} disabled={!result.ok}>
            {copied ? <Clipboard size={18} /> : <Copy size={18} />}
            {copied ? '已复制' : '复制结果'}
          </button>
        </div>
        <div className="split-grid">
          <label className="field stretch">
            <span>输入</span>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} />
          </label>
          <label className="field stretch">
            <span>{result.ok ? '格式化结果' : '错误信息'}</span>
            <textarea className={result.ok ? '' : 'error-text'} value={result.value} readOnly />
          </label>
        </div>
        <div className="hint-line">
          <WandSparkles size={16} />
          <span>适合粘贴接口响应、配置片段和日志里的 JSON。</span>
        </div>
      </div>
    </div>
  );
}
