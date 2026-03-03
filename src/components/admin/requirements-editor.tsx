"use client";

import { Trash2 } from "lucide-react";

interface Requirement {
  field: string;
  operator: string;
  value: string;
  isRequired: boolean;
}

interface RequirementsEditorProps {
  value: Requirement[];
  onChange: (requirements: Requirement[]) => void;
}

const PROFILE_FIELDS = [
  {
    group: "Persona",
    fields: [
      { value: "birthYear", label: "Anno di nascita" },
      { value: "region", label: "Regione" },
      { value: "province", label: "Provincia" },
      { value: "maritalStatus", label: "Stato civile" },
      { value: "childrenCount", label: "Numero figli" },
      { value: "childrenAges", label: "Et\u00e0 figli" },
      { value: "employmentType", label: "Tipo impiego" },
      { value: "contractType", label: "Tipo contratto" },
      { value: "incomeRange", label: "Fascia reddito" },
      { value: "iseeRange", label: "Fascia ISEE" },
      { value: "housingType", label: "Tipo abitazione" },
      { value: "isPrimaryResidence", label: "Residenza principale" },
      { value: "hasMortgage", label: "Ha mutuo" },
      { value: "hasRenovatedRecently", label: "Ristrutturato di recente" },
      { value: "heatingType", label: "Tipo riscaldamento" },
      { value: "electricityBimonthly", label: "Bolletta luce bimestrale" },
      { value: "gasBimonthly", label: "Bolletta gas bimestrale" },
      { value: "bankName", label: "Banca" },
      { value: "accountType", label: "Tipo conto" },
      { value: "estimatedBankCost", label: "Costo bancario stimato" },
      { value: "hasInsurance", label: "Ha assicurazione" },
      { value: "travelFrequency", label: "Frequenza viaggi" },
      { value: "hasPets", label: "Ha animali" },
      { value: "medicalExpensesRange", label: "Spese mediche" },
      { value: "hasChildrenInSchool", label: "Figli a scuola" },
      { value: "hasChildrenInDaycare", label: "Figli al nido" },
      { value: "subscriptionCount", label: "Numero abbonamenti" },
    ],
  },
  {
    group: "Azienda",
    fields: [
      { value: "companyName", label: "Nome azienda" },
      { value: "legalForm", label: "Forma giuridica" },
      { value: "atecoCode", label: "Codice ATECO" },
      { value: "employeeCount", label: "Numero dipendenti" },
      { value: "revenueRange", label: "Fascia fatturato" },
      { value: "taxRegime", label: "Regime fiscale" },
      { value: "hasAccountant", label: "Ha commercialista" },
      { value: "investsInTraining", label: "Investe in formazione" },
      { value: "investsInRD", label: "Investe in R&S" },
      { value: "boughtEquipmentRecently", label: "Acquisto beni recente" },
      { value: "energyCostRange", label: "Costo energia" },
      { value: "offersWelfare", label: "Offre welfare" },
      { value: "hiredRecently", label: "Assunzioni recenti" },
      { value: "hiredYouth", label: "Assunzioni giovani" },
      { value: "hiredWomen", label: "Assunzioni donne" },
    ],
  },
] as const;

const OPERATORS = [
  { value: "eq", label: "Uguale (eq)" },
  { value: "neq", label: "Diverso (neq)" },
  { value: "gt", label: "Maggiore (gt)" },
  { value: "gte", label: "Maggiore o uguale (gte)" },
  { value: "lt", label: "Minore (lt)" },
  { value: "lte", label: "Minore o uguale (lte)" },
  { value: "in", label: "In lista (in)" },
  { value: "not_in", label: "Non in lista (not_in)" },
  { value: "exists", label: "Esiste (exists)" },
  { value: "between", label: "Tra (between)" },
  { value: "contains", label: "Contiene (contains)" },
  { value: "range_overlaps", label: "Range sovrapposto" },
] as const;

const selectClass =
  "w-full border border-border-light rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary";

const inputClass =
  "w-full border border-border-light rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary";

export function RequirementsEditor({ value, onChange }: RequirementsEditorProps) {
  function addRequirement() {
    onChange([
      ...value,
      { field: "", operator: "eq", value: "", isRequired: true },
    ]);
  }

  function updateRequirement(index: number, updates: Partial<Requirement>) {
    const updated = value.map((req, i) =>
      i === index ? { ...req, ...updates } : req
    );
    onChange(updated);
  }

  function removeRequirement(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-text-muted">Nessun requisito aggiunto.</p>
      )}

      {value.map((req, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <select
              value={req.field}
              onChange={(e) => updateRequirement(index, { field: e.target.value })}
              className={selectClass}
            >
              <option value="">Seleziona campo...</option>
              {PROFILE_FIELDS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.fields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="w-48 shrink-0">
            <select
              value={req.operator}
              onChange={(e) => updateRequirement(index, { operator: e.target.value })}
              className={selectClass}
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={req.value}
              onChange={(e) => updateRequirement(index, { value: e.target.value })}
              placeholder="Valore"
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-1.5 shrink-0 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={req.isRequired}
              onChange={(e) =>
                updateRequirement(index, { isRequired: e.target.checked })
              }
              className="rounded border-border-light"
            />
            <span className="text-xs text-text-secondary whitespace-nowrap">Obbligatorio</span>
          </label>

          <button
            type="button"
            onClick={() => removeRequirement(index)}
            className="shrink-0 p-2 text-text-muted hover:text-accent-danger transition-colors"
            title="Rimuovi requisito"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRequirement}
        className="text-sm text-accent-primary hover:underline"
      >
        + Aggiungi requisito
      </button>
    </div>
  );
}
