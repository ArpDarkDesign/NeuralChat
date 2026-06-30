import SupportForm from "../../components/support/SupportForm";
import SupportPageLayout from "../../components/support/SupportPageLayout";
import { submitContactSupport } from "../../services/supportService";

const contactFields = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    name: "subject",
    label: "Subject",
    placeholder: "What do you need help with?",
    required: true,
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "Share the details of your request.",
    required: true,
  },
];

function ContactSupport() {
  return (
    <SupportPageLayout
      eyebrow="Support Center"
      title="📧 Contact Support"
      description=""
    >
      <SupportForm
        fields={contactFields}
        submitLabel="Submit Message"
        onSubmit={submitContactSupport}
      />
    </SupportPageLayout>
  );
}

export default ContactSupport;
