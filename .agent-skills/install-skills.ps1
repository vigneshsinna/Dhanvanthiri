Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Path $PSScriptRoot -Parent
$sourcesRoot = Join-Path $PSScriptRoot 'sources'
$reportsRoot = Join-Path $PSScriptRoot 'reports'

if (-not (Test-Path $sourcesRoot)) {
    throw "Sources folder not found: $sourcesRoot"
}

if (-not (Test-Path $reportsRoot)) {
    New-Item -ItemType Directory -Path $reportsRoot | Out-Null
}

$repoRoots = @{
    'superpowers' = Join-Path $sourcesRoot 'superpowers'
    'openai-skills' = Join-Path $sourcesRoot 'openai-skills'
    'anthropics-skills' = Join-Path $sourcesRoot 'anthropics-skills'
    'skillkit' = Join-Path $sourcesRoot 'skillkit'
}

$agentTargets = @(
    @{ Name = 'claude'; Path = '.claude/skills'; Format = 'skillmd' }
    @{ Name = 'codex'; Path = '.codex/skills'; Format = 'skillmd' }
    @{ Name = 'opencode'; Path = '.opencode/skills'; Format = 'skillmd' }
    @{ Name = 'gemini'; Path = '.gemini/skills'; Format = 'skillmd' }
    @{ Name = 'aider'; Path = '.aider/skills'; Format = 'skillmd' }
    @{ Name = 'cody'; Path = '.cody/skills'; Format = 'skillmd' }
    @{ Name = 'amazonq'; Path = '.amazonq/skills'; Format = 'skillmd' }
    @{ Name = 'copilot'; Path = '.github/skills'; Format = 'markdown' }
    @{ Name = 'windsurf'; Path = '.windsurf/skills'; Format = 'markdown' }
    @{ Name = 'devin'; Path = '.devin/skills'; Format = 'markdown' }
    @{ Name = 'cursor'; Path = '.cursor/skills'; Format = 'mdc' }
)

function Get-SkillNameFromContent {
    param([string]$Content, [string]$Fallback)

    $name = $null
    if ($Content -match '(?ms)^---\s*(.*?)\s*---') {
        $frontmatter = $matches[1]
        if ($frontmatter -match '(?im)^name\s*:\s*["'']?([^"''\r\n]+)') {
            $name = $matches[1].Trim()
        }
    }

    if ([string]::IsNullOrWhiteSpace($name)) {
        return $Fallback
    }

    return $name
}

function Sanitize-SkillName {
    param([string]$Name)

    $normalized = $Name.ToLowerInvariant()
    $normalized = ($normalized -replace '[^a-z0-9\-]+', '-')
    $normalized = ($normalized -replace '-{2,}', '-')
    $normalized = $normalized.Trim('-')

    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return 'unnamed-skill'
    }

    return $normalized
}

function Set-NamespacedSkillName {
    param(
        [string]$FilePath,
        [string]$NamespacedName
    )

    $content = Get-Content -Raw -Path $FilePath

    if ($content -match '(?ms)^---\s*(.*?)\s*---') {
        $frontmatter = $matches[1]
        $replaced = $false
        if ($frontmatter -match '(?im)^name\s*:') {
            $updatedFrontmatter = [regex]::Replace(
                $frontmatter,
                '(?im)^name\s*:\s*.*$',
                "name: $NamespacedName"
            )
            $replaced = $true
        }
        else {
            $updatedFrontmatter = "name: $NamespacedName`r`n$frontmatter"
            $replaced = $true
        }

        if ($replaced) {
            $updatedContent = [regex]::Replace(
                $content,
                '(?ms)^---\s*.*?\s*---',
                "---`r`n$updatedFrontmatter`r`n---"
            )
            Set-Content -Path $FilePath -Value $updatedContent -NoNewline
            return
        }
    }

    $withFrontmatter = "---`r`nname: $NamespacedName`r`n---`r`n`r`n$content"
    Set-Content -Path $FilePath -Value $withFrontmatter -NoNewline
}

$skillEntries = @()

foreach ($repoName in $repoRoots.Keys) {
    $repoRoot = $repoRoots[$repoName]
    if (-not (Test-Path $repoRoot)) {
        throw "Repository not found: $repoRoot"
    }

    $skillFiles = Get-ChildItem -Path $repoRoot -Recurse -File -Filter 'SKILL.md' |
        Where-Object {
            $_.FullName -notmatch '\\.git\\' -and
            $_.FullName -notmatch '\\node_modules\\'
        }

    foreach ($skillFile in $skillFiles) {
        $skillDir = Split-Path -Path $skillFile.FullName -Parent
        $content = Get-Content -Raw -Path $skillFile.FullName
        $fallback = Split-Path -Path $skillDir -Leaf
        $originalName = Get-SkillNameFromContent -Content $content -Fallback $fallback
        $sanitized = Sanitize-SkillName -Name $originalName
        $namespaced = "$repoName--$sanitized"
        $isPotentiallyGlobal = [bool]($content -match '(?im)\b(always|mandatory|before any task|must\s+always)\b')

        $skillEntries += [PSCustomObject]@{
            Repo = $repoName
            SkillDir = $skillDir
            SkillFile = $skillFile.FullName
            OriginalName = $originalName
            NamespacedName = $namespaced
            InstallName = $namespaced
            PotentiallyGlobal = $isPotentiallyGlobal
        }
    }
}

