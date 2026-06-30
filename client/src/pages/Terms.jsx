import { Ban, Brain, FileText, Shield, UserX } from "lucide-react";
import SupportPageLayout from "../components/support/SupportPageLayout";

const termsSections = [
  {
    icon: Ban,
    title: "Acceptable Use",
    text: "Use NeuralChat responsibly. Do not use the platform to harm others, abuse systems, or attempt unauthorized access.",
  },
  {
    icon: Brain,
    title: "AI Limitations",
    text: "AI can make mistakes. Please verify important information before relying on it.",
  },
  {
    icon: FileText,
    title: "User Responsibilities",
    text: "You are responsible for your account activity and for the content you submit to the platform.",
  },
  {
    icon: Shield,
    title: "Privacy",
    text: "NeuralChat handles account and conversation data according to the privacy protections described in the Privacy & Security page.",
  },
  {
    icon: UserX,
    title: "Account Termination",
    text: "Accounts may be removed when users delete them or when platform abuse requires access to be restricted.",
  },
];

function Terms() {
  return (
    <SupportPageLayout
      eyebrow="Policies"
      title="📜 Terms of Service"
      description="Clear platform guidelines for using NeuralChat."
    >
      <div className="terms-section-list">
        {termsSections.map(({ icon: Icon, title, text }) => (
          <article className="support-info-card" key={title}>
            <span className="support-info-icon">
              <Icon size={22} />
            </span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </SupportPageLayout>
  );
}

export default Terms;
