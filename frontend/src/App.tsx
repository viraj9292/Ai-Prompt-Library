import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { PromptProvider, usePrompts } from "./context/PromptContext";
import type { Prompt } from "./types/prompt";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import DashboardStats from "./components/dashboard/DashboardStats";
import ControlsBar from "./components/controls/ControlsBar";
import PromptGrid from "./components/prompts/PromptGrid";
import PromptModal from "./components/prompts/PromptModal";
import PromptDetailsModal from "./components/prompts/PromptDetailsModal";
import DeleteConfirmDialog from "./components/prompts/DeleteConfirmDialog";
import ToastContainer from "./components/ui/ToastContainer";
import "./App.css";

function AppShell() {
  const { prompts, deletePrompt } = usePrompts();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formModal, setFormModal] = useState<{ mode: "add" | "edit"; prompt?: Prompt } | null>(
    null
  );
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null!);

  const closeAllModals = useCallback(() => {
    setFormModal(null);
    setViewingPrompt(null);
    setDeletingPrompt(null);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;

      if (e.key === "Escape") {
        closeAllModals();
        return;
      }
      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setFormModal({ mode: "add" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAllModals]);

  const handleConfirmDelete = async () => {
    if (!deletingPrompt) return;
    try {
      await deletePrompt(deletingPrompt.id);
      showToast(`Deleted "${deletingPrompt.title}"`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't delete that prompt.", "error");
    } finally {
      setDeletingPrompt(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalCount={prompts.length}
      />
      <div className="app-main">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddClick={() => setFormModal({ mode: "add" })}
        />
        <main className="app-content">
          <DashboardStats />
          <ControlsBar searchInputRef={searchInputRef} />
          <PromptGrid
            onView={setViewingPrompt}
            onEdit={(p) => setFormModal({ mode: "edit", prompt: p })}
            onDelete={setDeletingPrompt}
            onAddNew={() => setFormModal({ mode: "add" })}
          />
        </main>
      </div>

      {formModal && (
        <PromptModal
          mode={formModal.mode}
          initialPrompt={formModal.prompt}
          onClose={() => setFormModal(null)}
        />
      )}

      {viewingPrompt && (
        <PromptDetailsModal
          prompt={viewingPrompt}
          onClose={() => setViewingPrompt(null)}
          onEdit={() => {
            setFormModal({ mode: "edit", prompt: viewingPrompt });
            setViewingPrompt(null);
          }}
        />
      )}

      {deletingPrompt && (
        <DeleteConfirmDialog
          promptTitle={deletingPrompt.title}
          onCancel={() => setDeletingPrompt(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PromptProvider>
          <AppShell />
        </PromptProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
