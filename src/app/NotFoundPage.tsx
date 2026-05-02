import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="not-found-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>
        The route you opened does not exist in this Diguifi Studios frontend. Use the links below to
        get back to the portfolio or the storefront.
      </p>
      <div className="hero-actions">
        <Link className="primary-button" to="/">
          Back to portfolio
        </Link>
        <Link className="ghost-button" to="/store">
          Open store
        </Link>
      </div>
    </section>
  );
}
