param(
    [string] $CacheFile = "PokemonSpecies.json",
    [string] $PokeApi = "http://localhost:8000/api/v2",
    [switch] $ForceUpdate = $false,
    [int] $Count = 807
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

# returns the varieties of the given Pokemon species
function GetVarieties($Species, $FallbackDisplayNames)
{
    # get resources for the varieties
    $varietyResources = $Species.varieties | select -ExpandProperty pokemon

    $varieties = @()
    foreach ($res in $varietyResources)
    {
        # process each one
        $pokemon = Get -Endpoint $res.Url
        $key = $pokemon.id

        $form = Get -Endpoint $pokemon.forms[0].url
        $displayNames = GetDisplayNames -Resource $form
        if ($displayNames.Count -le 0)
        {
            $displayNames = $FallbackDisplayNames
        }

        $varieties += @{
            Key = $key
            DisplayNames = @($displayNames)
        }
    }

    return $varieties
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
    $response = Read-Host "Are you sure you want to cache $Count Pokemon species? This could take up to 30 minutes"
    if ($response -ne "y")
    {
        return
    }

    # cache object to be written
    $newCache = @{
        Timestamp = Get-Date $date -Format o
        Entries = @()
    }

    # get all species resources
    $speciesResources = (Get -Endpoint "pokemon-species/?offset=0&limit=$Count").Results
    $speciesCount = $speciesResources.Count
    $completeCount = 0

    # cache them
    foreach ($res in $speciesResources)
    {
        $species = Get -Endpoint $res.url

        $key = $species.id
        $displayNames = GetDisplayNames -Resource $species
        $varieties = GetVarieties -Species $species -FallbackDisplayNames $displayNames

        $entry = @{
            Key = $key
            DisplayNames = @($displayNames)
            Varieties = @($varieties)
        }
        $newCache.Entries += $entry

        $completeCount++
        $p = $completeCount * 100 / $speciesCount
        Write-Progress -Activity "Caching Pokemon species" `
                       -Status "$completeCount of $speciesCount complete" `
                       -PercentComplete $p
    }

    $json = $newCache | ConvertTo-Json -Depth 6
    Set-Content -Path $CacheFile -Value $json -Encoding UTF8

    Write-Host "Cached $($newCache.Entries.Count) Pokemon species at $date to $CacheFile"
}
else
{
    Write-Host "No update needed at $date to $CacheFile"
}
