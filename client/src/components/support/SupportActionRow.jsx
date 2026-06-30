import { ChevronRight } from "lucide-react";

function SupportActionRow({ icon, title, subtitle, onClick }) {
  return (
    <button type="button" className="support-action-row" onClick={onClick}>
      <span className="support-action-icon">{icon}</span>

      <span className="support-action-copy">
        <span className="support-action-title">{title}</span>
        {subtitle && (
          <span className="support-action-subtitle">{subtitle}</span>
        )}
      </span>

      <span className="support-action-arrow" aria-hidden="true">
        <ChevronRight size={20} strokeWidth={2.4} />
      </span>
    </button>
  );
}

export default SupportActionRow;
