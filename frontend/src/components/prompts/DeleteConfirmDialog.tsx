import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";

interface DeleteConfirmDialogProps {
  promptTitle: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmDialog({
  promptTitle,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <Modal
      title="Delete this prompt?"
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </>
      }
    >
      <div className="confirm-body">
        <AlertTriangle size={22} className="confirm-body__icon" />
        <p>
          "<strong>{promptTitle}</strong>" will be permanently removed from your library. This
          can't be undone.
        </p>
      </div>
    </Modal>
  );
}
