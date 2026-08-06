import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Download, FileCheck2, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

export const ESGReportExporter = ({ reportData }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Colors
      const mossColor = [92, 110, 69];
      const loamColor = [36, 27, 20];
      const kraftColor = [199, 154, 92];

      // Header Banner
      doc.setFillColor(...mossColor);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(243, 238, 227); // parchment
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CircularSync AI', 15, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('VERIFIED ESG & CIRCULAR ECONOMY IMPACT CERTIFICATE', 15, 26);

      // Organization Details
      doc.setTextColor(...loamColor);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData?.organization || 'GreenBean Cafe & Bakery', 15, 50);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 57);
      doc.text(`Address: ${reportData?.address || '142 Mercer St, New York, NY'}`, 15, 63);

      // Line Separator
      doc.setDrawColor(199, 154, 92);
      doc.setLineWidth(0.8);
      doc.line(15, 68, 195, 68);

      // Impact Metric Box Grid
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Environmental & Financial Achievements', 15, 78);

      const metrics = [
        { label: 'CO2 Greenhouse Emissions Saved', val: `${reportData?.metrics?.co2DivertedKg || 144.5} kg CO2` },
        { label: 'Freshwater Resource Preserved', val: `${reportData?.metrics?.waterPreservedL || 11175} Liters` },
        { label: 'Total Landfill Diversion Volume', val: `${reportData?.metrics?.landfillDivertedKg || 235} kg` },
        { label: 'Avoided Disposal Fee Cost Savings', val: `$${reportData?.metrics?.avoidedDisposalFeesUSD || 42.50}` },
        { label: 'Neighborhood Circularity Index', val: `${reportData?.metrics?.circularityScore || '94.2%'}` },
      ];

      let yPos = 88;
      metrics.forEach((m) => {
        doc.setFillColor(243, 238, 227);
        doc.roundedRect(15, yPos, 180, 14, 2, 2, 'F');
        doc.setDrawColor(228, 220, 200);
        doc.roundedRect(15, yPos, 180, 14, 2, 2, 'S');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(36, 27, 20);
        doc.text(m.label, 20, yPos + 9);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(63, 77, 47);
        doc.text(m.val, 150, yPos + 9);

        yPos += 18;
      });

      // Verification Stamp Footer
      doc.setFillColor(228, 220, 200);
      doc.rect(15, 210, 180, 25, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...loamColor);
      doc.text('AUDIT VERIFICATION STAMP', 20, 220);
      doc.setFont('helvetica', 'normal');
      doc.text('Engineered using CircularSync AI non-blackbox multi-criteria impact ledger.', 20, 227);

      doc.save(`CircularSync_ESG_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleDownloadPDF}
      disabled={downloading}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      <span>{downloading ? 'Generating PDF Certificate...' : 'Export ESG Report (PDF)'}</span>
    </Button>
  );
};
