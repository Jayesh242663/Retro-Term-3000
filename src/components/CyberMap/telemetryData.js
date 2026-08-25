// Geographical Nodes & Cyber Telemetry Data

// Authentic 1998 Matthew Thomas ASCII World Map
export const ASCII_WORLD_MAP_RAW = [
  '               . _..::__:  ,-"-"._       |7       ,     _,.__             ',
  '       _.___ _ _<_>`!(._`.`-.    /        _._     `_ ,_/  \'  \'-._.---.-.__',
  '     .{     " " `-==,\',._\\{  \\  / {)     / _ ">_,-` `                mt-2_',
  '      \\_.:--.       `._ )`^-. "\'      , [_/(                       __,/-\' ',
  '     \'"\'     \\         "    _L       oD_,--\'                )     /. (|   ',
  '              |           ,\'         _)_.\\\\._<> 6              _,\' /  \'   ',
  '              `.         /          [_/_\'` `"(                <\'}  )      ',
  '               \\\\    .-. )          /   `-\'"..\' `:._          _)  \'       ',
  '        `        \\  (  `(          /         `:\\  > \\  ,-^.  /\' \'         ',
  '                  `._,   ""        |           \\`\'   \\|   ?_)  {\\         ',
  '                     `=.---.       `._._       ,\'     "`  |\' ,- \'.        ',
  '                       |    `-._        |     /          `:`<_|h--._      ',
  '                       (        >       .     | ,          `=.__.`-\'\\     ',
  '                        `.     /        |     |{|              ,-.,\\     .',
  '                         |   ,\'          \\   / `\'            ,"     \\     ',
  '                         |  /             |_\'                |  __  /     ',
  '                         | |                                 \'-\'  `-\'   \\.',
  '                         |/                                        "    / ',
  '                         \\.                                            \'  ',
  '                                                                          ',
  '                          ,/           ______._.--._ _..---.---------._   ',
  '         ,-----"-..?----_/ )      _,-`"             "                  (  ',
];

export const ASCII_MAP_CREDIT = 'Map 1998 Matthew Thomas. Freely usable as long as this line is included';

// Global Telemetry Nodes
export const BASE_STATION = {
  id: 'mumbai',
  name: 'Mumbai Base Core',
  country: 'India',
  lat: 19.0760,
  lng: 72.8777,
  ip: '103.14.120.4',
  status: 'PRIMARY CORE',
  role: 'Developer Home Base / Command Station',
  latency: '1ms',
  marker: '<*>',
  color: '#ffb000',
};

export const GLOBAL_NODES = [
  {
    id: 'sf',
    name: 'San Francisco Hub',
    country: 'United States',
    lat: 37.7749,
    lng: -122.4194,
    ip: '192.30.255.113',
    status: 'ACTIVE',
    role: 'GitHub & Cloud Production Edge',
    latency: '142ms',
    packetLoss: '0.0%',
    cipher: 'AES-256-GCM',
    marker: 'oD',
    color: '#00ff66',
    projects: ['Banking System', 'Secure Pass', 'Retro-Term-3000'],
  },
  {
    id: 'london',
    name: 'London Gateway',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    ip: '185.199.108.153',
    status: 'ACTIVE',
    role: 'European Edge Relay',
    latency: '118ms',
    packetLoss: '0.0%',
    cipher: 'CHACHA20-POLY1305',
    marker: '[*/*]',
    color: '#ff3366',
    projects: ['Workspace Management System'],
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt Central',
    country: 'Germany',
    lat: 50.1109,
    lng: 8.6821,
    ip: '141.95.12.89',
    status: 'ACTIVE',
    role: 'Central European Cloud Data Node',
    latency: '124ms',
    packetLoss: '0.0%',
    cipher: 'AES-256-GCM',
    marker: '**',
    color: '#ff3333',
    projects: ['Full-Stack Infrastructure'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo Metro Node',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    ip: '133.242.18.77',
    status: 'ACTIVE',
    role: 'Asia-Pacific Core Backbone',
    latency: '88ms',
    packetLoss: '0.0%',
    cipher: 'AES-256-GCM',
    marker: '<> 6',
    color: '#33ccff',
    projects: ['AI & ML Data Systems'],
  },
  {
    id: 'singapore',
    name: 'Singapore Subsea Relay',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    ip: '116.12.55.201',
    status: 'ACTIVE',
    role: 'Equatorial Fiber Hub',
    latency: '42ms',
    packetLoss: '0.0%',
    cipher: 'AES-256-GCM',
    marker: 'mt-2',
    color: '#00ffcc',
    projects: ['Fast Cache & API Gateway'],
  },
  {
    id: 'sydney',
    name: 'Sydney Pacific Hub',
    country: 'Australia',
    lat: -33.8688,
    lng: 151.2093,
    ip: '139.130.4.5',
    status: 'ACTIVE',
    role: 'Oceania Telemetry Station',
    latency: '158ms',
    packetLoss: '0.0%',
    cipher: 'CHACHA20-POLY1305',
    marker: '[AU]',
    color: '#ffff33',
    projects: ['Disaster Recovery Mirror'],
  },
];

// Simulated Live Threat & Telemetry Event Pool
export const TELEMETRY_EVENT_TEMPLATES = [
  { prefix: '*', name: 'Trojan.Generic.6176504', location: 'FR Le Perreux', type: 'threat' },
  { prefix: '*', name: 'Gen:Variant.Graftor.27080', location: 'SE Stockholm', type: 'threat' },
  { prefix: '*', name: 'Worm:W32/Downaduprun.A', location: 'IT Milan', type: 'threat' },
  { prefix: '*', name: 'Gen:Trojan.Heur.PT.Mu0@bqC5qQc', location: 'DE Frankfurt', type: 'threat' },
  { prefix: '*', name: 'Gen:Application.Heur.cmKfb04FRnmO', location: 'AT Vienna', type: 'threat' },
  { prefix: '*', name: 'SSH.Telemetry.Heartbeat', location: 'IN Mumbai [Base Core]', type: 'telemetry' },
  { prefix: '*', name: 'GitHub.CI.Deployment.Verified', location: 'US San Francisco', type: 'info' },
  { prefix: '*', name: 'ICMP.Ping.Telemetry.Echo', location: 'JP Tokyo [88ms]', type: 'telemetry' },
  { prefix: '*', name: 'AES256.Packet.Relay.Synchronized', location: 'SG Singapore', type: 'info' },
  { prefix: '*', name: 'Border.Gateway.BGP.Route.OK', location: 'AU Sydney', type: 'telemetry' },
];

// Convert Lat/Lng to ASCII Map (row, col)
export const latLonToAsciiCoords = (lat, lon) => {
  const top = 0;
  const left = 0;
  const bottom = 21;
  const right = 74;

  const absLat = -lat + 90;
  const absLon = lon + 180;

  const col = Math.round((absLon / 360.0) * (right - left) + left);
  const row = Math.round((absLat / 180.0) * (bottom - top) + top);

  return {
    row: Math.max(0, Math.min(bottom, row)),
    col: Math.max(0, Math.min(right, col)),
  };
};

// Project coordinates for SVG 2D View
export const projectToCanvas = (lat, lng, width = 800, height = 400) => {
  const x = (lng + 180) * (width / 360);
  const y = (90 - lat) * (height / 180);
  return { x, y };
};

export const createTrajectoryPath = (start, end) => {
  const midX = (start.x + end.x) / 2;
  const dist = Math.hypot(end.x - start.x, end.y - start.y);
  const curveArc = Math.min(80, Math.max(30, dist * 0.2));
  const midY = Math.min(start.y, end.y) - curveArc;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
};
