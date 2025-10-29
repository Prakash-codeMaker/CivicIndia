import React, { useEffect, useState } from 'react';
import Link from '../routing/Link';
import engageStore, { Topic, Poll, EventItem } from '../lib/engageStore';
import Modal from '../components/Modal';
import { GoogleGenAI } from '@google/genai';

// Sanitize input: collapse extremely long runs of the same character and long unbroken words
const sanitize = (s: string) => {
    // collapse runs of the same character > 200 into 3 chars + ellipsis
    s = s.replace(/(.)\1{200,}/g, (m, ch) => ch + ch + ch + '...');
    // collapse very long unbroken words (>200) by inserting an ellipsis in the middle
    s = s.replace(/\S{200,}/g, w => w.slice(0, 80) + '...' + w.slice(-80));
    return s;
};

const getAiClient = () => {
    const viteKey = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) || undefined;
    const procKey = (typeof process !== 'undefined' && (process as any).env && (process as any).env.API_KEY) || undefined;
    const apiKey = viteKey || procKey;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        console.warn('Gemini API key not configured. Skipping AI moderation for Engage posts.');
        return null;
    }
    try { return new GoogleGenAI({ apiKey }); } catch (e) { console.error('Failed to init AI client', e); return null; }
};

const previewText = (s: string, max = 300) => {
    if (!s) return '';
    if (s.length <= max) return s;
    // try to cut at last space before max
    const cut = s.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > Math.floor(max * 0.6)) return cut.slice(0, lastSpace) + '...';
    return cut + '...';
};

const clampStyle: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
};

const LongContentFallback: React.FC<{ content: string }> = ({ content }) => {
    const [show, setShow] = useState(false);
    if (show) return <pre className="whitespace-pre-wrap text-sm text-light-slate">{content}</pre>;
    return (
        <div className="text-sm text-light-slate">
            <p>Content too large to display by default.</p>
            <button type="button" onClick={() => setShow(true)} className="mt-2 px-3 py-1 bg-glow-blue text-white rounded">Show full</button>
        </div>
    );
};

const ForumTopicCard = ({ t, onView }: { t: Topic; onView: (t: Topic) => void }) => (
    <div className="bg-primary-dark p-6 rounded-lg border border-white/10 hover:border-glow-blue/50 transition-colors flex items-start justify-between gap-4">
        <div style={{ flex: 1, maxHeight: '7.5rem', overflow: 'hidden' }}>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.tag === 'Utilities' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{t.tag}</span>
            <h4 className="font-bold text-white mt-2" style={{ ...clampStyle as any, wordBreak: 'break-word' }} title={t.title}>{previewText(t.title)}</h4>
            <p className="text-xs text-light-slate mt-1">By {t.author} • {t.replies} replies • Last reply {new Date(t.lastReplyAt).toLocaleString()}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <button type="button" onClick={() => onView(t)} className="text-glow-blue text-sm font-semibold hover:underline">Read more</button>
        </div>
    </div>
);

