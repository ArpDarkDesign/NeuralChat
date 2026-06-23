import "./Profile.css";
import { useEffect, useState } from "react";
import { getUserStats } from "../services/chatService";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { uploadAvatar, deleteAccount } from "../services/userService";
import {
  CHAT_THEME_STORAGE_KEY,
  CHAT_THEMES,
  getChatThemeById,
  getStoredChatThemeId,
} from "../theme/chatThemes";

function Profile() {
  const storedUser = localStorage.getItem("user");

  const user =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : {};

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    chats: 0,
    messages: 0,
    mostActiveDay: "None",
    lastChat: null,
    streak: 0,
  });

  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [selectedTheme, setSelectedTheme] = useState(getStoredChatThemeId);

  const activeTheme = getChatThemeById(selectedTheme);

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    localStorage.setItem(CHAT_THEME_STORAGE_KEY, themeId);
  };

  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      const data = await uploadAvatar(user.id, file);

      setAvatar(data.avatar);

      const updatedUser = {
        ...user,
        avatar: data.avatar,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getUserStats(user?.id);

        setStats(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const rank =
    stats.messages >= 5000
      ? "Neural Master"
      : stats.messages >= 2000
        ? "Architect"
        : stats.messages >= 500
          ? "Creator"
          : stats.messages >= 100
            ? "Builder"
            : "Explorer";

  const nextRankMessages =
    rank === "Explorer"
      ? 100
      : rank === "Builder"
        ? 500
        : rank === "Creator"
          ? 2000
          : rank === "Architect"
            ? 5000
            : stats.messages;

  const messagesRemaining =
    rank === "Neural Master" ? 0 : nextRankMessages - stats.messages;

  const progress =
    rank === "Neural Master"
      ? 100
      : Math.min((stats.messages / nextRankMessages) * 100, 100);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    navigate("/login");
  };

  const level = Math.floor(stats.messages / 25) + 1;

  const xp = stats.messages % 25;

  const xpPercent = (xp / 25) * 100;

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteText, setDeleteText] = useState("");

  const handleDeleteAccount = async () => {
    try {
      if (deleteText !== "DELETE") {
        alert('Type "DELETE" to confirm account deletion');
        return;
      }

      await deleteAccount(user.id);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteInputRef = useRef(null);
  useEffect(() => {
    if (showDeleteModal) {
      setTimeout(() => {
        deleteInputRef.current?.focus();
      }, 100);
    }
  }, [showDeleteModal]);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Identity Card */}

        <div className="identity-card">
          <p className="welcome-text">
            {greeting}, {user.name}
          </p>
          <div className="avatar-wrapper">
            {avatar ? (
              <img src={avatar} alt="avatar" className="profile-avatar" />
            ) : (
              <div className="avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <label htmlFor="avatarUpload" className="avatar-edit">
              ✏️
            </label>

            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              hidden
            />
          </div>

          <h1>{user?.name}</h1>

          <p>{user?.email}</p>

          <p className="neural-id">ID #{user?.id?.slice(-6)}</p>

          <div className="rank-badge">⚡ {rank}</div>
          <div className="level-card">Level {level}</div>
          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{
                width: `${xpPercent}%`,
              }}
            ></div>
          </div>

          <p className="xp-text">{xp}/25 XP</p>
        </div>

        <div className="theme-card">
          <div className="theme-card-header">
            <div>
              <p className="theme-kicker">Chat Theme</p>
              <h2>{activeTheme.icon} {activeTheme.name}</h2>
            </div>

            <span className="active-theme-pill">Active</span>
          </div>

          <div className="theme-options">
            {CHAT_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`theme-option ${
                  selectedTheme === theme.id ? "active" : ""
                }`}
                onClick={() => handleThemeSelect(theme.id)}
                aria-pressed={selectedTheme === theme.id}
              >
                <span className="theme-option-top">
                  <span className="theme-icon">{theme.icon}</span>
                  <span className="theme-name">{theme.name}</span>
                </span>

                <span className="theme-description">{theme.description}</span>

                <span className="theme-swatches">
                  {theme.swatches.map((color) => (
                    <span
                      key={color}
                      className="theme-swatch"
                      style={{ background: color }}
                    ></span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}

        <div className="profile-grid">
          {/* Stats */}

          <div className="stats-card">
            <h2>📊 Neural Stats</h2>

            <div className="stat-row">
              <span>Current Streak</span>
              <span>
                {stats.streak} Day
                {stats.streak !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="stat-row">
              <span>Chats Created</span>
              <span>{stats.chats}</span>
            </div>

            <div className="stat-row">
              <span>Messages Sent</span>
              <span>{stats.messages}</span>
            </div>
          </div>

          {/* Activity */}

          <div className="activity-card">
            <h2>🔥 Activity Heat</h2>

            <div className="activity-grid">
              <div className="active"></div>
              <div className="active"></div>
              <div className="active"></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div className="activity-info">
              <span>Weekly Activity: {Math.min(stats.messages * 5, 100)}%</span>

              <span>Most Active Day: {stats.mostActiveDay}</span>

              <span>
                Last Chat:{" "}
                {stats.lastChat
                  ? new Date(stats.lastChat).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>

          {/* Journey */}

          <div className="journey-card">
            <h2>🚀 Neural Journey</h2>

            <div className="journey-progress">
              <div
                className="journey-fill"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                }}
              ></div>
            </div>

            <p>{messagesRemaining} messages until next rank</p>
          </div>

          <div className="achievement-card">
            <h2>🏆 Neural Milestones</h2>

            <div className="milestone-list">
              {stats.chats >= 1 && (
                <div className="milestone unlocked">✅ First Chat</div>
              )}

              <div className="milestone unlocked">✅ Verified User</div>

              {stats.messages >= 10 && (
                <div className="milestone unlocked">✅ 10 Messages</div>
              )}
            </div>

            <div className="next-unlock">
              <h3>Next Unlock</h3>

              <div className="unlock-rank">
                {rank === "Explorer"
                  ? "🏗 Builder Rank"
                  : rank === "Builder"
                    ? "🎨 Creator Rank"
                    : rank === "Creator"
                      ? "🏛 Architect Rank"
                      : rank === "Architect"
                        ? "👑 Neural Master"
                        : "🏆 All Ranks Unlocked"}
              </div>

              {rank !== "Neural Master" && (
                <>
                  <div className="unlock-progress">
                    <div
                      className="unlock-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    ></div>
                  </div>

                  <p className="unlock-text">
                    {messagesRemaining} messages remaining
                  </p>
                </>
              )}
            </div>
          </div>

          {/* DNA */}

          <div className="dna-card">
            <h2>🧠 Neural DNA</h2>

            <div className="stat-row">
              <span>Account Type</span>
              <span>{user?.googleId ? "Google" : "Email"}</span>
            </div>

            <div className="stat-row">
              <span>Favorite Model</span>
              <span>Groq</span>
            </div>

            <div className="stat-row">
              <span>AI Personality</span>
              <span>Balanced</span>
            </div>

            <div className="stat-row">
              <span>Theme</span>
              <span>{activeTheme.name}</span>
            </div>
          </div>
        </div>

        {/* Security */}

        <div className="security-card">
          <h2>🔒 Security</h2>

          <div className="security-action">
            <span>Change Password</span>

            <button onClick={() => navigate("/forgot-password")}>→</button>
          </div>

          <div className="security-action">
            <span>Sign Out</span>

            <button onClick={logout}>→</button>
          </div>
        </div>

        <div className="danger-zone">
          <h2>⚠ Danger Zone</h2>

          <div className="danger-content">
            <div>
              <h3>Delete Account</h3>

              <p>
                Permanently delete your account, chats, achievements and profile
                data.
              </p>
            </div>

            <button
              className="danger-delete-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <p className="danger-warning">
                This action is permanent and cannot be undone.
              </p>

              <p>This action cannot be undone.</p>

              <p>
                All chats, profile data and achievements will be permanently
                deleted.
              </p>

              <input
                ref={deleteInputRef}
                type="text"
                placeholder='Type "DELETE"'
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
              />

              <div className="delete-actions">
                <button onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>

                <button
                  className="danger-btn"
                  disabled={deleteText !== "DELETE"}
                  onClick={handleDeleteAccount}
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
