# Meow Launcher - GPU usage and temperatures for the overlay (Catmeow Team)
# Prints one JSON line about every 1.5 s. No Administrator rights needed. Exits when -Parent exits.
param([int]$Parent = 0)
$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

$smi = @("$env:SystemRoot\System32\nvidia-smi.exe", "$env:ProgramFiles\NVIDIA Corporation\NVSMI\nvidia-smi.exe") |
  Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
$useCounter = $true
$tick = 0

function Temp-FromZones($values) {
  $best = $null
  foreach ($v in $values) {
    $c = [double]$v
    if ($c -gt 2000) { $c = $c / 10 }        # High Precision Temperature is in tenths of a Kelvin
    $c = $c - 273.15
    if ($c -gt 5 -and $c -lt 125 -and ($best -eq $null -or $c -gt $best)) { $best = $c }
  }
  if ($best -ne $null) { [math]::Round($best) } else { $null }
}

while ($true) {
  if ($Parent -gt 0 -and -not (Get-Process -Id $Parent)) { break }
  $o = [ordered]@{}

  # GPU usage: busiest engine type summed across processes (what Task Manager shows)
  $engines = $null
  if ($useCounter) {
    try {
      $s = Get-Counter -Counter '\GPU Engine(*)\Utilization Percentage' -ErrorAction Stop
      $engines = $s.CounterSamples | ForEach-Object { [pscustomobject]@{ Name = $_.InstanceName; V = $_.CookedValue } }
    } catch { $useCounter = $false }
  }
  if (-not $useCounter) {
    $engines = Get-CimInstance Win32_PerfFormattedData_GPUPerformanceCounters_GPUEngine -Property Name, UtilizationPercentage |
      ForEach-Object { [pscustomobject]@{ Name = $_.Name; V = [double]$_.UtilizationPercentage } }
  }
  if ($engines) {
    $by = @{}
    foreach ($e in $engines) { if ($e.Name -match 'engtype_([a-z0-9]+)') { $by[$matches[1]] += $e.V } }
    if ($by.Count) { $o.gpu = [math]::Min(100, [math]::Round(($by.Values | Measure-Object -Maximum).Maximum)) }
  }

  # Temperature from ACPI thermal zones (every 3 s - it changes slowly)
  if ($tick % 2 -eq 0) {
    $z = Get-CimInstance Win32_PerfFormattedData_Counters_ThermalZoneInformation -Property HighPrecisionTemperature, Temperature
    $vals = @($z | ForEach-Object { if ($_.HighPrecisionTemperature) { $_.HighPrecisionTemperature } else { $_.Temperature } })
    if (-not $vals.Count) {
      $z2 = Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature
      $vals = @($z2 | ForEach-Object { $_.CurrentTemperature })
    }
    $script:cpuT = Temp-FromZones $vals
  }
  if ($script:cpuT -ne $null) { $o.cpuT = $script:cpuT }

  # NVIDIA cards: real GPU temperature
  if ($smi) {
    $line = & $smi --query-gpu=temperature.gpu,utilization.gpu --format=csv,noheader,nounits 2>$null | Select-Object -First 1
    if ($line) {
      $p = $line -split ','
      $o.gpuT = [int]$p[0].Trim()
      if ($o.gpu -eq $null) { $o.gpu = [int]$p[1].Trim() }
    }
  }

  [Console]::Out.WriteLine(($o | ConvertTo-Json -Compress))
  [Console]::Out.Flush()
  $tick++
  Start-Sleep -Milliseconds 1500
}
