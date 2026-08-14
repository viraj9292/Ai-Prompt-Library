import { useState } from "react";
import {
  Copy,
  Pencil,
  Trash2,
  Star,
  Pin,
  CopyPlus,
  GripVertical,
  Check,
} from "lucide-react";
import type { Prompt } from "../../types/prompt";
import { usePrompts } from "../../context/PromptContext";
import { useToast } from "../../context/ToastContext";
import { copyToClipboard } from "../../utils/clipboard";

interface PromptCardProps {
  prompt: Prompt;
  onView: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  dragHandlers: {
    draggable: boolean;
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    isDragging: boolean;
    isDragOver: boolean;
  };
}

export default function PromptCard({ prompt, onView, onEdit, onDelete, dragHandlers }: PromptCardProps) {
  const { toggleFavorite, togglePin, duplicatePrompt } = usePrompts();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setCopied(true);
      showToast("Prompt copied to clipboard.", "success");
      setTimeout(() => setCopied(false), 1500);
    } else {
      showToast("Couldn't copy — your browser blocked clipboard access.", "error");
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(prompt.id);
    } catch {
      showToast("Couldn't update favorite status.", "error");
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await togglePin(prompt.id);
    } catch {
      showToast("Couldn't update pin status.", "error");
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicatePrompt(prompt.id);
      showToast("Prompt duplicated.", "success");
    } catch {
      showToast("Couldn't duplicate that prompt.", "error");
    }
  };

  return (
    <article
      className={`prompt-card ${prompt.isPinned ? "prompt-card--pinned" : ""} ${
        dragHandlers.isDragging ? "prompt-card--dragging" : ""
      } ${dragHandlers.isDragOver ? "prompt-card--drag-over" : ""}`}
      draggable={dragHandlers.draggable}
      onDragStart={dragHandlers.onDragStart}
      onDragEnter={dragHandlers.onDragEnter}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={dragHandlers.onDragOver}
      onClick={() => onView(prompt)}
    >
      {prompt.isPinned && <span className="prompt-card__pin-mark" aria-hidden="true" />}

      <header className="prompt-card__header">
        <button
          className="prompt-card__handle"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical size={15} />
        </button>
        <span className="tag tag--category">{prompt.category}</span>
        <div className="prompt-card__header-actions">
          <button
            className={`icon-btn ${prompt.isPinned ? "icon-btn--brass-active" : ""}`}
            onClick={handlePin}
            aria-label={prompt.isPinned ? "Unpin prompt" : "Pin prompt"}
            title={prompt.isPinned ? "Unpin" : "Pin to top"}
          >
            <Pin size={15} fill={prompt.isPinned ? "currentColor" : "none"} />
          </button>
          <button
            className={`icon-btn ${prompt.isFavorite ? "icon-btn--accent-active" : ""}`}
            onClick={handleFavorite}
            aria-label={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={prompt.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star size={15} fill={prompt.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <h3 className="prompt-card__title">{prompt.title}</h3>
      {prompt.description && <p className="prompt-card__description">{prompt.description}</p>}
      <p className="prompt-card__content">{prompt.content}</p>

      {prompt.tags.length > 0 && (
        <div className="prompt-card__tags">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag tag--muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <footer className="prompt-card__footer">
        <span className="prompt-card__date">
          Updated {new Date(prompt.updatedAt).toLocaleDateString()}
        </span>
        <div className="prompt-card__actions">
          <button className="icon-btn" onClick={handleCopy} aria-label="Copy prompt" title="Copy">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button
            className="icon-btn"
            onClick={handleDuplicate}
            aria-label="Duplicate prompt"
            title="Duplicate"
          >
            <CopyPlus size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(prompt);
            }}
            aria-label="Edit prompt"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            className="icon-btn icon-btn--danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(prompt);
            }}
            aria-label="Delete prompt"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </footer>
    </article>
  );
}
