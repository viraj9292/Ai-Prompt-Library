import { CATEGORIES } from "../../types/prompt";
import type { Category } from "../../types/prompt";
import { usePrompts } from "../../context/PromptContext";

export default function CategoryFilter() {
  const { filters, setFilters } = usePrompts();

  return (
    <label className="select-field">
      <span className="visually-hidden">Filter by category</span>
      <select
        value={filters.category}
        onChange={(e) =>
          setFilters((f) => ({ ...f, category: e.target.value as Category | "All" }))
        }
      >
        <option value="All">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
