import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Trash2, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import api from '../api/axios';

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyInput, setReplyInput] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/contact-messages/conversations');
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);
    try {
      const response = await api.get(`/api/contact-messages/${conversation.sessionId}`);
      console.log('Messages fetched:', response.data); // Debug log
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(reader.result); // base64
        setReplyImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReply = async () => {
    if (!replyInput.trim() && !replyImage) return;

    setReplySending(true);
    try {
      await api.post(`/api/contact-messages/${selectedConversation.sessionId}/reply`, {
        message: replyInput,
        image: replyImage,
        replyTo: selectedConversation.visitorEmail
      });
      setReplyInput('');
      setReplyImage(null);
      setReplyImagePreview(null);
      // Refresh messages
      const response = await api.get(`/api/contact-messages/${selectedConversation.sessionId}`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setReplySending(false);
    }
  };

  const handleDeleteConversation = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.delete(`/api/contact-messages/${sessionId}`);
      setConversations(conversations.filter(c => c.sessionId !== sessionId));
      if (selectedConversation?.sessionId === sessionId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-slate-300 bg-white shadow-sm overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Messages
          </h2>
          <p className="text-sm text-blue-100 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="divide-y divide-slate-200">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <button
                key={conversation.sessionId}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full text-left p-4 transition-colors hover:bg-slate-50 border-l-4 ${
                  selectedConversation?.sessionId === conversation.sessionId
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-transparent'
                }`}
              >
                <p className="font-semibold text-slate-900 truncate">{conversation.visitorName}</p>
                <p className="text-sm text-slate-600 truncate">{conversation.visitorEmail}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(conversation.lastMessageAt).toLocaleString()}
                </p>
                {conversation.unread && (
                  <div className="mt-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="border-b border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedConversation.visitorName}</h3>
                  <p className="text-sm text-slate-600">{selectedConversation.visitorEmail}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedConversation.visitorEmail}`}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Send email"
                  >
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                  </a>
                  <button
                    onClick={() => handleDeleteConversation(selectedConversation.sessionId)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">No messages yet</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderName = msg.senderName || 
                    (msg.type === 'visitor' ? selectedConversation?.visitorName : 'Support Team');
                  
                  return (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'visitor' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-sm rounded-lg ${
                        msg.type === 'visitor'
                          ? 'bg-blue-100 text-slate-900 rounded-bl-none'
                          : 'bg-green-100 text-slate-900 rounded-br-none'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-600 mb-2 px-4 pt-2">
                        {senderName}
                        <span className="text-slate-500 ml-2">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </p>
                      {msg.image && msg.image.length > 0 && (
                        <div className="px-4 pb-2">
                          <img 
                            src={msg.image} 
                            alt="message" 
                            className="max-w-xs max-h-48 rounded-lg object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {msg.text && msg.text !== '📷 Image' && (
                        <p className="text-sm break-words px-4 pb-3">{msg.text}</p>
                      )}
                      {msg.text === '📷 Image' && !msg.image && (
                        <p className="text-sm break-words px-4 pb-3">{msg.text}</p>
                      )}
                    </div>
                  </div>
                  );
                })
                )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="border-t border-slate-300 p-4 bg-white shadow-lg">
              {replyImagePreview && (
                <div className="relative mb-3 rounded-lg overflow-hidden border-2 border-blue-300 max-w-xs">
                  <img src={replyImagePreview} alt="preview" className="w-full max-h-32 object-cover" />
                  <button
                    onClick={() => {
                      setReplyImage(null);
                      setReplyImagePreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60"
                  disabled={replySending}
                />
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors flex items-center">
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={replySending}
                  />
                </label>
                <button
                  onClick={handleSendReply}
                  disabled={(!replyInput.trim() && !replyImage) || replySending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {replySending ? 'Sending...' : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold">Select a conversation to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
