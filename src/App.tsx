import { Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { tools } from './tools/toolRegistry';
import type { ToolCategory } from './tools/types';

const categories: Array<ToolCategory | '全部'> = ['全部', '编码', '文本', '时间', '生成'];

function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | '全部'>('全部');

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
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>Tools Web</h1>
            <p>小工具，打开就干活。</p>
          </div>
        </div>

        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工具"
          />
        </label>

        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? 'active' : ''}
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
                className={tool.id === activeTool.id ? 'tool-item active' : 'tool-item'}
                onClick={() => setActiveToolId(tool.id)}
              >
                <Icon size={20} />
                <span>
                  <strong>{tool.name}</strong>
                  <small>{tool.description}</small>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div className="title-block">
            <div className="title-icon">
              <ActiveIcon size={24} />
            </div>
            <div>
              <span>{activeTool.category}</span>
              <h2>{activeTool.name}</h2>
              <p>{activeTool.description}</p>
            </div>
          </div>
          <div className="tool-count">{tools.length} 个工具</div>
        </header>

        <ActiveComponent />
      </section>
    </main>
  );
}

export default App;
