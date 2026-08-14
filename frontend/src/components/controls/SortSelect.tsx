import type { SortOption } from "../../types/prompt";
import { usePrompts } from "../../context/PromptContext";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "Title: A → Z" },
  { value: "za", label: "Title: Z → A" },
];

export default function SortSelect() {
  const { filters, setFilters } = usePrompts();

  return (
    <label className="select-field">
      <span className="visually-hidden">Sort prompts</span>
      <select
        value={filters.sort}
        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
