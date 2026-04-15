import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ASSISTANT_ACTION_STORAGE_KEY = 'mms_assistant_action';
const CHATBOT_QUICK_PROMPTS = [
    'What should we fix first?',
    'Which property has the most incidents?',
    'Show open work orders this week',
    'List unassigned requests',
    'Which technician resolves issues fastest?',
    'Where are we breaching SLA most often?'
];
const CHATBOT_QUICK_ACTIONS = [
    { label: 'Create Request', type: 'openRequestForm' },
    { label: 'Create Work Order', type: 'openWorkOrderDetailsForm' },
    { label: 'Create Preventive', type: 'openCreatePm' },
    { label: 'Open Meters', type: 'openMetersTab' },
];

const parseMarkdownTableMessage = (content) => {
    const text = String(content || '');
    const parseCells = (line) => line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());
    const buildParsedTable = (intro, headers, rows) => {
        if (!headers.length || !rows.length) return null;
        return {
            intro: intro.trim(),
            headers,
            rows,
        };
    };

    const lines = text.split(/\r?\n/);
    const dividerIndex = lines.findIndex((line) => /^\|\s*---/.test(line.trim()));

    if (dividerIndex > 0) {
        const introLines = lines.slice(0, Math.max(0, dividerIndex - 1)).filter((line) => line.trim().length > 0);
        const headerLine = lines[dividerIndex - 1];
        const rowLines = lines.slice(dividerIndex + 1).filter((line) => line.trim().startsWith('|'));
        const headers = parseCells(headerLine);
        const rows = rowLines
            .map(parseCells)
            .filter((cells) => cells.length > 0 && cells.some((cell) => cell.length > 0));

        const parsed = buildParsedTable(introLines.join('\n'), headers, rows);
        if (parsed) return parsed;
    }

    const inlineDividerMatch = text.match(/^(.*?)(\|\s*[^|]+(?:\|\s*[^|]+)+\|?)\s*(\|\s*---(?:\s*\|\s*---)+\s*\|?)\s*(.+)$/);
    if (!inlineDividerMatch) return null;

    const intro = inlineDividerMatch[1] || '';
    const headerSegment = inlineDividerMatch[2] || '';
    const headers = parseCells(headerSegment);
    const remaining = (inlineDividerMatch[4] || '').trim();
    if (!headers.length || !remaining) return null;

    const rawCells = remaining
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);

    const rows = [];
    for (let index = 0; index < rawCells.length; index += headers.length) {
        const row = rawCells.slice(index, index + headers.length);
        if (row.length === headers.length) rows.push(row);
    }

    return buildParsedTable(intro, headers, rows);
};

const normalizeAssistantText = (value) => String(value || '').trim().toLowerCase();

const buildAssistantActionResponse = (query) => {
    const q = normalizeAssistantText(query);
    const wantsAdd = /\b(add|create|submit|make|open|new)\b/.test(q) || /\b(how|where|can i|could i|help)\b/.test(q);
    if (!wantsAdd) return null;

    const actionForEntity = (content, label, type) => ({
        role: 'model',
        kind: 'action',
        content,
        action: { label, type },
    });

    if (/\b(assigned requests|requests assigned|issues assigned|assigned issues)\b/.test(q)) {
        return actionForEntity('Open the Requests tab to review and manage assigned requests.', 'Open Requests', 'openRequestsTab');
    }
    if (/\b(request|requests|issue request|issues requests|ticket|tickets)\b/.test(q)) {
        return actionForEntity('Open the request form to add a new request.', 'Open Request Form', 'openRequestForm');
    }
    if (/\btechnician|technicians|worker|workers|staff\b/.test(q)) {
        return actionForEntity('Open People & Teams to add a technician.', 'Add Technician', 'openAddTechnician');
    }
    if (/\bwork\s*order|workorders|wo\b/.test(q)) {
        return actionForEntity('Open the full work order form to create a new work order.', 'Create Work Order', 'openWorkOrderDetailsForm');
    }
    if (/\basset|assets\b/.test(q)) {
        return actionForEntity('Open the Assets area to add a new asset.', 'Add Asset', 'openAddAsset');
    }
    if (/\blocation|locations|property|properties|site|sites\b/.test(q)) {
        return actionForEntity('Open Locations to add a new site or property.', 'Add Location', 'openAddLocation');
    }
    if (/\bpreventive|preventive maintenance|pm\b/.test(q)) {
        return actionForEntity('Open preventive maintenance to create a new PM item.', 'Create Preventive', 'openCreatePm');
    }
    if (/\bschedule|schedules|maintenance schedule|maintenance schedules\b/.test(q)) {
        return actionForEntity('Open the schedule form to add a new maintenance schedule.', 'Add Schedule', 'openAddSchedule');
    }
    if (/\bmeter|meters\b/.test(q)) {
        return actionForEntity('Open the Meters tab and use the Add Meter button there.', 'Open Meters', 'openMetersTab');
    }
    if (/\bedge|device|devices|edge device|edge devices\b/.test(q)) {
        return actionForEntity('Open the Edge tab and use the Add Device button there.', 'Open Edge', 'openEdgeTab');
    }

    return null;
};

