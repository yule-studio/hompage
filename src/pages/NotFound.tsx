import { Link } from "react-router-dom";
import Navigation from "../components/Navigation/Navigation";

export default function NotFound() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">/ 404</div>
          <h1 className="page-title">존재하지 않는 경로입니다.</h1>
          <p className="page-subtitle">URL 을 확인하시거나, 홈으로 돌아가 주세요.</p>
        </div>
      </header>

      <Navigation />
      <p className="mono">
        <Link to="/" className="card-link">return home</Link>
      </p>
    </>
  );
}
