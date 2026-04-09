$outputFile = "Atlas_Full_Context.md"
$include = @("*.cs", "*.js", "*.jsx", "*.ts", "*.tsx", "*.css", "*.json")
$exclude = @("bin", "obj", "node_modules", ".git", "dist", "build", "wwwroot", "package-lock.json")

# Helper function to check if a path should be skipped
function Should-Skip($path) {
    foreach ($dir in $exclude) {
        if ($path -split '[\\/]' -contains $dir) { return $true }
    }
    return $false
}

# Start Fresh
"# Project Context: Historical Atlas`n" | Out-File -FilePath $outputFile -Encoding utf8

"## Project Structure`n" | Out-File -FilePath $outputFile -Append -Encoding utf8
"```text" | Out-File -FilePath $outputFile -Append -Encoding utf8

Get-ChildItem -Recurse -Directory | Where-Object { -not (Should-Skip $_.FullName) } | ForEach-Object {
    $relativeDir = Resolve-Path $_.FullName -Relative
    "$relativeDir/" | Out-File -FilePath $outputFile -Append -Encoding utf8
}
"````n`n---`n" | Out-File -FilePath $outputFile -Append -Encoding utf8

"## File Contents`n" | Out-File -FilePath $outputFile -Append -Encoding utf8

Get-ChildItem -Recurse -Include $include | Where-Object { -not (Should-Skip $_.FullName) } | ForEach-Object {
    $relativeName = Resolve-Path $_.FullName -Relative
    $ext = $_.Extension.ToLower().TrimStart('.')
    
    # Map extensions to Markdown-friendly languages
    $lang = switch($ext) { 
        "cs"   { "csharp" } 
        "js"   { "javascript" } 
        "jsx"  { "javascript" } 
        "ts"   { "typescript" } 
        "tsx"  { "typescript" } 
        default { $ext } 
    }
    
    "### File: $relativeName" | Out-File -FilePath $outputFile -Append -Encoding utf8
    "```$lang" | Out-File -FilePath $outputFile -Append -Encoding utf8
    Get-Content $_.FullName | Out-File -FilePath $outputFile -Append -Encoding utf8
    "````n" | Out-File -FilePath $outputFile -Append -Encoding utf8
    
    Write-Host "Added: $relativeName" -ForegroundColor Green
}

Write-Host "`nDone! Created: $outputFile" -ForegroundColor Cyan