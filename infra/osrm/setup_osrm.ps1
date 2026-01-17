$ErrorActionPreference = "Stop"
$DataDir = Join-Path $PSScriptRoot "data"
$SourceMap = "central-zone-latest.osm.pbf"
$CustomMapFile = "lucknow.osm.pbf"
$OsrmFile = "lucknow.osrm"

# Bounding Box for Lucknow (Tight) - verified coordinates
# Approx: Left 80.75, Bottom 26.70, Right 81.15, Top 27.00
$BBox = "80.75,26.70,81.15,27.00"

# Create data directory if it doesn't exist
if (!(Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir
}

# Clean up existing data to force fresh processing
Write-Host "Cleaning up old map data (keeping source maps)..."
Get-ChildItem -Path $DataDir -Recurse | Where-Object { $_.Name -ne $SourceMap } | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

# Download Central Zone PBF if missing or too small
if (!(Test-Path "$DataDir\$SourceMap") -or (Get-Item "$DataDir\$SourceMap").Length -lt 10000000) {
    Write-Host "Downloading Central Zone map using curl..."
    if (Test-Path "$DataDir\$SourceMap") { Remove-Item "$DataDir\$SourceMap" -Force }
    curl.exe -L "https://download.geofabrik.de/asia/india/central-zone-latest.osm.pbf" -o "$DataDir\$SourceMap"
}

Write-Host "Source map size: $((Get-Item "$DataDir\$SourceMap").Length) bytes"

# Extract Lucknow region
Write-Host "Extracting Lucknow region..."
if (!(Test-Path "$DataDir\$SourceMap")) {
    Write-Error "Map file $SourceMap not found in $DataDir. Please verify downloads."
}

# Use osmium to extract the region
docker run --rm -t -v "${DataDir}:/data" stefda/osmium-tool osmium extract --bbox $BBox /data/$SourceMap -o /data/$CustomMapFile --overwrite

# Verify extracted file size
$ExtractedFileItem = Get-Item "$DataDir\$CustomMapFile"
if ($ExtractedFileItem.Length -lt 5000) {
    Write-Error "Extracted file is too small ($($ExtractedFileItem.Length) bytes). Extraction failed or area has no data."
}

# Optional: Clean up source map to save memory/disk
# Write-Host "Cleaning up source India map to preserve space..."
# Remove-Item "$DataDir\$SourceMap" -Force

# Run OSRM processing on extracted map
Write-Host "Running OSRM extraction on Lucknow map..."
docker run -t -v "${DataDir}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/$CustomMapFile

Write-Host "Running OSRM partition..."
docker run -t -v "${DataDir}:/data" osrm/osrm-backend osrm-partition /data/$OsrmFile

Write-Host "Running OSRM customization..."
docker run -t -v "${DataDir}:/data" osrm/osrm-backend osrm-customize /data/$OsrmFile

Write-Host "OSRM setup complete! Starting/Restarting OSRM service..."
docker-compose -f (Join-Path $PSScriptRoot "docker-compose.yml") up -d --force-recreate osrm
