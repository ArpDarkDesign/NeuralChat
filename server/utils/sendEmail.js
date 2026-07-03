const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log("✅ SMTP Ready"))
  .catch((err) => console.error("❌ SMTP Verify Error:", err));

const sendEmail = async (toOrOptions, subject, html) => {
  const options =
    typeof toOrOptions === "object"
      ? toOrOptions
      : {
          to: toOrOptions,
          subject,
          html,
        };

  await transporter.sendMail({
    from: `"NeuralChat" <${process.env.EMAIL_USER}>`,
    ...options,
  });
};

module.exports = sendEmail;
