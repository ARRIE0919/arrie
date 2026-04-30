Get-ChildItem -Path "文章","平面" -Recurse -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'src=\s*["'']\.\./', "src='/""
    $content = $content -replace 'poster=\s*["'']\.\./', "poster='/""
    Set-Content -Path $_.FullName -Value $content -NoNewline
}
Write-Host "Done!"