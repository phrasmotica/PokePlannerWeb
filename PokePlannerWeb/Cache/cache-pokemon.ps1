param(
    [string] $CacheFile = "Pokemon.json",
    [string] $PokeApi = "http://localhost:8000/api/v2",
    [switch] $ForceUpdate = $false,
    [int] $Count = 964
)

# sends a vanilla GET request to the endpoint and returns the response content
function Get([string] $Endpoint)
{
    $Endpoint = $Endpoint.Replace("$PokeApi/", "")
    $response = Invoke-WebRequest -Uri "$PokeApi/$Endpoint"
    return ($response.Content | ConvertFrom-Json)
}

# returns the display names of the given Pokemon species or form
function GetDisplayNames($Resource)
{
    $names = $Resource.names | % {
        return @{
            Language = $_.language.name
            Name = $_.name
        }
    }

    return $names
}

# returns the forms of the given Pokemon
function GetForms($Pokemon, $FallbackDisplayNames)
{
    # get resources for the forms
    $formResources = $Pokemon.forms

    $forms = @()
    foreach ($res in $formResources)
    {
        # process each one
        $form = Get -Endpoint $res.url
        $key = $form.id

        $displayNames = GetDisplayNames -Resource $form
        if ($displayNames.Count -le 0)
        {
            $displayNames = $FallbackDisplayNames
        }

        $forms += @{
            Key = $key
            DisplayNames = @($displayNames)
        }
    }

    return $forms
}

$needsUpdate = $true
$date = [datetime]::UtcNow
if (Test-Path $CacheFile)
{
    $oldCache = Get-Content $CacheFile | ConvertFrom-Json
    $lifetime = [timespan]::FromDays(365)
    $needsUpdate = ($date - [datetime] $oldCache.Timestamp) -gt $lifetime
}

if ($ForceUpdate -or $needsUpdate)
{
    $response = Read-Host "Are you sure you want to cache $Count Pokemon? This could take up to 30 minutes"
    if ($response -ne "y")
    {
        return
    }

    # cache object to be written
    $newCache = @{
        Timestamp = Get-Date $date -Format o
        Entries = @()
    }

    # get all Pokemon resources
    $pokemonResources = (Get -Endpoint "pokemon/?offset=0&limit=$Count").Results
    $pokemonCount = $pokemonResources.Count
    $completeCount = 0

    # cache them
    foreach ($res in $pokemonResources)
    {
        $pokemon = Get -Endpoint $res.url

        $key = $pokemon.id

        $species = Get -Endpoint $pokemon.species.url
        $displayNames = GetDisplayNames -Resource $species
        $forms = GetForms -Pokemon $pokemon -FallbackDisplayNames $displayNames

        $entry = @{
            Key = $key
            DisplayNames = @($displayNames)
            Forms = @($forms)
        }
        $newCache.Entries += $entry

        $completeCount++
        $p = $completeCount * 100 / $pokemonCount
        Write-Progress -Activity "Caching Pokemon" `
                       -Status "$completeCount of $pokemonCount complete" `
                       -PercentComplete $p
    }

    $json = $newCache | ConvertTo-Json -Depth 6
    Set-Content -Path $CacheFile -Value $json -Encoding UTF8

    Write-Host "Cached $($newCache.Entries.Count) Pokemon at $date to $CacheFile"
}
else
{
    Write-Host "No update needed at $date to $CacheFile"
}
