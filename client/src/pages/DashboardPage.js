import React, { useState, useEffect, useCallback } from 'react';
import { clubsAPI } from '../api';
import ChatRoom from '../components/ChatRoom';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [chatOpen, setChatOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Поля для создания клуба
  const [showCreate, setShowCreate] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');

  const fetchClubs = useCallback(async () => {
    try {
      setError('');
      const [allRes, myRes] = await Promise.all([
        clubsAPI.getAll(),
        clubsAPI.getMy()
      ]);

      const all = Array.isArray(allRes.data) ? allRes.data : [];
      const my = Array.isArray(myRes.data) ? myRes.data : [];

      setClubs(all);
      setMyClubs(my.map(c => c.club_id));
    } catch (err) {
      console.error('Ошибка загрузки клубов:', err);
      setError('Не удалось загрузить клубы');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const handleJoin = async (e, clubId) => {
    e.stopPropagation();
    try {
      await clubsAPI.join(clubId);
      await fetchClubs();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleLeave = async (e, clubId) => {
    e.stopPropagation();
    try {
      await clubsAPI.leave(clubId);
      await fetchClubs();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newClubName.trim()) return alert('Введите название клуба');
    
    try {
      await clubsAPI.create({
        club_name: newClubName.trim(),
        description: newClubDesc.trim()
      });
      setNewClubName('');
      setNewClubDesc('');
      setShowCreate(false);
      await fetchClubs();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка создания клуба');
    }
  };

  if (loading) {
    return <p className="empty-text">Загрузка...</p>;
  }

  if (error) {
    return <p className="empty-text" style={{ color: 'var(--error)' }}>{error}</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Книжные клубы</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            background: showCreate ? 'var(--surface2)' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          {showCreate ? '✕ Отмена' : '+ Создать клуб'}
        </button>
      </div>

      {/* Форма создания клуба */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{
          background: 'var(--surface)',
          borderRadius: 14,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Название клуба
            </label>
            <input
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              placeholder="Например: Клуб фантастики"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text)',
                fontSize: 15,
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: 2, minWidth: 250 }}>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Описание
            </label>
            <input
              value={newClubDesc}
              onChange={(e) => setNewClubDesc(e.target.value)}
              placeholder="О чём этот клуб?"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text)',
                fontSize: 15,
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Создать
          </button>
        </form>
      )}

      {clubs.length === 0 && !showCreate && (
        <p className="empty-text">Нет клубов. Создайте первый!</p>
      )}

      <div className="clubs-list">
        {clubs.map(club => {
          const isMember = myClubs.includes(club.club_id);

          return (
            <div
              key={club.club_id}
              className="club-row"
              onClick={() => isMember && setChatOpen(club)}
              style={{ cursor: isMember ? 'pointer' : 'default' }}
            >
              <div className="club-icon">📚</div>
              <div className="club-info">
                <div className="club-name">{club.club_name}</div>
                <div className="club-desc">{club.description}</div>
              </div>
              <div className="club-meta">👥 {club.member_count}</div>

              {isMember ? (
                <button
                  onClick={(e) => handleLeave(e, club.club_id)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    marginLeft: 8
                  }}
                >
                  Выйти
                </button>
              ) : (
                <button
                  onClick={(e) => handleJoin(e, club.club_id)}
                  style={{
                    background: 'var(--accent)',
                    border: 'none',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                    marginLeft: 8
                  }}
                >
                  Вступить
                </button>
              )}
            </div>
          );
        })}
      </div>

      {chatOpen && <ChatRoom club={chatOpen} onClose={() => setChatOpen(null)} />}
    </div>
  );
}