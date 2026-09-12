# Tests the promo migration in a fresh local PostgreSQL cluster. It never uses
# .env, Supabase credentials, or the application's database connection.
$ErrorActionPreference = 'Stop'
$postgresBin = Split-Path (Get-Command pg_ctl).Source
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('three-monkeys-promo-test-' + [guid]::NewGuid().ToString('N'))
$fixtureData = Join-Path $fixtureRoot 'data'
$fixtureStarted = $false
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$listener.Start()
$fixturePort = $listener.LocalEndpoint.Port
$listener.Stop()
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

function Invoke-FixtureCommand([string] $binary, [string[]] $arguments) {
  & (Join-Path $postgresBin $binary) @arguments
  if ($LASTEXITCODE -ne 0) { throw "$binary failed with exit code $LASTEXITCODE" }
}

try {
  Invoke-FixtureCommand 'initdb.exe' @('-D', $fixtureData, '-U', 'postgres', '-A', 'trust', '--no-locale', '-E', 'UTF8')
  Invoke-FixtureCommand 'pg_ctl.exe' @('-D', $fixtureData, '-l', (Join-Path $fixtureRoot 'postgres.log'), '-o', "-h 127.0.0.1 -p $fixturePort", '-w', 'start')
  $fixtureStarted = $true
  Invoke-FixtureCommand 'createdb.exe' @('-h', '127.0.0.1', '-p', "$fixturePort", '-U', 'postgres', 'checkout_regression')
  $connectionArgs = @('-h', '127.0.0.1', '-p', "$fixturePort", '-U', 'postgres', '-d', 'checkout_regression', '-v', 'ON_ERROR_STOP=1')
  Invoke-FixtureCommand 'psql.exe' ($connectionArgs + @('-f', (Join-Path $PSScriptRoot 'checkout-promo-migration.test.sql')))

  $concurrentSql = Join-Path $fixtureRoot 'concurrent.sql'
  @'
BEGIN;
UPDATE public.bookings SET status = 'confirmed' WHERE id = '55555555-5555-4555-8555-555555555555';
SELECT pg_sleep(1);
COMMIT;
'@ | Set-Content -LiteralPath $concurrentSql
  $concurrentArgs = $connectionArgs + @('-f', ('"' + $concurrentSql + '"'))
  $first = Start-Process -FilePath (Join-Path $postgresBin 'psql.exe') -ArgumentList $concurrentArgs -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $fixtureRoot 'first.log') -RedirectStandardError (Join-Path $fixtureRoot 'first-error.log')
  $null = $first.Handle
  $second = Start-Process -FilePath (Join-Path $postgresBin 'psql.exe') -ArgumentList $concurrentArgs -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $fixtureRoot 'second.log') -RedirectStandardError (Join-Path $fixtureRoot 'second-error.log')
  $null = $second.Handle
  $first.WaitForExit()
  $second.WaitForExit()
  if ($first.ExitCode -ne 0 -or $second.ExitCode -ne 0) {
    Get-Content -LiteralPath (Join-Path $fixtureRoot 'first-error.log'), (Join-Path $fixtureRoot 'second-error.log')
    throw "Concurrent fixture update failed: first=$($first.ExitCode), second=$($second.ExitCode)."
  }

  $assertSql = Join-Path $fixtureRoot 'assert.sql'
  @'
DO $$ BEGIN
  IF (SELECT current_uses FROM public.promo_codes WHERE id = '44444444-4444-4444-8444-444444444444') <> 1 THEN
    RAISE EXCEPTION 'Concurrent duplicate payment updates consumed more than one promo use';
  END IF;
END $$;
SELECT 'Concurrent promo migration assertions passed' AS result;
'@ | Set-Content -LiteralPath $assertSql
  Invoke-FixtureCommand 'psql.exe' ($connectionArgs + @('-f', $assertSql))
} finally {
  if ($fixtureStarted) {
    Invoke-FixtureCommand 'pg_ctl.exe' @('-D', $fixtureData, '-m', 'immediate', '-w', 'stop')
  }
  # Resolve and check the exact target before any recursive deletion.
  $resolvedFixture = (Resolve-Path -LiteralPath $fixtureRoot).Path
  $resolvedTemp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
  if (!$resolvedFixture.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase) -or !(Split-Path $resolvedFixture -Leaf).StartsWith('three-monkeys-promo-test-')) {
    throw 'Refusing to remove an unexpected fixture path.'
  }
  Remove-Item -LiteralPath $resolvedFixture -Recurse -Force
}
