$skillFiles = Get-ChildItem -Recurse -File -Filter SKILL.md | Where-Object { $_.FullName -match 'superpowers|openai-skills|anthropics-skills|skillkit' }
Write-Output ('Total SKILL.md files: ' + $skillFiles.Count)
$items = foreach ($f in $skillFiles) {
  $content = Get-Content -Raw -Path $f.FullName
  $name = $null
  if ($content -match '(?ms)^---\s*(.*?)\s*---') {
    $fm = $matches[1]
    if ($fm -match '(?im)^name\s*:\s*["'']?([^"''\r\n]+)') { $name = $matches[1].Trim() }
  }
  if (-not $name) { $name = Split-Path -Path (Split-Path $f.FullName -Parent) -Leaf }
  $always = [bool]($content -match '(?im)\b(always|mandatory|before any task|must\s+always)\b')
  [PSCustomObject]@{
    Repo = if($f.FullName -match 'superpowers'){'superpowers'} elseif($f.FullName -match 'openai-skills'){'openai-skills'} elseif($f.FullName -match 'anthropics-skills'){'anthropics-skills'} else {'skillkit'}
    Name = $name
    File = $f.FullName
    HasGlobalishWords = $always
  }
}
$dupes = $items | Group-Object Name | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending
Write-Output ''
Write-Output 'Duplicate names:'
if ($dupes.Count -eq 0) { Write-Output 'None' } else { $dupes | Select-Object -First 40 | ForEach-Object { Write-Output ('- ' + $_.Name + ' (' + $_.Count + ')') } }
Write-Output ''
Write-Output ('Potentially global wording count: ' + (($items | Where-Object HasGlobalishWords).Count))
