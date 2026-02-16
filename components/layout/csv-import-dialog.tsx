'use client';

import * as React from 'react';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/lib/context/app-context';
import { getCsvTemplate, parseTradesCsv } from '@/lib/adapters/csv';

export function CsvImportDialog() {
  const { csvText, setCsvText, clearCsvText } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(csvText);

  React.useEffect(() => {
    if (open) setDraft(csvText);
  }, [open, csvText]);

  const downloadTemplate = () => {
    const blob = new Blob([getCsvTemplate()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'derivision-trades-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded CSV template');
  };

  const onPickFile = async (file: File) => {
    const text = await file.text();
    setDraft(text);
    toast.info(`Loaded ${file.name}`);
  };

  const applyImport = () => {
    const parsed = parseTradesCsv(draft);
    if (!parsed.ok) {
      toast.error(parsed.error);
      return;
    }
    setCsvText(draft);
    toast.success(`Imported ${parsed.trades.length} trades from CSV`);
    setOpen(false);
  };

  const validateDraft = () => {
    const parsed = parseTradesCsv(draft);
    if (!parsed.ok) {
      toast.error(parsed.error);
      return;
    }
    toast.success(`CSV looks valid (${parsed.trades.length} trades)`);
  };

  const clear = () => {
    clearCsvText();
    setDraft('');
    toast.info('Cleared CSV data');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-2">
          <Upload className="w-3 h-3" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>CSV Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Card className="glass-panel border-white/10 p-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="text-xs text-white/70">
                Recommended columns: <span className="text-white">timestamp, symbol, side, pnl</span> (+ optional entry/exit/fees/size/orderType/tags/notes).
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-8 text-xs gap-2" onClick={downloadTemplate}>
                  <Download className="w-3 h-3" />
                  Template
                </Button>
                <label className="inline-flex">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onPickFile(f);
                      e.currentTarget.value = '';
                    }}
                  />
                  <span>
                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-2" asChild>
                      <span>
                        <FileText className="w-3 h-3" />
                        Choose file
                      </span>
                    </Button>
                  </span>
                </label>
              </div>
            </div>
          </Card>

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste CSV here (header row required)..."
            className="min-h-[260px] font-mono text-xs"
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={validateDraft}>
                Validate
              </Button>
              <Button size="sm" className="h-8 text-xs bg-cyan-500 hover:bg-cyan-600 text-black" onClick={applyImport}>
                Import
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-red-300 gap-2" onClick={clear}>
              <Trash2 className="w-3 h-3" />
              Clear stored CSV
            </Button>
          </div>

          <div className="text-[11px] text-white/50">
            Data is stored locally in your browser (localStorage). No files are uploaded to any server.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
