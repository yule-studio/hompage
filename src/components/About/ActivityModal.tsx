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

function DownloadIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M12 12v5M9.5 14.5 12 17l2.5-2.5" />
    </svg>
  );
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

        {/* The opening photograph reads caption-first — the line sets up the
            picture here, where a section figure's caption explains one it has
            already shown. <figcaption> is allowed as the first child. */}
        {d?.hero && (
          <figure className="am-figure am-figure--lead">
            {d.hero.caption && <figcaption>{d.hero.caption}</figcaption>}
            <img src={d.hero.src} alt={d.hero.alt} loading="lazy" />
          </figure>
        )}

        {d?.summary && <p className="am-lead">{rich(d.summary)}</p>}

        {/* After the lead, not before it: the standfirst says what this was in
            sentences, and the facts are the reference table you check second. */}
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

        {d?.deck?.slides?.length ? (
          <section className="am-section">
            {d.deck.heading && <h4 className="am-heading">{d.deck.heading}</h4>}
            {d.deck.note && <p className="am-para">{rich(d.deck.note)}</p>}

            {/* Horizontal and scroll-snapped: a deck is read in order, and a
                strip says that where a grid doesn't. Native scrolling means
                trackpad, wheel, touch and keyboard all work for free. */}
            <div
              className="am-deck"
              tabIndex={0}
              role="group"
              aria-label={`${d.deck.heading ?? "발표 자료"} — 슬라이드 ${d.deck.slides.length}장`}
            >
              {d.deck.slides.map((slide, i) => (
                <figure className="am-deck-slide" key={slide.src}>
                  {/* A scanned page is unreadable at strip size, so the frame
                      opens the original rather than pretending to be legible. */}
                  <a
                    className="am-deck-frame"
                    href={slide.src}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${slide.alt} — 원본 크기로 보기`}
                  >
                    <img src={slide.src} alt={slide.alt} loading="lazy" />
                    <span className="am-deck-index mono" aria-hidden>
                      {i + 1} / {d.deck!.slides.length}
                    </span>
                    <span className="am-deck-zoom mono" aria-hidden>
                      크게 보기 ↗
                    </span>
                  </a>
                  {slide.caption && <figcaption>{slide.caption}</figcaption>}
                </figure>
              ))}
            </div>

          </section>
        ) : null}

        {d?.downloads?.items?.length ? (
          <section className="am-section">
            {d.downloads.heading && <h4 className="am-heading">{d.downloads.heading}</h4>}
            {d.downloads.note && <p className="am-para">{rich(d.downloads.note)}</p>}
            <div className="am-files">
              {d.downloads.items.map((file) => (
                /* `download` rather than a new tab: these are .pptx/.docx, and
                   a browser that can't render them would otherwise navigate
                   away from the article to a blank page. */
                <a className="am-file" key={file.url} href={file.url} download>
                  <DownloadIcon />
                  <span className="am-file-text">
                    <span className="am-file-label">{file.label}</span>
                    {file.meta && <span className="am-file-meta mono">{file.meta}</span>}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

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
