// Meow Launcher — các hàm làm việc với Windows (không dùng module native, chỉ PowerShell/cmd)
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');

const IS_WIN = process.platform === 'win32';
const env = (k, d = '') => process.env[k] || d;
const SYSROOT = env('SystemRoot', 'C:\\Windows');
const LOCAL = env('LOCALAPPDATA');
const ROAMING = env('APPDATA');
const PROGDATA = env('ProgramData', 'C:\\ProgramData');

// ---------- tiện ích chạy lệnh ----------
function run(file, args = [], opts = {}) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true, maxBuffer: 64 * 1024 * 1024, timeout: opts.timeout || 120000, encoding: 'utf8', ...opts },
      (err, stdout, stderr) => resolve({ ok: !err, code: err ? (err.code ?? 1) : 0, out: stdout || '', err: stderr || (err ? String(err.message) : '') }));
  });
}
function b64(script) { return Buffer.from(script, 'utf16le').toString('base64'); }
const PS_HEAD = "$ErrorActionPreference='SilentlyContinue';[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$ProgressPreference='SilentlyContinue';";
async function ps(script, timeout) {
  if (!IS_WIN) return { ok: false, out: '', err: 'not windows' };
  return run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', b64(PS_HEAD + script)], { timeout });
}
async function psJson(script, timeout) {
  const r = await ps(script + ' | ConvertTo-Json -Depth 4 -Compress', timeout);
  try { const v = JSON.parse(r.out.trim() || 'null'); return v == null ? [] : v; } catch { return null; }
}
const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Chạy một đoạn PowerShell với quyền Admin (hiện hộp UAC). Trả về ok=false nếu người dùng bấm Không.
async function psAdmin(script, { visible = false, wait = true } = {}) {
  const inner = b64(PS_HEAD + script);
  const outer = `try { Start-Process powershell -Verb RunAs ${visible ? '' : '-WindowStyle Hidden'} ${wait ? '-Wait' : ''} -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-EncodedCommand','${inner}' -ErrorAction Stop; 'OK' } catch { 'CANCEL' }`;
  const r = await ps(outer, 60 * 60 * 1000);
  return { ok: r.out.includes('OK'), cancelled: r.out.includes('CANCEL') };
}
function startDetached(cmd, args = [], opts = {}) {
  return new Promise((resolve) => {
    try {
      const p = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false, shell: false, ...opts });
      p.once('error', () => resolve(false)); p.once('spawn', () => { p.unref(); resolve(true); });
    } catch { resolve(false); }
  });
}
function cmdStart(target) { return startDetached('cmd.exe', ['/d', '/c', 'start', '""', target], { windowsVerbatimArguments: true, windowsHide: true }); }

// ---------- dung lượng thư mục ----------
async function dirSize(p, depth = 0) {
  let total = 0;
  let entries;
  try { entries = await fsp.readdir(p, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    const f = path.join(p, e.name);
    try {
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (depth < 40) total += await dirSize(f, depth + 1); }
      else { const st = await fsp.stat(f); total += st.size; }
    } catch { /* bỏ qua file bị khoá */ }
  }
  return total;
}
async function clearDir(p) {
  let entries;
  try { entries = await fsp.readdir(p); } catch { return; }
  await Promise.all(entries.map((n) => fsp.rm(path.join(p, n), { recursive: true, force: true, maxRetries: 0 }).catch(() => {})));
}
async function globFiles(dir, re) {
  try { return (await fsp.readdir(dir)).filter((n) => re.test(n)).map((n) => path.join(dir, n)); } catch { return []; }
}

