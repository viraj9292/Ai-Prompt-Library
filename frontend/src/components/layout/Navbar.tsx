import { Menu, Plus, WifiOff } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { usePrompts } from "../../context/PromptContext";

interface NavbarProps {
  onMenuClick: () => void;
  onAddClick: () => void;
}

export default function Navbar({ onMenuClick, onAddClick }: NavbarProps) {
  const { apiAvailable, loading } = usePrompts();

  return (
    <header className="navbar">
      <button className="navbar__menu" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="navbar__title">
        <h1>Your prompts</h1>
        <p>Create, organize, and reuse your best AI prompts.</p>
      </div>

      <div className="navbar__actions">
        {!loading && !apiAvailable && (
          <span className="navbar__offline" title="Backend API unreachable — saving locally">
            <WifiOff size={14} />
            Local only
          </span>
        )}
        <ThemeToggle />
        <button className="btn btn--primary" onClick={onAddClick}>
          <Plus size={16} strokeWidth={2.25} />
          <span>New prompt</span>
        </button>
      </div>
    </header>
  );
}
