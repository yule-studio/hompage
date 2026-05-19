import { profile } from "../../data/profile";

/**
 * ProfileCard — corner-bracketed photo / silhouette card.
 * Lives in the Home grid as a tall left-anchor card (span="hero").
 * The frame mirrors the look from the reference design:
 *   four corner ticks → blurred silhouette → "[_ PROFILE / ONLINE _]"
 *   label → NAME / ROLE / SINCE rows.
 */
export default function ProfileCard() {
  return (
    <article className="card profile-card" data-span="hero" aria-label="profile">
      <div className="profile-frame" aria-hidden>
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
        <div className="profile-silhouette">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="22" r="12" fill="currentColor" />
            <path d="M8 60c0-13 11-22 24-22s24 9 24 22" fill="currentColor" />
          </svg>
        </div>
        <span className="profile-frame-label mono">[_ PROFILE / ONLINE _]</span>
      </div>

      <dl className="profile-stats mono">
        <div className="profile-stat">
          <dt>NAME</dt>
          <dd>{profile.name.split(" ").reverse()[0]}</dd>
        </div>
        <div className="profile-stat">
          <dt>ROLE</dt>
          <dd>BE / DevOps</dd>
        </div>
        <div className="profile-stat">
          <dt>SINCE</dt>
          <dd>2018</dd>
        </div>
      </dl>
    </article>
  );
}
