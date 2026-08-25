import React, { useState, useEffect, useRef } from 'react';
import './TopTaskManager.css';

// Initial Process Datasets matching the reference image layout
const INITIAL_TABLE_1_PROCS = [
  { pid: 16819, user: 'ricardo', pr: 20, ni: 0, virt: 894836, res: 128384, shr: 66892, s: 'S', cpu: 7.3, mem: 1.6, timeSec: 8.58, cmd: './cool-re+' },
  { pid: 1754, user: 'root', pr: 20, ni: 0, virt: 519436, res: 44916, shr: 31684, s: 'S', cpu: 6.9, mem: 0.6, timeSec: 113.18, cmd: '/usr/bin/+' },
  { pid: 3640, user: 'ricardo', pr: 20, ni: 0, virt: 1720644, res: 104540, shr: 51260, s: 'S', cpu: 6.6, mem: 1.3, timeSec: 104.27, cmd: 'compiz' },
  { pid: 4120, user: 'guest', pr: 20, ni: 0, virt: 324560, res: 45120, shr: 28900, s: 'S', cpu: 3.4, mem: 0.5, timeSec: 14.22, cmd: 'tetris-arcade' },
  { pid: 4215, user: 'guest', pr: 20, ni: 0, virt: 289100, res: 38400, shr: 21040, s: 'S', cpu: 2.8, mem: 0.4, timeSec: 9.11, cmd: 'chiptune-deck' },
];

const INITIAL_TABLE_2_PROCS = [
  { pid: 16867, ppid: 16826, timeSec: 1.21, cpu: 0.3, mem: 0.0, pr: 20, ni: 0, s: 'R', virt: 29328, swap: 0, res: 3208, uid: 1000, cmd: 'top' },
  { pid: 16826, ppid: 16819, timeSec: 0.06, cpu: 0.0, mem: 0.1, pr: 20, ni: 0, s: 'S', virt: 28352, swap: 0, res: 6856, uid: 1000, cmd: '/bin/b+' },
  { pid: 16819, ppid: 16699, timeSec: 8.58, cpu: 7.3, mem: 1.6, pr: 20, ni: 0, s: 'S', virt: 894836, swap: 0, res: 128384, uid: 1000, cmd: './cool+' },
  { pid: 16699, ppid: 16689, timeSec: 0.10, cpu: 0.0, mem: 0.1, pr: 20, ni: 0, s: 'S', virt: 28400, swap: 0, res: 7084, uid: 1000, cmd: '/bin/b+' },
];

const INITIAL_TABLE_3_PROCS = [
  { pid: 4762, mem: 17.1, virt: 4204900, swap: 0, resStr: '1.320g', code: 4572, data: 3927536, shr: 14972, nmaj: 56, ndrt: 0, s: 'S', pr: 20, ni: 0 },
  { pid: 4426, mem: 4.6, virt: 1328884, swap: 0, resStr: '368924', code: 83276, data: 910088, shr: 89436, nmaj: 21, ndrt: 0, s: 'S', pr: 20, ni: 0 },
  { pid: 4712, mem: 2.7, virt: 959436, swap: 0, resStr: '217584', code: 83276, data: 594584, shr: 41684, nmaj: 4, ndrt: 0, s: 'S', pr: 20, ni: 0 },
  { pid: 4383, mem: 2.6, virt: 1693344, swap: 0, resStr: '212496', code: 83276, data: 1050820, shr: 70956, nmaj: 475, ndrt: 0, s: 'S', pr: 20, ni: 0 },
];

const INITIAL_TABLE_4_PROCS = [
  { pid: 2609, ppid: 2606, uid: 33, user: 'www-data', ruser: 'www-data', tty: '?', timeSec: 1.37, cpu: 0.0, mem: 0.0, s: 'S', cmd: '/usr/sbin+' },
  { pid: 2610, ppid: 2606, uid: 33, user: 'www-data', ruser: 'www-data', tty: '?', timeSec: 1.36, cpu: 0.0, mem: 0.0, s: 'S', cmd: '/usr/sbin+' },
  { pid: 1481, ppid: 1, uid: 110, user: 'whoopsie', ruser: 'whoopsie', tty: '?', timeSec: 0.09, cpu: 0.0, mem: 0.1, s: 'S', cmd: 'whoopsie +' },
  { pid: 1063, ppid: 1, uid: 100, user: 'syslog', ruser: 'syslog', tty: '?', timeSec: 0.49, cpu: 0.0, mem: 0.0, s: 'S', cmd: 'rsyslogd' },
];

