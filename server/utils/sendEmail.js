const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (toOrOptions, subject, html) => {
  const options =
    typeof toOrOptions === "object"
      ? toOrOptions
      : {
          to: toOrOptions,
          subject,
          html,
        };

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    ...options,
  });

  if (error) {
    throw error;
  }
};

module.exports = sendEmail;