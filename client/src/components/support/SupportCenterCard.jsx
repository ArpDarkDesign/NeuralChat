import { useNavigate } from "react-router-dom";
import SupportActionRow from "./SupportActionRow";

const supportItems = [
  {
    icon: "🐞",
    title: "Report a Bug",
    subtitle: "Found something broken? Let us know.",
    to: "/support/bug",
  },
  {
    icon: "💡",
    title: "Feature Request",
    subtitle: "Share an idea to improve NeuralChat.",
    to: "/support/feature",
  },
  {
    icon: "🛡",
    title: "Privacy & Security",
    subtitle: "Learn how your data is protected.",
    to: "/privacy",
  },
  {
    icon: "📜",
    title: "Terms of Service",
    subtitle: "Read the platform policies.",
    to: "/terms",
  },
  {
    icon: "📧",
    title: "Contact Support",
    subtitle: "Need help? Reach out directly.",
    to: "/support/contact",
  },
];

function SupportCenterCard() {
  const navigate = useNavigate();

  return (
    <div className="support-card">
      <h2>💬 Support Center</h2>

      <div className="support-action-list">
        {supportItems.map((item) => (
          <SupportActionRow
            key={item.to}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            onClick={() => navigate(item.to)}
          />
        ))}
      </div>

      <p className="support-response-time">
        Typical response time: within 24 hours.
      </p>
    </div>
  );
}

export default SupportCenterCard;
