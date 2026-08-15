$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$repositoryProcedures=Get-ChildItem (Join-Path $root 'RevenuUsage.Infrastructure\Repositories') -Filter '*.cs' -Recurse | Select-String -Pattern 'dbo\.(usp[A-Za-z0-9_]+)' -AllMatches | ForEach-Object {$_.Matches|ForEach-Object{$_.Groups[1].Value}} | Sort-Object -Unique
$sqlProcedures=Get-ChildItem $PSScriptRoot -Filter '*.sql' -Recurse | Select-String -Pattern '(?:CREATE OR ALTER|ALTER) PROCEDURE dbo\.(usp[A-Za-z0-9_]+)' -AllMatches | ForEach-Object {$_.Matches|ForEach-Object{$_.Groups[1].Value}} | Sort-Object -Unique
$missing=@($repositoryProcedures|Where-Object{$_ -notin $sqlProcedures})
if($missing.Count){throw "Missing SQL procedure definitions: $($missing -join ', ')"}
Write-Output "Verified $($repositoryProcedures.Count) repository procedure contracts."
