// Virtual file system for the portfolio terminal

// Default file contents
const defaultFiles = {
  '~/about.txt': `Jayesh Channe
Software Engineer

Email: jayeshchanne9@gmail.com
LinkedIn: linkedin.com/in/jayeshchanne
GitHub: github.com/Jayesh242663

Professional Summary
Results-driven software engineer with 3+ years of learning experience in developing scalable web and desktop applications. Strong background in full-stack development, data structures, and system design. Comfortable collaborating across teams to deliver user-centric, high-quality solutions.

Education
- Vidya Niketan — SSC (2008 – 2020)
- Royal Junior College — HSC in Science (2020 – 2022)
- Mumbai University — BS in Information Technology (2022 – 2027)

Skills
- Programming: Python, JavaScript, C, Java
- Web: HTML, CSS, React, Node.js, Express.js
- Tools: Git, GitHub, Wireshark, Burp Suite
- Databases: MySQL, MongoDB, PostgreSQL
`,

  '~/project.txt': `Retro Portfolio Terminal

This is a retro CRT-styled portfolio website built with React and Vite. It simulates an old-school computer terminal with realistic CRT effects including scanlines, screen curvature, and phosphor glow.

Features:
- Interactive terminal with Linux-like commands
- Realistic CRT monitor visual effects
- In-memory virtual file system
- Nvim-style text editor
- Multiple color themes (amber/green)
- Retro boot sequence animation

Technologies Used:
- React + Vite
- CSS animations for CRT effects
- Web Audio API for sound effects

Commands: Type 'help' for available commands.
`,

  '~/readme.txt': `Retro Portfolio Terminal

Welcome to my retro-styled portfolio!

Commands:
- help     — Show available commands
- about    — Display info about me
- projects — List my projects
- contact  — Get contact info
- theme    — Toggle amber/green theme
- ls       — List files
- cat      — Read file contents

Explore the terminal to learn more about me and my work!
`,

  '~/resume.txt': `Jayesh Channe

Email: jayeshchanne9@gmail.com
LinkedIn: linkedin.com/in/jayeshchanne
GitHub: github.com/Jayesh242663

---

Professional Summary

Results-driven software engineer with 3+ years of learning experience in developing scalable web and desktop applications. Strong background in full-stack development, data structures, and system design. Comfortable collaborating across teams to deliver user-centric, high-quality solutions.

Education

- Vidya Niketan — SSC (2008 – 2020)
- Royal Junior College — HSC in Science (2020 – 2022)
- Mumbai University — BS in Information Technology (2022 – 2027)

Skills

- Programming Languages: Python, JavaScript, C, Java
- Web Development: HTML, CSS, React, Node.js, Express.js
- Tools & Technologies: Git, GitHub, Wireshark, Burp Suite
- Databases: MySQL, MongoDB, PostgreSQL
- Soft Skills: Teamwork, Communication, Problem-Solving, Time Management

Projects

Bank Management System
Simulates fundamental banking operations, allowing users to manage accounts, perform transactions, and view account details. Initially developed in Java, later rebuilt in Python with MySQL integration.
Tools: Python, MySQL

Workspace Management System
Platform to manage employee information, assign tasks, and track project progress to improve team productivity.
Tools: Python, MySQL

Secure Pass (Under Development)
Web application to securely store passwords, perform security diagnostics, and monitor data breaches with real-time alerts.
Tools: React, Python, PostgreSQL

Certifications

- 100 Days of Code: The Complete Python Pro Boot Camp — Udemy
- The Complete 2024 Web Development Boot Camp — Udemy
`,
};

// In-memory file storage (starts with default files)
let fileStorage = { ...defaultFiles };

// File metadata (for tracking user-created files)
let userCreatedFiles = [];

// Track user-created directories
let userCreatedDirs = [];

// Get all files
export const getFiles = () => {
  return { ...fileStorage };
};

// Get file content
export const getFileContent = (path) => {
  // Normalize path
  const normalizedPath = normalizePath(path);
  return fileStorage[normalizedPath] || null;
};

// Check if file exists
export const fileExists = (path) => {
  const normalizedPath = normalizePath(path);
  return normalizedPath in fileStorage;
};

// Create or update a file
export const saveFile = (path, content) => {
  const normalizedPath = normalizePath(path);
  const isNew = !fileStorage[normalizedPath];
  
  // Ensure parent directories exist
  const parentDir = getDirectory(normalizedPath);
  if (parentDir && parentDir !== '~') {
    // Create parent directory chain if needed
    const parts = parentDir.split('/');
    let current = parts[0]; // '~'
    for (let i = 1; i < parts.length; i++) {
      current = current + '/' + parts[i];
      if (!userCreatedDirs.includes(current)) {
        userCreatedDirs.push(current);
      }
    }
  }
  
  fileStorage[normalizedPath] = content;
  
  if (isNew && !userCreatedFiles.includes(normalizedPath)) {
    userCreatedFiles.push(normalizedPath);
  }
  
  return { success: true, isNew, path: normalizedPath };
};