// ---------- DỌN RÁC ----------
async function browserCacheDirs() {
  const roots = [
    path.join(LOCAL, 'Google', 'Chrome', 'User Data'),
    path.join(LOCAL, 'Microsoft', 'Edge', 'User Data'),
    path.join(LOCAL, 'CocCoc', 'Browser', 'User Data'),
    path.join(LOCAL, 'BraveSoftware', 'Brave-Browser', 'User Data'),
  ];
  const out = [];
  for (const r of roots) {
    let profs = [];
    try { profs = (await fsp.readdir(r)).filter((n) => n === 'Default' || /^Profile \d+$/.test(n)); } catch { continue; }
    for (const pr of profs) for (const c of ['Cache', 'Code Cache', 'GPUCache', path.join('Service Worker', 'CacheStorage')]) out.push(path.join(r, pr, c));
  }
  return out;
}
const JUNK = [
  { id: 'tmp', name: 'Tệp tạm của người dùng', desc: '%TEMP%', on: true, dirs: async () => [os.tmpdir()] },
  { id: 'wtmp', name: 'Tệp tạm của Windows', desc: SYSROOT + '\\Temp', on: true, admin: true, dirs: async () => [path.join(SYSROOT, 'Temp')] },
  { id: 'bin', name: 'Thùng rác', desc: 'Tất cả ổ đĩa', on: true, special: 'bin' },
  { id: 'br', name: 'Bộ nhớ đệm trình duyệt', desc: 'Chrome, Edge, Cốc Cốc, Brave · giữ nguyên mật khẩu, lịch sử, đăng nhập', on: true, dirs: browserCacheDirs },
  { id: 'thumb', name: 'Bộ nhớ đệm ảnh thu nhỏ', desc: '%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer', on: true, files: async () => globFiles(path.join(LOCAL, 'Microsoft', 'Windows', 'Explorer'), /^(thumbcache|iconcache)_.*\.db$/i) },
  { id: 'dump', name: 'Báo cáo lỗi và tệp dump', desc: 'CrashDumps, Windows Error Reporting', on: true, dirs: async () => [path.join(LOCAL, 'CrashDumps'), path.join(LOCAL, 'Microsoft', 'Windows', 'WER'), path.join(PROGDATA, 'Microsoft', 'Windows', 'WER', 'ReportArchive'), path.join(PROGDATA, 'Microsoft', 'Windows', 'WER', 'ReportQueue')] },
  { id: 'wu', name: 'Bộ đệm Windows Update', desc: SYSROOT + '\\SoftwareDistribution\\Download', on: false, admin: true, dirs: async () => [path.join(SYSROOT, 'SoftwareDistribution', 'Download')] },
];
async function recycleBinSize() {
  const r = await ps("$s=0;(New-Object -ComObject Shell.Application).NameSpace(10).Items()|%{$s+=$_.Size};$s");
  return Number(r.out.trim()) || 0;
}
async function junkScan() {
  const res = [];
  for (const j of JUNK) {
    let size = 0;
    if (j.special === 'bin') size = await recycleBinSize();
    else if (j.files) { for (const f of await j.files()) { try { size += (await fsp.stat(f)).size; } catch {} } }
    else for (const d of await j.dirs()) size += await dirSize(d);
    res.push({ id: j.id, name: j.name, desc: j.desc, admin: !!j.admin, on: j.on, size });
  }
  return res;
}
async function junkClean(ids) {
  const adminScript = [];
  for (const id of ids) {
    const j = JUNK.find((x) => x.id === id); if (!j) continue;
    if (j.special === 'bin') { await ps('Clear-RecycleBin -Force'); continue; }
    if (j.admin) {
      const ds = await j.dirs();
      if (id === 'wu') adminScript.push("Stop-Service wuauserv -Force;Stop-Service bits -Force");
      for (const d of ds) adminScript.push(`Get-ChildItem -LiteralPath '${d.replace(/'/g, "''")}' -Force | Remove-Item -Recurse -Force`);
      if (id === 'wu') adminScript.push("Start-Service bits;Start-Service wuauserv");
      continue;
    }
    if (j.files) { for (const f of await j.files()) await fsp.rm(f, { force: true }).catch(() => {}); continue; }
    for (const d of await j.dirs()) await clearDir(d);
  }
  let cancelled = false;
  if (adminScript.length) { const r = await psAdmin(adminScript.join(';')); cancelled = !r.ok; }
  return { cancelled };
}

