import { profile } from "../../data/profile";

/**
 * ProfileCard — corner-bracketed GitHub avatar card.
 * Lives in the Home grid as a tall left-anchor card (span="hero").
 * The frame mirrors the look from the reference design:
 *   four corner ticks → avatar → "[_ PROFILE / ONLINE _]"
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
        <img className="profile-avatar" src={profile.avatarUrl} alt="" decoding="async" />
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
