import Card from "../../components/Card/Card";
import TerminalCard from "../../components/TerminalCard/TerminalCard";
import { profile } from "../../data/profile";

export default function Contact() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ contact</div>
          <h1 className="page-title">Contact</h1>
          <p className="page-subtitle">짧은 문의 / 협업 / 발표 — 어디로든 환영.</p>
        </div>
      </header>

      <div className="grid">
        <Card span="md" ariaLabel="reach">
          <div className="card-head">
            <span className="label">/ reach</span>
          </div>
          <div className="card-body">
            <ul className="card-list">
              <li>
                <span>email</span>
                <a className="mono" href="mailto:hi@yule.studio">hi@yule.studio</a>
              </li>
              <li>
                <span>github</span>
                <a className="mono" href="https://github.com/yule-studio" target="_blank" rel="noreferrer">
                  @yule-studio
                </a>
              </li>
              <li>
                <span>schedule</span>
                <span className="mono faint">async friendly · KR-time</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card span="md" ariaLabel="open to">
          <div className="card-head">
            <span className="label">/ open to</span>
          </div>
          <div className="card-body">
            <ul className="card-list">
              <li><span>backend / platform consulting</span><span className="mono faint">paid</span></li>
              <li><span>llm agent 설계 리뷰</span><span className="mono faint">paid</span></li>
              <li><span>오픈소스 co-maintain</span><span className="mono faint">case-by-case</span></li>
              <li><span>talks / 발표</span><span className="mono faint">free</span></li>
            </ul>
          </div>
        </Card>

        <TerminalCard
          span="wide"
          title="~/contact"
          lines={[
            { kind: "comment", text: "shortest path" },
            { kind: "cmd",     text: "echo \"hi yule, 협업 제안입니다\" | mail -s \"hello\" hi@yule.studio" },
            { kind: "out",     text: "queued ✓" },
            { kind: "comment", text: `region=${profile.region}` },
          ]}
        />
      </div>
    </>
  );
}
