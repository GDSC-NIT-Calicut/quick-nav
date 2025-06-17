import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const normalizeUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

const App = () => {
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [abbr, setAbbr] = useState('');
  const [url, setUrl] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.sync.get('shortcuts', (data) => {
      setShortcuts(data.shortcuts || {});
    });
  }, []);

  const saveShortcut = () => {
    if (!abbr || !url) return;
    const newShortcuts = { ...shortcuts, [abbr]: normalizeUrl(url) };
    chrome.storage.sync.set({ shortcuts: newShortcuts }, () => {
      setShortcuts(newShortcuts);
      setAbbr('');
      setUrl('');
      setEditing(null);
    });
  };

  const deleteShortcut = (key: string) => {
    const newShortcuts = { ...shortcuts };
    delete newShortcuts[key];
    chrome.storage.sync.set({ shortcuts: newShortcuts }, () => {
      setShortcuts(newShortcuts);
      if (editing === key) setEditing(null);
    });
  };

  const onClickEdit = (key: string) => {
    setEditing(key);
    setAbbr(key);
    setUrl(shortcuts[key].replace(/^https?:\/\//i, ''));
  };

  return (
    <div className="p-4 w-[300px] bg-white dark:bg-gray-900 rounded-lg shadow-lg font-sans">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
      >
        QuickNav
      </motion.h2>
      <div className="space-y-3 mb-4">
        <motion.input
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          type="text"
          placeholder="Shortcut (e.g. nn)"
          value={abbr}
          onChange={(e) => setAbbr(e.target.value)}
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <motion.input
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          type="text"
          placeholder="Target URL (e.g. notion.new or https://notion.new)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
          onClick={saveShortcut}
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors"
        >
          {editing ? 'Update Shortcut' : 'Save Shortcut'}
        </motion.button>
      </div>
      <ul className="space-y-2">
        <AnimatePresence>
          {Object.entries(shortcuts).map(([key, val]) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-gray-800"
            >
              <span className="text-gray-900 dark:text-white">
                <span className="px-1 bg-white text-black rounded-sm">{key}</span>: {val}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onClickEdit(key)}
                  className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  aria-label="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteShortcut(key)}
                  className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </
