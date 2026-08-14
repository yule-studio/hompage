import { Fragment, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { type Activity } from "../../data/activities";

/**
 * Two levels of emphasis in body copy, and no markdown parser to get them:
 *   **text**  structural bold — step labels and the like
 *   ==text==  the accented phrase, used sparingly so it still means something
 */
function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|==[^=]+==)/g).map((part, i) => {
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <strong className="am-em" key={i}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="am-strong" key={i}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * ActivityModal — one activity record entry opened as an article: a lead, a
 * photograph, body sections, an embedded clip and source links.
 *
 * Portalled to <body> so `position: fixed` isn't trapped by the reveal
 * animations' transforms, which create a containing block further up the tree.
 */
export default function ActivityModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const d = activity.detail;

  return createPortal(
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <article
        className="am"
        role="dialog"
        aria-modal="true"
        aria-label={activity.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="am-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        <header className="am-head">
          <span className="am-period mono">{activity.period}</span>
          <h3 className="am-title">{activity.title}</h3>
          {d?.org && <span className="am-org">{d.org}</span>}
        </header>

        {d?.facts?.length ? (
          <dl className="am-facts">
            {d.facts.map((f) => (
              <div className="am-fact" key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {d?.hero && (
          <figure className="am-figure">
            <img src={d.hero.src} alt={d.hero.alt} loading="lazy" />
            {d.hero.caption && <figcaption>{d.hero.caption}</figcaption>}
          </figure>
        )}

        {d?.summary && <p className="am-lead">{rich(d.summary)}</p>}

        {d?.sections?.map((section) => (
          <section className="am-section" key={section.heading}>
            <h4 className="am-heading">{section.heading}</h4>
            {section.figure && (
              <figure className="am-figure am-figure--doc">
                <img src={section.figure.src} alt={section.figure.alt} loading="lazy" />
                {section.figure.caption && <figcaption>{section.figure.caption}</figcaption>}
              </figure>
            )}
            {section.body.map((para) => (
              <p className="am-para" key={para.slice(0, 24)}>
                {rich(para)}
              </p>
            ))}
            {section.list?.length ? (
              <ul className="am-list">
                {section.list.map((item) => (
                  <li key={item}>{rich(item)}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {d?.video && (
          <section className="am-section">
            {d.video.heading && <h4 className="am-heading">{d.video.heading}</h4>}
            <figure className="am-figure am-figure--video">
              <div className="am-video">
                <iframe
                src={`https://www.youtube-nocookie.com/embed/${d.video.id}`}
                title={d.video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {d.video.caption && <figcaption>{d.video.caption}</figcaption>}
            </figure>
          </section>
        )}

        {d?.links?.length ? (
          <footer className="am-sources">
            {d.linksHeading && <h4 className="am-heading">{d.linksHeading}</h4>}
            {d.links.map((link) => (
              <a key={link.url} className="am-source" href={link.url} target="_blank" rel="noreferrer">
                <span className="am-source-label">{link.label} ↗</span>
                {link.note && <span className="am-source-note">{link.note}</span>}
              </a>
            ))}
          </footer>
        ) : null}
      </article>
    </div>,
    document.body,
  );
}
