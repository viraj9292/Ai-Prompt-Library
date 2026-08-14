import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { Search, X } from "lucide-react";
import { usePrompts } from "../../context/PromptContext";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchBarProps {
  inputRef: RefObject<HTMLInputElement>;
}

export default function SearchBar({ inputRef }: SearchBarProps) {
  const { setFilters } = usePrompts();
  const [value, setValue] = useState("");
  const debounced = useDebounce(value, 250);

  useEffect(() => {
    setFilters((f) => ({ ...f, query: debounced }));
  }, [debounced, setFilters]);

  return (
    <div className="search-bar">
      <Search size={16} className="search-bar__icon" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title or prompt content…"
        aria-label="Search prompts"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => setValue("")}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
      <kbd className="search-bar__hint">/</kbd>
    </div>
  );
}
