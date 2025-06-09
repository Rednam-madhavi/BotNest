import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

import botSticker from './assets/bot.gif';     
import userAvatar from './assets/user.png';
import wallpaper from './assets/wallpaper.jpg';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const API = import.meta.env.VITE_API_BASE_URL;
  const chatRef = useRef(null);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, { message: input });
      const botMessage = { sender: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Oops! Something went wrong' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Fullscreen Wallpaper */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${wallpaper})` }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition">
        
        {/* Header */}
        <header className="bg-indigo-700 dark:bg-indigo-800 text-white py-4 shadow-md flex justify-between items-center px-6">
          <h1 className="text-xl font-semibold">🤖 BotNest</h1>
          <button
            onClick={toggleTheme}
            className="text-indigo-700 dark:text-white px-3 py-1 rounded shadow text-sm"
          >
            {darkMode ? <FaSun className="text-yellow-400" size={28} /> : <FaMoon className="text-gray-200" size={28} />}
          </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 max-w-2xl mx-auto w-full p-4">
          <div
            ref={chatRef}
            className="relative z-10 h-[70vh] overflow-y-auto border bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-xs ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={msg.sender === 'bot' ? botSticker : userAvatar}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full"
                  />
                  <div
                    className={`px-4 py-2 rounded-xl break-words ${
                      msg.sender === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-left mt-2">
                Bot is typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-4 sticky bottom-0 bg-gray-100 dark:bg-gray-900 flex gap-2 z-20">
            <input
              type="text"
              className="flex-1 border rounded-lg px-4 py-2 shadow-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
