"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadPdf } from "@/app/(admin)/admin/actions";

export function PdfUploadForm() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file ? file.name : null);
    setStatus("idle");
    setMessage("");
  };

  const handleSubmit = async (formData: FormData) => {
    setStatus("loading");
    setMessage("");

    try {
      await uploadPdf(formData);
      setStatus("success");
      setMessage("PDF caricato con successo.");
      setSelectedFile(null);
      formRef.current?.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Errore durante il caricamento.");
    }
  };

  return (
    <Card padding="md">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Carica PDF Guida
      </h2>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="pdf"
            className="mb-1 block text-sm font-medium text-text-secondary"
          >
            Seleziona file PDF
          </label>
          <input
            id="pdf"
            name="pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-md file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-primary hover:file:bg-brand-primary/20"
          />
          {selectedFile && (
            <p className="mt-1 text-sm text-text-muted">
              File selezionato: {selectedFile}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={status === "loading"}
        >
          Carica PDF
        </Button>
        {status === "success" && (
          <p className="text-sm text-accent-success">{message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-accent-danger">{message}</p>
        )}
      </form>
    </Card>
  );
}