$installNameGroups = $skillEntries | Group-Object InstallName | Where-Object { $_.Count -gt 1 }
foreach ($group in $installNameGroups) {
    $ordered = $group.Group | Sort-Object SkillFile
    for ($index = 0; $index -lt $ordered.Count; $index++) {
        if ($index -eq 0) {
            $ordered[$index].InstallName = $ordered[$index].NamespacedName
        }
        else {
            $ordered[$index].InstallName = ($ordered[$index].NamespacedName + '-' + ($index + 1))
        }
    }
}

$duplicates = $skillEntries |
    Group-Object OriginalName |
    Where-Object { $_.Count -gt 1 } |
    Sort-Object Count -Descending

foreach ($target in $agentTargets) {
    $targetRoot = Join-Path $workspaceRoot $target.Path
    if (-not (Test-Path $targetRoot)) {
        New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null
    }

    foreach ($skill in $skillEntries) {
        $destSkillDir = Join-Path $targetRoot $skill.InstallName
        if (Test-Path $destSkillDir) {
            Remove-Item -Path $destSkillDir -Recurse -Force
        }

        New-Item -ItemType Directory -Path $destSkillDir -Force | Out-Null
        Copy-Item -Path (Join-Path $skill.SkillDir '*') -Destination $destSkillDir -Recurse -Force

        $destSkillMd = Join-Path $destSkillDir 'SKILL.md'
        if (Test-Path $destSkillMd) {
            Set-NamespacedSkillName -FilePath $destSkillMd -NamespacedName $skill.InstallName
        }

        if ($target.Format -eq 'mdc') {
            if (Test-Path $destSkillMd) {
                $mdcFile = Join-Path $destSkillDir ($skill.InstallName + '.mdc')
                Move-Item -Path $destSkillMd -Destination $mdcFile -Force
            }
        }
    }
}

$reportPath = Join-Path $reportsRoot 'compatibility-report.md'

$byRepo = $skillEntries | Group-Object Repo | Sort-Object Name
$globalFlagged = $skillEntries | Where-Object PotentiallyGlobal

$reportLines = @()
$reportLines += '# Skill Compatibility Report'
$reportLines += ''
$reportLines += ('Generated: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
$reportLines += ''
$reportLines += '## Sources'
foreach ($repo in $byRepo) {
    $reportLines += ('- ' + $repo.Name + ': ' + $repo.Count + ' skills')
}
$reportLines += ('- Total: ' + $skillEntries.Count + ' skills')
$reportLines += ''
$reportLines += '## Collision Analysis'
if ($duplicates.Count -eq 0) {
    $reportLines += '- No duplicate original skill names found.'
}
else {
    $reportLines += '- Duplicate original names detected (collision-safe due to namespacing):'
    foreach ($dup in $duplicates) {
        $reportLines += ('  - ' + $dup.Name + ' (' + $dup.Count + ')')
    }
}
$reportLines += ''
$reportLines += '## Interference Controls Applied'
$reportLines += '- Only SKILL.md-based skill folders were installed.'
$reportLines += '- Non-skill global instruction files (e.g., AGENTS.md, CLAUDE.md, install docs) were not installed.'
$reportLines += '- Each skill was namespaced by source repo in frontmatter `name` to avoid cross-repo collisions.'
$reportLines += '- Skills were installed into isolated per-agent directories with identical namespaced folder names.'
$reportLines += ''
$reportLines += '## Potentially Global Wording (Review Recommended)'
$reportLines += ('- Flagged skills: ' + $globalFlagged.Count)
foreach ($item in ($globalFlagged | Sort-Object Repo, NamespacedName)) {
    $relativePath = $item.SkillFile.Replace($workspaceRoot + '\\', '').Replace('\\', '/')
    $reportLines += ('  - ' + $item.InstallName + ' (' + $item.Repo + ') -> ' + $relativePath)
}
$reportLines += ''
$reportLines += '## Install Targets'
foreach ($target in $agentTargets) {
    $reportLines += ('- ' + $target.Name + ': ' + $target.Path)
}

Set-Content -Path $reportPath -Value ($reportLines -join "`r`n") -Encoding UTF8

$manifestPath = Join-Path $PSScriptRoot 'manifest.json'
$manifest = [PSCustomObject]@{
    generatedAt = (Get-Date -Format 'o')
    totalSkills = $skillEntries.Count
    sources = ($byRepo | ForEach-Object { [PSCustomObject]@{ repo = $_.Name; count = $_.Count } })
    duplicates = ($duplicates | ForEach-Object { [PSCustomObject]@{ name = $_.Name; count = $_.Count } })
    targets = ($agentTargets | ForEach-Object { [PSCustomObject]@{ name = $_.Name; path = $_.Path; format = $_.Format } })
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "Installed $($skillEntries.Count) namespaced skills into $($agentTargets.Count) agent targets."
Write-Host "Report: $reportPath"
Write-Host "Manifest: $manifestPath"