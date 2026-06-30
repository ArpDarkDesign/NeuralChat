import SupportForm from "../../components/support/SupportForm";
import SupportPageLayout from "../../components/support/SupportPageLayout";
import { submitBugReport } from "../../services/supportService";

const bugFields = [
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
    name: "category",
    label: "Bug Category",
    type: "select",
    required: true,
    options: [
      "Login or account",
      "Chat experience",
      "Profile",
      "Image upload",
      "Performance",
      "Other",
    ],
  },
  {
    name: "page",
    label: "Page",
    placeholder: "Where did this happen?",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe what went wrong.",
    required: true,
  },
  {
    name: "steps",
    label: "Steps to reproduce",
    type: "textarea",
    placeholder: "List the steps that caused the issue.",
    required: true,
  },
  {
    name: "expectedBehaviour",
    label: "Expected behaviour",
    type: "textarea",
    placeholder: "What did you expect to happen?",
    required: true,
  },
];

function ReportBug() {
  return (
    <SupportPageLayout
      eyebrow="Support Center"
      title="🐞 Report a Bug"
      description="Tell us what broke so it can be investigated in a future support workflow."
    >
      <SupportForm
        fields={bugFields}
        submitLabel="Submit Bug Report"
        onSubmit={submitBugReport}
      />
    </SupportPageLayout>
  );
}

export default ReportBug;
