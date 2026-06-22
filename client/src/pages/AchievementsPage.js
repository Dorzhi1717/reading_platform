import React, { useState, useEffect } from 'react';
import { statsAPI } from '../api';

export default function AchievementsPage() {
  const [data, setData] = useState({ stats: null, earned: [], all: [] });

  useEffect(() => {
    statsAPI.get().then(res => setData(res.data)).catch(() => {});
  }, []);

  const earnedIds = data.earned.map(a => a.achievement_id);

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Достижения</h2>

      {data.stats && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Книг', value: data.stats.books_count },
            { label: 'Клубов', value: data.stats.clubs_count },
            { label: 'Сообщений', value: data.stats.messages_count },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 14,
              padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {data.all.map(a => (
          <div key={a.achievement_id} style={{
            background: 'var(--surface)', borderRadius: 14, padding: 20, textAlign: 'center',
            opacity: earnedIds.includes(a.achievement_id) ? 1 : 0.4,
            filter: earnedIds.includes(a.achievement_id) ? 'none' : 'grayscale(1)'
          }}>
            <div style={{ fontSize: 32 }}>🏆</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.description}</div>
          </div>
        ))}
        {data.all.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>Достижения появятся после добавления книг и активности в клубах.</p>
        )}
      </div>
    </div>
  );
}