const PollCard = ({ poll, onVote }: { poll: Poll | null, onVote: (optId: string) => void }) => {
    if (!poll) return null;
    const total = poll.options.reduce((s,o) => s + (o.votes||0), 0) || 1;
    return (
        <div className="bg-primary-dark p-8 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold text-white">{poll.question}</h3>
            <p className="text-light-slate mt-2 mb-6 text-sm">Cast your vote — results shown live.</p>
            <div className="space-y-3">
                {poll.options.map(opt => (
                    <button key={opt.id} onClick={() => onVote(opt.id)} className="w-full text-left p-3 rounded-md bg-dark-navy border border-gray-600 hover:border-glow-blue transition-colors text-sm flex justify-between items-center">
                        <span>{opt.label}</span>
                        <span className="text-xs text-light-slate">{Math.round((opt.votes/total)*100)}% • {opt.votes}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const EventCard = ({ e, onView }: { e: EventItem; onView: (e: EventItem) => void }) => (
    <div className="bg-primary-dark p-6 rounded-lg border border-white/10 h-full flex flex-col">
        <p className="text-sm font-semibold text-glow-blue">{e.date}</p>
        <h4 className="font-bold text-white mt-2 flex-grow">{e.title}</h4>
        <p className="text-xs text-light-slate mt-1">{e.location}</p>
        <button type="button" onClick={() => onView(e)} className="mt-4 w-full bg-primary-dark text-glow-blue px-4 py-2 rounded-md text-sm font-semibold border border-glow-blue hover:bg-glow-blue hover:text-white transition-colors">
            View Details
        </button>
    </div>
);

const EngagePage: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [poll, setPoll] = useState<Poll | null>(null);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newTag, setNewTag] = useState('General');
    const [submitting, setSubmitting] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const [t, p, e] = await Promise.all([engageStore.getTopics(), engageStore.getPoll(), engageStore.getEvents()]);
            if (!mounted) return;
            setTopics(t);
            setPoll(p as any);
            setEvents(e as any);
        };
        load();
        // If AI is configured, scan existing topics and remove non-relevant ones
        (async () => {
            const ai = getAiClient();
            if (!ai) return;
            try {
                await engageStore.scanAndModerateTopics(async (topic) => {
                    const prompt = `Decide if the following forum post title is a civic issue related to city services, infrastructure, sanitation, safety, utilities, or local governance. Respond with ONLY YES or NO.`;
                    const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: `${prompt}\n\nTitle: "${topic.title}"` }] } });
                    const txt = resp.text.trim().toLowerCase();
                    return txt.includes('yes');
                });
            } catch (e) { console.warn('AI moderation failed', e); }
        })();
        const unsub = engageStore.subscribeTopics(() => {
            engageStore.getTopics().then(setTopics);
            engageStore.getPoll().then(setPoll as any);
        });
        return () => { mounted = false; unsub(); };
    }, []);

    const submitTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            setSubmitting(true);
            // debug & sanitize
            const clean = sanitize(newTitle.trim());
            console.debug('Submitting topic', { title: clean, tag: newTag });

            // If AI is configured, ask it whether this post is relevant to civic issues
            const ai = getAiClient();
            if (ai) {
                try {
                    const prompt = `You are a civic moderation assistant. Decide if the following user-submitted forum post title relates to a real civic issue (infrastructure, sanitation, utilities, safety, public services) or if it is unrelated (spam, personal, off-topic, application feature request, advertisement). Reply with ONLY YES or NO.`;
                    const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: `${prompt}\n\nTitle: "${clean}"` }] } });
                    const out = resp.text.trim().toLowerCase();
                    if (!out.includes('yes')) {
                        // Block posting
                        alert('Your post appears to be off-topic for civic issues and cannot be published.');
                        return;
                    }
                } catch (err) {
                    console.warn('AI moderation failed, permitting post as fallback', err);
                }
            } else {
                console.warn('AI not configured — skipping moderation');
            }

            await engageStore.addTopic({ title: clean, author: 'You', tag: newTag, id: undefined } as any);
            // Immediately refresh topics in this tab so the user sees their post instantly
            const latest = await engageStore.getTopics();
            setTopics(latest);
            setNewTitle('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (optId: string) => {
        if (!poll) return;
        console.debug('Voting', optId, 'on poll', poll.id);
        // Optimistic UI update: update local poll state immediately
        setPoll(prev => {
            if (!prev) return prev;
            const copy = { ...prev, options: prev.options.map(o => o.id === optId ? { ...o, votes: (o.votes||0) + 1 } : o) };
            return copy;
        });
        try {
            const updated = await engageStore.vote(poll.id, optId);
            setPoll(updated as any);
        } catch (err) {
            // on error, re-fetch poll to ensure consistent state
            console.error('Vote failed', err);
            const p = await engageStore.getPoll();
            setPoll(p as any);
        }
    };

    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="font-semibold text-glow-blue">ENGAGE & INFLUENCE</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Voice Shapes Our City</h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-light-slate">
                        Participate in discussions, vote on key issues, and collaborate to build a better community.
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold text-white">Active Discussions</h2>
                        <form onSubmit={submitTopic} className="flex gap-2">
                            <textarea rows={2} maxLength={1000} className="flex-grow p-2 rounded-md bg-dark-navy resize-none break-words" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Start a discussion..." />
                            <select value={newTag} onChange={e=>setNewTag(e.target.value)} className="bg-dark-navy p-2 rounded-md">
                                <option>General</option>
                                <option>Utilities</option>
                                <option>Sanitation</option>
                                <option>Infrastructure</option>
                                <option>Community</option>
                            </select>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-glow-blue text-white rounded-md disabled:opacity-60">{submitting ? 'Posting...' : 'Post'}</button>
                        </form>

                                    <div className="space-y-4">
                                        {topics.map(t => (
                                            <div key={t.id}>
                                                <ForumTopicCard t={t} onView={(topic)=>{ setSelectedTopic(topic); setModalOpen(true); }} />
                                            </div>
                                        ))}
                                    </div>
                    </div>

                    <div className="space-y-8">
                         <h2 className="text-2xl font-bold text-white">Have Your Say</h2>
                        <PollCard poll={poll} onVote={handleVote} />
                    </div>
                </div>
                
                    <div className="mt-24">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Upcoming Town Halls & Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                       {events.map(ev => (
                           <div key={ev.id}>
                               <EventCard e={ev} onView={(ev)=>{ setSelectedEvent(ev); setModalOpen(true); }} />
                           </div>
                       ))}
                    </div>
                </div>
                {modalOpen && selectedTopic && (
                    <Modal title={previewText(selectedTopic.title, 200)} onClose={() => { setModalOpen(false); setSelectedTopic(null); }}>
                            <p className="text-xs text-light-slate">By {selectedTopic.author} • {selectedTopic.replies} replies</p>
                            <p className="mt-3 text-sm text-light-slate">Tag: {selectedTopic.tag}</p>
                            <div className="mt-4">
                                {selectedTopic.title && selectedTopic.title.length > 5000 ? (
                                    <LongContentFallback content={selectedTopic.title} />
                                ) : (
                                    <p className="text-sm text-light-slate">{selectedTopic.title}</p>
                                )}

                                <div className="mt-6">
                                    <h4 className="text-white font-semibold">Discussion</h4>
                                    <div className="mt-3 max-h-48 overflow-auto space-y-3">
                                        {replies.map(r => (
                                            <div key={r.id} className="bg-dark-navy p-3 rounded">
                                                <div className="text-xs text-light-slate">{r.author} • {new Date(r.createdAt).toLocaleString()}</div>
                                                <div className="text-sm text-white mt-1">{r.text}</div>
                                            </div>
                                        ))}
                                        {replies.length === 0 && <p className="text-sm text-light-slate">No replies yet.</p>}
                                    </div>

                                    <form onSubmit={async (ev) => {
                                        ev.preventDefault();
                                        if (!replyText.trim() || !selectedTopic) return;
                                        const clean = sanitize(replyText.trim());
                                        // optimistic update
                                        const temp = { id: `tmp-${Date.now()}`, topicId: selectedTopic.id, author: 'You', text: clean, createdAt: Date.now() };
                                        setReplies(prev => [...prev, temp]);
                                        setReplyText('');
                                        try {
                                            await engageStore.addReply(selectedTopic.id, { author: 'You', text: clean } as any);
                                            const fresh = await engageStore.getReplies(selectedTopic.id);
                                            setReplies(fresh);
                                        } catch (e) {
                                            console.error('Failed to post reply', e);
                                        }
                                    }} className="mt-3">
                                        <textarea rows={2} value={replyText} onChange={e=>setReplyText(e.target.value)} className="w-full p-2 bg-dark-navy rounded" placeholder="Write a reply..." />
                                        <div className="mt-2 flex justify-end">
                                            <button type="submit" className="px-3 py-1 bg-glow-blue text-white rounded">Reply</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Modal>
                )}

                {modalOpen && selectedEvent && (
                    <Modal title={previewText(selectedEvent.title, 200)} onClose={() => { setModalOpen(false); setSelectedEvent(null); }}>
                            <p className="text-xs text-light-slate">When: {selectedEvent.date}</p>
                            <p className="mt-3 text-sm text-light-slate">Location: {selectedEvent.location}</p>
                        </Modal>
                )}
            </div>
        </div>
    );
};

export default EngagePage;