"use client";

import React from "react";
import {
  Download,
  FileImage,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Atom,
  TriangleAlert,
} from "lucide-react";

import { ChemicalProperties } from "./chemistry";
import { ExportFormat } from "./types";

interface OutputPanelProps {
  analysis: ChemicalProperties;
  onExport: (format: ExportFormat) => void;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
      {children}
    </div>
  );
}

function ExportButton({
  onClick,
  icon,
  label,
  subLabel,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          {subLabel ? (
            <span className="text-xs text-slate-500">{subLabel}</span>
          ) : null}
        </div>
      </div>
      <Download size={16} className="text-slate-400 transition group-hover:text-sky-600" />
    </button>
  );
}

export default function OutputPanel({ analysis, onExport }: OutputPanelProps) {
  const hasWarnings = analysis.warnings.length > 0;
  const atomCountEntries = Object.entries(analysis.atomCounts);

  return (
    <aside className="flex h-full min-w-[300px] flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-slate-50 p-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle>
          <FlaskConical size={16} className="text-sky-600" />
          Molecule Info
        </SectionTitle>

        <div className="divide-y divide-slate-100">
          <InfoRow label="Formula" value={analysis.formula || "—"} />
          <InfoRow
            label="Molecular Weight"
            value={
              typeof analysis.molecularWeight === "number"
                ? `${analysis.molecularWeight.toFixed(3)} g/mol`
                : "—"
            }
          />
          <InfoRow label="Total Bonds" value={analysis.totalBonds ?? "—"} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle>
          <Atom size={16} className="text-emerald-600" />
          Atom Counts
        </SectionTitle>

        <div className="space-y-2">
          {atomCountEntries.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
              No atoms yet
            </div>
          ) : (
            atomCountEntries.map(([element, count]) => (
              <div
                key={element}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{element}</span>
                <strong className="text-slate-900">{count}</strong>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle>
          <TriangleAlert size={16} className={hasWarnings ? "text-amber-500" : "text-emerald-600"} />
          Warnings
        </SectionTitle>

        <div className="space-y-2">
          {!hasWarnings ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              No structural warnings
            </div>
          ) : (
            analysis.warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-800"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{warning}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle>
          <FileText size={16} className="text-violet-600" />
          Export
        </SectionTitle>

        <div className="space-y-3">
          <ExportButton
            onClick={() => onExport("png")}
            icon={<FileImage size={18} />}
            label="PNG"
            subLabel="Raster image export"
          />
          <ExportButton
            onClick={() => onExport("svg")}
            icon={<Download size={18} />}
            label="SVG"
            subLabel="Vector image export"
          />
          <ExportButton
            onClick={() => onExport("json")}
            icon={<FileText size={18} />}
            label="JSON"
            subLabel="Project data export"
          />
        </div>
      </section>
    </aside>
  );
}
