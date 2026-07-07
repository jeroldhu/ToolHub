import { ClipboardCheck, Eraser } from 'lucide-react';
import { useMemo, useState } from 'react';

const initialText = '把文本粘贴到这里，快速查看字符数、单词数、行数和字节数。';

export function TextCounter() {
  const [text, setText] = useState(initialText);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.length ? text.split(/\r\n|\r|\n/).length : 0;
    const bytes = new TextEncoder().encode(text).length;

    return [
      { label: '字符', value: text.length },
      { label: '无空白字符', value: charsNoSpaces },
      { label: '单词/片段', value: words },
      { label: '行', value: lines },
      { label: '字节', value: bytes },
    ];
  }, [text]);

  return (
    <div className="tool-panel tool-page-shell text-tool">
      <div className="tool-page-inner">
        <section className="tool-page-hero">
          <div className="tool-copy">
            <span className="tool-eyebrow">Text metrics</span>
            <h3>让长文本的体量一眼可见</h3>
            <p>统计字符、字节、行数和片段数量，适合写摘要、检查提示词长度或整理待发布文案。</p>
          </div>
          <div className="tool-hero-stat">
            <span>总字符</span>
            <strong>{text.length.toLocaleString()}</strong>
          </div>
        </section>

        <div className="tool-controls">
          <button className="command-button primary" onClick={() => navigator.clipboard.writeText(text)}>
            <ClipboardCheck size={18} />
            复制文本
          </button>
          <button className="icon-button" onClick={() => setText('')} title="清空">
            <Eraser size={18} />
          </button>
        </div>
        <div className="stats-grid">
          {stats.map((item) => (
            <div className="stat-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value.toLocaleString()}</strong>
            </div>
          ))}
        </div>
        <label className="field stretch tall">
          <span>文本</span>
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
        </label>
      </div>
    </div>
  );
}