// Create new empty file
export const createFile = (path) => {
  const normalizedPath = normalizePath(path);
  if (fileStorage[normalizedPath]) {
    return { success: false, error: 'File already exists' };
  }
  
  fileStorage[normalizedPath] = '';
  userCreatedFiles.push(normalizedPath);
  
  return { success: true, path: normalizedPath };
};

// Delete a file
export const deleteFile = (path) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) {
    return { success: false, error: 'File not found' };
  }

  // Move single file to trash instead of permanent deletion
  const trashRoot = '~/.trash';
  if (!directoryExists(trashRoot)) createDirectory(trashRoot);

  const timestamp = Date.now().toString();
  const trashPrefix = `${trashRoot}/${timestamp}`;
  createDirectory(trashPrefix);

  const rel = normalizedPath.startsWith('~/') ? normalizedPath.slice(2) : normalizedPath.replace(/^~\/?/, '');
  const newPath = `${trashPrefix}/${rel}`;

  // ensure parent dir exists in trash
  const newParent = getDirectory(newPath);
  createDirectory(newParent);

  fileStorage[newPath] = fileStorage[normalizedPath];
  if (!userCreatedFiles.includes(newPath)) userCreatedFiles.push(newPath);

  // remove original
  delete fileStorage[normalizedPath];
  userCreatedFiles = userCreatedFiles.filter(f => f !== normalizedPath);

  return { success: true, trashPath: newPath };
};

// Delete a directory and its contents (recursive)
export const deleteDirectory = (path) => {
  const normalizedPath = normalizePath(path);

  // Prevent removing root
  if (normalizedPath === '~') {
    return { success: false, error: 'Refusing to remove root directory' };
  }

  // If directory doesn't exist, return error
  if (!directoryExists(normalizedPath)) {
    return { success: false, error: 'Directory not found' };
  }

  // Ensure trash exists
  const trashRoot = '~/.trash';
  if (!directoryExists(trashRoot)) {
    createDirectory(trashRoot);
  }

  const timestamp = Date.now().toString();
  const trashPrefix = `${trashRoot}/${timestamp}`;
  createDirectory(trashPrefix);

  // Move all files under this directory to trashPrefix preserving relative paths
  Object.keys(fileStorage).forEach(fp => {
    if (fp === normalizedPath || fp.startsWith(normalizedPath + '/')) {
      // compute relative path without leading '~/'
      const rel = fp.startsWith('~/') ? fp.slice(2) : fp.replace(/^~\/?/, '');
      const newPath = `${trashPrefix}/${rel}`;

      // Ensure parent dirs for newPath exist in userCreatedDirs
      const newParent = getDirectory(newPath);
      createDirectory(newParent);

      // move content
      fileStorage[newPath] = fileStorage[fp];
      // mark as user-created in trash
      if (!userCreatedFiles.includes(newPath)) userCreatedFiles.push(newPath);

      // remove original
      delete fileStorage[fp];
      userCreatedFiles = userCreatedFiles.filter(f => f !== fp);
    }
  });

  // Remove user-created directories that are this dir or subdirs
  userCreatedDirs = userCreatedDirs.filter(d => !(d === normalizedPath || d.startsWith(normalizedPath + '/')));

  return { success: true, trashPath: trashPrefix };
};

// Create a directory
export const createDirectory = (path) => {
  const normalizedPath = normalizePath(path);

  // If a file exists at this path, cannot create directory
  if (fileStorage[normalizedPath]) {
    return { success: false, error: 'A file with this name already exists' };
  }

  // Create parent directories as needed (idempotent)
  const parts = normalizedPath.split('/');
  let current = parts[0]; // '~'
  for (let i = 1; i < parts.length; i++) {
    current = current + '/' + parts[i];
    if (!userCreatedDirs.includes(current)) {
      userCreatedDirs.push(current);
    }
  }

  return { success: true, path: normalizedPath };
};

// Check if directory exists
export const directoryExists = (path) => {
  const normalizedPath = normalizePath(path);
  
  // Check user-created dirs
  if (userCreatedDirs.includes(normalizedPath)) {
    return true;
  }
  
  // Check if any files exist in this directory
  return Object.keys(fileStorage).some(filePath => {
    const dir = getDirectory(filePath);
    return dir === normalizedPath || dir.startsWith(normalizedPath + '/');
  });
};

// Get user-created directories
export const getUserDirs = () => {
  return [...userCreatedDirs];
};

