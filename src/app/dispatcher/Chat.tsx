'use client';

import { useEffect, useRef, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

type Props = {
  dispatcherUid: string;
  driverUid: string;
};

export default function Chat({ dispatcherUid, driverUid }: Props) {
  const { auth, firestore } = useFirebase();
  const [messages, setMessages] = useState<Array<any>>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const conversationId = `${dispatcherUid}_${driverUid}`;

  useEffect(() => {
    const q = query(
      collection(firestore, 'messages', conversationId, 'items'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 0);
    });
    return () => unsub();
  }, [firestore, conversationId]);

  const send = async () => {
    if (!text.trim()) return;
    const from = auth.currentUser?.uid;
    await addDoc(collection(firestore, 'messages', conversationId, 'items'), {
      text: text.trim(),
      from,
      to: from === dispatcherUid ? driverUid : dispatcherUid,
      createdAt: serverTimestamp(),
    });
    setText('');
  };

  return (
    <div className="flex flex-col h-80 border rounded-lg">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {messages.map((m) => {
          const mine = m.from === auth.currentUser?.uid;
          return (
            <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${mine ? 'bg-blue-600 text-white ml-auto' : 'bg-white border'} `}>
              {m.text}
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-lg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение..."
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button className="btn-primary" onClick={send}>Отправить</button>
      </div>
    </div>
  );
}


