export type Topic = {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastReplyAt: number;
  tag: string;
};

export type Poll = {
  id: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
  endsAt?: number;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
};

export type Reply = {
  id: string;
  topicId: string;
  author: string;
  text: string;
  createdAt: number;
};

const TOPICS_KEY = 'civic_engage_topics_v1';
const POLL_KEY = 'civic_engage_poll_v1';
const EVENTS_KEY = 'civic_engage_events_v1';
const REPLIES_KEY = 'civic_engage_replies_v1';

const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('civic-engage') : null;

const read = (key: string) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch(e){ return null; }
};

const write = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    // Broadcast to other tabs if available. Guard against closed channels.
    try {
      if (bc) bc.postMessage({ key, val });
    } catch (msgErr) {
      // If the channel is closed or postMessage fails, fall back to storage event/custom event only.
      console.warn('BroadcastChannel postMessage failed:', msgErr);
    }
    window.dispatchEvent(new CustomEvent('engage:changed', { detail: { key, val } }));
  } catch (e) {
    console.error(e);
  }
};

const seedTopics = (): Topic[] => ([
  { id: 't1', title: 'Frequent power outages in Sector 12', author: 'A. Sharma', replies: 42, lastReplyAt: Date.now()-1000*60*60*2, tag: 'Utilities' },
  { id: 't2', title: 'Suggestion for new waste collection schedule', author: 'R. Patel', replies: 18, lastReplyAt: Date.now()-1000*60*60*5, tag: 'Sanitation' },
  { id: 't3', title: 'Need for speed breakers near the public school', author: 'M. Khan', replies: 31, lastReplyAt: Date.now()-1000*60*60*24, tag: 'Infrastructure' },
]);

const seedPoll = (): Poll => ({ id: 'p1', question: 'Which design for the new community park?', options:[ {id:'o1',label:'Modern Zen Garden', votes: 120}, {id:'o2',label:'Kids Play Area', votes: 220}, {id:'o3',label:'Community Sports', votes: 98} ] });

const seedEvents = (): EventItem[] => ([
  { id: 'e1', title: 'Quarterly Budget Meeting: Ward 7', date: 'Oct 28, 2024', location: 'Community Hall' },
  { id: 'e2', title: 'Town Hall on Water Supply Issues', date: 'Nov 05, 2024', location: 'Online via Zoom' },
]);

export const getTopics = async () => {
  const t = read(TOPICS_KEY) || seedTopics();
  if (!read(TOPICS_KEY)) write(TOPICS_KEY, t);
  return t as Topic[];
};

