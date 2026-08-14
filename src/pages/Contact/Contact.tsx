import { useState } from "react";
import { profile } from "../../data/profile";
import CommentsPanel from "./CommentsPanel";
import "./Contact.css";

/**
 * Contact — portofoliov1's two-panel Contact layout in our theme: the message
 * form and social links on the left, the comment wall on the right.
 *
 * The form stays static-site friendly: Send composes a mailto: so it opens the
 * visitor's own mail client, already addressed. The comment wall keeps its
 * entries in the browser (see `lib/comments.ts`), since there is no backend.
 */

const TO = profile.emailDisplay;

const SOCIALS = [
  { key: "linkedin", name: "LinkedIn", handle: "@ohyuchan", url: profile.links.linkedin, icon: <LiIcon />, wide: true },
  { key: "github", name: "GitHub", handle: `@${profile.githubUsername}`, url: profile.links.github, icon: <GhIcon /> },
  { key: "instagram", name: "Instagram", handle: "@oyuchan50", url: profile.links.instagram, icon: <IgIcon /> },
  { key: "blog", name: "Blog", handle: "codingtips", url: profile.links.blog, icon: <RssIcon /> },
  { key: "email", name: "Email", handle: profile.emailDisplay, url: profile.links.email, icon: <MailIcon /> },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Contact] ${name || "익명"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` <${email}>` : ""}`);
    window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="contact">
      <header className="contact-head">
        <span className="contact-eyebrow mono">// CONTACT</span>
        <h2 className="contact-title">Contact Me</h2>
        <p className="contact-sub">Have something in mind? Send a message and let's connect.</p>
      </header>

      <div className="contact-panels">
        {/* ── left: message form + socials ── */}
        <section className="contact-panel">
          <h3 className="contact-panel-title">메시지 보내기</h3>
          <p className="contact-panel-sub">
            협업이나 아이디어 논의, 가벼운 인사 모두 환영합니다.
          </p>

          <form className="contact-form" onSubmit={onSubmit}>
            <label className="contact-field">
              <UserIcon />
              <input
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="contact-field">
              <MailIcon />
              <input
                required
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="contact-field contact-field--area">
              <MsgIcon />
              <textarea
                required
                rows={5}
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <button type="submit" className="contact-send">
              <SendIcon /> Send Message
            </button>
          </form>

          <div className="contact-divider" />

          <span className="contact-connect-label mono">CONNECT WITH ME</span>
          <div className="contact-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                className={`contact-social${s.wide ? " contact-social--wide" : ""}`}
                href={s.url}
                target={s.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
              >
                <span className="contact-social-icon" aria-hidden>
                  {s.icon}
                </span>
                <span className="contact-social-text">
                  <span className="contact-social-name">{s.name}</span>
                  <span className="contact-social-handle mono">{s.handle}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── right: comment wall ── */}
        <CommentsPanel />
      </div>
    </div>
  );
}

/* ── icons ──────────────────────────────────────────────────── */
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function MsgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}
function GhIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.24-.01-.86-.01-1.69-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.92-.62.07-.61.07-.61 1.01.07 1.55 1.04 1.55 1.04.9 1.54 2.36 1.1 2.94.84.09-.66.35-1.1.64-1.36-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
function IgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5.001A2.5 2.5 0 0 1 4.98 3.5ZM3 9.75h4v11.25H3V9.75Zm6.5 0h3.84v1.54h.05c.53-.96 1.84-1.97 3.78-1.97 4.05 0 4.8 2.66 4.8 6.13V21h-4v-5.32c0-1.27-.02-2.91-1.78-2.91-1.78 0-2.06 1.39-2.06 2.82V21h-4V9.75Z" />
    </svg>
  );
}
function RssIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}
