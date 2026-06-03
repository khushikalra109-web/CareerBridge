import { useEffect, useState } from 'react';
import { MessageCircle, Send, Users } from 'lucide-react';
import { fetchChats, fetchChatMessages, fetchContacts, sendMessage } from '../services/chatService';
import Loader from '../components/Loader';

function Chat({ user, showToast }) {
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const currentUserId = user?._id || user?.id;

  const loadChats = async () => {
    setLoading(true);
    try {
      const { data } = await fetchChats();
      setChats(data.chats || []);
      if (!activeChat && data.chats?.length) {
        setActiveChat(data.chats[0]);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load chats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const role = user.role === 'student' ? 'company' : 'student';
      const { data } = await fetchContacts(role);
      setContacts(data.users || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    if (!chatId) return;
    setLoading(true);
    try {
      const { data } = await fetchChatMessages(chatId);
      setMessages(data.chat.messages || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadChats();
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (activeChat) loadMessages(activeChat._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setSelectedContact(null);
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setActiveChat(null);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageText.trim() || (!activeChat && !selectedContact)) return;

    setSending(true);
    try {
      const payload = activeChat ? { chatId: activeChat._id, text: messageText.trim() } : { recipientId: selectedContact._id, text: messageText.trim() };
      const { data } = await sendMessage(payload);
      setMessages(data.chat.messages || []);
      setActiveChat(data.chat);
      setSelectedContact(null);
      setChats((prev) => {
        const exists = prev.some((chat) => chat._id === data.chat._id);
        if (exists) return prev.map((chat) => (chat._id === data.chat._id ? data.chat : chat));
        return [data.chat, ...prev];
      });
      setMessageText('');
      showToast('Message sent');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const activeUser = activeChat?.participants?.find((member) => member._id !== currentUserId);
  const activeName = selectedContact?.name || activeUser?.name;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-10 text-center shadow-soft">
        <p className="text-lg font-semibold text-slate-900">Loading chat...</p>
        <p className="mt-2 text-slate-500">We are loading your chat session. Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="rounded-3xl bg-sky-100 p-3 text-sky-700">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
            <p className="text-sm text-slate-500">Choose a chat to continue the conversation.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6"><Loader /></div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {chats.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">No conversations yet. Start a chat from the contacts below.</div>
              ) : (
                chats.map((chat) => {
                  const participant = chat.participants.find((member) => member._id !== currentUserId) || chat.participants[0];
                  const isSelected = activeChat?._id === chat._id;
                  return (
                    <button
                      key={chat._id}
                      type="button"
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isSelected ? 'border-sky-600 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{participant?.name || 'Unknown user'}</p>
                          <p className="text-sm text-slate-500">{participant?.role || 'Member'}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">{chat.messages?.length || 0} msgs</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Start a new chat</h2>
                  <p className="text-sm text-slate-500">Pick a contact to message directly.</p>
                </div>
                <span className="text-sm text-slate-500">{contacts.length} contacts</span>
              </div>

              {contacts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">No contacts available yet.</div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => {
                    const isSelected = selectedContact?._id === contact._id;
                    return (
                      <button
                        key={contact._id}
                        type="button"
                        onClick={() => handleSelectContact(contact)}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isSelected ? 'border-sky-600 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{contact.name}</p>
                            <p className="text-sm text-slate-500">{contact.role === 'company' ? contact.name || 'Company' : contact.role}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">Message</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{activeName ? `Chat with ${activeName}` : 'Select a conversation'}</h2>
            <p className="text-sm text-slate-500">Your latest messages appear here.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">{activeChat ? `${messages.length} messages` : selectedContact ? 'New chat selected' : 'No chat selected'}</div>
        </div>

        <div className="mt-6 min-h-[360px] rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          {(activeChat || selectedContact) ? (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
              ) : (
                messages.map((message, index) => {
                  const isMine = message.senderId?._id === currentUserId || message.senderId === currentUserId;
                  return (
                    <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${isMine ? 'bg-sky-600 text-white' : 'bg-white text-slate-900'} shadow-sm`}>
                        <p>{message.text}</p>
                        <p className="mt-2 text-xs text-slate-400">{message.senderId?.name || (isMine ? 'You' : 'Sender')}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Select a conversation on the left to view and send messages.</div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            disabled={!activeChat && !selectedContact}
          />
          <button
            type="submit"
            disabled={!(activeChat || selectedContact) || !messageText.trim() || sending}
            className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} className="inline-block" />
          </button>
        </form>
      </section>
    </div>
  );
}

export default Chat;
