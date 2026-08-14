import { useRef, useState } from "react";
import { FilePlus2, SearchX, Loader2 } from "lucide-react";
import { usePrompts } from "../../context/PromptContext";
import { useToast } from "../../context/ToastContext";
import type { Prompt } from "../../types/prompt";
import PromptCard from "./PromptCard";

interface PromptGridProps {
  onView: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onAddNew: () => void;
}

export default function PromptGrid({ onView, onEdit, onDelete, onAddNew }: PromptGridProps) {
  const { filteredPrompts, prompts, loading, filters, reorderPrompts } = usePrompts();
  const { showToast } = useToast();
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const canDrag =
    filters.query === "" && filters.category === "All" && !filters.favoritesOnly;

  const handleDrop = async () => {
    if (dragIndex.current === null || dragOverIndex === null || dragIndex.current === dragOverIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      dragIndex.current = null;
      return;
    }
    const reordered = [...filteredPrompts];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dragOverIndex, 0, moved);

    const visibleIds = new Set(reordered.map((p) => p.id));
    const untouchedIds = prompts.filter((p) => !visibleIds.has(p.id)).map((p) => p.id);
    const fullOrder = [...reordered.map((p) => p.id), ...untouchedIds];

    setDraggingIndex(null);
    setDragOverIndex(null);
    dragIndex.current = null;

    try {
      await reorderPrompts(fullOrder);
    } catch {
      showToast("Couldn't save the new order.", "error");
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <Loader2 size={28} className="spin" />
        <p>Loading your prompts…</p>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="empty-state">
        <FilePlus2 size={30} strokeWidth={1.5} />
        <h3>Your library is empty</h3>
        <p>Add your first reusable prompt to get started.</p>
        <button className="btn btn--primary" onClick={onAddNew}>
          Create a prompt
        </button>
      </div>
    );
  }

  if (filteredPrompts.length === 0) {
    return (
      <div className="empty-state">
        <SearchX size={30} strokeWidth={1.5} />
        <h3>No prompts match</h3>
        <p>Try a different search term, category, or filter.</p>
      </div>
    );
  }

  return (
    <div className="prompt-grid" role="list">
      {filteredPrompts.map((prompt, index) => (
        <div role="listitem" key={prompt.id}>
          <PromptCard
            prompt={prompt}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandlers={{
              draggable: canDrag,
              isDragging: draggingIndex === index,
              isDragOver: dragOverIndex === index && draggingIndex !== index,
              onDragStart: () => {
                dragIndex.current = index;
                setDraggingIndex(index);
              },
              onDragEnter: () => setDragOverIndex(index),
              onDragOver: (e) => e.preventDefault(),
              onDragEnd: handleDrop,
            }}
          />
        </div>
      ))}
    </div>
  );
}
