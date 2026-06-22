import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api';
import { io } from 'socket.io-client';
import '../styles/chat.css';

const API_URL = 'https://reading-platform-api.onrender.com';

export default function ChatRoom({ club, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    chatAPI.getMessages(club.club_id).then(res => setMessages(res.data)).catch(() => {});

    const sock = io(API_URL, { auth: { token } });
    sock.emit('chat:join', { club_id: club.club_id });
    sock.on('chat:message', (msg) => setMessages(prev => [...prev, msg]));
    sock.on('chat:error', (err) => alert(err.message));
    setSocket(sock);

    return () => {
      sock.emit('chat:leave', { club_id: club.club_id });
      sock.disconnect();
    };
  }, [club.club_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = () => {
    if (!text.trim() || !socket) return;
    socket.emit('chat:message', { club_id: club.club_id, text: text.trim() });
    setText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mr.onstop = async () => {
        if (chunks.length === 0) {
          alert('Не удалось записать аудио.');
          stream.getTracks().forEach(t => t.stop());
          setRecording(false);
          return;
        }

        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'voice.webm');
        formData.append('club_id', club.club_id);

        try {
          const res = await fetch(`${API_URL}/api/chat/voice`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });

          if (res.ok) {
            chatAPI.getMessages(club.club_id).then(r => setMessages(r.data));
          }
        } catch (err) {
          console.error('Ошибка:', err);
        }

        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      alert('Нет доступа к микрофону.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h2>{club.club_name}</h2>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="messages-area">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.user_id === user.user_id ? 'mine' : ''}`}>
              <div className="message-author">{msg.author_name}</div>
              {msg.type === 'voice' ? (
                <div>
                  <audio controls preload="metadata" style={{ maxWidth: 220, height: 36 }}
                    src={`${API_URL}/uploads/${msg.audio_url}`} />
                  {msg.text !== '[Голосовое сообщение]' && (
                    <div style={{ fontSize: 13, color: '#b0b0b0', marginTop: 4, fontStyle: 'italic',
                      background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 8 }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="message-text">{msg.text}</div>
              )}
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendText()}
            placeholder="Написать сообщение..."
          />
          <button className="chat-send-btn" onClick={sendText}>📤</button>
          <button
            className={`chat-voice-btn ${recording ? 'recording' : ''}`}
            onClick={recording ? stopRecording : startRecording}
          >
            {recording ? '⏹️ Стоп' : '🎤 Запись'}
          </button>
        </div>
      </div>
    </div>
  );
}