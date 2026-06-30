import { useMemo, useState } from "react";

const getInitialValues = (fields) =>
  fields.reduce((values, field) => ({ ...values, [field.name]: "" }), {});

function SupportForm({ fields, submitLabel, onSubmit }) {
  const initialValues = useMemo(() => getInitialValues(fields), [fields]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    fields.forEach((field) => {
      if (field.required && !values[field.name]?.trim()) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
    });

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSuccessMessage("");
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await onSubmit(values);

      setValues(initialValues);
      setErrors({});
      setSuccessMessage(
        "Thanks! Your message has been sent successfully. Every submission helps improve NeuralChat.",
      );
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          "Unable to send your message right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="support-form" onSubmit={handleSubmit} noValidate>
      {successMessage && (
        <div className="support-success-message" role="status">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="support-field-error" role="alert">
          {submitError}
        </div>
      )}

      {fields.map((field) => {
        const inputId = `support-${field.name}`;
        const sharedProps = {
          id: inputId,
          name: field.name,
          value: values[field.name],
          onChange: handleChange,
          required: field.required,
          disabled: isSubmitting,
          "aria-invalid": errors[field.name] ? "true" : "false",
        };

        return (
          <label key={field.name} className="support-field" htmlFor={inputId}>
            <span>
              {field.label}
              {!field.required && (
                <span className="support-optional"> optional</span>
              )}
            </span>

            {field.type === "textarea" ? (
              <textarea
                {...sharedProps}
                rows={field.rows || 5}
                placeholder={field.placeholder}
              />
            ) : field.type === "select" ? (
              <select {...sharedProps}>
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...sharedProps}
                type={field.type || "text"}
                placeholder={field.placeholder}
              />
            )}

            {errors[field.name] && (
              <span className="support-field-error">{errors[field.name]}</span>
            )}
          </label>
        );
      })}

      <button
        type="submit"
        className="support-submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

export default SupportForm;