// Get user-created files
export const getUserFiles = () => {
  return [...userCreatedFiles];
};

// Rename/move a file
export const moveFile = (oldPath, newPath) => {
  const normalizedOld = normalizePath(oldPath);
  const normalizedNew = normalizePath(newPath);
  
  if (!fileStorage[normalizedOld]) {
    return { success: false, error: 'Source file not found' };
  }
  
  if (fileStorage[normalizedNew]) {
    return { success: false, error: 'Destination file already exists' };
  }
  
  fileStorage[normalizedNew] = fileStorage[normalizedOld];
  delete fileStorage[normalizedOld];
  
  // Update user-created tracking
  if (userCreatedFiles.includes(normalizedOld)) {
    userCreatedFiles = userCreatedFiles.filter(f => f !== normalizedOld);
    userCreatedFiles.push(normalizedNew);
  }
  
  return { success: true };
};

// Copy a file
export const copyFile = (srcPath, destPath) => {
  const normalizedSrc = normalizePath(srcPath);
  const normalizedDest = normalizePath(destPath);
  
  if (!fileStorage[normalizedSrc]) {
    return { success: false, error: 'Source file not found' };
  }
  
  fileStorage[normalizedDest] = fileStorage[normalizedSrc];
  userCreatedFiles.push(normalizedDest);
  
  return { success: true };
};

// Get file size (simulated - character count)
export const getFileSize = (path) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) return null;
  return fileStorage[normalizedPath].length;
};

// Count lines in a file
export const countLines = (path) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) return null;
  const content = fileStorage[normalizedPath];
  if (content === '') return 0;
  return content.split('\n').length;
};

// Count words in a file
export const countWords = (path) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) return null;
  const content = fileStorage[normalizedPath];
  if (content.trim() === '') return 0;
  return content.trim().split(/\s+/).length;
};

// Search for pattern in file (grep)
export const searchInFile = (path, pattern) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) return null;
  
  const content = fileStorage[normalizedPath];
  const lines = content.split('\n');
  const matches = [];
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(pattern.toLowerCase())) {
      matches.push({ lineNum: index + 1, content: line });
    }
  });
  
  return matches;
};

// Get head of file (first n lines)
export const getHead = (path, n = 10) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) return null;
  
  const lines = fileStorage[normalizedPath].split('\n');
  return lines.slice(0, n).join('\n');
};

// Get tail of file (last n lines)
export const getTail = (path, n = 10) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) return null;
  
  const lines = fileStorage[normalizedPath].split('\n');
  return lines.slice(-n).join('\n');
};

// Append to file
export const appendToFile = (path, content) => {
  const normalizedPath = normalizePath(path);
  if (!fileStorage[normalizedPath]) {
    fileStorage[normalizedPath] = content;
    userCreatedFiles.push(normalizedPath);
  } else {
    fileStorage[normalizedPath] += '\n' + content;
  }
  return { success: true };
};

// Normalize file path
export const normalizePath = (path) => {
  let normalized = path.trim();
  
  // Handle relative paths
  if (!normalized.startsWith('~') && !normalized.startsWith('/')) {
    normalized = '~/' + normalized;
  }
  
  // Remove double slashes
  normalized = normalized.replace(/\/+/g, '/');
  
  // Remove trailing slash
  if (normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
};

// Get file type from extension
export const getFileType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap = {
    'txt': 'text',
    'md': 'markdown',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'conf': 'config',
    'cfg': 'config',
    'log': 'log',
    'dat': 'data',
    'sh': 'shell',
    'bash': 'shell',
  };
  return typeMap[ext] || 'text';
};

