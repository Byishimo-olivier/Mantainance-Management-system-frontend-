$path = 'c:\Users\HP\Desktop\Projects\MMS\Mantainance-Management-system-frontend-\src\components\ClientDashboard.jsx'
$lines = Get-Content -Path $path
$start = 6662
$end = 6808
$before = if ($start -gt 1) { $lines[0..($start-2)] } else { @() }
$after = if ($end -lt $lines.Length) { $lines[$end..($lines.Length-1)] } else { @() }
$block = Get-Content -Path 'c:\Users\HP\Desktop\Projects\MMS\Mantainance-Management-system-frontend-\src\components\snippet_po_restore.txt'
$new = @()
$new += $before
$new += $block
$new += $after
Set-Content -Path $path -Value $new -Encoding utf8
