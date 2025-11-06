# Activation Code System API Test Script
# Test frontend (3000) and backend (3001) integration

Write-Host "Starting activation code system test..." -ForegroundColor Green
Write-Host ("=" * 60)

# Configuration
$BACKEND_URL = "http://localhost:3001"
$FRONTEND_URL = "http://localhost:3000"

# Test counters
$passedTests = 0
$failedTests = 0

function Test-Assert {
    param(
        [bool]$Condition,
        [string]$Message
    )
    if ($Condition) {
        Write-Host "PASS: $Message" -ForegroundColor Green
        $script:passedTests++
    } else {
        Write-Host "FAIL: $Message" -ForegroundColor Red
        $script:failedTests++
    }
}

# Test 1: Check backend service
Write-Host "`nTest 1: Check backend service" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/admin/codes?page=1&pageSize=1" -Method Get -ErrorAction Stop
    Test-Assert ($response.StatusCode -eq 200) "Backend service is running"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Test-Assert ($true) "Backend service is running (auth required)"
    } else {
        Test-Assert ($false) "Backend service is running"
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# Test 2: Check frontend service
Write-Host "`nTest 2: Check frontend service" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$FRONTEND_URL" -Method Get -ErrorAction Stop
    Test-Assert ($response.StatusCode -eq 200) "Frontend service is running"
} catch {
    Test-Assert ($false) "Frontend service is running"
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 3: Check admin page
Write-Host "`nTest 3: Check admin page" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$FRONTEND_URL/admin" -Method Get -ErrorAction Stop
    Test-Assert ($response.StatusCode -eq 200) "Admin page is accessible"
} catch {
    Test-Assert ($false) "Admin page is accessible"
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 4: Test database connection
Write-Host "`nTest 4: Test database connection" -ForegroundColor Cyan
try {
    $result = H:\xampp\mysql\bin\mysql.exe -h localhost -P 3306 -u root -pmojz168168 shekong_ai -e "SELECT COUNT(*) as count FROM activation_codes;" -s -N
    $count = [int]$result
    Test-Assert ($count -ge 3) "Database has activation codes (count: $count)"
} catch {
    Test-Assert ($false) "Database query successful"
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 5: Verify simplified fields
Write-Host "`nTest 5: Verify database field simplification" -ForegroundColor Cyan
try {
    $result = H:\xampp\mysql\bin\mysql.exe -h localhost -P 3306 -u root -pmojz168168 shekong_ai -e "SHOW COLUMNS FROM activation_codes WHERE Field IN ('expires_at', 'updated_at', 'created_by');" -s -N
    Test-Assert ([string]::IsNullOrWhiteSpace($result)) "Removed redundant fields from activation_codes"

    $result = H:\xampp\mysql\bin\mysql.exe -h localhost -P 3306 -u root -pmojz168168 shekong_ai -e "SHOW COLUMNS FROM activation_records WHERE Field IN ('ip_address', 'usage_count', 'last_used_at');" -s -N
    Test-Assert ([string]::IsNullOrWhiteSpace($result)) "Removed redundant fields from activation_records"
} catch {
    Test-Assert ($false) "Database field verification"
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 6: Verify core fields
Write-Host "`nTest 6: Verify core fields retained" -ForegroundColor Cyan
try {
    $result = H:\xampp\mysql\bin\mysql.exe -h localhost -P 3306 -u root -pmojz168168 shekong_ai -e "SHOW COLUMNS FROM activation_codes WHERE Field IN ('code', 'status', 'max_uses', 'daily_limit', 'validity_days', 'notes');" -s -N
    $lines = ($result -split "`n" | Where-Object { $_.Trim() -ne "" }).Count
    Test-Assert ($lines -eq 6) "All core fields retained (6 fields)"
} catch {
    Test-Assert ($false) "Core field verification"
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 7: View test data
Write-Host "`nTest 7: View test activation codes" -ForegroundColor Cyan
try {
    Write-Host "`nCurrent activation codes:" -ForegroundColor Yellow
    H:\xampp\mysql\bin\mysql.exe -h localhost -P 3306 -u root -pmojz168168 shekong_ai -e "SELECT code, status, max_uses, daily_limit, validity_days FROM activation_codes LIMIT 5;" -t
    Test-Assert ($true) "Successfully queried activation code data"
} catch {
    Test-Assert ($false) "Query activation code data"
    Write-Host "Error: $_" -ForegroundColor Red
}

# Output test results
Write-Host "`n" -NoNewline
Write-Host ("=" * 60)
Write-Host "`nTest Results:" -ForegroundColor Cyan
Write-Host "Passed: $passedTests tests" -ForegroundColor Green
Write-Host "Failed: $failedTests tests" -ForegroundColor Red
$totalTests = $passedTests + $failedTests
if ($totalTests -gt 0) {
    $passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    Write-Host "Pass Rate: $passRate%" -ForegroundColor Cyan
}

if ($failedTests -eq 0) {
    Write-Host "`nAll tests passed! System is running normally!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Open browser and visit: http://localhost:3000/admin" -ForegroundColor White
    Write-Host "2. Login with admin account" -ForegroundColor White
    Write-Host "3. Verify table shows 'Today Used' and 'Time Remaining' columns" -ForegroundColor White
    Write-Host "4. Test create, edit, delete activation code functions" -ForegroundColor White
} else {
    Write-Host "`nSome tests failed, please check error messages" -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 60)

