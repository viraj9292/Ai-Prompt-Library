import { useState } from "react";
import { Copy, Check, Pencil, Star, Pin } from "lucide-react";
import Modal from "../ui/Modal";
import type { Prompt } from "../../types/prompt";
import { copyToClipboard } from "../../utils/clipboard";
import { useToast } from "../../context/ToastContext";
import { usePrompts } from "../../context/PromptContext";

interface PromptDetailsModalProps {
  prompt: Prompt;
  onClose: () => void;
  onEdit: () => void;
}

export default function PromptDetailsModal({ prompt, onClose, onEdit }: PromptDetailsModalProps) {
  const { showToast } = useToast();
  const { toggleFavorite, togglePin } = usePrompts();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setCopied(true);
      showToast("Prompt copied to clipboard.", "success");
      setTimeout(() => setCopied(false), 1500);
    } else {
      showToast("Couldn't copy to clipboard.", "error");
    }
  };

  return (
    <Modal
      title={prompt.title}
      subtitle={prompt.description || undefined}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
          <button className="btn btn--ghost" onClick={onEdit}>
            <Pencil size={15} /> Edit
          </button>
          <button className="btn btn--primary" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy prompt"}
          </button>
        </>
      }
    >
      <div className="details">
        <div className="details__meta">
          <span className="tag tag--category">{prompt.category}</span>
          <button
            className={`icon-btn ${prompt.isPinned ? "icon-btn--brass-active" : ""}`}
            onClick={() => togglePin(prompt.id)}
            title={prompt.isPinned ? "Unpin" : "Pin to top"}
          >
            <Pin size={15} fill={prompt.isPinned ? "currentColor" : "none"} />
          </button>
          <button
            className={`icon-btn ${prompt.isFavorite ? "icon-btn--accent-active" : ""}`}
            onClick={() => toggleFavorite(prompt.id)}
            title={prompt.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star size={15} fill={prompt.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <pre className="details__content">{prompt.content}</pre>

        {prompt.tags.length > 0 && (
          <div className="details__tags">
            {prompt.tags.map((tag) => (
              <span key={tag} className="tag tag--muted">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <dl className="details__dates">
          <div>
            <dt>Created</dt>
            <dd>{new Date(prompt.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{new Date(prompt.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
