# Test Usage Deduction Logic
Write-Host "Testing Usage Deduction Logic..." -ForegroundColor Cyan
Write-Host "=" * 60

# Configuration
$BACKEND_URL = "http://localhost:3001"
$ACTIVATION_CODE = "TEST-2024-0001"
$DEVICE_ID = "test-device-$(Get-Random -Maximum 9999)"

Write-Host "`nTest Configuration:" -ForegroundColor Yellow
Write-Host "Backend URL: $BACKEND_URL"
Write-Host "Activation Code: $ACTIVATION_CODE"
Write-Host "Device ID: $DEVICE_ID"

# Step 1: Login to get admin token
Write-Host "`n[Step 1] Login as admin..." -ForegroundColor Cyan
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        $adminToken = $loginResponse.token
        Write-Host "Login successful!" -ForegroundColor Green
    } else {
        Write-Host "Login failed: $($loginResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Login error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get initial stats
Write-Host "`n[Step 2] Get initial statistics..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $initialStats = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/stats" -Method Get -Headers $headers
    
    if ($initialStats.success) {
        $initialTodayUsage = $initialStats.data.today_usage_count
        Write-Host "Initial today usage count: $initialTodayUsage" -ForegroundColor White
        
        # Find the test code stats
        $testCodeStats = $initialStats.data.byCode | Where-Object { $_.code -eq $ACTIVATION_CODE }
        if ($testCodeStats) {
            $initialCodeTodayUsed = $testCodeStats.today_used
            Write-Host "Initial $ACTIVATION_CODE today used: $initialCodeTodayUsed" -ForegroundColor White
        } else {
            Write-Host "Warning: $ACTIVATION_CODE not found in stats" -ForegroundColor Yellow
            $initialCodeTodayUsed = 0
        }
    } else {
        Write-Host "Failed to get stats: $($initialStats.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error getting stats: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Verify activation code (simulate user clicking "Start Test")
Write-Host "`n[Step 3] Verify activation code..." -ForegroundColor Cyan
try {
    $verifyBody = @{
        code = $ACTIVATION_CODE
        deviceId = $DEVICE_ID
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/activation/verify" -Method Post -Body $verifyBody -ContentType "application/json"
    
    if ($verifyResponse.valid) {
        $recordId = $verifyResponse.recordId
        Write-Host "Verification successful!" -ForegroundColor Green
        Write-Host "Record ID: $recordId" -ForegroundColor White
        Write-Host "Days Left: $($verifyResponse.daysLeft)" -ForegroundColor White
        Write-Host "Remaining Today: $($verifyResponse.remainingToday)" -ForegroundColor White
    } else {
        Write-Host "Verification failed: $($verifyResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Verification error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Record usage (simulate user clicking "Start Test" button)
Write-Host "`n[Step 4] Record usage (deduct 1 usage)..." -ForegroundColor Cyan
try {
    $recordBody = @{
        recordId = $recordId
    } | ConvertTo-Json

    $recordResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/activation/record-usage" -Method Post -Body $recordBody -ContentType "application/json"
    
    if ($recordResponse.success) {
        Write-Host "Usage recorded successfully!" -ForegroundColor Green
        Write-Host "Days Left: $($recordResponse.daysLeft)" -ForegroundColor White
        Write-Host "Remaining Today: $($recordResponse.remainingToday)" -ForegroundColor White
    } else {
        Write-Host "Record usage failed: $($recordResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Record usage error: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Wait a moment for database to update
Write-Host "`n[Step 5] Waiting for database to sync..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

# Step 6: Get updated stats
Write-Host "`n[Step 6] Get updated statistics..." -ForegroundColor Cyan
try {
    $updatedStats = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/stats" -Method Get -Headers $headers
    
    if ($updatedStats.success) {
        $updatedTodayUsage = $updatedStats.data.today_usage_count
        Write-Host "Updated today usage count: $updatedTodayUsage" -ForegroundColor White
        
        # Find the test code stats
        $testCodeStats = $updatedStats.data.byCode | Where-Object { $_.code -eq $ACTIVATION_CODE }
        if ($testCodeStats) {
            $updatedCodeTodayUsed = $testCodeStats.today_used
            Write-Host "Updated $ACTIVATION_CODE today used: $updatedCodeTodayUsed" -ForegroundColor White
        } else {
            Write-Host "Warning: $ACTIVATION_CODE not found in stats" -ForegroundColor Yellow
            $updatedCodeTodayUsed = 0
        }
    } else {
        Write-Host "Failed to get updated stats: $($updatedStats.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error getting updated stats: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Verify data synchronization
Write-Host "`n[Step 7] Verify data synchronization..." -ForegroundColor Cyan
Write-Host "=" * 60

$globalUsageIncreased = ($updatedTodayUsage - $initialTodayUsage) -eq 1
$codeUsageIncreased = ($updatedCodeTodayUsed - $initialCodeTodayUsed) -eq 1

Write-Host "`nGlobal Today Usage:" -ForegroundColor Yellow
Write-Host "  Before: $initialTodayUsage" -ForegroundColor White
Write-Host "  After:  $updatedTodayUsage" -ForegroundColor White
Write-Host "  Change: +$($updatedTodayUsage - $initialTodayUsage)" -ForegroundColor $(if ($globalUsageIncreased) { "Green" } else { "Red" })
Write-Host "  Status: $(if ($globalUsageIncreased) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($globalUsageIncreased) { "Green" } else { "Red" })

Write-Host "`n$ACTIVATION_CODE Today Used:" -ForegroundColor Yellow
Write-Host "  Before: $initialCodeTodayUsed" -ForegroundColor White
Write-Host "  After:  $updatedCodeTodayUsed" -ForegroundColor White
Write-Host "  Change: +$($updatedCodeTodayUsed - $initialCodeTodayUsed)" -ForegroundColor $(if ($codeUsageIncreased) { "Green" } else { "Red" })
Write-Host "  Status: $(if ($codeUsageIncreased) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($codeUsageIncreased) { "Green" } else { "Red" })

# Final result
Write-Host "`n" -NoNewline
Write-Host "=" * 60
if ($globalUsageIncreased -and $codeUsageIncreased) {
    Write-Host "`nTest Result: ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Data synchronization is working correctly!" -ForegroundColor Green
} else {
    Write-Host "`nTest Result: SOME TESTS FAILED!" -ForegroundColor Red
    Write-Host "Please check the data synchronization logic!" -ForegroundColor Red
}
Write-Host "=" * 60

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Refresh admin dashboard at http://localhost:3000/admin" -ForegroundColor White
Write-Host "2. Check 'Today Usage Count' in overview section" -ForegroundColor White
Write-Host "3. Check '$ACTIVATION_CODE' row in the table" -ForegroundColor White
Write-Host "4. Verify 'Today Used' column shows the updated value" -ForegroundColor White

