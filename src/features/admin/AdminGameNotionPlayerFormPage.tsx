import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import { NotFoundPage } from '../../app/NotFoundPage';
import type { AdminGameNotionPlayer, GameNotionPlayerFormData } from './types';

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

const EMPTY_FORM: GameNotionPlayerFormData = {
  playerId: '',
  lastPing: toDatetimeLocal(new Date().toISOString())
};

export function AdminGameNotionPlayerFormPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const decodedPlayerId = playerId ? decodeURIComponent(playerId) : undefined;
  const isEdit = !!decodedPlayerId;
  const { authState, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<GameNotionPlayerFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = authState === 'authenticated' && user?.isAdmin === true;
  const isPending = authState === 'refreshing' || authState === 'authenticating';

  useEffect(() => {
    if (!isEdit || !isAdmin) return;
    apiClient
      .get<AdminGameNotionPlayer>(`/api/game-notion-players/${encodeURIComponent(decodedPlayerId!)}`)
      .then(player => {
        setForm({ playerId: player.playerId, lastPing: toDatetimeLocal(player.lastPing) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedPlayerId, isEdit, isAdmin]);

  if (isPending) return null;
  if (!isAdmin) return <NotFoundPage />;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.put(`/api/game-notion-players/${encodeURIComponent(decodedPlayerId!)}`, {
          newPlayerId: form.playerId !== decodedPlayerId ? form.playerId : undefined,
          lastPing: toIso(form.lastPing)
        });
      } else {
        await apiClient.post('/api/game-notion-players', {
          playerId: form.playerId,
          lastPing: toIso(form.lastPing)
        });
      }
      navigate('/admin/game-notion-players');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar player.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{isEdit ? 'Edit player' : 'New player'}</h1>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form className="admin-form" onSubmit={e => void handleSubmit(e)}>
          <div className="form-field">
            <label htmlFor="playerId">Player ID</label>
            <input
              id="playerId"
              name="playerId"
              type="text"
              value={form.playerId}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-field">
            <label htmlFor="lastPing">Last Ping</label>
            <input
              id="lastPing"
              name="lastPing"
              type="datetime-local"
              value={form.lastPing}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => navigate('/admin/game-notion-players')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
