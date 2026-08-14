import { useEffect, useState } from "react";
import {
  CommentError,
  createComment,
  likeComment,
  listComments,
  toStoredImage,
  type Comment,
} from "../../lib/comments";

/**
 * CommentsPanel — portofoliov1's comment wall: name + comment + optional image,
 * then a scrolling list with an avatar initial, a pin badge and a like button.
 *
 * Each comment is a GitHub issue on yule-studio/hompage-comments, filed through
 * that repo's Spring Boot service. Moderation is just the GitHub UI: close an
 * issue to hide it.
 */
export default function CommentsPanel() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setComments(await listComments());
      setError(null);
    } catch (e) {
      setError(e instanceof CommentError ? e.message : "코멘트를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(await toStoredImage(file));
  };

  const onPost = async () => {
    if (!name.trim() || !comment.trim() || busy) return;
    setBusy(true);
    try {
      const created = await createComment({ name, comment, image: preview });
      setComments((prev) => [created, ...prev]);
      setName("");
      setComment("");
      setPreview(null);
      setError(null);
    } catch (e) {
      setError(e instanceof CommentError ? e.message : "코멘트를 남기지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onLike = async (id: number) => {
    // optimistic — the like is a body rewrite on GitHub and takes a moment
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c)));
    try {
      const updated = await likeComment(id);
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, likes: c.likes - 1 } : c)));
    }
  };

  return (
    <section className="cm">
      <header className="cm-head">
        <h3 className="cm-title">Comments</h3>
        <p className="cm-sub">Leave your thoughts here</p>
        <p className="cm-note mono">ⓘ 남겨주신 코멘트는 GitHub Issue로 기록됩니다.</p>
      </header>

      <div className="cm-form">
        <input
          className="cm-input"
          placeholder="Your Name"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="cm-input cm-input--area"
          rows={4}
          maxLength={2000}
          placeholder="Your Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <label className="cm-upload">
          <UploadIcon />
          <span>{preview ? "Change Image" : "Upload Image"}</span>
          <input hidden type="file" accept="image/*" onChange={onPickImage} />
        </label>

        {preview && <img className="cm-preview" src={preview} alt="첨부 미리보기" />}

        <button
          type="button"
          className="cm-post"
          onClick={onPost}
          disabled={busy || !name.trim() || !comment.trim()}
        >
          {busy ? "Posting..." : "Post Comment"}
        </button>

        {error && <p className="cm-error mono">{error}</p>}
      </div>

      <div className="cm-list">
        {loading ? (
          <p className="cm-empty mono">불러오는 중…</p>
        ) : comments.length === 0 ? (
          <p className="cm-empty mono">아직 남겨진 코멘트가 없습니다.</p>
        ) : (
          comments.map((c) => (
            <article className={`cm-item${c.pinned ? " cm-item--pinned" : ""}`} key={c.id}>
              <span className="cm-avatar" aria-hidden>
                {c.name.charAt(0)}
              </span>

              <div className="cm-body">
                <div className="cm-meta">
                  <span className="cm-name">{c.name}</span>
                  {c.pinned && <span className="cm-pin mono">PINNED</span>}
                </div>
                <p className="cm-text">{c.comment}</p>
                {c.imageUrl && <img className="cm-image" src={c.imageUrl} alt="첨부 이미지" />}
              </div>

              <button
                type="button"
                className="cm-like"
                onClick={() => onLike(c.id)}
                aria-label={`${c.name} 코멘트에 좋아요`}
              >
                <HeartIcon /> {c.likes || 0}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

/* ── icons ──────────────────────────────────────────────────── */
function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M12 3v13M7 8l5-5 5 5" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.5 12 20 12 20z" />
    </svg>
  );
}
