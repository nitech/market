'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebaseClient';
import { firebaseErrorMessage } from '@/app/lib/firebaseErrorMessage';

type LaneId = 'wishes' | 'inProgress' | 'done';

interface DevelopmentCard {
  id: string;
  lane: LaneId;
  title: string;
  content: string;
  caption: string;
  createdById: string;
  createdByName: string;
  assignedToName: string;
  createdAtMs: number;
}

interface DevelopmentBoardProps {
  userId: string;
  userName: string;
}

const Icons = {
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  save: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  home: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  ),
  user: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  lock: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  ),
};

export function DevelopmentBoard({ userId, userName }: DevelopmentBoardProps) {
  const [cards, setCards] = useState<DevelopmentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCaption, setNewCaption] = useState('Nicolai Winther');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCaption, setEditCaption] = useState('');

  useEffect(() => {
    const cardsQuery = query(collection(db, 'developmentCards'), orderBy('createdAtMs', 'desc'));
    const unsubscribe = onSnapshot(
      cardsQuery,
      (snapshot) => {
        const nextCards: DevelopmentCard[] = snapshot.docs.map((entry) => {
          const data = entry.data();
          return {
            id: entry.id,
            lane:
              data.lane === 'done'
                ? 'done'
                : data.lane === 'inProgress'
                ? 'inProgress'
                : 'wishes',
            title: typeof data.title === 'string' ? data.title : '',
            content: typeof data.content === 'string' ? data.content : '',
            caption: typeof data.caption === 'string' ? data.caption : '',
            createdById: typeof data.createdById === 'string' ? data.createdById : '',
            createdByName: typeof data.createdByName === 'string' ? data.createdByName : 'Ukjent bruker',
            assignedToName: typeof data.assignedToName === 'string' ? data.assignedToName : 'Ukjent bruker',
            createdAtMs: typeof data.createdAtMs === 'number' ? data.createdAtMs : 0,
          };
        });
        setCards(nextCards);
        setLoading(false);
        setStatusError(null);
      },
      (error) => {
        console.error('Feil ved lasting av utviklingskort:', error);
        setStatusError(firebaseErrorMessage(error));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const wishes = cards.filter((card) => card.lane === 'wishes');
  const inProgress = cards.filter((card) => card.lane === 'inProgress');
  const done = cards.filter((card) => card.lane === 'done');

  const createCard = async () => {
    const title = newTitle.trim();
    const content = newContent.trim();
    const caption = newCaption.trim();

    if (!title || !content || !caption) {
      return;
    }

    try {
      setIsSaving(true);
      await addDoc(collection(db, 'developmentCards'), {
        lane: 'wishes',
        title,
        content,
        caption,
        createdById: userId,
        createdByName: userName,
        assignedToName: userName,
        createdAtMs: Date.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewTitle('');
      setNewContent('');
      setNewCaption('Nicolai Winther');
      setIsComposerOpen(false);
      setStatusError(null);
    } catch (error) {
      console.error('Feil ved opprettelse av kort:', error);
      setStatusError(firebaseErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (card: DevelopmentCard) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditContent(card.content);
    setEditCaption(card.caption);
  };

  const saveEdit = async (cardId: string) => {
    const title = editTitle.trim();
    const content = editContent.trim();
    const caption = editCaption.trim();

    if (!title || !content || !caption) {
      return;
    }

    const card = cards.find((entry) => entry.id === cardId);
    if (!card || card.createdById !== userId) {
      setStatusError('Du kan kun redigere dine egne kort.');
      return;
    }

    try {
      setIsSaving(true);
      await updateDoc(doc(db, 'developmentCards', cardId), {
        title,
        content,
        caption,
        updatedAt: serverTimestamp(),
      });

      setEditingCardId(null);
      setEditTitle('');
      setEditContent('');
      setEditCaption('');
      setStatusError(null);
    } catch (error) {
      console.error('Feil ved lagring av kort:', error);
      setStatusError(firebaseErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const renderCard = (card: DevelopmentCard) => {
    const isEditable = card.createdById === userId;
    const isEditing = editingCardId === card.id;

    return (
      <CardContainer key={card.id}>
        {isEditing ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              placeholder="Tittel"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: '#f4f5f7',
                border: '1px solid #dfe1e6',
                color: '#172b4d',
              }}
            />
            <textarea
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              placeholder="Innhold"
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm resize-y focus:outline-none"
              style={{
                background: '#f4f5f7',
                border: '1px solid #dfe1e6',
                color: '#172b4d',
              }}
            />
            <input
              value={editCaption}
              onChange={(event) => setEditCaption(event.target.value)}
              placeholder="Teksting"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: '#f4f5f7',
                border: '1px solid #dfe1e6',
                color: '#172b4d',
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveEdit(card.id)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: '#0c66e4',
                  color: '#ffffff',
                }}
              >
                {Icons.save}
                Lagre
              </button>
              <button
                onClick={() => setEditingCardId(null)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{
                  background: '#f4f5f7',
                  color: '#44546f',
                  border: '1px solid #dfe1e6',
                }}
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-semibold" style={{ color: '#172b4d' }}>
                {card.title}
              </h3>
              {isEditable && (
                <button
                  onClick={() => startEdit(card)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: '#f4f5f7',
                    color: '#44546f',
                    border: '1px solid #dfe1e6',
                  }}
                >
                  {Icons.edit}
                  Rediger
                </button>
              )}
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: '#44546f' }}>
              {card.content}
            </p>
            <p className="mt-3 text-xs" style={{ color: '#5e6c84' }}>
              Teksting: {card.caption}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                style={{
                  background: '#ebecf0',
                  color: '#44546f',
                }}
              >
                {Icons.home}
                Internt
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                style={{
                  background: '#e9f2ff',
                  color: '#0c66e4',
                }}
              >
                {Icons.user}
                {card.assignedToName}
              </span>
            </div>
          </>
        )}
      </CardContainer>
    );
  };

  return (
    <section
      className="rounded-2xl p-4 sm:p-5 lg:p-6"
      style={{
        background: 'linear-gradient(145deg, #0079bf 0%, #026aa7 100%)',
      }}
    >
      <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-white">Utviklingstavle</h2>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-white/20 text-white">
          {Icons.lock}
          Ingen flytting mellom lanes
        </span>
      </div>

      {statusError && (
        <p
          className="mb-4 text-sm px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fff',
          }}
        >
          {statusError}
        </p>
      )}

      <div
        className="grid grid-cols-1 xl:grid-cols-3 gap-4"
        style={{ alignItems: 'start' }}
      >
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(9, 30, 66, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Ønsker (Backlog)
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
              {wishes.length}
            </span>
          </div>

          <div className="space-y-3">
            {isComposerOpen ? (
              <div
                className="rounded-xl p-3"
                style={{
                  background: '#ffffff',
                  border: '1px solid #dfe1e6',
                  boxShadow: '0 1px 1px rgba(9, 30, 66, 0.2)',
                }}
              >
                <div className="grid gap-2">
                  <input
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="Tittel"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{
                      background: '#f4f5f7',
                      border: '1px solid #dfe1e6',
                      color: '#172b4d',
                    }}
                  />
                  <textarea
                    value={newContent}
                    onChange={(event) => setNewContent(event.target.value)}
                    placeholder="Innhold"
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-y focus:outline-none"
                    style={{
                      background: '#f4f5f7',
                      border: '1px solid #dfe1e6',
                      color: '#172b4d',
                    }}
                  />
                  <input
                    value={newCaption}
                    onChange={(event) => setNewCaption(event.target.value)}
                    placeholder="Teksting"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{
                      background: '#f4f5f7',
                      border: '1px solid #dfe1e6',
                      color: '#172b4d',
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={createCard}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-transform duration-150 active:scale-[0.98]"
                      style={{
                        background: '#0c66e4',
                        color: '#ffffff',
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {Icons.plus}
                      {isSaving ? 'Lagrer...' : 'Legg til kort'}
                    </button>
                    <button
                      onClick={() => setIsComposerOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: '#f4f5f7',
                        color: '#44546f',
                        border: '1px solid #dfe1e6',
                      }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsComposerOpen(true)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  border: '1px dashed rgba(255, 255, 255, 0.45)',
                }}
              >
                + Legg til et kort
              </button>
            )}

            {loading ? (
              <p className="text-sm text-white/80 px-1">Laster kort...</p>
            ) : wishes.length > 0 ? (
              wishes.map(renderCard)
            ) : (
              <p className="text-sm text-white/80 px-1">Ingen kort i Ønsker enda.</p>
            )}
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(9, 30, 66, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Under arbeid
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
              {inProgress.length}
            </span>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-white/80 px-1">Laster kort...</p>
            ) : inProgress.length > 0 ? (
              inProgress.map(renderCard)
            ) : (
              <p className="text-sm text-white/80 px-1">Ingen kort under arbeid enda.</p>
            )}
          </div>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(9, 30, 66, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Ferdig
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
              {done.length}
            </span>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-white/80 px-1">Laster kort...</p>
            ) : done.length > 0 ? (
              done.map(renderCard)
            ) : (
              <p className="text-sm text-white/80 px-1">Ingen ferdige kort enda.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Card styles closer to Trello list cards */
function CardContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: '#ffffff',
        border: '1px solid #dfe1e6',
        boxShadow: '0 1px 1px rgba(9, 30, 66, 0.2)',
      }}
    >
      {children}
    </div>
  );
}