// ---------- TIẾN TRÌNH ----------
const SYS_PROCS = new Set(['system', 'idle', 'registry', 'smss', 'csrss', 'wininit', 'winlogon', 'services', 'lsass', 'lsaiso', 'svchost', 'fontdrvhost', 'dwm', 'memory compression', 'secure system', 'spoolsv', 'sihost', 'ctfmon', 'runtimebroker', 'searchhost', 'searchindexer', 'startmenuexperiencehost', 'shellexperiencehost', 'textinputhost', 'audiodg', 'conhost', 'dllhost', 'taskhostw', 'wudfhost', 'msmpeng', 'nissrv', 'securityhealthservice', 'smartscreen', 'lockapp', 'explorer', 'applicationframehost', 'systemsettings', 'widgets', 'wmiprvse', 'dashost', 'unsecapp', 'searchprotocolhost', 'searchfilterhost', 'mpdefendercoreservice']);
let lastCpu = null;
const descCache = new Map(); let procCalls = 0;
async function processes() {
  const withDesc = procCalls++ % 12 === 0;
  const list = arr(await psJson("Get-Process | Select-Object Id,ProcessName,CPU,WorkingSet64,MainWindowTitle" + (withDesc ? ",@{n='Desc';e={$_.Description}}" : '')));
  for (const p of list) if (p && p.Desc) descCache.set(p.ProcessName, p.Desc);
  const now = Date.now();
  const groups = new Map();
  for (const p of list) {
    if (!p || !p.ProcessName) continue;
    const key = p.ProcessName;
    const g = groups.get(key) || { name: key, desc: '', pids: [], ram: 0, cpuSec: 0, hasWindow: false };
    g.pids.push(p.Id); g.ram += Number(p.WorkingSet64) || 0; g.cpuSec += Number(p.CPU) || 0;
    if (p.MainWindowTitle) g.hasWindow = true;
    if (!g.desc) g.desc = descCache.get(key) || '';
    groups.set(key, g);
  }
  const cores = os.cpus().length || 1;
  const out = [];
  for (const g of groups.values()) {
    let cpu = 0;
    if (lastCpu && lastCpu.map.has(g.name)) {
      const dt = (now - lastCpu.t) / 1000;
      cpu = Math.max(0, ((g.cpuSec - lastCpu.map.get(g.name)) / dt / cores) * 100);
    }
    const low = g.name.toLowerCase();
    const type = low === 'meow launcher' || low === 'meowlauncher' ? 'self' : SYS_PROCS.has(low) || g.pids.includes(0) || g.pids.includes(4) ? 'sys' : g.hasWindow ? 'app' : 'bg';
    out.push({ name: g.name, title: g.desc || g.name, pids: g.pids, ram: g.ram, cpu: Math.round(cpu * 10) / 10, type });
  }
  lastCpu = { t: now, map: new Map([...groups.values()].map((g) => [g.name, g.cpuSec])) };
  return out;
}
function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }
async function killProcs(pids, force) {
  // force=false: gửi lệnh đóng như bấm nút X để app kịp hỏi lưu file; không tự buộc tắt
  const args = (pid) => ['/PID', String(pid), '/T', ...(force ? ['/F'] : [])];
  await Promise.all(pids.map((pid) => run('taskkill.exe', args(pid))));
  if (force) { await new Promise((r) => setTimeout(r, 800)); return { left: pids.filter(alive) }; }
  await new Promise((r) => setTimeout(r, 5000));
  return { left: pids.filter(alive) };
}
async function restartExplorer() {
  await run('taskkill.exe', ['/F', '/IM', 'explorer.exe']);
  await new Promise((r) => setTimeout(r, 800));
  await startDetached(path.join(SYSROOT, 'explorer.exe'));
  return { ok: true };
}