// Helper: Format time in top format "M:SS.ss"
const formatTopTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const TopTaskManager = ({ isOpen, onClose }) => {
  const [table1Procs, setTable1Procs] = useState(INITIAL_TABLE_1_PROCS);
  const [table2Procs, setTable2Procs] = useState(INITIAL_TABLE_2_PROCS);
  const [table3Procs, setTable3Procs] = useState(INITIAL_TABLE_3_PROCS);
  const [table4Procs, setTable4Procs] = useState(INITIAL_TABLE_4_PROCS);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUs, setCpuUs] = useState(3.6);
  const [cpuSy, setCpuSy] = useState(2.0);
  const [cpuId, setCpuId] = useState(93.9);
  const [loadAvg, setLoadAvg] = useState([0.25, 0.41, 0.50]);
  const [showMultiWindow, setShowMultiWindow] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isPromptingKill, setIsPromptingKill] = useState(false);
  const [killPidInput, setKillPidInput] = useState('');
  const [killMessage, setKillMessage] = useState('');

  const killInputRef = useRef(null);

  // Focus kill input when opened
  useEffect(() => {
    if (isPromptingKill && killInputRef.current) {
      killInputRef.current.focus();
    }
  }, [isPromptingKill]);

  // Live telemetry updater (every 1.2s)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Realistic CPU fluctuations
      const newUs = +(3.0 + Math.random() * 2.5).toFixed(1);
      const newSy = +(1.5 + Math.random() * 1.5).toFixed(1);
      setCpuUs(newUs);
      setCpuSy(newSy);
      setCpuId(+(100 - newUs - newSy - 0.4).toFixed(1));

      // Fluctuate load averages
      setLoadAvg(prev => [
        +(prev[0] + (Math.random() * 0.04 - 0.02)).toFixed(2),
        prev[1],
        prev[2],
      ]);

      // Fluctuate process stats & advance runtime
      setTable1Procs(prev =>
        prev.map(p => ({
          ...p,
          cpu: +(p.cpu + (Math.random() * 0.8 - 0.4)).toFixed(1),
          timeSec: +(p.timeSec + 1.2).toFixed(2),
        }))
      );

      setTable2Procs(prev =>
        prev.map(p => ({
          ...p,
          timeSec: +(p.timeSec + 1.2).toFixed(2),
        }))
      );
    }, 1200);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (isPromptingKill) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsPromptingKill(false);
          setKillPidInput('');
        }
        return;
      }

      if (e.key === 'q' || e.key === 'Escape') {
        e.preventDefault();
        if (showHelp) {
          setShowHelp(false);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === 'k') {
        e.preventDefault();
        setIsPromptingKill(true);
        setKillMessage('');
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        setShowMultiWindow(prev => !prev);
        return;
      }

      if (e.key === 'h' || e.key === '?') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Sort keys
      if (e.key === 'P') {
        // Sort by CPU
        setTable1Procs(prev => [...prev].sort((a, b) => b.cpu - a.cpu));
      } else if (e.key === 'M') {
        // Sort by Mem
        setTable1Procs(prev => [...prev].sort((a, b) => b.mem - a.mem));
      } else if (e.key === 'N') {
        // Sort by PID
        setTable1Procs(prev => [...prev].sort((a, b) => a.pid - b.pid));
      } else if (e.key === 'T') {
        // Sort by Time
        setTable1Procs(prev => [...prev].sort((a, b) => b.timeSec - a.timeSec));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showHelp, isPromptingKill, onClose]);

  // Handle process kill submission
  const handleKillSubmit = (e) => {
    e.preventDefault();
    const targetPid = parseInt(killPidInput.trim(), 10);
    if (isNaN(targetPid)) {
      setKillMessage('Invalid PID');
      return;
    }

    // Check if process exists in any table
    const exists =
      table1Procs.some(p => p.pid === targetPid) ||
      table2Procs.some(p => p.pid === targetPid) ||
      table3Procs.some(p => p.pid === targetPid) ||
      table4Procs.some(p => p.pid === targetPid);

    if (exists) {
      setTable1Procs(prev => prev.filter(p => p.pid !== targetPid));
      setTable2Procs(prev => prev.filter(p => p.pid !== targetPid));
      setTable3Procs(prev => prev.filter(p => p.pid !== targetPid));
      setTable4Procs(prev => prev.filter(p => p.pid !== targetPid));
      setKillMessage(`PID ${targetPid} terminated (SIGTERM).`);
    } else {
      setKillMessage(`PID ${targetPid}: No such process.`);
    }

    setTimeout(() => {
      setIsPromptingKill(false);
      setKillPidInput('');
      setKillMessage('');
    }, 1200);
  };

  if (!isOpen) return null;

  const timeStr = currentTime.toTimeString().split(' ')[0];

  return (
    <div className="top-overlay">
      {/* 5-Line Authentic System Header */}
      <div className="top-sys-header">
        <div className="top-line-1">
          {`1:Def - ${timeStr} up  1:19,  4 users,  load average: ${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}`}
        </div>
        <div className="top-line-2">
          Tasks: 287 total,   1 running, 286 sleeping,   0 stopped,   0 zombie
        </div>
        <div className="top-line-3">
          {`%Cpu(s):  ${cpuUs} us,  ${cpuSy} sy,  0.0 ni, ${cpuId} id,  0.4 wa,  0.0 hi,  0.0 si,  0.0 st`}
        </div>
        <div className="top-line-4">
          KiB Mem:   8078536 total,  6268256 used,  1810280 free,    77128 buffers
        </div>
        <div className="top-line-5">
          KiB Swap: 15624188 total,    72156 used, 15552032 free,  1575336 cached Mem
        </div>
      </div>

      {/* Shortcuts status bar */}
      <div className="top-control-bar">
        <div className="top-shortcuts">
          <span><span className="top-shortcut-key">[q]</span> Quit</span>
          <span><span className="top-shortcut-key">[k]</span> Kill PID</span>
          <span><span className="top-shortcut-key">[1]</span> Windows ({showMultiWindow ? '4-Win' : '1-Win'})</span>
          <span><span className="top-shortcut-key">[P]</span> CPU Sort</span>
          <span><span className="top-shortcut-key">[M]</span> Mem Sort</span>
          <span><span className="top-shortcut-key">[h]</span> Help</span>
        </div>
        <div>UBUNTU TOP TASK MANAGER</div>
      </div>

      {/* Kill Process Prompt Bar */}
      {isPromptingKill && (
        <form className="top-prompt-bar" onSubmit={handleKillSubmit}>
          <span>PID to signal/kill [default pid 16819]:</span>
          <input
            ref={killInputRef}
            type="text"
            className="top-prompt-input"
            value={killPidInput}
            onChange={(e) => setKillPidInput(e.target.value)}
            placeholder="PID"
          />
          <button type="submit" style={{ display: 'none' }} />
          {killMessage && <span>{killMessage}</span>}
        </form>
      )}

      {/* Process Tables Viewport */}
      <div className="top-process-viewport">
        {/* Table 1: Default Task List */}
        <div className="top-table-section">
          <div className="top-col-header-inverted">
            {'1  PID USER     PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND'}
          </div>
          <div className="top-proc-list">
            {table1Procs.map((p) => {
              const pidStr = String(p.pid).padStart(6, ' ');
              const userStr = p.user.padEnd(8, ' ');
              const prStr = String(p.pr).padStart(3, ' ');
              const niStr = String(p.ni).padStart(3, ' ');
              const virtStr = String(p.virt).padStart(7, ' ');
              const resStr = String(p.res).padStart(6, ' ');
              const shrStr = String(p.shr).padStart(6, ' ');
              const sStr = p.s.padStart(2, ' ');
              const cpuStr = p.cpu.toFixed(1).padStart(5, ' ');
              const memStr = p.mem.toFixed(1).padStart(4, ' ');
              const timeStrFormatted = formatTopTime(p.timeSec).padStart(10, ' ');
              const cmdStr = p.cmd;

              return (
                <div key={`t1-${p.pid}`} className={`top-proc-row ${p.cpu > 5 ? 'highlighted' : ''}`}>
                  {`${pidStr} ${userStr} ${prStr} ${niStr} ${virtStr} ${resStr} ${shrStr} ${sStr} ${cpuStr} ${memStr} ${timeStrFormatted} ${cmdStr}`}
                </div>
              );
            })}
          </div>
        </div>

        {showMultiWindow && (
          <>
            {/* Table 2: Job / PPID List */}
            <div className="top-table-section">
              <div className="top-col-header-inverted">
                {'2  PID  PPID    TIME+  %CPU %MEM  PR  NI S    VIRT   SWAP    RES  UID COMMAND'}
              </div>
              <div className="top-proc-list">
                {table2Procs.map((p) => {
                  const pidStr = String(p.pid).padStart(6, ' ');
                  const ppidStr = String(p.ppid).padStart(5, ' ');
                  const timeStrFormatted = formatTopTime(p.timeSec).padStart(8, ' ');
                  const cpuStr = p.cpu.toFixed(1).padStart(5, ' ');
                  const memStr = p.mem.toFixed(1).padStart(4, ' ');
                  const prStr = String(p.pr).padStart(3, ' ');
                  const niStr = String(p.ni).padStart(3, ' ');
                  const sStr = p.s.padStart(2, ' ');
                  const virtStr = String(p.virt).padStart(7, ' ');
                  const swapStr = String(p.swap).padStart(6, ' ');
                  const resStr = String(p.res).padStart(6, ' ');
                  const uidStr = String(p.uid).padStart(4, ' ');
                  const cmdStr = p.cmd;

                  return (
                    <div key={`t2-${p.pid}`} className="top-proc-row">
                      {`${pidStr} ${ppidStr} ${timeStrFormatted} ${cpuStr} ${memStr} ${prStr} ${niStr} ${sStr} ${virtStr} ${swapStr} ${resStr} ${uidStr} ${cmdStr}`}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table 3: Memory / Paging List */}
            <div className="top-table-section">
              <div className="top-col-header-inverted">
                {'3  PID %MEM    VIRT   SWAP    RES  CODE  DATA   SHR nMaj nDRT S  PR  NI'}
              </div>
              <div className="top-proc-list">
                {table3Procs.map((p) => {
                  const pidStr = String(p.pid).padStart(6, ' ');
                  const memStr = p.mem.toFixed(1).padStart(4, ' ');
                  const virtStr = String(p.virt).padStart(8, ' ');
                  const swapStr = String(p.swap).padStart(6, ' ');
                  const resStr = p.resStr.padStart(7, ' ');
                  const codeStr = String(p.code).padStart(5, ' ');
                  const dataStr = String(p.data).padStart(8, ' ');
                  const shrStr = String(p.shr).padStart(6, ' ');
                  const nmajStr = String(p.nmaj).padStart(5, ' ');
                  const ndrtStr = String(p.ndrt).padStart(4, ' ');
                  const sStr = p.s.padStart(2, ' ');
                  const prStr = String(p.pr).padStart(3, ' ');
                  const niStr = String(p.ni).padStart(3, ' ');

                  return (
                    <div key={`t3-${p.pid}`} className="top-proc-row">
                      {`${pidStr} ${memStr} ${virtStr} ${swapStr} ${resStr} ${codeStr} ${dataStr} ${shrStr} ${nmajStr} ${ndrtStr} ${sStr} ${prStr} ${niStr}`}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table 4: User / Daemons List */}
            <div className="top-table-section">
              <div className="top-col-header-inverted">
                {'4  PID  PPID   UID USER     RUSER    TTY        TIME+  %CPU %MEM S COMMAND'}
              </div>
              <div className="top-proc-list">
                {table4Procs.map((p) => {
                  const pidStr = String(p.pid).padStart(6, ' ');
                  const ppidStr = String(p.ppid).padStart(5, ' ');
                  const uidStr = String(p.uid).padStart(5, ' ');
                  const userStr = p.user.padEnd(8, ' ');
                  const ruserStr = p.ruser.padEnd(8, ' ');
                  const ttyStr = p.tty.padEnd(7, ' ');
                  const timeStrFormatted = formatTopTime(p.timeSec).padStart(11, ' ');
                  const cpuStr = p.cpu.toFixed(1).padStart(5, ' ');
                  const memStr = p.mem.toFixed(1).padStart(4, ' ');
                  const sStr = p.s.padStart(2, ' ');
                  const cmdStr = p.cmd;

                  return (
                    <div key={`t4-${p.pid}`} className="top-proc-row">
                      {`${pidStr} ${ppidStr} ${uidStr} ${userStr} ${ruserStr} ${ttyStr} ${timeStrFormatted} ${cpuStr} ${memStr} ${sStr} ${cmdStr}`}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="top-help-overlay">
          <div>
            <h3>HELP: UBUNTU TOP TASK MANAGER</h3>
            <p>Interactive keystrokes available in top session:</p>
            <div className="top-help-grid">
              <div className="help-cmd-row"><strong>q, ESC</strong>: Quit top</div>
              <div className="help-cmd-row"><strong>k</strong>: Kill process by PID</div>
              <div className="help-cmd-row"><strong>1</strong>: Toggle 4-window mode</div>
              <div className="help-cmd-row"><strong>P</strong>: Sort by CPU%</div>
              <div className="help-cmd-row"><strong>M</strong>: Sort by Memory%</div>
              <div className="help-cmd-row"><strong>N</strong>: Sort by PID</div>
              <div className="help-cmd-row"><strong>T</strong>: Sort by Running Time</div>
              <div className="help-cmd-row"><strong>Space</strong>: Force refresh</div>
            </div>
          </div>
          <div>Press <strong>[q]</strong> or <strong>[ESC]</strong> to return to top.</div>
        </div>
      )}
    </div>
  );
};

export default TopTaskManager;
