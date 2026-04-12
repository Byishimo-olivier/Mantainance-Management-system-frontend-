import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Phone, Mail, Send, Image as ImageIcon, Paperclip } from 'lucide-react';
import api from '../api/axios';

const ContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'chat'
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Hello! Thank you for reaching out. How can our support team help you today?', senderName: 'Support Bot' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showVisitorForm, setShowVisitorForm] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Generate or get session ID
  useEffect(() => {
    let id = localStorage.getItem('contactWidgetSessionId');
    if (!id) {
      id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('contactWidgetSessionId', id);
    }
    setSessionId(id);
  }, []);

  const contactInfo = {
    displayEmail: 'support@fixnest.com',
    actualEmail: 'byishimo034@gmail.com',
    phone: '+250 783 227 490',
    hours: 'Available 24/7'
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // base64
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!chatInput.trim() && !selectedImage) || !visitorName.trim() || !visitorEmail.trim()) {
      alert('Please provide your name, email, and a message or image.');
      return;
    }

    const userMessage = chatInput || '📷 Image';
    setChatMessages(prev => [...prev, { 
      type: 'user', 
      text: userMessage,
      image: imagePreview
    }]);
    setChatInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsSending(true);

    try {
      // Send message to backend
      await api.post('/api/contact-messages', {
        sessionId,
        visitorName,
        visitorEmail,
        message: userMessage,
        image: selectedImage, // base64 image
        timestamp: new Date().toISOString()
      });

      // Show bot response
      setChatMessages(prev => [...prev, 
        { 
          type: 'bot', 
          text: 'Thanks for your message! A support team member will respond shortly. In the meantime, you can also reach us at ' + contactInfo.displayEmail,
          senderName: 'Support Bot'
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, 
        { 
          type: 'bot', 
          text: 'Sorry, there was an error sending your message. Please try again or email us at ' + contactInfo.displayEmail,
          senderName: 'Support Bot'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Contact Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-2xl transition-shadow flex items-center justify-center"
        style={{ boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)' }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Contact Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Us
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActiveTab('contact');
                  }}
                  className="p-2 hover:bg-blue-500/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 py-3 px-4 font-semibold text-center transition-colors ${
                    activeTab === 'contact'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Contact Info
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 px-4 font-semibold text-center transition-colors ${
                    activeTab === 'chat'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Chat
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Contact Info Tab */}
                {activeTab === 'contact' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <p className="text-slate-600 text-sm">
                        Get in touch with our support team. We're here to help!
                      </p>
                    </div>

                    {/* Email */}
                    <a
                      href={`mailto:${contactInfo.actualEmail}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                        <p className="text-slate-900 font-semibold truncate">{contactInfo.displayEmail}</p>
                      </div>
                    </a>

                    {/* Phone */}
                    <a
                      href={`tel:${contactInfo.phone.replace(/[\s\-()]/g, '')}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                        <p className="text-slate-900 font-semibold">{contactInfo.phone}</p>
                      </div>
                    </a>

                    {/* Hours */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-600 uppercase">Support Hours</p>
                        <p className="text-slate-900 font-semibold">{contactInfo.hours}</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Start Live Chat
                    </button>
                  </motion.div>
                )}

                {/* Live Chat Tab */}
                {activeTab === 'chat' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-[400px]"
                  >
                    {showVisitorForm ? (
                      // Visitor Info Form
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                          <input
                            type="text"
                            value={visitorName}
                            onChange={(e) => setVisitorName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Email</label>
                          <input
                            type="email"
                            value={visitorEmail}
                            onChange={(e) => setVisitorEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 text-sm"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (visitorName.trim() && visitorEmail.trim()) {
                              setShowVisitorForm(false);
                            } else {
                              alert('Please fill in all fields');
                            }
                          }}
                          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Chat
                        </button>
                      </div>
                    ) : (
                      // Chat Interface
                      <>
                        <div className="mb-2 pb-2 border-b border-slate-200">
                          <p className="text-xs text-slate-500">Chatting as <span className="font-semibold text-slate-700">{visitorName}</span></p>
                        </div>
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
                          {chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs ${
                                  msg.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-lg rounded-br-none'
                                    : 'bg-slate-100 text-slate-900 rounded-lg rounded-bl-none'
                                }`}
                              >
                                {msg.image && (
                                  <div className="mb-2 rounded">
                                    <img src={msg.image} alt="message" className="max-w-xs max-h-48 rounded-lg object-cover" />
                                  </div>
                                )}
                                <p className="text-sm px-4 py-2">{msg.text}</p>
                              </div>
                            </div>
                          ))}
                          {isSending && (
                            <div className="flex justify-start">
                              <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none">
                                <div className="flex gap-1">
                                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="relative mb-3 rounded-lg overflow-hidden border-2 border-blue-300">
                            <img src={imagePreview} alt="preview" className="w-full max-h-32 object-cover" />
                            <button
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Input */}
                        <div className="flex gap-2">
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Type your message..."
                              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 text-sm"
                              disabled={isSending}
                            />
                            <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center">
                              <ImageIcon className="w-4 h-4 text-slate-600" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={isSending}
                              />
                            </label>
                          </div>
                          <button
                            onClick={handleSendMessage}
                            disabled={(!chatInput.trim() && !selectedImage) || isSending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactWidget;
