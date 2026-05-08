import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminGameNotionPlayer } from './types';

export function AdminGameNotionPlayersPage() {
  const { authState, user } = useAuth();
  const [players, setPlayers] = useState<AdminGameNotionPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isAdmin) return;
    apiClient
      .get<AdminGameNotionPlayer[]>('/api/game-notion-players')
      .then(setPlayers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  async function handleDelete(playerId: string) {
    if (!confirm(`Excluir player "${playerId}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(playerId);
    try {
      await apiClient.delete(`/api/game-notion-players/${playerId}`);
      setPlayers(prev => prev.filter(p => p.playerId !== playerId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao excluir player.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Game Notion Players</h1>
        </div>
        <Link to="/admin/game-notion-players/new" className="primary-button">
          New player
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : players.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No players yet.</p>
      ) : (
        <div className="admin-list">
          {players.map(player => (
            <div key={player.playerId} className="admin-row">
              <div className="admin-row-info">
                <span className="admin-row-name">{player.playerId}</span>
                <span className="admin-row-slug">
                  Last ping: {new Date(player.lastPing).toLocaleString()}
                </span>
              </div>
              <div className="admin-row-actions">
                <Link
                  to={`/admin/game-notion-players/${encodeURIComponent(player.playerId)}/edit`}
                  className="ghost-button admin-action-btn"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger-button admin-action-btn"
                  onClick={() => void handleDelete(player.playerId)}
                  disabled={deletingId === player.playerId}
                >
                  {deletingId === player.playerId ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
