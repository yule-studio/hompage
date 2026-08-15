import { useEffect } from "react";
import { createPortal } from "react-dom";
import { profile } from "../../data/profile";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * ProfileDetailModal — about / 경력 / 학력 / 연락처 소개 팝업.
 * Backdrop click & Esc 로 닫힘. Portal 로 `document.body` 에 mount —
 * `.page-anim > *` 의 `will-change: transform` 같은 ancestor 때문에
 * fixed positioning 이 깨지는 걸 피한다.
 */
export default function ProfileDetailModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handle);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="profile-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="profile detail"
      onClick={onClose}
    >
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="profile-modal-close"
          onClick={onClose}
          aria-label="close profile"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            aria-hidden
          >
            <path d="M6 6 L18 18" />
            <path d="M18 6 L6 18" />
          </svg>
        </button>

        <header className="profile-modal-head">
          <img
            className="profile-modal-avatar"
            src={profile.avatarUrl}
            alt={`${profile.name} avatar`}
            decoding="async"
          />
          <div className="profile-modal-id">
            <h2 className="profile-modal-name">{profile.name}</h2>
            <p className="profile-modal-role">{profile.role}</p>
            <p className="profile-modal-loc mono faint">{profile.location}</p>
          </div>
        </header>

        <div className="profile-modal-body">
          <section className="profile-modal-section">
            <h3 className="profile-modal-section-title">Work Experience</h3>
            <ul className="profile-modal-list">
              {profile.experience.map((exp) => (
                <li className="profile-modal-entry" key={`${exp.org}-${exp.period}`}>
                  <div className="profile-modal-entry-side">
                    <span className="profile-modal-period mono">{exp.period}</span>
                  </div>
                  <div className="profile-modal-entry-main">
                    <div className="profile-modal-entry-title">
                      <span className="profile-modal-entry-org">{exp.org}</span>
                      <span className="profile-modal-entry-role">{exp.role}</span>
                    </div>
                    {exp.link ? (
                      <a
                        className="profile-modal-link"
                        href={exp.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        notion ↗
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="profile-modal-section">
            <h3 className="profile-modal-section-title">Education & Training</h3>
            <ul className="profile-modal-list">
              {profile.education.map((edu) => (
                <li className="profile-modal-entry" key={`${edu.org}-${edu.period}`}>
                  <div className="profile-modal-entry-side">
                    <span className="profile-modal-period mono">{edu.period}</span>
                  </div>
                  <div className="profile-modal-entry-main">
                    <div className="profile-modal-entry-title">
                      <span className="profile-modal-entry-org">{edu.org}</span>
                    </div>
                    {edu.link ? (
                      <a
                        className="profile-modal-link"
                        href={edu.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        notion ↗
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="profile-modal-section">
            <h3 className="profile-modal-section-title">Contact</h3>
            <ul className="profile-modal-contact">
              <li>
                <span className="label">phone</span>
                <a className="profile-modal-link" href={`tel:${profile.phone}`}>
                  {profile.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="label">email</span>
                <a className="profile-modal-link" href={profile.links.email}>
                  {profile.emailDisplay}
                </a>
              </li>
              <li>
                <span className="label">github</span>
                <a
                  className="profile-modal-link"
                  href={profile.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{profile.githubUsername}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
