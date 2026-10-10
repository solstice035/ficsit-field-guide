import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl">Page not found</h1>
      <p className="text-ink-muted">
        That page does not exist. <Link to="/">Back to the dashboard</Link>.
      </p>
    </div>
  );
}
