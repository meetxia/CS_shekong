# Test Dashboard API
Write-Host "Testing Dashboard API..." -ForegroundColor Cyan

# Step 1: Login to get token
Write-Host "`nStep 1: Login to get token" -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.token
        Write-Host "Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "Login failed: $($loginResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Login error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Fetch stats
Write-Host "`nStep 2: Fetch activation stats" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/stats" -Method Get -Headers $headers
    
    if ($statsResponse.success) {
        Write-Host "Stats fetched successfully!" -ForegroundColor Green
        
        $data = $statsResponse.data
        
        Write-Host "`n=== Overview Statistics ===" -ForegroundColor Cyan
        Write-Host "Total Codes: $($data.total_codes)" -ForegroundColor White
        Write-Host "Active Codes: $($data.active_codes)" -ForegroundColor Green
        Write-Host "Expired Codes: $($data.expired_codes)" -ForegroundColor Red
        Write-Host "Revoked Codes: $($data.revoked_codes)" -ForegroundColor Yellow
        Write-Host "Total Records: $($data.total_records)" -ForegroundColor White
        Write-Host "Total Usage Count: $($data.total_usage_count)" -ForegroundColor Cyan
        Write-Host "Today Usage Count: $($data.today_usage_count)" -ForegroundColor Magenta
        
        Write-Host "`n=== By Code Statistics ===" -ForegroundColor Cyan
        if ($data.byCode -and $data.byCode.Count -gt 0) {
            foreach ($code in $data.byCode) {
                Write-Host "`nCode: $($code.code)" -ForegroundColor Yellow
                Write-Host "  Status: $($code.status)" -ForegroundColor White
                Write-Host "  Max Uses: $($code.max_uses)" -ForegroundColor White
                Write-Host "  Daily Limit: $($code.daily_limit)" -ForegroundColor White
                Write-Host "  Activated Devices: $($code.activated_devices)" -ForegroundColor Cyan
                Write-Host "  Total Usages: $($code.total_usages)" -ForegroundColor Green
                Write-Host "  Today Used: $($code.today_used)" -ForegroundColor Magenta
                Write-Host "  Time Remaining: $($code.time_remaining)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "No code statistics available" -ForegroundColor Gray
        }
        
        Write-Host "`n=== Full Response ===" -ForegroundColor Cyan
        $statsResponse | ConvertTo-Json -Depth 10
        
    } else {
        Write-Host "Failed to fetch stats: $($statsResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error fetching stats: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green

