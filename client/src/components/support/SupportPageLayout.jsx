import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./Support.css";

function SupportPageLayout({ eyebrow, title, description, children }) {
  const navigate = useNavigate();

  return (
    <div className="profile-page support-page">
      <Navbar />

      <div className="support-page-container">
        <button
          type="button"
          className="support-back-button"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>

        <div className="support-page-card">
          <div className="support-page-header">
            {eyebrow && <p className="support-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {description && (
              <p className="support-page-description">{description}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default SupportPageLayout;
