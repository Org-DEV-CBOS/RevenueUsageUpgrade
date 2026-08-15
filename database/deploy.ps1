param([Parameter(Mandatory=$true)][string]$Server,[string]$Database='RUTS',[string]$Username,[string]$Password,[switch]$TrustServerCertificate,[switch]$CreateDatabase)
$ErrorActionPreference='Stop'
if($Server -eq 'YOUR_SERVER'){throw 'Replace YOUR_SERVER with a real SQL Server instance, for example .\SQLEXPRESS.'}
if($Username -and -not $Password){throw 'Password is required when Username is supplied.'}
$authArgs=if($Username){@('-U',$Username,'-P',$Password)}else{@('-E')}
$trustArgs=if($TrustServerCertificate){@('-C')}else{@()}
if($CreateDatabase){
  $escapedDatabase=$Database.Replace(']',']]')
  $createQuery="IF DB_ID(N'$($Database.Replace("'","''"))') IS NULL CREATE DATABASE [$escapedDatabase];"
  $createArgs=@('-S',$Server,'-d','master','-b','-Q',$createQuery)+$authArgs+$trustArgs
  & sqlcmd @createArgs
  if($LASTEXITCODE-ne 0){throw "Could not create or access database '$Database'."}
}
$scripts=@('001_schema.sql','002_seed_reference_data.sql','010_master_data_procedures.sql','020_transaction_procedures.sql','../procedures/uspGetTransfers.sql','030_reporting_procedures.sql','090_verify.sql')
$base=Join-Path $PSScriptRoot 'deployment'
foreach($script in $scripts){
  $sourcePath=Join-Path $base $script
  $inputPath=$sourcePath
  $temporaryPath=$null
  try {
    $sql=[IO.File]::ReadAllText($sourcePath)
    if($sql.Contains('CREATE OR ALTER PROCEDURE')){
      $temporaryPath=[IO.Path]::GetTempFileName()
      [IO.File]::WriteAllText($temporaryPath,$sql.Replace('CREATE OR ALTER PROCEDURE','CREATE PROCEDURE'))
      $inputPath=$temporaryPath
    }
    $args=@('-S',$Server,'-d',$Database,'-b','-i',$inputPath)+$authArgs+$trustArgs
    & sqlcmd @args
    if($LASTEXITCODE-ne 0){throw "Deployment failed: $script"}
  } finally {
    if($temporaryPath -and (Test-Path $temporaryPath)){Remove-Item -LiteralPath $temporaryPath}
  }
}