const AIChatbot = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hello! I'm your maintenance AI assistant. Ask me about incident trends, risky properties, technician performance, SLA breaches, or what to prioritize first." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (!isOpen || summary || loadingSummary) return;

        const fetchSummary = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                setLoadingSummary(true);
                const res = await api.get('/api/ai/maintenance-summary');
                setSummary(res.data);
            } catch (error) {
                console.error("Failed to load AI maintenance summary:", error);
            } finally {
                setLoadingSummary(false);
            }
        };

        fetchSummary();
    }, [isOpen, summary, loadingSummary]);

    const performAssistantAction = (actionType) => {
        if (!actionType) return;
        try {
            sessionStorage.setItem(ASSISTANT_ACTION_STORAGE_KEY, actionType);
        } catch (error) {
            console.warn('Failed to persist assistant action', error);
        }
        navigate('/dashboard');
        setIsOpen(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const content = input.trim();
        const userMessage = { role: 'user', content };
        const validHistory = messages.filter((msg, index) => {
            if (!msg?.content) return false;
            if (index === 0 && msg.role !== 'user') return false;
            return msg.role === 'user' || msg.role === 'model';
        });
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        const actionResponse = buildAssistantActionResponse(content);
        if (actionResponse) {
            setMessages(prev => [...prev, actionResponse]);
            setIsTyping(false);
            return;
        }

        try {
            const res = await api.post('/api/ai/chat', {
                message: content,
                history: validHistory
            });

            setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Sorry, I encountered an error. Please check your connection or try again later.";
            setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        if (window.confirm("Clear chat history?")) {
            setMessages([{ role: 'model', content: "Hello again! Ask me about trends, repeated failures, risky properties, or what the team should fix first." }]);
        }
    };

    const applyPrompt = (prompt) => {
        setInput(prompt);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-4 rounded-full shadow-2xl text-white flex items-center justify-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={`absolute bottom-20 right-0 ${isMaximized ? 'w-[90vw] h-[80vh] max-w-4xl' : 'w-96 h-[500px]'} bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">KAT AI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-indigo-100 font-medium tracking-wider">ONLINE</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={clearChat} title="Clear history" className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {(loadingSummary || summary) && (
                                <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">AI Snapshot</div>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">
                                                {loadingSummary ? 'Loading maintenance insights...' : 'Live maintenance overview'}
                                            </div>
                                        </div>
                                    </div>
                                    {summary && (
                                        <>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
                                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                    <div className="font-semibold text-slate-500">Open Issues</div>
                                                    <div className="mt-1 text-sm font-bold text-slate-900">{summary.metrics?.openIssues ?? '—'}</div>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                    <div className="font-semibold text-slate-500">SLA Breaches</div>
                                                    <div className="mt-1 text-sm font-bold text-slate-900">{summary.metrics?.slaBreaches ?? '—'}</div>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                    <div className="font-semibold text-slate-500">Avg Resolution</div>
                                                    <div className="mt-1 text-sm font-bold text-slate-900">
                                                        {summary.metrics?.avgResolutionHours ? `${summary.metrics.avgResolutionHours}h` : 'Not enough data'}
                                                    </div>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                    <div className="font-semibold text-slate-500">Top Property</div>
                                                    <div className="mt-1 text-sm font-bold text-slate-900">
                                                        {summary.topProperties?.[0]?.property || 'No data'}
                                                    </div>
                                                </div>
                                            </div>
                                            {Array.isArray(summary.recommendations) && summary.recommendations.length > 0 && (
                                                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-3">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Top Recommendation</div>
                                                    <div className="mt-2 text-sm font-medium text-slate-800">
                                                        {summary.recommendations[0]}
                                                    </div>
                                                </div>
                                            )}
                                            {Array.isArray(summary.suggestedQuestions) && summary.suggestedQuestions.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {summary.suggestedQuestions.slice(0, 4).map((prompt) => (
                                                        <button
                                                            key={prompt}
                                                            type="button"
                                                            onClick={() => applyPrompt(prompt)}
                                                            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                                                        >
                                                            {prompt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {CHATBOT_QUICK_ACTIONS.map((action) => (
                                                    <button
                                                        key={action.type}
                                                        type="button"
                                                        onClick={() => performAssistantAction(action.type)}
                                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {!loadingSummary && !summary && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quick Start</div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {CHATBOT_QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => applyPrompt(prompt)}
                                                className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {messages.map((msg, i) => {
                                const parsedTable = parseMarkdownTableMessage(msg.content);
                                const isTableMessage = Boolean(parsedTable);

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                                    >
                                        {msg.role !== 'user' && (
                                            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mb-1">
                                                <Bot className="w-4 h-4 text-indigo-600" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                } ${isTableMessage ? 'overflow-hidden' : 'whitespace-pre-wrap'}`}
                                        >
                                            {msg.kind === 'action' && msg.action ? (
                                                <div className="space-y-3">
                                                    <div className="whitespace-pre-wrap text-sm font-medium text-slate-700">
                                                        {msg.content}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => performAssistantAction(msg.action.type)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        {msg.action.label}
                                                    </button>
                                                </div>
                                            ) : isTableMessage ? (
                                                <div className="space-y-3">
                                                    {parsedTable?.intro ? (
                                                        <div className="whitespace-pre-wrap text-sm font-medium text-slate-700">
                                                            {parsedTable.intro}
                                                        </div>
                                                    ) : null}
                                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                        <table className="min-w-full border-collapse text-xs">
                                                            <thead className="bg-slate-100">
                                                                <tr>
                                                                    {parsedTable.headers.map((header) => (
                                                                        <th
                                                                            key={header}
                                                                            className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700"
                                                                        >
                                                                            {header}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white">
                                                                {parsedTable.rows.map((row, rowIndex) => (
                                                                    <tr key={`${i}-${rowIndex}`} className="odd:bg-white even:bg-slate-50">
                                                                        {parsedTable.headers.map((_, cellIndex) => (
                                                                            <td
                                                                                key={`${i}-${rowIndex}-${cellIndex}`}
                                                                                className="border-t border-slate-100 px-3 py-2 text-slate-600"
                                                                            >
                                                                                {row[cellIndex] || '-'}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white mb-1 shadow-md">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                            {isTyping && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="bg-white p-3.5 rounded-2xl rounded-bl-none border border-gray-100 flex gap-1 items-center shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-gray-100 bg-white p-4">
                            <div className="mb-3 flex flex-wrap gap-2">
                                {CHATBOT_QUICK_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => applyPrompt(prompt)}
                                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about trends, priorities, hotspots, or what to create next..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChatbot;
