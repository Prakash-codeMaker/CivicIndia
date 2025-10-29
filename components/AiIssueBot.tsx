import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from '../routing/RouterContext';
import { getReportsForUser, getReportById } from '../lib/reportStore';
import { getApplicationsForUser } from '../lib/serviceStore';
import servicesMetadata from '../services-metadata.json';

// (AI client removed) This chat widget provides local QA only — no report creation or AI verification here.

type ChatMessage = { from: 'user' | 'bot' | 'system'; text: string };

const AiIssueBot: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: 'Hi — I can help answer questions about your reports and available services. Ask about report status, tracking, or how to apply for services.' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const append = (m: ChatMessage) => setMessages((s) => [...s, m]);
  const { navigate } = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    try {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  }, [messages, isProcessing]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  };

  // Note: report-creation and AI verification have been removed from the chat widget.

  const handleSend = async () => {
    if (!input.trim()) return;
    append({ from: 'user', text: input });
    setInput('');
    setIsProcessing(true);

    // Local QA handler: quick intents for tracking and services without calling external AI
    const localAnswer = await tryLocalQA(input.trim());
    if (localAnswer) {
      append({ from: 'bot', text: localAnswer });
      setIsProcessing(false);
      return;
    }

      // Draft helper trigger: user asks to create a draft or help file a report
      const draftTriggers = /\b(draft|help me file|help me report|help me file a report|create draft|prepare report)\b/i;
      if (draftTriggers.test(input)) {
        // Use services metadata to try to classify intent and prefill fields
        const services = (servicesMetadata as any).services || {};

        const classifyIssue = (text: string) => {
          const t = text.toLowerCase();
          // Rank services by keyword matches in title, description or keywords array
          const scores: { key: string; score: number }[] = [];
          for (const key of Object.keys(services)) {
            const meta = services[key] as any;
            let score = 0;
            const hay = (meta.title || key || '').toLowerCase() + ' ' + (meta.description || '') + ' ' + (meta.keywords || []).join(' ');
            if (!hay) continue;
            for (const token of t.split(/\W+/).filter(Boolean)) {
              if (hay.includes(token)) score += 1;
            }
            if (score > 0) scores.push({ key, score });
          }
          scores.sort((a, b) => b.score - a.score);
          return scores.length ? scores[0].key : '';
        };

        const foundKey = classifyIssue(input);
        const foundType = foundKey ? ((services as any)[foundKey].title || foundKey) : '';
        const locationMatch = input.match(/near\s+([\w\s,.-]+)/i) || input.match(/at\s+([\w\s,.-]+)/i);

        // Multi-turn drafting: if we miss critical fields, ask follow-up questions instead of immediately navigating away
        const draft: any = { issueType: foundType || '', location: locationMatch ? locationMatch[1].trim() : '', description: input };

        // If we have low confidence, ask for clarification (multi-turn)
        if (!draft.issueType || !draft.location) {
          if (!draft.issueType) append({ from: 'bot', text: 'I can help prepare a draft. What category best matches this issue? (e.g., Housing, Utilities, Health, Employment)' });
          else if (!draft.location) append({ from: 'bot', text: 'Thanks — can you tell me where this is located? A street, landmark, or "Lat:... Lon:..." coordinates will help.' });

          // Store the unfinished draft in session so the user can complete it in chat
          try { sessionStorage.setItem('report:draft', JSON.stringify(draft)); } catch (e) { /* ignore */ }
          setIsProcessing(false);
          return;
        }

        // If we have decent info, store and navigate to /report for review
        try {
          sessionStorage.setItem('report:draft', JSON.stringify(draft));
          append({ from: 'bot', text: 'Okay — I created a draft for you and will open the Report page where you can review and submit it.' });
          navigate('/report');
        } catch (e) {
          append({ from: 'bot', text: 'Unable to create a draft at the moment.' });
        }
        setIsProcessing(false);
        return;
      }

    // Quick image URL detection: if the user pasted an image URL, attempt server-side verification and summarize
    const urlMatch = input.match(/https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif)/i);
    if (urlMatch) {
      const url = urlMatch[0];
      append({ from: 'bot', text: 'I found an image link. I will analyze it to help pre-fill the draft.' });
      try {
        const fetched = await fetch(url);
        if (!fetched.ok) throw new Error('Failed to fetch image');
        const blob = await fetched.blob();
        const file = new File([blob], 'attached-image', { type: blob.type });
        const form = new FormData();
        form.append('photos', file);
        form.append('reportedLocation', '');
        const resp = await fetch('/verify', { method: 'POST', body: form });
        if (resp.ok) {
          const data = await resp.json();
          const summary = (data.results || []).map((r: any, i: number) => `Image ${i+1}: ${r.ok ? 'OK' : 'FLAGGED'} (${r.reason})`).join('\n');
          append({ from: 'bot', text: `Image analysis:\n${summary}` });

          // Add to draft if available
          try {
            const raw = sessionStorage.getItem('report:draft');
            const draft = raw ? JSON.parse(raw) : {};
            draft.photos = draft.photos ? [...draft.photos, url] : [url];
            sessionStorage.setItem('report:draft', JSON.stringify(draft));
            append({ from: 'bot', text: 'I attached the image to your draft. Open the Report page to review it.' });
            navigate('/report');
          } catch (e) {
            // ignore
          }
          setIsProcessing(false);
          return;
        } else {
          append({ from: 'bot', text: 'Could not analyze the image with the server. It may be unavailable.' });
        }
      } catch (e) {
        append({ from: 'bot', text: 'Failed to fetch or analyze the image link.' });
      }
    }

    // Optional LLM path (feature-flagged). If localStorage.ai:enabled === 'true', we could forward to an external LLM for richer responses.
    const aiEnabled = typeof localStorage !== 'undefined' && localStorage.getItem('ai:enabled') === 'true';
    if (aiEnabled) {
      append({ from: 'bot', text: 'Attempting to get a richer answer from the AI assistant...' });
      // External LLM path (feature-flagged). Read configuration from localStorage.
      try {
        const apiKey = localStorage.getItem('ai:key') || '';
        const model = localStorage.getItem('ai:model') || 'gpt-4o-mini';
        if (!apiKey) {
          append({ from: 'bot', text: 'AI is enabled but no API key is configured. Set ai:key in localStorage to use the LLM.' });
          setIsProcessing(false);
          return;
        }

        // Example generic fetch to a configured LLM proxy - replace with your secure backend or direct provider call.
        const resp = await fetch('https://example-llm-proxy.local/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model, prompt: input })
        });
        if (!resp.ok) throw new Error(`LLM returned ${resp.status}`);
        const data = await resp.json();
        const text = data?.text || data?.result || JSON.stringify(data);
        append({ from: 'bot', text: String(text) });
      } catch (e) {
        console.error('LLM error', e);
        append({ from: 'bot', text: 'AI request failed or is not configured correctly.' });
      }
      setIsProcessing(false);
      return;
    }

    // We intentionally removed report creation from the chat widget.
    append({ from: 'bot', text: "I can help with questions about report progress and services, but I cannot file reports from this chat. Please use the Report page to create a new report or follow the 'Report an Issue' link in the app." });
    setIsProcessing(false);
  };

  // --- Local QA helpers ---
  const tryLocalQA = async (text: string) => {
    if (!text) return null;
    const t = text.toLowerCase().trim();

    // Very small rule-based intent parser
    const intents = {
      status: /\b(status|progress|track|tracking|how is my|what's the status of|what is the status of)\b/i,
      last: /\b(last|latest|most recent)\b/i,
      id: /(RPT-[A-Za-z0-9\-]+)/i,
      applyHow: /\bhow to apply for\b|\bhow do i apply for\b|\bhow to apply\b/i,
      applyFor: /\bapply for\b|\bapply\b/i,
      services: /\b(what services|services available|what can i apply|available services)\b/i,
    };

    // 1) Status + ID
    const idMatch = text.match(intents.id);
    if (intents.status.test(text) && idMatch) {
      const id = idMatch[1];
      try {
        const rep = await getReportById(id);
        if (!rep) return `I couldn't find a report with id ${id}. Check the reference and try again.`;
        return `Report ${rep.id}: status=${rep.status}. Submitted on ${new Date(rep.createdAt).toLocaleString()}. Description: ${rep.description.slice(0,200)}${rep.description.length>200? '...':''}`;
      } catch (e) {
        return `Error checking report ${id}.`;
      }
    }

    // 2) Status + last/latest
    if (intents.status.test(text) && intents.last.test(text)) {
      try {
        const list = await getReportsForUser(user?.id || 'guest');
        if (!list || list.length === 0) return 'I do not see any reports from your account. Use the Report page to file an issue.';
        const latest = list[0];
        return `Your latest report ${latest.id} (submitted ${new Date(latest.createdAt).toLocaleString()}): status=${latest.status}. Description: ${latest.description.slice(0,200)}${latest.description.length>200? '...':''}`;
      } catch (e) {
        return 'I had trouble retrieving your reports. Please try again.';
      }
    }

    // 3) Ask for status generally (default to latest)
    if (intents.status.test(text)) {
      try {
        const list = await getReportsForUser(user?.id || 'guest');
        if (!list || list.length === 0) return 'I do not see any reports from your account. Use the Report page to file an issue.';
        const latest = list[0];
        return `Your latest report ${latest.id}: status=${latest.status} (submitted ${new Date(latest.createdAt).toLocaleDateString()}).`;
      } catch (e) {
        return 'I had trouble retrieving your reports. Please try again.';
      }
    }

    // 4) How to apply for X — use services-metadata.json when available
    if (intents.applyHow.test(text)) {
      const services = Object.keys((servicesMetadata as any).services || {});
      const found = services.find((s: string) => text.toLowerCase().includes(s));
      if (found) {
        const meta = (servicesMetadata as any).services[found];
        if (meta && Array.isArray(meta.steps)) {
          return `How to apply for ${meta.title || found}:\n` + meta.steps.map((st: string, i: number) => `${i+1}. ${st}`).join('\n');
        }
        return `To apply for ${found}, open the Services page → ${found.replace('-', ' ')} and follow the on-screen instructions.`;
      }
      return 'To apply for a service, open the Services page, choose the service you need (housing, utilities, health, education, employment, financial-assistance), fill the form and submit. Tell me which service and I will list the exact steps.';
    }

    // 5) Apply for / list user's applications
    if (intents.applyFor.test(text) || intents.services.test(text)) {
      try {
        const apps = await getApplicationsForUser(user?.id || 'guest');
        if (!apps || apps.length === 0) return 'I do not see any service applications in your account. You can apply for services from the Services page.';
        const top = apps.slice(0,5).map(a => `- ${a.service} (${a.status}) id:${a.id} submitted ${new Date(a.createdAt).toLocaleDateString()}`).join('\n');
        return `Here are your recent service applications:\n${top}`;
      } catch (e) {
        return 'I could not read your service applications right now. Please try again.';
      }
    }

    // 6) Fallback: not handled locally
    return null;
  };

  return (
    <div className="flex flex-col h-80">
      <div ref={containerRef} className="flex-1 overflow-auto p-2 space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.from !== 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">AI</div>
            )}
            <div className={`max-w-[80%] p-2 rounded-lg ${m.from === 'user' ? 'bg-slate-800 text-white rounded-br-none' : 'bg-slate-700 text-gray-100 rounded-bl-none'}`}>
              <div className="text-xs text-gray-400 mb-1">{m.from === 'user' ? (user?.fullName ?? 'You') : 'Assistant'}</div>
              <div className="whitespace-pre-wrap text-sm">{m.text}</div>
            </div>
            {m.from === 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold">{getInitials(user?.fullName)}</div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-glow-blue text-white flex items-center justify-center text-sm font-semibold">AI</div>
            <div className="p-2 rounded-lg bg-slate-700 text-gray-100">
              <div className="animate-pulse text-sm">Assistant is typing...</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-white/5">
        <textarea
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask about report status, services, or type 'help me file' to create a draft..."
          className="w-full p-2 rounded bg-dark-navy text-white resize-none h-20"
          rows={3}
        />
        <div className="flex items-center justify-end mt-2">
          <button disabled={isProcessing} onClick={handleSend} className="inline-flex items-center gap-2 px-3 py-1 bg-glow-blue rounded text-white">
            {isProcessing ? (
              <span>Processing...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiIssueBot;
