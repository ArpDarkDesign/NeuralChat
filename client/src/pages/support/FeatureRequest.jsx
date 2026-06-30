import SupportForm from "../../components/support/SupportForm";
import SupportPageLayout from "../../components/support/SupportPageLayout";

const featureFields = [
  {
    name: "name",
    label: "Name",
    placeholder: "Your name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    name: "title",
    label: "Feature title",
    placeholder: "Give your idea a short title",
    required: true,
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      "Chat",
      "Profile",
      "AI responses",
      "Personalization",
      "Security",
      "Other",
    ],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe the feature and why it would help.",
    required: true,
  },
];

function FeatureRequest() {
  return (
    <SupportPageLayout
      eyebrow="Support Center"
      title="💡 Feature Request"
      description="Share a practical improvement idea for NeuralChat."
    >
      <SupportForm fields={featureFields} submitLabel="Submit Feature Request" />
    </SupportPageLayout>
  );
}

export default FeatureRequest;
