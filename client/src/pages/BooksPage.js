import React, { useState, useEffect } from 'react';
import { booksAPI } from '../api';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    booksAPI.getMy().then(res => setBooks(res.data)).catch(() => {});
  }, []);

  const addBook = async () => {
    if (!title.trim()) return alert('Введите название книги');
    try {
      await booksAPI.add({ title: title.trim(), author: author.trim() || null });
      setTitle('');
      setAuthor('');
      const res = await booksAPI.getMy();
      setBooks(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const removeBook = async (id) => {
    await booksAPI.remove(id);
    setBooks(books.filter(b => b.book_id !== id));
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Мои книги</h2>

      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 20,
        marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Название</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Название книги" style={{ padding: '10px 14px', background: 'var(--bg)',
              border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15 }} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Автор</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)}
            placeholder="Автор" style={{ padding: '10px 14px', background: 'var(--bg)',
              border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15 }} />
        </div>
        <button onClick={addBook} style={{ background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 10, padding: '12px 20px', fontWeight: 600 }}>
          Добавить
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {books.map(book => (
          <div key={book.book_id} style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, position: 'relative' }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>📖</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{book.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{book.author || 'Без автора'}</div>
            <button onClick={() => removeBook(book.book_id)}
              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
                color: 'var(--muted)', fontSize: 16 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}