// The receipt as the OCR read it. Monospace, because the columns matter.
export default function ReceiptView({ text }: { text: string }) {
  if (!text) return <p className="receipt none">No receipt attached.</p>;
  return <pre className="receipt">{text}</pre>;
}
