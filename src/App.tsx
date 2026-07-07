import { Search, Sparkles, Sun, Moon } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { tools } from './tools/toolRegistry';
import type { ToolCategory } from './tools/types';

const categories: Array<ToolCategory | '全部'> = ['全部', '生活', '编码', '文本', '时间', '生成'];

function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | '全部'>('全部');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <div className="brand-text">
              <h1>ToolHub</h1>
              <p>即开即用</p>
            </div>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label="切换主题"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="tool-count">{tools.length} 个工具</span>
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
        </header>

        <div className="workspace-content" key={activeToolId}>
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}

export default App;