// Get filename from path
export const getFileName = (path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

// Get directory from path
export const getDirectory = (path) => {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '~';
};

// List files in a directory
export const listFiles = (directory = '~') => {
  const normalizedDir = normalizePath(directory);
  const files = [];
  const addedDirs = new Set();
  
  // Add user-created directories in this directory
  userCreatedDirs.forEach(dir => {
    const parentDir = getDirectory(dir);
    if (parentDir === normalizedDir) {
      const dirName = getFileName(dir);
      if (!addedDirs.has(dirName)) {
        addedDirs.add(dirName);
        files.push({
          name: dirName + '/',
          path: dir,
          type: 'directory',
          isUserCreated: true,
          isDirectory: true
        });
      }
    }
  });
  
  // Add files and directories from file paths
  Object.keys(fileStorage).forEach(path => {
    const dir = getDirectory(path);
    
    // Direct children files
    if (dir === normalizedDir) {
      files.push({
        name: getFileName(path),
        path: path,
        type: getFileType(getFileName(path)),
        isUserCreated: userCreatedFiles.includes(path),
        isDirectory: false
      });
    }
    
    // Child directories (inferred from file paths)
    if (dir.startsWith(normalizedDir + '/')) {
      const relativePath = dir.slice(normalizedDir.length + 1);
      const immediateChild = relativePath.split('/')[0];
      if (immediateChild && !addedDirs.has(immediateChild)) {
        addedDirs.add(immediateChild);
        files.push({
          name: immediateChild + '/',
          path: normalizedDir + '/' + immediateChild,
          type: 'directory',
          isUserCreated: false,
          isDirectory: true
        });
      }
    }
  });
  
  // Sort: directories first, then files alphabetically
  files.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  
  return files;
};

// Get all files as a flat structure for the file explorer
export const getFileStructure = () => {
  // Build a hierarchical tree so folders have their immediate children
  const nodes = {};

  // Helper to ensure a node exists
  const ensureNode = (path, props = {}) => {
    if (!nodes[path]) {
      nodes[path] = {
        path,
        name: props.name || (path === '~' ? '~' : path.split('/').pop() + (props.isDirectory ? '/' : '')),
        type: props.type || (props.isDirectory ? 'folder' : 'file'),
        children: [],
        parent: props.parent || null,
        isUserCreated: !!props.isUserCreated,
      };
    }
    return nodes[path];
  };

  // Root
  ensureNode('~', { name: '~', type: 'folder', isDirectory: true });

  // Collect directories from userCreatedDirs and inferred from file paths
  const directories = new Set(userCreatedDirs);
  Object.keys(fileStorage).forEach(path => {
    const parts = path.split('/');
    // build intermediate directories
    let current = parts[0];
    for (let i = 1; i < parts.length - 1; i++) {
      current = current + '/' + parts[i];
      directories.add(current);
    }
  });

  // Create directory nodes
  Array.from(directories).sort().forEach(dir => {
    if (dir === '~') return;
    const parts = dir.split('/');
    const parent = parts.slice(0, -1).join('/') || '~';
    ensureNode(dir, { name: parts[parts.length - 1] + '/', type: 'folder', isDirectory: true, parent, isUserCreated: userCreatedDirs.includes(dir) });
  });

  // Create file nodes and attach to parent
  Object.keys(fileStorage).forEach(path => {
    const parts = path.split('/');
    const parent = parts.slice(0, -1).join('/') || '~';
    const name = parts[parts.length - 1];
    const node = ensureNode(path, { name, type: 'file', isDirectory: false, parent, isUserCreated: userCreatedFiles.includes(path) });
    // attach to parent
    const parentNode = ensureNode(parent, { isDirectory: true });
    parentNode.children.push(node);
  });

  // Attach directory nodes to their parents
  Object.keys(nodes).forEach(path => {
    const node = nodes[path];
    if (!node.parent && path !== '~') {
      const parts = path.split('/');
      node.parent = parts.slice(0, -1).join('/') || '~';
    }
    if (node.parent) {
      const p = ensureNode(node.parent, { isDirectory: true });
      // avoid duplicates
      if (!p.children.includes(node)) p.children.push(node);
    }
  });

  // Now traverse the tree depth-first to produce a flat list with levels
  const result = [];
  const traverse = (nodePath, level = 0) => {
    const node = nodes[nodePath];
    if (!node) return;
    // push a folder node representation
    result.push({
      name: node.name,
      type: node.type === 'folder' ? 'folder' : (node.type === 'file' ? 'file' : node.type),
      level,
      path: node.path,
      parent: node.parent || null,
      isUserCreated: node.isUserCreated,
      fileType: node.type === 'file' ? getFileType(node.name) : undefined,
      isDirectory: node.type === 'folder',
    });

    // sort children: folders first then files, alphabetically
    const folders = node.children.filter(c => c.type === 'folder').sort((a, b) => a.name.localeCompare(b.name));
    const files = node.children.filter(c => c.type !== 'folder').sort((a, b) => a.name.localeCompare(b.name));

    folders.concat(files).forEach(child => {
      traverse(child.path, level + 1);
    });
  };

  traverse('~', 0);

  return result;
};

// Reset to default files
export const resetFileSystem = () => {
  fileStorage = { ...defaultFiles };
  userCreatedFiles = [];
  userCreatedDirs = [];
};

export default {
  getFiles,
  getFileContent,
  fileExists,
  saveFile,
  createFile,
  deleteFile,
  createDirectory,
  directoryExists,
  deleteDirectory,
  getUserFiles,
  getUserDirs,
  moveFile,
  copyFile,
  getFileSize,
  countLines,
  countWords,
  searchInFile,
  getHead,
  getTail,
  appendToFile,
  normalizePath,
  getFileType,
  getFileName,
  getDirectory,
  listFiles,
  getFileStructure,
  resetFileSystem,
};
