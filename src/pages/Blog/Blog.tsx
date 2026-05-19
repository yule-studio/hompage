import Card from "../../components/Card/Card";
import { posts } from "../../data/posts";

export default function Blog() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ blog</div>
          <h1 className="page-title">Blog</h1>
          <p className="page-subtitle">엔지니어링 / 운영 / 에이전트 — 길게 쓰는 글.</p>
        </div>
        <span className="chip mono">{posts.length} posts</span>
      </header>

      <div className="section-grid">
        {posts.map((p) => (
          <Card key={p.slug} hoverable as="article">
            <div className="card-head">
              <h3 className="card-title">{p.title}</h3>
              <span className="mono faint">{p.readMin}m</span>
            </div>
            <p className="card-sub">{p.summary}</p>
            <div className="card-body" style={{ justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {p.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
            <div className="card-footer">
              <span className="card-link">read</span>
              <span className="mono faint">{p.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
