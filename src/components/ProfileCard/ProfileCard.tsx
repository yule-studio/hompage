import { profile } from "../../data/profile";

/**
 * ProfileCard — corner-bracketed GitHub avatar card.
 * Uniform 4×3 tile (same size as every other dashboard card).
 * Layout: small corner-bracketed avatar on the left, NAME / ROLE / SINCE
 * on the right, all sized to fit a 3-row card.
 */
export default function ProfileCard() {
  return (
    <article className="card profile-card" data-span="sm" aria-label="profile">
      <header className="card-head">
        <span className="card-eyebrow">/ PROFILE</span>
        <span className="status-badge"><span className="status-dot" />online</span>
      </header>

      <div className="profile-body">
        <div className="profile-frame" aria-hidden>
          <span className="bracket tl" />
          <span className="bracket tr" />
          <span className="bracket bl" />
          <span className="bracket br" />
          <img className="profile-avatar" src={profile.avatarUrl} alt="" decoding="async" />
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
      </div>
    </article>
  );
}
