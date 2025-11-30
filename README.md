# 🖥️ Retro CRT Portfolio Terminal

A retro-styled portfolio website that simulates an old-school CRT computer terminal. Built with React and Vite, featuring realistic CRT effects, scanlines, phosphor glow, and an interactive Linux-like terminal.

![Retro Portfolio](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🖥️ CRT Monitor Effects
- Realistic scanlines and screen curvature
- Phosphor glow effect
- Screen flicker and noise
- Power on/off animations with authentic CRT behavior
- Amber and Green theme options

### 💻 Interactive Terminal
- Linux-like command interface
- File system navigation (`ls`, `cd`, `pwd`, `cat`, etc.)
- File operations (`touch`, `mkdir`, `rm`, `mv`, `cp`)
- Text utilities (`grep`, `head`, `tail`, `wc`, `find`)
- Built-in text editor (nvim-style)
- Command history with arrow key navigation

### 🎮 Retro Experience
- Custom pixelated cursor (only visible inside the screen)
- Retro boot sequence animation
- Keyboard sound effects
- CRT ambient hum audio
- Theme switching (amber/green phosphor)

### 📁 Virtual File System
- In-memory file system with default portfolio files
- Create, edit, and delete files
- Directory support
- File explorer GUI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Jayesh242663/Jayesh-Channe.git

# Navigate to project directory
cd Jayesh-Channe

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Available Terminal Commands

### Portfolio Commands
| Command | Description |
|---------|-------------|
| `help` | Show available commands |
| `about` | Display information about me |
| `skills` | List technical skills |
| `projects` | View my projects |
| `experience` | Show work history |
| `contact` | Get contact information |
| `resume` | Display resume |

### File System Commands
| Command | Description |
|---------|-------------|
| `ls [-la]` | List directory contents |
| `cd <dir>` | Change directory |
| `pwd` | Print working directory |
| `cat <file>` | Display file contents |
| `touch <file>` | Create empty file |
| `mkdir [-p] <dir>` | Create directory |
| `rm [-rf] <file>` | Remove file/directory |
| `mv <src> <dest>` | Move/rename file |
| `cp <src> <dest>` | Copy file |
| `nvim <file>` | Edit file in editor |

### Utility Commands
| Command | Description |
|---------|-------------|
| `grep <pattern> <file>` | Search in file |
| `head [-n] <file>` | Show first lines |
| `tail [-n] <file>` | Show last lines |
| `wc [-lwc] <file>` | Count lines/words/chars |
| `find [-name] <pattern>` | Find files |
| `echo <text>` | Print text |
| `history` | Show command history |

### System Commands
| Command | Description |
|---------|-------------|
| `clear` | Clear terminal |
| `theme` | Toggle amber/green theme |
| `sound` | Toggle CRT hum sound |
| `init 0` / `shutdown` | Power off monitor |
| `neofetch` | Display system info |
| `date` | Show current date/time |
| `whoami` | Display current user |

### Fun Commands
| Command | Description |
|---------|-------------|
| `hack` / `matrix` | Fake hacking animation |
| `cowsay <text>` | ASCII cow says text |
| `fortune` | Random fortune quote |
| `coffee` | Get a virtual coffee ☕ |

## 🎨 Themes

Toggle between themes using the `theme` command:
- **Amber** - Classic amber phosphor (default)
- **Green** - Green phosphor terminal

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **Framer Motion** - Animations
- **CSS3** - CRT effects and styling
- **Web Audio API** - Sound effects

## 📁 Project Structure

```
src/
├── components/
│   ├── BootScreen/      # Boot animation
│   ├── CRTMonitor/      # CRT monitor frame
│   ├── FileExplorer/    # GUI file browser
│   ├── NvimEditor/      # Text editor
│   ├── RetroCursor/     # Custom cursor
│   ├── Terminal/        # Main terminal
│   └── ThemeSwitcher/   # Theme toggle
├── content/
│   └── resume.md        # Resume content
├── data/
│   └── portfolio.js     # Portfolio data
├── styles/
│   ├── crt-effects.css  # CRT visual effects
│   └── themes.css       # Color themes
└── utils/
    ├── fileSystem.js    # Virtual file system
    └── sounds.js        # Audio utilities
```

## 👤 Author

**Jayesh Channe**
- GitHub: [@Jayesh242663](https://github.com/Jayesh242663)
- LinkedIn: [jayeshchanne](https://linkedin.com/in/jayeshchanne)
- Email: jayeshchanne9@gmail.com

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by classic CRT terminals and retro computing
- VT323 font for authentic terminal feel
- The open source community

---

<p align="center">
  <i>Type <code>help</code> in the terminal to get started!</i>
</p>
