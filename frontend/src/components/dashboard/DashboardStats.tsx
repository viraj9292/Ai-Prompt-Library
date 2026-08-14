import { FileStack, Star, FolderKanban, Clock3 } from "lucide-react";
import { usePrompts } from "../../context/PromptContext";

export default function DashboardStats() {
  const { stats } = usePrompts();

  const cards = [
    {
      label: "Total prompts",
      value: stats.total,
      icon: FileStack,
      accent: "neutral" as const,
    },
    {
      label: "Favorites",
      value: stats.favorites,
      icon: Star,
      accent: "brass" as const,
    },
    {
      label: "Categories in use",
      value: stats.categories,
      icon: FolderKanban,
      accent: "accent" as const,
    },
    {
      label: "Added recently",
      value: stats.recent.length,
      icon: Clock3,
      accent: "neutral" as const,
      hint: stats.recent[0]?.title,
    },
  ];

  return (
    <section className="stats-grid" aria-label="Dashboard overview">
      {cards.map(({ label, value, icon: Icon, accent, hint }) => (
        <div key={label} className={`stat-card stat-card--${accent}`}>
          <div className="stat-card__icon">
            <Icon size={18} strokeWidth={1.75} />
          </div>
          <div>
            <p className="stat-card__value">{value}</p>
            <p className="stat-card__label">{label}</p>
            {hint && <p className="stat-card__hint">Latest: {hint}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}
