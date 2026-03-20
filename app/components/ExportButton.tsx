'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { CompanyWithRoles } from '@/server/types';

interface ExportButtonProps {
  companies: CompanyWithRoles[];
  variant?: 'button' | 'icon';
}

const Icons = {
  download: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  ),
  fileSpreadsheet: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M8 13h2"/>
      <path d="M8 17h2"/>
      <path d="M14 13h2"/>
      <path d="M14 17h2"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
};

// Helper to format date for Excel
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('no-NO');
  } catch {
    return dateStr;
  }
}

// Helper to get daglig leder name
function getDagligLederNavn(company: CompanyWithRoles): string {
  if (!company.dagligLeder) return '';
  
  const leder = company.dagligLeder;
  
  if (typeof leder === 'object') {
    if ('navn' in leder && typeof leder.navn === 'string') {
      return leder.navn;
    }
    // Handle Person type with fornavn/etternavn
    const fornavn = (leder as any).fornavn || '';
    const mellomnavn = (leder as any).mellomnavn || '';
    const etternavn = (leder as any).etternavn || '';
    return [fornavn, mellomnavn, etternavn].filter(Boolean).join(' ');
  }
  
  return '';
}

export function ExportButton({ companies, variant = 'button' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const exportToExcel = () => {
    if (companies.length === 0) return;

    setExporting(true);

    // Prepare data for Excel
    const data = companies.map(company => {
      const address = company.forretningsadresse || company.postadresse;
      
      return {
        'Organisasjonsnummer': company.organisasjonsnummer,
        'Navn': company.navn || '',
        'Organisasjonsform': company.organisasjonsform?.beskrivelse || company.organisasjonsform?.kode || '',
        'Aksjekapital (NOK)': company.kapital?.belop || 0,
        'Registreringsdato': formatDate(company.registreringsdatoEnhetsregisteret),
        'Stiftelsesdato': formatDate(company.stiftelsesdato),
        'Adresse': address?.adresse?.join(', ') || '',
        'Postnummer': address?.postnummer || '',
        'Poststed': address?.poststed || '',
        'Kommune': address?.kommune || '',
        'Daglig leder': getDagligLederNavn(company),
        'Næringskode': company.naeringskode1?.kode || '',
        'Næringsbeskrivelse': company.naeringskode1?.beskrivelse || '',
        'Antall ansatte': company.antallAnsatte || 0,
        'E-post': company.epostadresse || '',
        'Telefon': company.telefon || '',
        'Hjemmeside': company.hjemmeside || '',
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Orgnr
      { wch: 35 }, // Navn
      { wch: 20 }, // Orgform
      { wch: 15 }, // Kapital
      { wch: 15 }, // Reg dato
      { wch: 15 }, // Stiftelsesdato
      { wch: 30 }, // Adresse
      { wch: 10 }, // Postnr
      { wch: 15 }, // Poststed
      { wch: 15 }, // Kommune
      { wch: 25 }, // Daglig leder
      { wch: 12 }, // Næringskode
      { wch: 35 }, // Næringsbeskrivelse
      { wch: 10 }, // Ansatte
      { wch: 25 }, // E-post
      { wch: 15 }, // Telefon
      { wch: 25 }, // Hjemmeside
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Bedrifter');

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `bedrifter_eksport_${dateStr}.xlsx`;

    // Write file and trigger download
    XLSX.writeFile(wb, filename);

    // Show success state
    setExporting(false);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  if (companies.length === 0) return null;

  if (variant === 'icon') {
    return (
      <button
        onClick={exportToExcel}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-white/5"
        style={{
          background: 'var(--gs-bg-tertiary)',
          border: '1px solid var(--gs-border-default)',
          color: exported ? 'var(--gs-accent-green)' : 'var(--gs-text-secondary)',
          cursor: exporting ? 'wait' : 'pointer',
        }}
        title="Eksporter til Excel"
      >
        {exported ? Icons.check : Icons.download}
        {exported ? 'Eksportert' : 'Eksport'}
      </button>
    );
  }

  return (
    <button
      onClick={exportToExcel}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
      style={{
        background: exported 
          ? 'rgba(34, 197, 94, 0.15)' 
          : 'var(--gs-bg-tertiary)',
        border: `1px solid ${exported 
          ? 'rgba(34, 197, 94, 0.3)' 
          : 'var(--gs-border-default)'}`,
        color: exported ? 'var(--gs-success)' : 'var(--gs-text-secondary)',
        cursor: exporting ? 'wait' : 'pointer',
      }}
    >
      <span style={{ color: exported ? 'var(--gs-success)' : 'var(--gs-accent-lime)' }}>
        {exported ? Icons.check : Icons.fileSpreadsheet}
      </span>
      {exported 
        ? 'Eksportert!' 
        : exporting 
          ? 'Eksporterer...' 
          : `Eksporter ${companies.length} bedrifter`
      }
    </button>
  );
}
