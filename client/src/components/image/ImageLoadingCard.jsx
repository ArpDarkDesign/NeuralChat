import { useEffect, useState } from "react";
import "./ImageLoadingCard.css";
import BoltLogo from "../../assets/brand/logo.svg";

const stages = [
  "Understanding prompt...",
  "Planning composition...",
  "Rendering artwork...",
  "Enhancing details...",
  "Finalizing image...",
];

function ImageGenerationCard({ title = "Generating Image" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % stages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="image-generation-card" aria-live="polite">
      <div className="generation-logo">
        <img src={BoltLogo} alt="NeuralChat" />
      </div>

      <div className="generation-content">
        <h3>{title}</h3>

        <p key={stages[index]}>{stages[index]}</p>

        <div className="generation-progress">
          <div className="generation-progress-bar" />
        </div>

        <span className="generation-powered">Powered by NeuralChat</span>
      </div>
    </div>
  );
}

export default ImageGenerationCard;
