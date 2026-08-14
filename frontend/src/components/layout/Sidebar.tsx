import { X, LibraryBig } from "lucide-react";
import { CATEGORIES } from "../../types/prompt";
import { usePrompts } from "../../context/PromptContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
}

export default function Sidebar({ isOpen, onClose, totalCount }: SidebarProps) {
  const { prompts, filters, setFilters } = usePrompts();

  const countFor = (category: string) => prompts.filter((p) => p.category === category).length;

  const selectCategory = (category: string) => {
    setFilters((f) => ({ ...f, category: category as typeof f.category }));
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-scrim" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`} aria-label="Categories">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon">
            <LibraryBig size={20} strokeWidth={1.75} />
          </span>
          <div>
            <p className="sidebar__brand-title">Prompt Library</p>
            <p className="sidebar__brand-sub">{totalCount} entries catalogued</p>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__label">Browse</p>
          <button
            className={`sidebar__item ${filters.category === "All" ? "sidebar__item--active" : ""}`}
            onClick={() => selectCategory("All")}
          >
            <span>All prompts</span>
            <span className="sidebar__count">{prompts.length}</span>
          </button>

          <p className="sidebar__label">Categories</p>
          <div className="sidebar__categories">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`sidebar__item ${
                  filters.category === category ? "sidebar__item--active" : ""
                }`}
                onClick={() => selectCategory(category)}
              >
                <span>{category}</span>
                <span className="sidebar__count">{countFor(category)}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar__footer">
          <p>
            Tips: press <kbd>/</kbd> to search, <kbd>n</kbd> to add a prompt.
          </p>
        </div>
      </aside>
    </>
  );
}
