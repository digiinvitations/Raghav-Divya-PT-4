const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Insert imports for Download and Upload icons if not present
if (!content.includes('Download')) {
  content = content.replace('Save, Image as ImageIcon, ArrowLeft', 'Save, Image as ImageIcon, ArrowLeft, Download, Upload');
}

// Create the handleExport and handleImport functions right after handleSave
const handleExportCode = `
  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setData(parsed);
        alert("Data imported successfully! Make sure to click Save Changes to persist it.");
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };
`;

if (!content.includes('handleExport')) {
  content = content.replace('return (', handleExportCode + '\n  return (');
}

// Add the buttons next to Save
const buttonsCode = `
            <div className="flex items-center gap-2 mt-[20px]">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-blush-light text-wine-dark border border-pink-border px-4 py-2 h-[38px] rounded-md hover:bg-pink-border/50 transition-colors"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label 
                className="flex items-center gap-2 bg-blush-light text-wine-dark border border-pink-border px-4 py-2 h-[38px] rounded-md hover:bg-pink-border/50 transition-colors cursor-pointer"
                title="Import Data"
              >
                <Upload className="w-4 h-4" />
                Import
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-burgundy text-white px-6 py-2 h-[38px] rounded-md hover:bg-wine-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
`;

content = content.replace(
  /<button\s+onClick=\{handleSave\}[\s\S]*?<\/button>/,
  buttonsCode.trim()
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