// ---------- APP TỰ KHỞI ĐỘNG ----------
async function startupList() {
  const script = `
$res=@()
$appr='Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StartupApproved'
function St($hive,$sub,$name){ $k=Get-ItemProperty -Path "$hive\\$appr\\$sub" -Name $name; $v=$null; if($k){ $v=$k.PSObject.Properties[$name].Value }; if($v){ return ((([byte[]]$v)[0] -band 1) -eq 0) } ; return $true }
foreach($src in @(@{h='HKCU:';p='Software\\Microsoft\\Windows\\CurrentVersion\\Run';s='Run';scope='user'},@{h='HKLM:';p='Software\\Microsoft\\Windows\\CurrentVersion\\Run';s='Run';scope='machine'},@{h='HKLM:';p='Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run';s='Run32';scope='machine'})){
  $k=Get-Item -Path ($src.h+'\\'+$src.p)
  if($k){ foreach($n in $k.GetValueNames()){ if($n -eq ''){continue}; $res+=[pscustomobject]@{name=$n;cmd=[string]$k.GetValue($n);hive=$src.h.TrimEnd(':');sub=$src.s;scope=$src.scope;src='Registry';on=(St $src.h $src.s $n)} } }
}
foreach($f in @(@{d=[Environment]::GetFolderPath('Startup');h='HKCU:';scope='user'},@{d=[Environment]::GetFolderPath('CommonStartup');h='HKLM:';scope='machine'})){
  Get-ChildItem -LiteralPath $f.d -File | ?{ $_.Name -ne 'desktop.ini' } | %{ $res+=[pscustomobject]@{name=$_.Name;cmd=$_.FullName;hive=$f.h.TrimEnd(':');sub='StartupFolder';scope=$f.scope;src='Thư mục Startup';on=(St $f.h 'StartupFolder' $_.Name)} }
}
$res`;
  return arr(await psJson(script)).filter(Boolean);
}
async function startupToggle(item, on) {
  const bytes = (on ? '02' : '03') + '0000000000000000000000';
  const key = `${item.hive}\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StartupApproved\\${item.sub}`;
  const args = ['add', key, '/v', item.name, '/t', 'REG_BINARY', '/d', bytes, '/f'];
  if (item.hive === 'HKCU') { const r = await run('reg.exe', args); return { ok: r.ok }; }
  const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
  const r = await psAdmin(`& reg.exe ${args.map(q).join(' ')}`);
  return { ok: r.ok, cancelled: r.cancelled };
}

// ---------- GỠ CÀI ĐẶT ----------
async function installedApps() {
  const script = `
$p=@('HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*')
Get-ItemProperty -Path $p | ?{ $_.DisplayName -and $_.UninstallString -and -not $_.SystemComponent -and -not $_.ParentKeyName -and $_.ReleaseType -notmatch 'Update|Hotfix' } |
 Select-Object @{n='name';e={$_.DisplayName}},@{n='pub';e={$_.Publisher}},@{n='kb';e={$_.EstimatedSize}},@{n='date';e={$_.InstallDate}},@{n='un';e={$_.UninstallString}},@{n='icon';e={$_.DisplayIcon}},@{n='ver';e={$_.DisplayVersion}},@{n='loc';e={$_.InstallLocation}}`;
  const list = arr(await psJson(script)).filter(Boolean);
  const seen = new Set();
  return list.filter((a) => { const k = a.name + '|' + (a.ver || ''); if (seen.has(k)) return false; seen.add(k); return true; })
    .map((a) => ({ name: a.name, pub: a.pub || '', size: (Number(a.kb) || 0) * 1024, date: /^\d{8}$/.test(String(a.date || '')) ? `${String(a.date).slice(6, 8)}/${String(a.date).slice(4, 6)}/${String(a.date).slice(0, 4)}` : '', un: a.un, ver: a.ver || '', icon: a.icon || '' }));
}
async function uninstall(un) {
  let s = String(un || '').trim();
  if (!s) return { ok: false };
  if (/msiexec/i.test(s)) s = s.replace(/\/I\{/i, '/X{');
  let file, args;
  const m1 = s.match(/^"([^"]+)"\s*(.*)$/); const m2 = s.match(/^(.+?\.exe)\s*(.*)$/i);
  if (m1) { file = m1[1]; args = m1[2]; } else if (m2) { file = m2[1]; args = m2[2]; } else { file = s; args = ''; }
  const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
  // Start-Process dùng ShellExecute nên trình gỡ cần quyền Admin sẽ tự hiện hộp xác nhận
  const r = await ps(`try{Start-Process -FilePath ${q(file)}${args ? ' -ArgumentList ' + q(args) : ''} -ErrorAction Stop;'OK'}catch{'NO'}`);
  return { ok: r.out.includes('OK') };
}

