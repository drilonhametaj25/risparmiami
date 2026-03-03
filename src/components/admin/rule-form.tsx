"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequirementsEditor } from "@/components/admin/requirements-editor";
import { createRule, updateRule } from "@/app/(admin)/admin/actions";

interface Requirement {
  field: string;
  operator: string;
  value: string;
  isRequired: boolean;
}

interface SerializedRule {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string | null;
  target: string;
  maxAmount: number | null;
  percentage: number | null;
  estimateFormula: string | null;
  certaintyLevel: string;
  certaintyNote: string | null;
  howToClaim: string;
  requiredDocs: string[];
  whereToApply: string | null;
  legalReference: string | null;
  officialUrl: string | null;
  sourceName: string | null;
  validFrom: string | null;
  validUntil: string | null;
  deadline: string | null;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  tags: string[];
  version: number;
  lastVerified: string | null;
  requirements: Requirement[];
  [key: string]: unknown;
}

interface RuleFormProps {
  initialData?: SerializedRule;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDateForInput(isoString: string | null): string {
  if (!isoString) return "";
  return isoString.slice(0, 10);
}

const CATEGORIES = [
  { value: "detrazioni-fiscali", label: "Detrazioni fiscali" },
  { value: "bonus-inps", label: "Bonus INPS" },
  { value: "bollette", label: "Bollette" },
  { value: "banca", label: "Banca" },
  { value: "trasporti", label: "Trasporti" },
  { value: "isee", label: "ISEE" },
  { value: "incentivi-imprese", label: "Incentivi imprese" },
] as const;

const TARGETS = [
  { value: "persona", label: "Persona" },
  { value: "impresa", label: "Impresa" },
  { value: "entrambi", label: "Entrambi" },
] as const;

const CERTAINTY_LEVELS = [
  { value: "certo", label: "Certo" },
  { value: "probabile", label: "Probabile" },
  { value: "consiglio", label: "Consiglio" },
] as const;

const inputClass =
  "w-full border border-border-light rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary";

const labelClass = "block text-sm font-medium text-text-primary mb-1";

export function RuleForm({ initialData }: RuleFormProps) {
  const isEditing = !!initialData;

  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [requirements, setRequirements] = useState<Requirement[]>(
    initialData?.requirements || []
  );

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugManuallyEdited) {
      setSlug(slugify(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true);
    setSlug(e.target.value);
  }

  const formAction = isEditing
    ? updateRule.bind(null, initialData.id)
    : createRule;

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
      <input
        type="hidden"
        name="requirements"
        value={JSON.stringify(requirements)}
      />

      {/* Section 1 - Informazioni base */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Informazioni base</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nome *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={initialData?.name || ""}
              onChange={handleNameChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className={labelClass}>
                Categoria
              </label>
              <select
                id="category"
                name="category"
                defaultValue={initialData?.category || ""}
                className={inputClass}
              >
                <option value="">Seleziona...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className={labelClass}>
                Sottocategoria
              </label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                defaultValue={initialData?.subcategory || ""}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="target" className={labelClass}>
                Target
              </label>
              <select
                id="target"
                name="target"
                defaultValue={initialData?.target || ""}
                className={inputClass}
              >
                <option value="">Seleziona...</option>
                {TARGETS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="shortDescription" className={labelClass}>
              Descrizione breve *
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              required
              rows={2}
              defaultValue={initialData?.shortDescription || ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fullDescription" className={labelClass}>
              Descrizione completa *
            </label>
            <textarea
              id="fullDescription"
              name="fullDescription"
              required
              rows={5}
              defaultValue={initialData?.fullDescription || ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="tags" className={labelClass}>
              Tag (separati da virgola)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              defaultValue={initialData?.tags?.join(", ") || ""}
              placeholder="bonus, famiglia, 2024"
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      {/* Section 2 - Importi */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Importi</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="maxAmount" className={labelClass}>
                Importo massimo
              </label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                step="0.01"
                defaultValue={initialData?.maxAmount ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="percentage" className={labelClass}>
                Percentuale
              </label>
              <input
                type="number"
                id="percentage"
                name="percentage"
                step="0.01"
                defaultValue={initialData?.percentage ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="estimateFormula" className={labelClass}>
                Formula di stima
              </label>
              <input
                type="text"
                id="estimateFormula"
                name="estimateFormula"
                defaultValue={initialData?.estimateFormula || ""}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3 - Certezza */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Certezza</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="certaintyLevel" className={labelClass}>
                Livello di certezza *
              </label>
              <select
                id="certaintyLevel"
                name="certaintyLevel"
                required
                defaultValue={initialData?.certaintyLevel || ""}
                className={inputClass}
              >
                <option value="">Seleziona...</option>
                {CERTAINTY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="certaintyNote" className={labelClass}>
                Nota certezza
              </label>
              <input
                type="text"
                id="certaintyNote"
                name="certaintyNote"
                defaultValue={initialData?.certaintyNote || ""}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section 4 - Come richiederlo */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Come richiederlo</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="howToClaim" className={labelClass}>
              Come richiederlo *
            </label>
            <textarea
              id="howToClaim"
              name="howToClaim"
              required
              rows={4}
              defaultValue={initialData?.howToClaim || ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="requiredDocs" className={labelClass}>
              Documenti richiesti (separati da virgola)
            </label>
            <input
              type="text"
              id="requiredDocs"
              name="requiredDocs"
              defaultValue={initialData?.requiredDocs?.join(", ") || ""}
              placeholder="ISEE, documento identit\u00e0, CUD"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="whereToApply" className={labelClass}>
              Dove fare domanda
            </label>
            <input
              type="text"
              id="whereToApply"
              name="whereToApply"
              defaultValue={initialData?.whereToApply || ""}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      {/* Section 5 - Riferimenti */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Riferimenti</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="legalReference" className={labelClass}>
                Riferimento normativo
              </label>
              <input
                type="text"
                id="legalReference"
                name="legalReference"
                defaultValue={initialData?.legalReference || ""}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sourceName" className={labelClass}>
                Nome fonte
              </label>
              <input
                type="text"
                id="sourceName"
                name="sourceName"
                defaultValue={initialData?.sourceName || ""}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="officialUrl" className={labelClass}>
              URL ufficiale
            </label>
            <input
              type="url"
              id="officialUrl"
              name="officialUrl"
              defaultValue={initialData?.officialUrl || ""}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="validFrom" className={labelClass}>
                Valido da
              </label>
              <input
                type="date"
                id="validFrom"
                name="validFrom"
                defaultValue={formatDateForInput(initialData?.validFrom || null)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="validUntil" className={labelClass}>
                Valido fino a
              </label>
              <input
                type="date"
                id="validUntil"
                name="validUntil"
                defaultValue={formatDateForInput(initialData?.validUntil || null)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="deadline" className={labelClass}>
                Scadenza
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                defaultValue={formatDateForInput(initialData?.deadline || null)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section 6 - SEO */}
      <Card>
        <h2 className="font-heading text-lg mb-4">SEO</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="seoTitle" className={labelClass}>
              Titolo SEO
            </label>
            <input
              type="text"
              id="seoTitle"
              name="seoTitle"
              defaultValue={initialData?.seoTitle || ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="seoDescription" className={labelClass}>
              Descrizione SEO
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={3}
              defaultValue={initialData?.seoDescription || ""}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      {/* Section 7 - Stato */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Stato</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-border-light"
            />
            <span className="text-sm text-text-primary">Regola attiva</span>
          </label>
        </div>
      </Card>

      {/* Section 8 - Requisiti */}
      <Card>
        <h2 className="font-heading text-lg mb-4">Requisiti</h2>
        <RequirementsEditor value={requirements} onChange={setRequirements} />
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit">
          {isEditing ? "Aggiorna regola" : "Salva regola"}
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/regole">Annulla</Link>
        </Button>
      </div>
    </form>
  );
}
