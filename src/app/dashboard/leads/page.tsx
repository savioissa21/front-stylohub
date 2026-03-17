"use client";

import { Users, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Placeholder leads data (API endpoint not yet available)
const PLACEHOLDER_LEADS = [
  { id: "1", email: "ana@email.com", source: "Link Bio", capturedAt: "2026-03-10T14:22:00Z" },
  { id: "2", email: "carlos@email.com", source: "Formulário PRO", capturedAt: "2026-03-09T09:10:00Z" },
  { id: "3", email: "julia@email.com", source: "Link Bio", capturedAt: "2026-03-08T18:05:00Z" },
];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function exportCsv(data: typeof PLACEHOLDER_LEADS) {
  const header = "Email,Origem,Data\n";
  const rows = data
    .map((l) => `${l.email},${l.source},${formatDate(l.capturedAt)}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads_stylohub.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Contatos capturados pela sua página.
          </p>
        </div>
        <Button
          onClick={() => exportCsv(PLACEHOLDER_LEADS)}
          variant="outline"
          className="border-white/15 text-white/70 hover:text-white hover:border-white/30 bg-transparent"
        >
          <Download size={15} className="mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Coming soon banner */}
      <div className="flex items-start gap-3 bg-stylo-gold/8 border border-stylo-gold/20 rounded-xl p-4">
        <Clock size={18} className="text-stylo-gold shrink-0 mt-0.5" />
        <div>
          <p className="text-stylo-gold font-semibold text-sm">Em breve</p>
          <p className="text-white/50 text-sm mt-0.5">
            A captura de leads via formulários personalizados está chegando. Os dados abaixo são
            de demonstração.
          </p>
        </div>
      </div>

      {/* Table */}
      {PLACEHOLDER_LEADS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
          <Users size={40} className="text-white/20 mb-3" strokeWidth={1.5} />
          <p className="text-white/40 font-medium">Nenhum lead ainda</p>
          <p className="text-white/25 text-sm mt-1">
            Adicione um widget de formulário para capturar leads.
          </p>
        </div>
      ) : (
        <div className="bg-stylo-surface border border-white/10 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/8 hover:bg-transparent">
                <TableHead className="text-white/50 font-semibold">E-mail</TableHead>
                <TableHead className="text-white/50 font-semibold">Origem</TableHead>
                <TableHead className="text-white/50 font-semibold">Capturado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLACEHOLDER_LEADS.map((lead) => (
                <TableRow key={lead.id} className="border-white/5 hover:bg-white/3">
                  <TableCell className="text-white font-medium">{lead.email}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-stylo-gold/10 text-stylo-gold border border-stylo-gold/20 px-2 py-0.5 rounded-full">
                      {lead.source}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/50 text-sm">
                    {formatDate(lead.capturedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
