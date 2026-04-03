"use client";

import { useEffect, useState } from "react";

interface Base64Image {
  id: string;
  data: string;
  name: string;
}

interface GeneratedStep {
  step: number;
  title: string;
  description: string;
  imageUrl: string;
  annotations: string[];
  tip?: string;
}

export default function PrintPage() {
  const [steps, setSteps] = useState<GeneratedStep[]>([]);

  useEffect(() => {
    // Load steps from sessionStorage (same as PreviewPage)
    const data = sessionStorage.getItem("docsnap_steps");
    if (data) {
      try {
        setSteps(JSON.parse(data));
      } catch {
        console.error("Failed to parse steps");
      }
    }
  }, []);

  // Auto-trigger print on load
  useEffect(() => {
    if (steps.length > 0) {
      window.print();
    }
  }, [steps]);

  if (steps.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>No documentation to print. Go back and generate documentation first.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 20px; }
          .step-card { page-break-inside: avoid; margin-bottom: 32px; }
          .step-number { background: #eef2ff !important; color: #4f46e5 !important; }
          .step-header { background: #f8fafc !important; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          padding: 40px;
          color: #1e293b;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .header-icon { font-size: 32px; }
        .header h1 { font-size: 24px; font-weight: 700; color: #0f172a; }
        .step-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .step-header {
          background: #f8fafc;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .step-number {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px;
        }
        .step-title { font-size: 16px; font-weight: 600; color: #1e293b; }
        .step-body { padding: 18px; }
        .step-description { color: #475569; line-height: 1.6; margin-bottom: 14px; }
        .step-image { width: 100%; max-width: 700px; border-radius: 10px; border: 1px solid #e2e8f0; }
        .annotations { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
        .annotation {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 9999px;
          font-size: 12px;
          color: #475569;
          background: #f8fafc;
        }
        .tip {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #92400e;
          margin-top: 12px;
        }
        .tip-label { font-weight: 600; margin-right: 4px; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        @media screen {
          .no-print { display: none; }
          .screen-notice {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
            font-size: 14px;
            color: #0369a1;
          }
        }
      `}</style>

      <div className="screen-notice no-print">
        📄 Print view — Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) to print or save as PDF.
      </div>

      <div className="header">
        <span className="header-icon">📋</span>
        <h1>DocSnap Documentation</h1>
      </div>

      <div>
        {steps.map((step) => (
          <div key={step.step} className="step-card">
            <div className="step-header">
              <div className="step-number">{step.step}</div>
              <div className="step-title">{step.title}</div>
            </div>
            <div className="step-body">
              <p className="step-description">{step.description}</p>
              <img src={step.imageUrl} alt={step.title} className="step-image" />
              {step.annotations.length > 0 && (
                <div className="annotations">
                  {step.annotations.map((ann) => (
                    <span key={ann} className="annotation">{ann}</span>
                  ))}
                </div>
              )}
              {step.tip && (
                <div className="tip">
                  <span className="tip-label">💡 Tip:</span>{step.tip}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="footer">
        Generated by DocSnap
      </div>
    </>
  );
}
