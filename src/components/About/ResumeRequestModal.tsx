import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { downloadResume, ResumeError } from "../../lib/resume";

/**
 * The form standing in front of the résumé.
 *
 * Asking for a name before handing over a document is only worth anything
 * because the copy that goes out is stamped with a serial tied to this
 * submission — see resume-api in yule-studio/hompage-comments. Nothing typed
 * here is verified, and the modal says so rather than pretending otherwise.
 *
 * Portalled to <body> so `position: fixed` isn't trapped by the reveal
 * animations' transforms, the same as ActivityModal.
 */
export default function ResumeRequestModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serial, setSerial] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, busy]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const issued = await downloadResume({
        name: name.trim(),
        email: email.trim(),
        org: org.trim() || undefined,
        purpose: purpose.trim() || undefined,
      });
      setSerial(issued);
    } catch (err) {
      setError(err instanceof ResumeError ? err.message : "이력서를 발급하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="am-backdrop" onClick={busy ? undefined : onClose} role="presentation">
      <article
        className="am am--form"
        role="dialog"
        aria-modal="true"
        aria-label="이력서 다운로드"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="am-close" onClick={onClose} aria-label="닫기" disabled={busy}>
          ✕
        </button>

        <header className="am-head">
          <span className="am-period mono">RESUME</span>
          <h3 className="am-title">이력서 다운로드</h3>
        </header>

        {serial !== null ? (
          <>
            <p className="am-lead">
              발급했습니다. 다운로드가 시작되지 않았다면 브라우저의 팝업 차단을 확인해 주세요.
            </p>
            <dl className="am-facts">
              <div className="am-fact">
                <dt className="mono">발급번호</dt>
                <dd>#{serial}</dd>
              </div>
            </dl>
            <p className="rr-note">
              받으신 파일에는 발급번호가 찍혀 있고, 전화번호는 가려져 있습니다. 연락은 이메일이나 아래
              Contact 로 주세요.
            </p>
            <div className="rr-actions">
              <button type="button" className="about-btn" onClick={onClose}>
                닫기
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="am-lead">
              이력서는 요청하실 때마다 개별로 발급됩니다.{" "}
              <strong className="am-em">전화번호는 가려지고</strong>, 발급번호가 함께 기록됩니다.
            </p>

            <form className="rr-form" onSubmit={submit}>
              <label className="rr-field">
                <span className="rr-label mono">이름 *</span>
                <input
                  className="rr-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  required
                  disabled={busy}
                  autoComplete="name"
                />
              </label>

              <label className="rr-field">
                <span className="rr-label mono">이메일 *</span>
                <input
                  className="rr-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  required
                  disabled={busy}
                  autoComplete="email"
                />
              </label>

              <label className="rr-field">
                <span className="rr-label mono">소속</span>
                <input
                  className="rr-input"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  maxLength={80}
                  disabled={busy}
                  autoComplete="organization"
                />
              </label>

              <label className="rr-field">
                <span className="rr-label mono">용도</span>
                <input
                  className="rr-input"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  maxLength={200}
                  disabled={busy}
                  placeholder="예: 백엔드 포지션 채용 검토"
                />
              </label>

              {error && <p className="rr-error">{error}</p>}

              <div className="rr-actions">
                <button type="submit" className="about-btn" disabled={busy}>
                  {busy ? "발급 중…" : "이력서 받기"}
                </button>
              </div>
            </form>
          </>
        )}
      </article>
    </div>,
    document.body,
  );
}
