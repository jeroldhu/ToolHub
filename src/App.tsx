import { Check, Command, Palette, Search, Sparkles } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { tools } from './tools/toolRegistry';
import type { ToolCategory } from './tools/types';

const categories: Array<ToolCategory | '全部'> = ['全部', '生活', '编码', '文本', '时间', '生成'];

const themes = [
  { id: 'obsidian', label: '黑曜', color: '#caa66a' },
  { id: 'mineral', label: '矿青', color: '#7aa79a' },
  { id: 'paper', label: '纸白', color: '#b98f62' },
  { id: 'dusk', label: '暮蓝', color: '#9ca7d7' },
] as const;

function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | '全部'>('全部');
  const [theme, setTheme] = useState('obsidian');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Close picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showPicker]);

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatched = category === '全部' || tool.category === category;
      const queryMatched =
        !normalized ||
        tool.name.toLowerCase().includes(normalized) ||
        tool.description.toLowerCase().includes(normalized) ||
        tool.category.toLowerCase().includes(normalized);
      return categoryMatched && queryMatched;
    });
  }, [category, query]);

  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];
  const ActiveComponent = activeTool.component;
  const ActiveIcon = activeTool.icon;
  const activeIndex = tools.findIndex((tool) => tool.id === activeTool.id) + 1;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace-content">跳到工具内容</a>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <div className="brand-text">
              <h1>ToolHub</h1>
              <p>精选本地工具台</p>
            </div>
          </div>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工具…"
          />
        </div>

        <div className="category-strip">
          {categories.map((item) => (
            <button
              key={item}
              className={`chip ${item === category ? 'active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <nav className="tool-list" aria-label="工具列表">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className={`tool-item ${tool.id === activeTool.id ? 'active' : ''}`}
                onClick={() => setActiveToolId(tool.id)}
              >
                <span className="tool-icon">
                  <Icon size={18} />
                </span>
                <span className="tool-meta">
                  <strong>{tool.name}</strong>
                  <small>{tool.description}</small>
                </span>
                <span className="tool-status" aria-hidden="true" />
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row" ref={pickerRef}>
            <span className="tool-count">
              <Command size={13} />
              {tools.length} 个工具
            </span>
            <button
              className="skin-btn"
              onClick={() => setShowPicker(v => !v)}
              aria-label="切换皮肤"
            >
              <Palette size={16} />
            </button>

            {showPicker && (
              <div className="skin-picker">
                {themes.map(t => (
                  <button
                    key={t.id}
                    className={`skin-option ${theme === t.id ? 'active' : ''}`}
                    onClick={() => { setTheme(t.id); setShowPicker(false); }}
                  >
                    <span className="skin-dot" style={{ background: t.color }} />
                    <span>{t.label}</span>
                    {theme === t.id && <Check size={14} className="skin-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div className="title-block">
            <div className="title-icon">
              <ActiveIcon size={22} />
            </div>
            <div className="title-text">
              <span className="title-category">{activeTool.category}</span>
              <h2>{activeTool.name}</h2>
              <p>{activeTool.description}</p>
            </div>
          </div>
          <div className="workspace-meta" aria-label="当前工具信息">
            <span>Tool {String(activeIndex).padStart(2, '0')}</span>
            <strong>{activeTool.category}</strong>
          </div>
        </header>

        <div className="workspace-content" id="workspace-content" key={activeToolId}>
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}

export default App;
