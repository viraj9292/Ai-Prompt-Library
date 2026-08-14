import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { usePrompts } from "../../context/PromptContext";
import { useToast } from "../../context/ToastContext";
import { exportPromptsAsFile, readJsonFile } from "../../utils/exportImport";

export default function ImportExportButtons() {
  const { prompts, importPrompts } = usePrompts();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (prompts.length === 0) {
      showToast("There's nothing to export yet.", "info");
      return;
    }
    exportPromptsAsFile(prompts);
    showToast(`Exported ${prompts.length} prompt${prompts.length === 1 ? "" : "s"}.`, "success");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      showToast("Please choose a .json file to import.", "error");
      return;
    }

    try {
      const parsed = await readJsonFile(file);
      const { added, skipped } = importPrompts(parsed);
      if (added === 0) {
        showToast("No valid prompts were found in that file.", "error");
      } else {
        showToast(
          `Imported ${added} prompt${added === 1 ? "" : "s"}${
            skipped > 0 ? ` (${skipped} skipped — missing required fields)` : ""
          }.`,
          "success"
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Import failed.", "error");
    }
  };

  return (
    <div className="import-export">
      <button className="btn btn--ghost" onClick={handleExport}>
        <Download size={15} />
        Export
      </button>
      <button className="btn btn--ghost" onClick={handleImportClick}>
        <Upload size={15} />
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="visually-hidden"
        onChange={handleFileChange}
        aria-label="Import prompts from JSON file"
      />
    </div>
  );
}
