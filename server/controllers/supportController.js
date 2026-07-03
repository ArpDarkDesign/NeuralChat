const sendEmail = require("../utils/sendEmail");

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;
console.log("SUPPORT_EMAIL =", SUPPORT_EMAIL);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldLabels = {
  name: "Name",
  email: "Email",
  category: "Category",
  page: "Page",
  description: "Description",
  steps: "Steps to reproduce",
  expectedBehaviour: "Expected behaviour",
  title: "Feature title",
  benefits: "Benefits",
  subject: "Subject",
  message: "Message",
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeText = (value, maxLength = 3000) =>
  typeof value === "string"
    ? value.replace(/\0/g, "").trim().slice(0, maxLength)
    : "";

const sanitizePayload = (body, fields) =>
  fields.reduce(
    (payload, field) => ({
      ...payload,
      [field]: normalizeText(body[field], field === "email" ? 254 : 3000),
    }),
    {},
  );

const validateRequiredFields = (payload, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    return `${missingFields.map((field) => fieldLabels[field]).join(", ")} ${
      missingFields.length === 1 ? "is" : "are"
    } required.`;
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return "A valid email address is required.";
  }

  return null;
};

const buildRows = (rows) =>
  rows
    .map(
      ({ label, value }) => `
        <tr>
          <th style="width: 190px; padding: 14px 16px; text-align: left; vertical-align: top; background: #111827; color: #c4b5fd; border-bottom: 1px solid #263044;">
            ${escapeHtml(label)}
          </th>
          <td style="padding: 14px 16px; color: #e5e7eb; border-bottom: 1px solid #263044; white-space: pre-wrap;">
            ${escapeHtml(value || "Not provided")}
          </td>
        </tr>
      `,
    )
    .join("");

const buildSupportEmail = ({ heading, intro, rows }) => `
  <div style="margin: 0; padding: 28px; background: #060b1a; font-family: Arial, sans-serif; color: #e5e7eb;">
    <div style="max-width: 720px; margin: 0 auto; border: 1px solid rgba(139, 92, 246, 0.35); border-radius: 18px; overflow: hidden; background: #0f1428;">
      <div style="padding: 24px 28px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; line-height: 1.2;">${escapeHtml(
          heading,
        )}</h1>
        <p style="margin: 10px 0 0; color: #eef2ff;">${escapeHtml(intro)}</p>
      </div>

      <div style="padding: 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #263044; border-radius: 14px; overflow: hidden;">
          ${buildRows(rows)}
        </table>
      </div>
    </div>
  </div>
`;

const sendSupportEmail = async ({ subject, replyTo, html }) => {
  await sendEmail({
    to: SUPPORT_EMAIL,
    subject,
    html,
    replyTo,
  });
};

const submitBugReport = async (req, res) => {
  try {
    const payload = sanitizePayload(req.body, [
      "name",
      "email",
      "category",
      "page",
      "description",
      "steps",
      "expectedBehaviour",
    ]);

    const validationError = validateRequiredFields(payload, [
      "email",
      "category",
      "page",
      "description",
      "steps",
      "expectedBehaviour",
    ]);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const timestamp = new Date().toISOString();

    await sendSupportEmail({
      subject: "🐞 NeuralChat Bug Report",
      replyTo: payload.email,
      html: buildSupportEmail({
        heading: "🐞 NeuralChat Bug Report",
        intro: "A user submitted a bug report from the Support Center.",
        rows: [
          { label: "Name", value: payload.name },
          { label: "Email", value: payload.email },
          { label: "Category", value: payload.category },
          { label: "Page", value: payload.page },
          { label: "Description", value: payload.description },
          { label: "Steps to reproduce", value: payload.steps },
          { label: "Expected behaviour", value: payload.expectedBehaviour },
          { label: "Timestamp", value: timestamp },
        ],
      }),
    });

    return res.status(200).json({
      message: "Bug report sent successfully.",
    });
  } catch (error) {
    console.error("SUPPORT BUG EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Unable to send bug report right now.",
    });
  }
};

const submitFeatureRequest = async (req, res) => {
  try {
    const payload = sanitizePayload(req.body, [
      "name",
      "email",
      "title",
      "category",
      "description",
      "benefits",
    ]);

    const validationError = validateRequiredFields(payload, [
      "email",
      "title",
      "category",
      "description",
    ]);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const timestamp = new Date().toISOString();

    await sendSupportEmail({
      subject: "💡 NeuralChat Feature Request",
      replyTo: payload.email,
      html: buildSupportEmail({
        heading: "💡 NeuralChat Feature Request",
        intro: "A user submitted a feature request from the Support Center.",
        rows: [
          { label: "Name", value: payload.name },
          { label: "Email", value: payload.email },
          { label: "Feature title", value: payload.title },
          { label: "Category", value: payload.category },
          { label: "Description", value: payload.description },
          { label: "Benefits", value: payload.benefits },
          { label: "Timestamp", value: timestamp },
        ],
      }),
    });

    return res.status(200).json({
      message: "Feature request sent successfully.",
    });
  } catch (error) {
    console.error("SUPPORT FEATURE EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Unable to send feature request right now.",
    });
  }
};

const submitContactSupport = async (req, res) => {
  try {
    const payload = sanitizePayload(req.body, ["email", "subject", "message"]);

    const validationError = validateRequiredFields(payload, [
      "email",
      "subject",
      "message",
    ]);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const timestamp = new Date().toISOString();

    await sendSupportEmail({
      subject: "📩 NeuralChat Contact Support",
      replyTo: payload.email,
      html: buildSupportEmail({
        heading: "📩 NeuralChat Contact Support",
        intro: "A user submitted a support message from the Support Center.",
        rows: [
          { label: "Email", value: payload.email },
          { label: "Subject", value: payload.subject },
          { label: "Message", value: payload.message },
          { label: "Timestamp", value: timestamp },
        ],
      }),
    });

    return res.status(200).json({
      message: "Support message sent successfully.",
    });
  } catch (error) {
    console.error("SUPPORT CONTACT EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Unable to send support message right now.",
    });
  }
};

module.exports = {
  submitBugReport,
  submitFeatureRequest,
  submitContactSupport,
};