export const addTopic = async (topic: Omit<Topic,'id'|'lastReplyAt'|'replies'> & { id?: string }) => {
  const all = (read(TOPICS_KEY) || seedTopics()) as Topic[];
  const id = topic.id || `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
  const item: Topic = { id, title: topic.title, author: topic.author, replies: 0, lastReplyAt: Date.now(), tag: topic.tag || 'General' };
  all.unshift(item);
  write(TOPICS_KEY, all);
  return item;
};

export const removeTopic = async (topicId: string) => {
  const all = (read(TOPICS_KEY) || seedTopics()) as Topic[];
  const filtered = all.filter(t => t.id !== topicId);
  write(TOPICS_KEY, filtered);
  return filtered as Topic[];
};

// Scan topics and call a provided evaluator function(topic) => Promise<boolean>
// If evaluator returns false, topic is considered non-relevant and will be removed.
export const scanAndModerateTopics = async (evaluator: (t: Topic) => Promise<boolean>) => {
  const all = (read(TOPICS_KEY) || seedTopics()) as Topic[];
  let changed = false;
  const keep: Topic[] = [];
  for (const t of all) {
    try {
      const ok = await evaluator(t);
      if (ok) keep.push(t); else changed = true;
    } catch (e) {
      // On evaluator error, keep the topic to avoid false positives
      keep.push(t);
    }
  }
  if (changed) write(TOPICS_KEY, keep);
  return keep as Topic[];
};

export const subscribeTopics = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener('storage', handler);
  window.addEventListener('engage:changed', handler as EventListener);

  // If BroadcastChannel is available, register a message listener.
  const bcListener = (m: MessageEvent) => { if (m.data && m.data.key === TOPICS_KEY) cb(); };
  if (bc) {
    // Prefer addEventListener to avoid clobbering other listeners.
    try {
      // Some environments implement addEventListener on BroadcastChannel.
      (bc as any).addEventListener?.('message', bcListener);
    } catch (e) {
      // Fallback to onmessage assignment if addEventListener isn't supported.
      (bc as any).onmessage = bcListener;
    }
  }

  // Unsubscribe should remove listeners but must NOT close the shared channel, because
  // other parts of the app may still be using it. Closing the channel here caused
  // InvalidStateError in other subscribers when they attempted to postMessage.
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('engage:changed', handler as EventListener);
    if (bc) {
      try {
        (bc as any).removeEventListener?.('message', bcListener);
      } catch (e) {
        // If removeEventListener isn't available, and onmessage was set to our listener,
        // clear it only if it references our handler to avoid clobbering others.
        try {
          if ((bc as any).onmessage === bcListener) (bc as any).onmessage = null;
        } catch (e2) {
          // ignore
        }
      }
    }
  };
};

export const getPoll = async () => {
  const p = read(POLL_KEY) || seedPoll();
  if (!read(POLL_KEY)) write(POLL_KEY, p);
  return p as Poll;
};

export const vote = async (pollId: string, optionId: string) => {
  const p = read(POLL_KEY) || seedPoll();
  const opt = p.options.find((o:any)=>o.id===optionId);
  if (opt) { opt.votes = (opt.votes || 0) + 1; write(POLL_KEY, p); }
  return p as Poll;
};

export const getEvents = async () => {
  const e = read(EVENTS_KEY) || seedEvents();
  if (!read(EVENTS_KEY)) write(EVENTS_KEY, e);
  return e as EventItem[];
};

export const getReplies = async (topicId: string) => {
  const all = (read(REPLIES_KEY) || []) as Reply[];
  if (!read(REPLIES_KEY)) write(REPLIES_KEY, all);
  return all.filter(r => r.topicId === topicId) as Reply[];
};

export const addReply = async (topicId: string, reply: Omit<Reply,'id'|'createdAt'> & { id?: string }) => {
  const all = (read(REPLIES_KEY) || []) as Reply[];
  const id = reply.id || `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
  const item: Reply = { id, topicId, author: reply.author, text: reply.text, createdAt: Date.now() };
  all.push(item);
  write(REPLIES_KEY, all);

  // update topic reply count and lastReplyAt
  try {
    const topics = (read(TOPICS_KEY) || seedTopics()) as Topic[];
    const idx = topics.findIndex(t => t.id === topicId);
    if (idx >= 0) {
      topics[idx] = { ...topics[idx], replies: (topics[idx].replies || 0) + 1, lastReplyAt: Date.now() };
      write(TOPICS_KEY, topics);
    }
  } catch (e) {
    console.error('Failed to update topic reply count', e);
  }

  return item;
};

export const subscribeReplies = (topicId: string, cb: () => void) => {
  const handler = () => cb();
  window.addEventListener('storage', handler);
  window.addEventListener('engage:changed', handler as EventListener);

  const bcListener = (m: MessageEvent) => { if (m.data && m.data.key === REPLIES_KEY) cb(); };
  if (bc) {
    try { (bc as any).addEventListener?.('message', bcListener); } catch (e) { (bc as any).onmessage = bcListener; }
  }

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('engage:changed', handler as EventListener);
    if (bc) {
      try { (bc as any).removeEventListener?.('message', bcListener); } catch (e) {
        try { if ((bc as any).onmessage === bcListener) (bc as any).onmessage = null; } catch (e2) {}
      }
    }
  };
};

export default { getTopics, addTopic, removeTopic, scanAndModerateTopics, subscribeTopics, getPoll, vote, getEvents, getReplies, addReply, subscribeReplies };
