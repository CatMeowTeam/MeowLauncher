# Meow Launcher - FPS counter (Catmeow Team)
# Counts DirectX Present calls of the foreground app through Windows ETW (same idea as PresentMon).
# Needs Administrator rights to open a real-time ETW session.
# Writes one small JSON object to -Out every second. Stops when -Parent exits or "<Out>.stop" appears.
# While "<Out>.pause" exists the ETW providers are switched off (no CPU cost) but the session stays ready.
param([string]$Out, [int]$Parent = 0)
$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

public static class MeowFps {
  [DllImport("advapi32.dll", CharSet = CharSet.Unicode)] static extern uint StartTraceW(out ulong handle, string name, IntPtr props);
  [DllImport("advapi32.dll", CharSet = CharSet.Unicode)] static extern uint ControlTraceW(ulong handle, string name, IntPtr props, uint code);
  [DllImport("advapi32.dll")] static extern uint EnableTraceEx2(ulong handle, ref Guid provider, uint control, byte level, ulong any, ulong all, uint timeout, IntPtr param);
  [DllImport("advapi32.dll", SetLastError = true)] static extern ulong OpenTraceW(IntPtr logfile);
  [DllImport("advapi32.dll")] static extern uint ProcessTrace(ulong[] handles, uint count, IntPtr start, IntPtr end);
  [DllImport("advapi32.dll")] static extern uint CloseTrace(ulong handle);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);

  [UnmanagedFunctionPointer(CallingConvention.Winapi)] delegate void EventCb(IntPtr record);

  const string NAME = "MeowLauncherFps";
  static EventCb callback;
  static ulong session, trace;
  static Guid DXGI = new Guid("CA11C036-0102-4A2D-A6AD-F03CFED5D3C9");
  static Guid D3D9 = new Guid("783ACA0A-790E-4D7F-8451-AA850511C6B9");
  static readonly object gate = new object();
  static Dictionary<uint, int> counts = new Dictionary<uint, int>();
  static Stopwatch clock = Stopwatch.StartNew();
  static bool enabled;

  // EVENT_TRACE_PROPERTIES (x64: 120 bytes) followed by room for the session name
  static IntPtr Props() {
    int size = 120 + 1024;
    IntPtr p = Marshal.AllocHGlobal(size);
    for (int i = 0; i < size; i++) Marshal.WriteByte(p, i, 0);
    Marshal.WriteInt32(p, 0, size);                                  // Wnode.BufferSize
    Marshal.Copy(Guid.NewGuid().ToByteArray(), 0, new IntPtr(p.ToInt64() + 24), 16); // Wnode.Guid
    Marshal.WriteInt32(p, 40, 1);                                    // Wnode.ClientContext = QPC
    Marshal.WriteInt32(p, 44, 0x00020000);                           // WNODE_FLAG_TRACED_GUID
    Marshal.WriteInt32(p, 64, 0x00000100);                           // EVENT_TRACE_REAL_TIME_MODE
    Marshal.WriteInt32(p, 68, 1);                                    // FlushTimer = 1 s
    Marshal.WriteInt32(p, 116, 120);                                 // LoggerNameOffset
    return p;
  }

  static void OnEvent(IntPtr rec) {
    // EVENT_HEADER: ProcessId @12, ProviderId @24, EventDescriptor.Id @40
    int data1 = Marshal.ReadInt32(rec, 24);
    int id = Marshal.ReadInt16(rec, 40) & 0xFFFF;
    bool present = (data1 == unchecked((int)0xCA11C036) && id == 42) || (data1 == 0x783ACA0A && id == 1);
    if (!present) return;
    uint pid = (uint)Marshal.ReadInt32(rec, 12);
    lock (gate) { int n; counts.TryGetValue(pid, out n); counts[pid] = n + 1; }
  }

  static void SetProviders(bool on) {
    uint code = on ? 1u : 0u;
    EnableTraceEx2(session, ref DXGI, code, 4, 0, 0, 0, IntPtr.Zero);
    EnableTraceEx2(session, ref D3D9, code, 4, 0, 0, 0, IntPtr.Zero);
    enabled = on;
  }

  public static string Start() {
    if (IntPtr.Size != 8) return "x86";
    ControlTraceW(0, NAME, Props(), 1);                              // stop a session left over from a crash
    uint r = StartTraceW(out session, NAME, Props());
    if (r == 5) return "denied";
    if (r != 0) return "start" + r;
    SetProviders(true);

    // EVENT_TRACE_LOGFILEW (x64: 448 bytes)
    IntPtr lf = Marshal.AllocHGlobal(448);
    for (int i = 0; i < 448; i++) Marshal.WriteByte(lf, i, 0);
    Marshal.WriteIntPtr(lf, 8, Marshal.StringToHGlobalUni(NAME));    // LoggerName
    Marshal.WriteInt32(lf, 28, 0x00000100 | 0x10000000);             // PROCESS_TRACE_MODE_REAL_TIME | EVENT_RECORD
    callback = new EventCb(OnEvent);
    Marshal.WriteIntPtr(lf, 424, Marshal.GetFunctionPointerForDelegate(callback)); // EventRecordCallback
    trace = OpenTraceW(lf);
    if (trace == ulong.MaxValue) { Stop(); return "open" + Marshal.GetLastWin32Error(); }
    Thread t = new Thread(delegate () { ProcessTrace(new ulong[] { trace }, 1, IntPtr.Zero, IntPtr.Zero); });
    t.IsBackground = true;
    t.Start();
    return "ok";
  }

  public static void Pause(bool pause) {
    if (pause == !enabled) return;
    SetProviders(!pause);
    lock (gate) { counts.Clear(); }
    clock.Restart();
  }

  public static string Tick() {
    double sec = clock.Elapsed.TotalSeconds;
    clock.Restart();
    Dictionary<uint, int> snap;
    lock (gate) { snap = counts; counts = new Dictionary<uint, int>(); }
    uint fg = 0;
    GetWindowThreadProcessId(GetForegroundWindow(), out fg);
    int n = 0;
    snap.TryGetValue(fg, out n);
    string name = "";
    try { name = Process.GetProcessById((int)fg).ProcessName; } catch { }
    name = name.Replace("\\", "").Replace("\"", "");
    long now = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds;
    string fps = (n > 0 && sec > 0) ? Math.Round(n / sec).ToString() : "null";
    return "{\"t\":" + now + ",\"pid\":" + fg + ",\"name\":\"" + name + "\",\"fps\":" + fps + ",\"on\":" + (enabled ? "true" : "false") + "}";
  }

  public static void Stop() {
    try { if (session != 0) SetProviders(false); } catch { }
    ControlTraceW(0, NAME, Props(), 1);
    if (trace != 0 && trace != ulong.MaxValue) CloseTrace(trace);
  }
}
"@

$tmp = "$Out.tmp"
function Write-State([string]$json) { [IO.File]::WriteAllText($tmp, $json); Move-Item -LiteralPath $tmp -Destination $Out -Force }

$r = [MeowFps]::Start()
if ($r -ne 'ok') { Write-State ('{"err":"' + $r + '"}'); exit 1 }
try {
  while ($true) {
    Start-Sleep -Milliseconds 1000
    if ($Parent -gt 0 -and -not (Get-Process -Id $Parent -ErrorAction SilentlyContinue)) { break }
    if (Test-Path -LiteralPath "$Out.stop") { break }
    [MeowFps]::Pause((Test-Path -LiteralPath "$Out.pause"))
    Write-State ([MeowFps]::Tick())
  }
} finally {
  [MeowFps]::Stop()
  Remove-Item -LiteralPath "$Out.stop", $Out -ErrorAction SilentlyContinue
}