// ---------- SỬA LỖI NHANH ----------
const FIXES = {
  dns: { admin: false, run: () => run('ipconfig.exe', ['/flushdns']) },
  ip: { admin: true, script: 'ipconfig /release; ipconfig /renew' },
  net: { admin: true, script: 'netsh winsock reset; netsh int ip reset' },
  print: { admin: true, script: `Stop-Service spooler -Force; Remove-Item -Path "$env:SystemRoot\\System32\\spool\\PRINTERS\\*" -Force -Recurse; Start-Service spooler` },
  exp: { admin: false, run: restartExplorer },
  sfc: { admin: true, visible: true, wait: false, script: "sfc /scannow; Write-Host ''; Write-Host 'Xong. Bam Enter de dong.'; Read-Host" },
};
async function runFix(id) {
  const f = FIXES[id]; if (!f) return { ok: false };
  if (!f.admin) { const r = await f.run(); return { ok: r.ok !== false }; }
  const r = await psAdmin(f.script, { visible: !!f.visible, wait: f.wait !== false });
  return { ok: r.ok, cancelled: r.cancelled, background: f.wait === false };
}

// ---------- THÔNG TIN MÁY ----------
function localIPs() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) for (const a of list || []) if (a.family === 'IPv4' && !a.internal) out.push({ name, ip: a.address, mac: a.mac });
  // ưu tiên dải mạng nội bộ phổ biến
  out.sort((a, b) => (/^(192\.168|10\.|172\.)/.test(b.ip) ? 1 : 0) - (/^(192\.168|10\.|172\.)/.test(a.ip) ? 1 : 0));
  return out;
}
async function machineInfo() {
  const script = `
$os=Get-CimInstance Win32_OperatingSystem; $cpu=Get-CimInstance Win32_Processor|Select -First 1; $gpu=Get-CimInstance Win32_VideoController|Select -Expand Name
$bb=Get-CimInstance Win32_BaseBoard; $mem=Get-CimInstance Win32_PhysicalMemory; $disks=Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3'
$gw=(Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled=True'|?{$_.DefaultIPGateway}|Select -First 1).DefaultIPGateway
[pscustomobject]@{os=$os.Caption;ver=$os.Version;build=$os.BuildNumber;disp=(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion').DisplayVersion;
cpu=$cpu.Name.Trim();cores=$cpu.NumberOfCores;threads=$cpu.NumberOfLogicalProcessors;gpu=@($gpu);board=($bb.Manufacturer+' '+$bb.Product).Trim();
ramSpeed=($mem|Select -First 1).Speed;ramSticks=@($mem).Count;gw=@($gw)[0];
disks=@($disks|%{[pscustomobject]@{l=$_.DeviceID;n=$_.VolumeName;free=$_.FreeSpace;size=$_.Size}})}`;
  const v = await psJson(script);
  const ips = localIPs();
  const r = Array.isArray(v) ? v[0] || {} : v || {};
  return {
    host: os.hostname(), user: os.userInfo().username,
    os: [r.os, r.disp].filter(Boolean).join(' ') + (r.build ? ` (build ${r.build})` : ''),
    cpu: r.cpu ? `${r.cpu} · ${r.cores} nhân ${r.threads} luồng` : os.cpus()[0]?.model || '',
    ram: `${Math.round(os.totalmem() / 1073741824)} GB` + (r.ramSpeed ? ` · ${r.ramSpeed} MHz` : '') + (r.ramSticks ? ` · ${r.ramSticks} thanh` : ''),
    gpu: arr(r.gpu).join(', '), board: r.board || '',
    ip: ips[0]?.ip || '', mac: ips[0]?.mac || '', gw: r.gw || '',
    uptime: os.uptime(), disks: arr(r.disks).map((d) => ({ l: d.l, n: d.n || '', free: Number(d.free) || 0, size: Number(d.size) || 0 })),
  };
}
let publicIpCache = null;
async function publicIP() {
  if (publicIpCache && Date.now() - publicIpCache.t < 10 * 60 * 1000) return publicIpCache.ip;
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 4000);
    const r = await fetch('https://api.ipify.org', { signal: ctl.signal }); const ip = (await r.text()).trim();
    publicIpCache = { ip, t: Date.now() }; return ip;
  } catch { return ''; }
}

