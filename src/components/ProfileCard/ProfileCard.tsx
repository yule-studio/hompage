import { profile } from "../../data/profile";

/**
 * ProfileCard — image-first GitHub avatar tile.
 */
export default function ProfileCard() {
  return (
    <article className="card profile-card" data-span="sm" aria-label="profile photo">
      <img className="profile-avatar" src={profile.avatarUrl} alt={`${profile.name} avatar`} decoding="async" />
    </article>
  );
}
