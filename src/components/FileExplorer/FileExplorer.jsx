import { useState, useEffect, useRef } from 'react';
import { playKeySound, playEnterSound } from '../../utils/sounds';
import { getFileContent, getFileStructure, getFileType, getFileName } from '../../utils/fileSystem';
import './FileExplorer.css';

const FileExplorer = ({ isOpen, onClose, onFileSelect, onOpenEditor, fileSystemVersion }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState(['~']);
  const [fileStructure, setFileStructure] = useState([]);
  const explorerRef = useRef(null);

  // Load file structure when opened or when the filesystem updates
  useEffect(() => {
    if (isOpen) {
      setFileStructure(getFileStructure());
    }
  }, [isOpen, fileSystemVersion]);

  // Get visible files based on expanded folders
  const getVisibleFiles = () => {
    return fileStructure.filter(item => {
      // always include root
      if (item.level === 0) return true;

      // show item if its parent folder is expanded
      if (item.parent && expandedFolders.includes(item.parent)) return true;

      // for top-level children (parent === '~'), show when root is expanded
      if (item.parent === '~' && expandedFolders.includes('~')) return true;

      return false;
    });
  };

  const visibleFiles = getVisibleFiles();

  // Ensure selectedIndex stays within bounds when items change
  useEffect(() => {
    setSelectedIndex(prev => Math.min(prev, Math.max(0, visibleFiles.length - 1)));
  }, [visibleFiles.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          playKeySound();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          playKeySound();
          setSelectedIndex(prev => Math.min(visibleFiles.length - 1, prev + 1));
          break;
        case 'Enter':
        case 'l':
          e.preventDefault();
          playEnterSound();
          handleSelect(visibleFiles[selectedIndex]);
          break;
        case 'h':
        case 'Backspace':
          e.preventDefault();
          playKeySound();
          // Collapse current folder or go up
          const currentItem = visibleFiles[selectedIndex];
          if (currentItem && currentItem.type === 'folder' && expandedFolders.includes(currentItem.path)) {
            setExpandedFolders(prev => prev.filter(p => p !== currentItem.path));
          }
          break;
        case 'Escape':
        case 'q':
          e.preventDefault();
          playKeySound();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, visibleFiles, expandedFolders]);

  // Reset selection when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    if (!item) return;
    
    if (item.type === 'folder') {
      // Toggle folder expansion
      if (expandedFolders.includes(item.path)) {
        setExpandedFolders(prev => prev.filter(p => p !== item.path && !p.startsWith(item.path + '/')));
      } else {
        setExpandedFolders(prev => [...prev, item.path]);
      }
    } else {
      // Open file in nvim editor
      const content = getFileContent(item.path);
      const fileData = {
        name: item.name,
        path: item.path,
        type: item.fileType || getFileType(item.name),
        isUserCreated: item.isUserCreated
      };
      onOpenEditor(fileData, content || '');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="file-explorer-overlay" onClick={onClose}>
      <div className="file-explorer" ref={explorerRef} onClick={e => e.stopPropagation()}>
        <div className="file-explorer-header">
          <span className="file-explorer-title">netrw</span>
          <span className="file-explorer-path">~</span>
        </div>
        
        <div className="file-explorer-help">
          <span>" ============================================</span>
          <span>" netrw v1.0 - Portfolio File Browser</span>
          <span>" Press ? for help, q to quit</span>
          <span>" ============================================</span>
        </div>

        <div className="file-explorer-content">
          <div className="file-explorer-banner">
            <span>"   Quick Help: &lt;CR&gt;:open  j/k:navigate  q:quit</span>
          </div>
          
          <div className="file-explorer-sorted">
            <span>" Sorted by: name</span>
          </div>

          {visibleFiles.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isExpanded = item.type === 'folder' && expandedFolders.includes(item.path);
            const indent = '  '.repeat(item.level);
            
            let icon = '';
            if (item.type === 'folder') {
              icon = isExpanded ? '▼ ' : '▶ ';
            } else {
              icon = '  ';
            }

            let displayName = item.name;

            return (
              <div
                key={item.path}
                className={`file-explorer-item ${isSelected ? 'selected' : ''} ${item.type} ${item.isUserCreated ? 'user-created' : ''}`}
                onClick={() => {
                  setSelectedIndex(index);
                  handleSelect(item);
                }}
              >
                <span className="file-line-number">{String(index + 1).padStart(3, ' ')} </span>
                <span className="file-content">
                  {indent}{icon}{displayName}
                  {item.isUserCreated && <span className="new-badge"> [new]</span>}
                </span>
              </div>
            );
          })}
        </div>

        <div className="file-explorer-footer">
          <span className="file-explorer-mode">-- NETRW --</span>
          <span className="file-explorer-info">{visibleFiles.length} items</span>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