// ---------- CPU / RAM / Ổ C ----------
let lastTimes = null;
function cpuPercent() {
  const t = os.cpus().reduce((a, c) => { const tot = Object.values(c.times).reduce((x, y) => x + y, 0); a.idle += c.times.idle; a.total += tot; return a; }, { idle: 0, total: 0 });
  let pct = 0;
  if (lastTimes) { const di = t.idle - lastTimes.idle, dt = t.total - lastTimes.total; pct = dt > 0 ? Math.round((1 - di / dt) * 100) : 0; }
  lastTimes = t; return pct;
}
async function stats() {
  let cFree = 0, cTotal = 0;
  try { const s = await fsp.statfs(IS_WIN ? (env('SystemDrive', 'C:') + '\\') : '/'); cFree = s.bavail * s.bsize; cTotal = s.blocks * s.bsize; } catch {}
  return { cpu: cpuPercent(), ramUsed: os.totalmem() - os.freemem(), ramTotal: os.totalmem(), cFree, cTotal, uptime: os.uptime() };
}

// ---------- NGUỒN ----------
async function power(action, minutes) {
  switch (action) {
    case 'lock': return run('rundll32.exe', ['user32.dll,LockWorkStation']);
    case 'sleep': return ps("Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.Application]::SetSuspendState('Suspend',$false,$false)");
    case 'restart': return run('shutdown.exe', ['/r', '/t', '0']);
    case 'shutdown': return run('shutdown.exe', ['/s', '/t', '0']);
    case 'timer': return run('shutdown.exe', ['/s', '/t', String(Math.round(minutes * 60))]);
    case 'cancel': return run('shutdown.exe', ['/a']);
  }
}

// ---------- CÔNG CỤ WINDOWS ----------
const WINTOOLS = {
  control: () => startDetached('control.exe'),
  devmgmt: () => cmdStart('devmgmt.msc'),
  diskmgmt: () => cmdStart('diskmgmt.msc'),
  services: () => cmdStart('services.msc'),
  network: () => cmdStart('ms-settings:network'),
  settings: () => cmdStart('ms-settings:'),
  eventvwr: () => cmdStart('eventvwr.msc'),
  taskschd: () => cmdStart('taskschd.msc'),
  envvars: () => startDetached('rundll32.exe', ['sysdm.cpl,EditEnvironmentVariables']),
  taskmgr: () => startDetached('taskmgr.exe'),
  appwiz: () => startDetached('control.exe', ['appwiz.cpl']),
  sysprops: () => startDetached('control.exe', ['sysdm.cpl']),
};
async function openWinTool(id) { const f = WINTOOLS[id]; return { ok: f ? await f() : false }; }

