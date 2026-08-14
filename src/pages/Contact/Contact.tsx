import { useState } from "react";
import "./Contact.css";

/**
 * Contact — a single message form. Static-site friendly: Send composes a
 * mailto: to oyuchan50@gmail.com so it opens the visitor's mail client
 * addressed to me.
 */

const TO = "oyuchan50@gmail.com";

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
        <h2 className="contact-title">Get in touch</h2>
        <p className="contact-sub">협업 · 아이디어 · 그냥 인사 — 편하게 메시지 남겨주세요.</p>
      </header>

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
