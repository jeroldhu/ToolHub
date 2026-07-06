import { Clock, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

const nowSeconds = () => Math.floor(Date.now() / 1000);

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(String(nowSeconds()));

  const parsed = useMemo(() => {
    const numeric = Number(timestamp);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    const milliseconds = timestamp.trim().length === 10 ? numeric * 1000 : numeric;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [timestamp]);

  const setNow = () => setTimestamp(String(nowSeconds()));

  return (
    <div className="tool-panel">
      <div className="tool-controls">
        <label className="field compact wide">
          <span>Unix 时间戳</span>
          <input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} />
        </label>
        <button className="command-button" onClick={setNow}>
          <Clock size={18} />
          当前时间
        </button>
        <button className="icon-button" onClick={() => setTimestamp('')} title="清空">
          <RotateCcw size={18} />
        </button>
      </div>
      <div className="result-list">
        <div>
          <span>本地时间</span>
          <strong>{parsed ? parsed.toLocaleString() : '无法解析'}</strong>
        </div>
        <div>
          <span>ISO</span>
          <strong>{parsed ? parsed.toISOString() : '无法解析'}</strong>
        </div>
        <div>
          <span>毫秒时间戳</span>
          <strong>{parsed ? parsed.getTime().toString() : '无法解析'}</strong>
        </div>
        <div>
          <span>秒时间戳</span>
          <strong>{parsed ? Math.floor(parsed.getTime() / 1000).toString() : '无法解析'}</strong>
        </div>
      </div>
    </div>
  );
}
