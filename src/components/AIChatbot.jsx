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
        return actionForEntity(
            'To review assigned requests, open the Requests area and scan the status, assignee, and due-date columns first. That will show which requests already have owners, which ones are waiting, and which ones need reassignment or follow-up.\n\nUse the button below to jump straight to the Requests tab.',
            'Open Requests',
            'openRequestsTab'
        );
    }
    if (/\b(request|requests|issue request|issues requests|ticket|tickets)\b/.test(q)) {
        return actionForEntity(
            'To create a request, open the request form, choose the property or location, describe the issue clearly, set the priority, and include any useful details like photos, contact information, or timing notes. Once you submit it, the request can be reviewed, assigned, and converted into a work order if needed.\n\nUse the button below to open the request form.',
            'Open Request Form',
            'openRequestForm'
        );
    }
    if (/\btechnician|technicians|worker|workers|staff\b/.test(q)) {
        return actionForEntity(
            'To add a technician, go to the team management area, enter the technician details, assign contact information, and set the right specialties or responsibilities. That helps the system and your managers route work to the right person later.\n\nUse the button below to open the technician setup flow.',
            'Add Technician',
            'openAddTechnician'
        );
    }
    if (/\bwork\s*order|workorders|wo\b/.test(q)) {
        return actionForEntity(
            'To create a work order, open the full work order form, select the asset or location involved, describe the maintenance task, set the priority and due date, then assign the technician or team. You can also add notes, attachments, or checklist details so execution is clear from the start.\n\nUse the button below to open the work order form.',
            'Create Work Order',
            'openWorkOrderDetailsForm'
        );
    }
    if (/\basset|assets\b/.test(q)) {
        return actionForEntity(
            'To add an asset, open the asset form and enter the equipment name, type, location, status, and any identifying details like serial number, vendor, or purchase information. A complete asset record makes scheduling, history tracking, and reporting much easier later.\n\nUse the button below to open the asset form.',
            'Add Asset',
            'openAddAsset'
        );
    }
    if (/\blocation|locations|property|properties|site|sites\b/.test(q)) {
        return actionForEntity(
            'To add a location or property, create the site record first with its name, address, and any structure details your team uses. Once the location exists, you can link requests, assets, schedules, and technicians to it more accurately.\n\nUse the button below to open the location form.',
            'Add Location',
            'openAddLocation'
        );
    }
    if (/\bpreventive|preventive maintenance|pm\b/.test(q)) {
        return actionForEntity(
            'To set up preventive maintenance, open the PM form, choose the asset or area, define the maintenance task, set the frequency, and assign who should carry it out. This creates a repeatable routine so the system can remind your team before work becomes overdue.\n\nUse the button below to create a preventive maintenance item.',
            'Create Preventive',
            'openCreatePm'
        );
    }
    if (/\bschedule|schedules|schedul|schedula|maintenance schedule|maintenance schedules\b/.test(q)) {
        if (/\btask|job|work\b/.test(q)) {
            return actionForEntity(
                'To schedule a task, open the scheduler, choose the relevant property, asset, or work item, then set the date, time, and frequency if it should repeat. After that, assign the technician or team so the task appears in the right workflow.\n\nUse the button below to open the schedule form.',
                'Add Schedule',
                'openAddSchedule'
            );
        }
        return actionForEntity(
            'To add a maintenance schedule, open the scheduler, define what should happen, choose when it should happen, and attach the right people or assets. Schedules are best when you want planned work to happen on a routine calendar or timeline.\n\nUse the button below to create the schedule.',
            'Add Schedule',
            'openAddSchedule'
        );
    }
    if (/\bmeter|meters\b/.test(q)) {
        return actionForEntity(
            'To add a meter, open the Meters tab, create a meter record, enter the meter name, type, unit, and where it belongs, then start recording readings. This helps you track consumption, thresholds, and abnormal changes over time.\n\nUse the button below to go to the Meters area.',
            'Open Meters',
            'openMetersTab'
        );
    }
    if (/\bedge|device|devices|edge device|edge devices\b/.test(q)) {
        return actionForEntity(
            'To add an edge device, open the Edge section, register the device, and connect it to the right site, asset, or measurement source. Once configured, it can feed operational data back into your maintenance workflow.\n\nUse the button below to open the Edge area.',
            'Open Edge',
            'openEdgeTab'
        );
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

            // Handle action-based responses (with links/buttons) or plain text responses
            const response = res.data.response;
            let messageToAdd;
            
            if (typeof response === 'string') {
              // Plain text response
              messageToAdd = { role: 'model', content: response };
            } else if (response.kind === 'action' && response.action) {
              // Action response with button/link
              messageToAdd = {
                role: 'model',
                kind: 'action',
                content: response.content,
                action: response.action
              };
            } else {
              // Fallback - treat as plain text
              messageToAdd = { role: 'model', content: response.content || JSON.stringify(response) };
            }
            
            setMessages(prev => [...prev, messageToAdd]);
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
                        className={`${isMaximized ? 'fixed inset-0' : 'absolute bottom-20 right-0 w-96 h-[550px]'} bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}
                    >
                        {/* Header - Minimalist */}
                        <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">KAT Assistant</h3>
                                    <p className="text-xs text-slate-500">Ask me anything about maintenance</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Toggle fullscreen">
                                    {isMaximized ? <Minimize2 className="w-5 h-5 text-slate-600" /> : <Maximize2 className="w-5 h-5 text-slate-600" />}
                                </button>
                                <button onClick={clearChat} title="Clear chat" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5 text-slate-600" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-white">
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
                                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md'
                                                : 'bg-gray-100 text-slate-800 rounded-bl-none'
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
                                    <div className="bg-gray-100 p-3.5 rounded-2xl rounded-bl-none flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - Minimalist */}
                        <div className="border-t border-gray-200 bg-white px-6 py-4">
                            <form onSubmit={handleSend} className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </form>
                            <p className="mt-2 text-xs text-slate-500 text-center">Ask about trends, priorities, how-tos, or create new items</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChatbot;
