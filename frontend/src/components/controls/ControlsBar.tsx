import type { RefObject } from "react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import SortSelect from "./SortSelect";
import ImportExportButtons from "./ImportExportButtons";
import { usePrompts } from "../../context/PromptContext";
import { Star } from "lucide-react";

interface ControlsBarProps {
  searchInputRef: RefObject<HTMLInputElement>;
}

export default function ControlsBar({ searchInputRef }: ControlsBarProps) {
  const { filters, setFilters } = usePrompts();

  return (
    <section className="controls-bar" aria-label="Search and filters">
      <SearchBar inputRef={searchInputRef} />
      <div className="controls-bar__row">
        <CategoryFilter />
        <SortSelect />
        <button
          className={`chip-toggle ${filters.favoritesOnly ? "chip-toggle--active" : ""}`}
          onClick={() => setFilters((f) => ({ ...f, favoritesOnly: !f.favoritesOnly }))}
          aria-pressed={filters.favoritesOnly}
        >
          <Star size={14} fill={filters.favoritesOnly ? "currentColor" : "none"} />
          Favorites only
        </button>
        <div className="controls-bar__spacer" />
        <ImportExportButtons />
      </div>
    </section>
  );
}
