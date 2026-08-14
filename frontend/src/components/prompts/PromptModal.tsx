import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "../ui/Modal";
import { CATEGORIES } from "../../types/prompt";
import type { Category, Prompt } from "../../types/prompt";
import { usePrompts } from "../../context/PromptContext";
import { useToast } from "../../context/ToastContext";

interface PromptModalProps {
  mode: "add" | "edit";
  initialPrompt?: Prompt;
  onClose: () => void;
}

interface FormErrors {
  title?: string;
  content?: string;
  category?: string;
}

export default function PromptModal({ mode, initialPrompt, onClose }: PromptModalProps) {
  const { addPrompt, updatePrompt } = usePrompts();
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialPrompt?.title ?? "");
  const [content, setContent] = useState(initialPrompt?.content ?? "");
  const [category, setCategory] = useState<Category>(initialPrompt?.category ?? "Coding");
  const [tags, setTags] = useState(initialPrompt?.tags.join(", ") ?? "");
  const [description, setDescription] = useState(initialPrompt?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Give your prompt a short, descriptive title.";
    else if (title.trim().length > 120) next.title = "Keep the title under 120 characters.";
    if (!content.trim()) next.content = "The prompt content can't be empty.";
    if (!CATEGORIES.includes(category)) next.category = "Choose a valid category.";
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      if (mode === "add") {
        await addPrompt({
          title: title.trim(),
          content: content.trim(),
          category,
          tags: parsedTags,
          description: description.trim(),
        });
        showToast("Prompt created.", "success");
      } else if (initialPrompt) {
        await updatePrompt(initialPrompt.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          tags: parsedTags,
          description: description.trim(),
        });
        showToast("Prompt updated.", "success");
      }
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong saving that prompt.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={mode === "add" ? "New prompt" : "Edit prompt"}
      subtitle={mode === "add" ? "Add a reusable prompt to your library." : `Editing "${initialPrompt?.title}"`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="prompt-form" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Saving…" : mode === "add" ? "Create prompt" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="prompt-form" className="prompt-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="pf-title">Title</label>
          <input
            id="pf-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Explain code like I'm five"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "pf-title-error" : undefined}
            autoFocus
          />
          {errors.title && (
            <p className="field__error" id="pf-title-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="pf-category">Category</label>
            <select
              id="pf-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-tags">Tags</label>
            <input
              id="pf-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma, separated, tags"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pf-description">Description</label>
          <input
            id="pf-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One line on what this prompt is for (optional)"
          />
        </div>

        <div className="field">
          <label htmlFor="pf-content">Prompt content</label>
          <textarea
            id="pf-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the full prompt text here. Use {placeholders} for variable parts."
            rows={7}
            aria-invalid={Boolean(errors.content)}
            aria-describedby={errors.content ? "pf-content-error" : undefined}
          />
          {errors.content && (
            <p className="field__error" id="pf-content-error">
              {errors.content}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
