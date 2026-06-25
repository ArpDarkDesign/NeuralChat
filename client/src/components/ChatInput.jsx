import { useEffect, useRef, useState } from "react";

function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    },
    [],
  );

  const handleImageSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);

    setImages((current) => [
      ...current,
      ...selectedFiles.slice(0, 5 - current.length).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = "";
  };

  const removeImage = (imageToRemove) => {
    URL.revokeObjectURL(imageToRemove.preview);
    setImages((current) => current.filter((image) => image !== imageToRemove));
  };

  const handleSubmit = async () => {
    if ((!text.trim() && images.length === 0) || isSending) return;

    const imagesToSend = images;
    setText("");
    setIsSending(true);

    try {
      const sent = await onSend(
        text,
        imagesToSend.map((image) => image.file),
      );

      if (sent !== false) {
        imagesToSend.forEach((image) => URL.revokeObjectURL(image.preview));
        setImages([]);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-shell">
        {images.length > 0 && (
          <div className="image-preview-list">
            {images.map((image) => (
              <div className="image-preview" key={image.preview}>
                <img src={image.preview} alt={image.file.name} />
                <button
                  type="button"
                  aria-label={`Remove ${image.file.name}`}
                  onClick={() => removeImage(image)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <input
            ref={fileInputRef}
            className="image-file-input"
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            multiple
            onChange={handleImageSelect}
          />

          <button
            className="image-upload-btn"
            type="button"
            aria-label="Add images"
            disabled={isSending || images.length >= 5}
            onClick={() => fileInputRef.current?.click()}
          >
            +
          </button>

          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            type="text"
            placeholder="Ask NeuralChat anything..."
            value={text}
            disabled={isSending}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            type="button"
            disabled={(!text.trim() && images.length === 0) || isSending}
            onClick={handleSubmit}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
