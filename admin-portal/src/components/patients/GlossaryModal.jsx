import { useEffect } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

// Hardcoded per the source glossary content — edit here if terms change.
const GLOSSARY_SECTIONS = [
  {
    title: "Expiratory",
    rows: [
      {
        variable: "FVC",
        fullName: "Forced Vital Capacity (L)",
        definition: "Maximum volume of air that a patient can exhale after maximal inhale",
      },
      {
        variable: "FEV1",
        fullName: "Forced Expiratory Volume 1 (L)",
        definition: "Volume measured in the first second of the spirometry blow",
      },
      {
        variable: "FEVx",
        fullName: "Forced Expiratory Volume X (L)",
        definition: "Volume of air exhaled in 1 second of the spirometry blow",
      },
      {
        variable: "FEV1/FVC",
        fullName: "",
        definition: "Proportion of FEV1 to FVC shown as a ratio",
      },
      {
        variable: "FEF25-75",
        fullName: "Forced Expiratory Flow (L/sec) measured from 25% to 75%",
        definition:
          "Flow rate (change in volume over change in time) for the middle range of the spirometry blow",
      },
      {
        variable: "PEFR",
        fullName: "Peak Expiratory Flow Rate (L/sec)",
        definition: "Maximum flow rate (change in volume over change in time)",
      },
      {
        variable: "FET",
        fullName: "Forced Expiratory Time (s)",
        definition: "Length of the spirometry blow",
      },
      {
        variable: "LLN",
        fullName: "Lower Limit of Normal",
        definition: "1.645 standard deviations below the mean value",
      },
      {
        variable: "% Predicted",
        fullName: "",
        definition: "Observed value as a percentage of the predicted value",
      },
    ],
  },
];

export default function GlossaryModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Glossary"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="flex max-h-[85vh] flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <h2 className="text-heading font-bold text-fg">Glossary</h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close glossary">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="overflow-y-auto pt-4">
            {GLOSSARY_SECTIONS.map((section) => (
              <div key={section.title} className="mb-6 last:mb-0">
                <h3 className="text-body font-semibold text-fg mb-2">{section.title}</h3>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-40 py-2 pr-4 text-left font-semibold text-fg-muted">
                        Variable
                      </th>
                      <th className="py-2 text-left font-semibold text-fg-muted">Definition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row) => (
                      <tr key={row.variable} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 align-top font-medium text-fg">
                          {row.variable}
                          {row.fullName && (
                            <div className="text-caption font-normal text-fg-muted">
                              {row.fullName}
                            </div>
                          )}
                        </td>
                        <td className="py-2 align-top text-fg-muted">{row.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}