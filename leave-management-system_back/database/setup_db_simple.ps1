

# Simple Database Setup Script for Leave Management System
Write-Host "=== Leave Management System Database Setup ===" -ForegroundColor Green
Write-Host ""

# Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

# Database configuration
$DB_NAME = "leave_management_system"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "This script will create the '$DB_NAME' database and populate it with sample data."
Write-Host "Please ensure PostgreSQL is running and you have admin access."
Write-Host ""

# Get password securely
$password = Read-Host "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow

try {
    # Step 1: Create database and tables
    Write-Host "Step 1: Creating database and tables..."
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -f "01_create_database.sql"
    if ($LASTEXITCODE -ne 0) { throw "Failed to create database" }
    
    # Step 2: Insert seed data
    Write-Host "Step 2: Inserting seed data..."
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "02_seed_data.sql"
    if ($LASTEXITCODE -ne 0) { throw "Failed to insert seed data" }
    
    # Step 3: Add sample leave requests
    Write-Host "Step 3: Adding sample leave requests..."
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "03_sample_leave_requests.sql"
    if ($LASTEXITCODE -ne 0) { throw "Failed to add leave requests" }
    
    # Step 4: Add activities and performance data
    Write-Host "Step 4: Adding activities and performance data..."
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "04_sample_activities_performance.sql"
    if ($LASTEXITCODE -ne 0) { throw "Failed to add activities data" }
    
    Write-Host ""
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "- Start your NestJS backend" -ForegroundColor White
    Write-Host "- Login with admin@company.com / password123" -ForegroundColor White
    Write-Host "- Test the application with the sample data" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "❌ Error during database setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the error messages above for more details." -ForegroundColor Yellow
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}