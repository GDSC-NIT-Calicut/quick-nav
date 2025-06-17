import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

const normalizeUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

interface Shortcuts {
  [key: string]: string;
}

interface Groups {
  [key: string]: string[];
}

const App = () => {
  const [shortcuts, setShortcuts] = useState<Shortcuts>({});
  const [groups, setGroups] = useState<Groups>({});
  const [abbr, setAbbr] = useState('');
  const [url, setUrl] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [expandedShortcut, setExpandedShortcut] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);
  const [groupDropArea, setGroupDropArea] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.sync.get(['shortcuts', 'groups'], (data) => {
      setShortcuts(data.shortcuts || {});
      setGroups(data.groups || {});
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
      if (expandedShortcut === key) setExpandedShortcut(null);
    });
  };

  const saveGroup = () => {
    if (!groupName || groupDropArea.length === 0) return;
    const newGroups = { ...groups, [groupName]: groupDropArea };
    chrome.storage.sync.set({ groups: newGroups }, () => {
      setGroups(newGroups);
      setGroupName('');
      setGroupDropArea([]);
      setShowGroupForm(false);
    });
  };

  const deleteGroup = (key: string) => {
    const newGroups = { ...groups };
    delete newGroups[key];
    chrome.storage.sync.set({ groups: newGroups }, () => {
      setGroups(newGroups);
    });
  };

  const onClickEdit = (key: string) => {
    setEditing(key);
    setAbbr(key);
    setUrl(shortcuts[key].replace(/^https?:\/\//i, ''));
  };

  const onShortcutClick = (key: string) => {
    setExpandedShortcut(expandedShortcut === key ? null : key);
  };

  const onDragStart = (key: string) => {
    setDragging(key);
  };

  const onDragEnd = () => {
    setDragging(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragging && !groupDropArea.includes(dragging)) {
      setGroupDropArea([...groupDropArea, dragging]);
    }
  };

  const removeFromGroupDrop = (key: string) => {
    setGroupDropArea(groupDropArea.filter(k => k !== key));
  };

  return (
    <div className="p-4 w-[400px] bg-black dark:bg-gray-900 rounded-lg shadow-lg font-sans">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xl font-bold mb-4 text-gray-100"
      >
        QuickNav
      </motion.h2>

      {/* Shortcut Form */}
      <div className="space-y-3 mb-4">
        <motion.input
          type="text"
          placeholder="Shortcut (e.g. nn)"
          value={abbr}
          onChange={(e) => setAbbr(e.target.value)}
          className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
        />
        <motion.input
          type="text"
          placeholder="Target URL (e.g. notion.new or https://notion.new)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
        />
        <motion.button
          onClick={saveShortcut}
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors"
        >
          {editing ? 'Update Shortcut' : 'Save Shortcut'}
        </motion.button>
      </div>

      {/* Shortcut Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(shortcuts).map(([key, val]) => (
          <div
            key={key}
            draggable
            onDragStart={() => onDragStart(key)}
            onDragEnd={onDragEnd}
            className={`relative ${expandedShortcut === key ? 'min-w-full' : 'max-w-[120px]'} transition-all`}
          >
            <div
              onClick={() => onShortcutClick(key)}
              className={`flex items-center justify-between p-2 rounded bg-gray-800 text-gray-100 hover:bg-gray-700 cursor-pointer ${expandedShortcut === key ? 'w-full' : 'w-auto'}`}
              title={val}
            >
              <span className="truncate">{key}</span>
              {expandedShortcut === key && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickEdit(key);
                    }}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteShortcut(key);
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {expandedShortcut === key && (
              <div className="mt-1 p-2 rounded bg-gray-700 text-gray-300 text-sm break-all">
                {val}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Group Button */}
      <motion.button
        onClick={() => setShowGroupForm(!showGroupForm)}
        className="flex items-center gap-1 w-full p-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors mb-4"
      >
        <PlusIcon className="w-4 h-4" />
        {showGroupForm ? 'Cancel Group Creation' : 'Create Group'}
      </motion.button>

      {/* Group Drop Area */}
      {showGroupForm && (
        <div className="space-y-3 mb-4">
          <motion.input
            type="text"
            placeholder="Group name (e.g. :work)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="min-h-16 p-3 rounded border-2 border-dashed border-gray-600 bg-gray-900"
          >
            <p className="text-gray-400 mb-2">Drag shortcuts here to add to group</p>
            <div className="flex flex-wrap gap-2">
              {groupDropArea.map(key => (
                <div
                  key={key}
                  className="flex items-center gap-1 p-2 rounded bg-gray-800 text-gray-100"
                >
                  <span>{key}</span>
                  <button
                    onClick={() => removeFromGroupDrop(key)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Remove"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <motion.button
            onClick={saveGroup}
            className="w-full p-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded transition-colors"
            disabled={groupDropArea.length === 0 || !groupName}
          >
            Save Group
          </motion.button>
        </div>
      )}

      {/* Groups List */}
      <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-100">Groups</h3>
      <ul className="space-y-2">
        <AnimatePresence>
          {Object.entries(groups).map(([key, val]) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-2 rounded bg-gray-800"
            >
              <span className="text-gray-100">
                <span className="px-1 bg-gray-700 text-gray-100 rounded-sm">{key}</span>: {val.join(' ')}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => deleteGroup(key)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  aria-label="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default App;
