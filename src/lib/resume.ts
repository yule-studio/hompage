/**
 * Résumé download client.
 *
 * The PDF is not a static file. Each download is built on request by the
 * resume-api service in yule-studio/hompage-comments: the phone number is
 * redacted and a serial is stamped on, so a copy that turns up somewhere it
 * shouldn't points back at one row in that service's log.
 *
 * Nothing here is verified — a visitor can type any name. It is a record, not
 * a gate.
 */

const API = import.meta.env.VITE_RESUME_API ?? "http://localhost:8081";

export type ResumeRequest = {
  name: string;
  email: string;
  org?: string;
  purpose?: string;
};

/** Thrown with a message the form can show as-is. */
export class ResumeError extends Error {}

/**
 * Requests the caller's copy and hands it to the browser as a download.
 * Returns the serial stamped on that copy.
 */
export async function downloadResume(input: ResumeRequest): Promise<number | null> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/resume/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ResumeError("이력서 서버에 연결할 수 없습니다.");
  }

  if (res.status === 400) throw new ResumeError("이름과 이메일을 확인해 주세요.");
  if (res.status === 429) throw new ResumeError("잠시 후 다시 시도해 주세요.");
  if (res.status === 503) throw new ResumeError("이력서 발급이 아직 설정되지 않았습니다.");
  if (!res.ok) throw new ResumeError("이력서를 발급하지 못했습니다.");

  const blob = await res.blob();
  save(blob, filenameOf(res));

  const serial = res.headers.get("X-Resume-Serial");
  return serial ? Number(serial) : null;
}

/**
 * The name comes from Content-Disposition when the header is exposed by CORS;
 * otherwise fall back rather than saving something called "download".
 */
function filenameOf(res: Response): string {
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      /* fall through to the plain form */
    }
  }
  const plain = /filename="([^"]+)"/i.exec(disposition);
  return plain ? plain[1] : "resume.pdf";
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
