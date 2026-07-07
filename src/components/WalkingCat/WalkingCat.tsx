import "./WalkingCat.css";

/**
 * WalkingCat — a little line-art cat that walks across, forever. Ambient
 * decoration. The 7x9 sprite sheet cycles the walk frames while the sprite
 * translates across its container.
 */
export default function WalkingCat() {
  return (
    <div className="walk-cat" aria-hidden>
      <div className="walk-cat-sprite" />
    </div>
  );
}
