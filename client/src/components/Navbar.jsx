import { Menu } from "lucide-react";

function Navbar({ onMenuClick, isMenuOpen }) {
  return (
    <div className="navbar">
      <button
        type="button"
        className="chat-menu-btn"
        onClick={onMenuClick}
        aria-label="Open conversations"
        aria-expanded={isMenuOpen}
        aria-controls="chat-sidebar"
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      <h2>llama-3.3-70b-versatile</h2>
    </div>
  );
}

export default Navbar;