// ---------- TÌM FILE ----------
let fileIndex = { t: 0, items: [], building: null };
async function walk(dir, depth, maxDepth, out, limit) {
  if (out.length >= limit) return;
  let entries; try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (out.length >= limit) return;
    if (e.name.startsWith('.') || e.name.startsWith('$') || /^(node_modules|AppData|Windows|Program Files.*|ProgramData|System Volume Information|__pycache__)$/i.test(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { out.push({ n: e.name, p: f, dir: true }); if (depth < maxDepth) await walk(f, depth + 1, maxDepth, out, limit); }
    else if (e.isFile() && !/\.(lnk|ini|tmp|dll|sys)$/i.test(e.name)) out.push({ n: e.name, p: f, dir: false });
  }
}
async function buildIndex(extraRoots = []) {
  const home = os.homedir();
  const items = [];
  const roots = [['Desktop', 3], ['Documents', 4], ['Downloads', 2], ['Pictures', 2], ['Videos', 1], ['Music', 1]].map(([n, d]) => [path.join(home, n), d]);
  for (const r of extraRoots) roots.push([r, 3]);
  for (const drv of ['D:\\', 'E:\\']) { try { await fsp.access(drv); roots.push([drv, 3]); } catch {} }
  for (const [r, d] of roots) await walk(r, 0, d, items, 60000);
  // file mở gần đây
  const recentDir = path.join(ROAMING, 'Microsoft', 'Windows', 'Recent');
  const recent = [];
  try {
    const ents = await fsp.readdir(recentDir);
    const st = await Promise.all(ents.filter((n) => n.endsWith('.lnk')).map(async (n) => { try { return { n, m: (await fsp.stat(path.join(recentDir, n))).mtimeMs }; } catch { return null; } }));
    st.filter(Boolean).sort((a, b) => b.m - a.m).slice(0, 150).forEach((x) => recent.push({ lnk: path.join(recentDir, x.n), m: x.m }));
  } catch {}
  fileIndex = { t: Date.now(), items, recent, building: null };
}
async function searchFiles(q, resolveLnk, extraRoots) {
  if (!fileIndex.t || Date.now() - fileIndex.t > 5 * 60 * 1000) {
    if (!fileIndex.building) fileIndex.building = buildIndex(extraRoots);
    if (!fileIndex.t) await fileIndex.building;
  }
  const nq = norm(q);
  if (!nq) return [];
  const res = [];
  const seen = new Set();
  for (const r of fileIndex.recent || []) {
    const name = path.basename(r.lnk, '.lnk');
    if (!norm(name).includes(nq)) continue;
    const t = resolveLnk(r.lnk); if (!t || seen.has(t.toLowerCase())) continue;
    let dir = false; try { dir = fs.statSync(t).isDirectory(); } catch { continue; }
    seen.add(t.toLowerCase()); res.push({ n: path.basename(t), p: t, dir, m: r.m, recent: true });
    if (res.length >= 6) break;
  }
  for (const it of fileIndex.items) {
    if (res.length >= 12) break;
    if (!norm(it.n).includes(nq) || seen.has(it.p.toLowerCase())) continue;
    seen.add(it.p.toLowerCase()); res.push(it);
  }
  return res;
}
function norm(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase(); }

// ---------- QUÉT START MENU ----------
async function listLnk(dir, out, depth = 0) {
  let ents; try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const f = path.join(dir, e.name);
    if (e.isDirectory() && depth < 4) await listLnk(f, out, depth + 1);
    else if (/\.(lnk|url)$/i.test(e.name) && !/uninstall|gỡ|go cai|readme|help|website|manual/i.test(e.name)) out.push(f);
  }
}
async function startMenuShortcuts() {
  const out = [];
  await listLnk(path.join(ROAMING, 'Microsoft', 'Windows', 'Start Menu', 'Programs'), out);
  await listLnk(path.join(PROGDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs'), out);
  await listLnk(path.join(os.homedir(), 'Desktop'), out);
  await listLnk(path.join(env('PUBLIC', 'C:\\Users\\Public'), 'Desktop'), out);
  return out;
}

module.exports = { IS_WIN, ps, psJson, psAdmin, run, startDetached, cmdStart, junkScan, junkClean, processes, killProcs, restartExplorer, startupList, startupToggle, installedApps, uninstall, runFix, machineInfo, publicIP, localIPs, stats, power, openWinTool, searchFiles, startMenuShortcuts, norm, dirSize };
