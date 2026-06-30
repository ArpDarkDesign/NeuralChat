import {
  Database,
  KeyRound,
  Lock,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import SupportPageLayout from "../components/support/SupportPageLayout";

const privacyItems = [
  {
    icon: KeyRound,
    title: "Password Protection",
    text: "Passwords are securely hashed before storage.",
  },
  {
    icon: ShieldCheck,
    title: "Google Sign-In",
    text: "Google Sign-In does not store your Google password in NeuralChat.",
  },
  {
    icon: UserCheck,
    title: "Account-Owned Conversations",
    text: "Your conversations are associated with the account you signed in with.",
  },
  {
    icon: Database,
    title: "Database Hosting",
    text: "All database access happens through the server. The client never connects directly to the database.",
  },
  {
    icon: Lock,
    title: "Sensitive Credentials",
    text: "Sensitive server credentials are never exposed to the client application.",
  },
  {
    icon: Trash2,
    title: "Account Deletion",
    text: "Users can delete their account and associated account data from the Profile page.",
  },
];

function Privacy() {
  return (
    <SupportPageLayout
      eyebrow="Trust"
      title="🛡 Privacy & Security"
      description="A simple overview of how NeuralChat handles account and conversation data."
    >
      <div className="support-info-grid">
        {privacyItems.map(({ icon: Icon, title, text }) => (
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

export default Privacy;
