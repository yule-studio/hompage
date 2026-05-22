import { useState } from "react";
import { profile } from "../../data/profile";
import ProfileDetailModal from "../ProfileDetailModal/ProfileDetailModal";

/**
 * ProfileCard — image-first GitHub avatar tile. 클릭 시 상세 모달.
 */
export default function ProfileCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="card profile-card" data-span="sm" aria-label="profile photo">
        <button
          type="button"
          className="profile-avatar-button"
          onClick={() => setOpen(true)}
          aria-label="open profile detail"
        >
          <img
            className="profile-avatar"
            src={profile.avatarUrl}
            alt={`${profile.name} avatar`}
            decoding="async"
          />
          <span className="profile-avatar-hint mono">view</span>
        </button>
      </article>
      <ProfileDetailModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
