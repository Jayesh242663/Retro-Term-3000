import { useState, useEffect, useRef } from 'react';
import { playProgressBeep, playBootCompleteSound } from '../../utils/sounds';
import './BootScreen.css';

const BootScreen = ({ onComplete, duration = 4000 }) => {
  const [bootLines, setBootLines] = useState([]);
  const [showCursor, setShowCursor] = useState(true);
  const [memoryCount, setMemoryCount] = useState(0);
  const [bootPhase, setBootPhase] = useState('bios'); // bios, kernel, systemd
  const [kernelProgress, setKernelProgress] = useState(0);
  const bootStarted = useRef(false);
  const terminalRef = useRef(null);

  // Auto-scroll to bottom whenever boot lines change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [bootLines, memoryCount, bootPhase]);

  // BIOS POST messages
  const biosMessages = [
    { text: 'American Megatrends BIOS v02.61', delay: 0, type: 'bios-header' },
    { text: 'Copyright (C) 1985-2024, American Megatrends, Inc.', delay: 80, type: 'bios-sub' },
    { text: '', delay: 150, type: 'blank' },
    { text: 'RETRO-TERM 3000 Motherboard', delay: 200, type: 'bios-info' },
    { text: 'BIOS Date: 11/24/24  Ver: 3.10', delay: 280, type: 'bios-info' },
    { text: '', delay: 350, type: 'blank' },
    { text: 'Press DEL to run Setup', delay: 400, type: 'bios-hint' },
    { text: 'Press F12 for Boot Menu', delay: 450, type: 'bios-hint' },
    { text: '', delay: 520, type: 'blank' },
    { text: 'CPU: Intel 80486DX-33 @ 33MHz', delay: 580, type: 'bios-detect' },
    { text: 'Memory Testing:', delay: 650, type: 'bios-label' },
  ];

  const postMessages = [
    { text: '', delay: 0, type: 'blank' },
    { text: '16384KB OK', delay: 50, type: 'bios-memory-ok' },
    { text: '', delay: 120, type: 'blank' },
    { text: 'Detecting drives...', delay: 180, type: 'bios-detect' },
    { text: 'IDE Primary Master: Seagate ST3120A 120MB', delay: 280, type: 'bios-device' },
    { text: 'IDE Primary Slave: ATAPI CD-ROM 4X', delay: 360, type: 'bios-device' },
    { text: 'Floppy Drive A: 3.5" 1.44MB', delay: 440, type: 'bios-device' },
    { text: '', delay: 500, type: 'blank' },
    { text: 'Initializing ISA Bus ... Done', delay: 560, type: 'bios-init' },
    { text: 'Initializing IDE Controller ... Done', delay: 640, type: 'bios-init' },
    { text: '', delay: 700, type: 'blank' },
    { text: 'Boot device: IDE Primary Master', delay: 780, type: 'bios-boot' },
    { text: '', delay: 850, type: 'blank' },
  ];

  // Kernel boot messages (dmesg style - retro)
  const kernelMessages = [
    { text: '[    0.000000] Linux version 2.0.36 (gcc version 2.7.2.3)', delay: 0, type: 'kernel' },
    { text: '[    0.000000] Command line: BOOT_IMAGE=/vmlinuz root=/dev/hda1', delay: 60, type: 'kernel' },
    { text: '[    0.000000] BIOS-provided physical RAM map:', delay: 120, type: 'kernel' },
    { text: '[    0.000000] BIOS-e820: 0000000000000000-000000000009fc00 usable', delay: 160, type: 'kernel-mem' },
    { text: '[    0.000000] BIOS-e820: 0000000000100000-0000000001000000 usable', delay: 200, type: 'kernel-mem' },
    { text: '[    0.000012] Console: colour VGA+ 80x25', delay: 260, type: 'kernel' },
    { text: '[    0.000015] Calibrating delay loop... 66.15 BogoMIPS', delay: 300, type: 'kernel' },
    { text: '[    0.000018] DMI: RETRO-TERM 3000/RetroBoard, BIOS 3.10 11/24/1994', delay: 340, type: 'kernel' },
    { text: '[    0.001203] CPU: Intel 80486DX-33 stepping 05', delay: 400, type: 'kernel-cpu' },
    { text: '[    0.004521] Checking 386/387 coupling... OK', delay: 460, type: 'kernel' },
    { text: '[    0.004523] Math coprocessor: present', delay: 500, type: 'kernel' },
    { text: '[    0.005891] Memory: 14328k/16384k available (756k kernel code)', delay: 540, type: 'kernel' },
    { text: '[    0.008234] Floppy drive(s): fd0 is 1.44M', delay: 600, type: 'kernel-disk' },
    { text: '[    0.012456] FDC 0 is a National Semiconductor PC87306', delay: 660, type: 'kernel' },
    { text: '[    0.015678] ide0: BM-DMA at 0xf000-0xf007', delay: 720, type: 'kernel' },
    { text: '[    0.089012] hda: Seagate ST3120A, ATA DISK drive', delay: 800, type: 'kernel-disk' },
    { text: '[    0.123456] hdb: ATAPI CD-ROM, ATAPI CDROM drive', delay: 860, type: 'kernel-disk' },
    { text: '[    0.234567] ide0 at 0x1f0-0x1f7,0x3f6 on irq 14', delay: 920, type: 'kernel' },
    { text: '[    0.345678] hda: Seagate ST3120A, 114MB w/256kB Cache', delay: 980, type: 'kernel-disk' },
    { text: '[    0.456789] Partition check: hda: hda1 hda2', delay: 1020, type: 'kernel' },
    { text: '[    0.567890] Serial driver version 4.13 with no serial options', delay: 1080, type: 'kernel' },
    { text: '[    0.678901] ttyS0 at 0x03f8 (irq = 4) is a 16550A', delay: 1140, type: 'kernel' },
    { text: '[    0.789012] ttyS1 at 0x02f8 (irq = 3) is a 16550A', delay: 1200, type: 'kernel' },
    { text: '[    0.890123] lp0 at 0x0378, (polling)', delay: 1240, type: 'kernel' },
    { text: '[    1.012345] PS/2 auxiliary pointing device detected', delay: 1280, type: 'kernel' },
    { text: '[    1.123456] eth0: NE2000 found at 0x300, using IRQ 5', delay: 1340, type: 'kernel' },
    { text: '[    1.234567] VFS: Mounted root (ext2 filesystem) readonly.', delay: 1400, type: 'kernel-fs' },
    { text: '[    1.345678] Adding Swap: 32764k swap-space', delay: 1460, type: 'kernel' },
    { text: '[    1.456789] EXT2-fs warning: mounting unchecked fs', delay: 1520, type: 'kernel' },
    { text: '[    1.567890] NET4: Unix domain sockets 1.0 for Linux NET4.0.', delay: 1560, type: 'kernel' },
    { text: '[    1.678901] NET4: Linux TCP/IP 1.0 for NET4.0', delay: 1620, type: 'kernel' },
    { text: '[    1.789012] IP Protocols: ICMP, UDP, TCP', delay: 1680, type: 'kernel' },
    { text: '[    1.890123] Starting kswapd v 1.4.2.2', delay: 1740, type: 'kernel' },
    { text: '[    1.901234] Freeing unused kernel memory: 48k freed', delay: 1800, type: 'kernel' },
    { text: '[    2.012345] init[1]: Starting init process', delay: 1860, type: 'kernel' },
    { text: '[    2.123456] Entering runlevel 3...', delay: 1920, type: 'kernel' },
    { text: '', delay: 2000, type: 'blank' },
  ];

  // Systemd service messages
  const systemdMessages = [
    { text: '         Starting Journal Service...', delay: 0, type: 'systemd-starting' },
    { text: '[  OK  ] Started Journal Service.', delay: 100, type: 'systemd-ok' },
    { text: '         Mounting /sys/fs/cgroup...', delay: 150, type: 'systemd-starting' },
    { text: '[  OK  ] Mounted /sys/fs/cgroup.', delay: 220, type: 'systemd-ok' },
    { text: '         Starting udev Kernel Device Manager...', delay: 280, type: 'systemd-starting' },
    { text: '[  OK  ] Started udev Kernel Device Manager.', delay: 380, type: 'systemd-ok' },
    { text: '[  OK  ] Reached target Local File Systems.', delay: 450, type: 'systemd-ok' },
    { text: '         Starting Network Manager...', delay: 520, type: 'systemd-starting' },
    { text: '[  OK  ] Started Network Manager.', delay: 620, type: 'systemd-ok' },
    { text: '[  OK  ] Reached target Network.', delay: 700, type: 'systemd-ok' },
    { text: '         Starting D-Bus System Message Bus...', delay: 760, type: 'systemd-starting' },
    { text: '[  OK  ] Started D-Bus System Message Bus.', delay: 840, type: 'systemd-ok' },
    { text: '         Starting Login Service...', delay: 900, type: 'systemd-starting' },
    { text: '[  OK  ] Started Login Service.', delay: 1000, type: 'systemd-ok' },
    { text: '[  OK  ] Reached target Sound Card.', delay: 1080, type: 'systemd-ok' },
    { text: '[  OK  ] Reached target Graphical Interface.', delay: 1160, type: 'systemd-ok' },
    { text: '', delay: 1240, type: 'blank' },
    { text: 'RetroOS 24.04 LTS retro-term tty1', delay: 1320, type: 'systemd-host' },
    { text: '', delay: 1380, type: 'blank' },
    { text: 'retro-term login: guest (automatic login)', delay: 1440, type: 'systemd-login' },
    { text: '', delay: 1520, type: 'blank' },
    { text: 'Last login: ' + new Date().toLocaleString() + ' on tty1', delay: 1580, type: 'systemd-info' },
    { text: 'Welcome to RetroOS 24.04 LTS (Nostalgic Newt)', delay: 1660, type: 'systemd-welcome' },
    { text: '', delay: 1740, type: 'blank' },
    { text: ' * Documentation:  https://help.retro-os.com', delay: 1800, type: 'systemd-motd' },
    { text: ' * Support:        https://retro-os.com/support', delay: 1860, type: 'systemd-motd' },
    { text: '', delay: 1920, type: 'blank' },
    { text: 'Starting terminal session...', delay: 2000, type: 'systemd-final' },
  ];

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;

    let currentTime = 0;

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    // Phase 1: BIOS POST
    biosMessages.forEach((msg) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
        if (msg.type === 'bios-header') playProgressBeep();
      }, msg.delay);
    });

    // Memory count animation (retro 16MB RAM displayed in KB)
    const memStartTime = 700;
    const memDuration = 400;
    const memTarget = 16384;
    let memInterval;
    
    setTimeout(() => {
      memInterval = setInterval(() => {
        setMemoryCount(prev => {
          const next = prev + Math.floor(Math.random() * 1500) + 800;
          if (next >= memTarget) {
            clearInterval(memInterval);
            return memTarget;
          }
          return next;
        });
      }, 30);
    }, memStartTime);

    setTimeout(() => {
      if (memInterval) clearInterval(memInterval);
      setMemoryCount(memTarget);
      playProgressBeep();
    }, memStartTime + memDuration);

    // Phase 2: POST messages
    const postStartTime = memStartTime + memDuration + 100;
    postMessages.forEach((msg) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
      }, postStartTime + msg.delay);
    });

    // Phase 3: Kernel boot (skip GRUB, go directly to kernel)
    const kernelStartTime = postStartTime + 1000;
    setTimeout(() => {
      setBootPhase('kernel');
      setBootLines([]);
      playProgressBeep();
    }, kernelStartTime);

    kernelMessages.forEach((msg) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
        // Random beeps for important kernel events
        if (msg.type === 'kernel-cpu' || msg.type === 'kernel-disk') {
          if (Math.random() > 0.5) playProgressBeep();
        }
      }, kernelStartTime + 100 + msg.delay);
    });

    // Phase 4: Systemd services
    const systemdStartTime = kernelStartTime + 2200;
    setTimeout(() => {
      setBootPhase('systemd');
      setBootLines([]);
    }, systemdStartTime);

    systemdMessages.forEach((msg) => {
      setTimeout(() => {
        setBootLines(prev => [...prev, msg]);
        if (msg.type === 'systemd-ok') {
          if (Math.random() > 0.6) playProgressBeep();
        }
      }, systemdStartTime + 100 + msg.delay);
    });

    // Complete boot
    const totalTime = systemdStartTime + 2300;
    setTimeout(() => {
      playBootCompleteSound();
      setTimeout(() => {
        onComplete?.();
      }, 400);
    }, totalTime);

    return () => {
      clearInterval(cursorInterval);
      if (memInterval) clearInterval(memInterval);
    };
  }, [onComplete]);

  // Render boot line based on type
  const renderLine = (line, index) => {
    if (line.type === 'blank') {
      return <div key={index} className="boot-line boot-blank">&nbsp;</div>;
    }
    
    if (line.type === 'systemd-starting') {
      return (
        <div key={index} className="boot-line systemd-starting">
          <span className="systemd-status starting">[     ]</span>
          {line.text.replace(/^\s+/, '')}
        </div>
      );
    }
    
    if (line.type === 'systemd-ok') {
      return (
        <div key={index} className="boot-line systemd-ok">
          <span className="systemd-status ok">[  OK  ]</span>
          {line.text.replace('[  OK  ]', '')}
        </div>
      );
    }

    return (
      <div key={index} className={`boot-line boot-${line.type}`}>
        {line.text}
      </div>
    );
  };

  return (
    <div className="boot-screen">
      <div className="boot-container">
        <div className="boot-scanlines" />
        
        <div className="boot-terminal" ref={terminalRef}>
          {/* BIOS Phase */}
          {bootPhase === 'bios' && (
            <>
              {bootLines.map((line, index) => renderLine(line, index))}
              {memoryCount > 0 && memoryCount < 16384 && (
                <div className="boot-line bios-memory-count">
                  {memoryCount}KB OK
                </div>
              )}
            </>
          )}

          {/* Kernel Phase */}
          {bootPhase === 'kernel' && (
            <>
              {bootLines.map((line, index) => renderLine(line, index))}
            </>
          )}

          {/* Systemd Phase */}
          {bootPhase === 'systemd' && (
            <>
              {bootLines.map((line, index) => renderLine(line, index))}
            </>
          )}

          {/* Blinking cursor */}
          <span className={`boot-cursor ${showCursor ? 'visible' : ''}`}>█</span>
        </div>
      </div>
    </div>
  );
};

export default BootScreen;
