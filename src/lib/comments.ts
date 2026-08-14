/**
 * Comment wall client.
 *
 * Comments are GitHub issues on yule-studio/hompage-comments, filed through the
 * Spring Boot service in that repo — the token that writes them never reaches
 * the browser. See that repo's README for running it.
 */

export type Comment = {
  id: number;
  name: string;
  comment: string;
  imageUrl: string | null;
  likes: number;
  pinned: boolean;
  createdAt: string | null;
  issueUrl: string;
};

const API = import.meta.env.VITE_COMMENTS_API ?? "http://localhost:8080";

/** Thrown with a message the panel can show as-is. */
export class CommentError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/comments${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new CommentError("코멘트 서버에 연결할 수 없습니다.");
  }

  if (res.status === 429) throw new CommentError("잠시 후 다시 시도해 주세요.");
  if (res.status === 503) throw new CommentError("코멘트 기능이 아직 설정되지 않았습니다.");
  if (!res.ok) throw new CommentError("코멘트를 처리하지 못했습니다.");

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export function listComments(): Promise<Comment[]> {
  return call<Comment[]>("");
}

export function createComment(input: {
  name: string;
  comment: string;
  image: string | null;
}): Promise<Comment> {
  return call<Comment>("", { method: "POST", body: JSON.stringify(input) });
}

export function likeComment(id: number): Promise<Comment> {
  return call<Comment>(`/${id}/like`, { method: "POST" });
}

/**
 * Shrinks an attachment before it leaves the browser. The service commits the
 * image into the repo, so a full-size photo would be a multi-megabyte commit;
 * 720px wide at JPEG 0.7 keeps a comment thumbnail well under 150KB.
 */
export function toStoredImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        const max = 720;
        const scale = Math.min(1, max / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
