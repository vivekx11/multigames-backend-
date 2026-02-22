@echo off
echo ========================================
echo 🚀 Push Backend to GitHub
echo ========================================
echo.

:: Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: MultiGames Backend Server"
)

echo.
echo Please enter your GitHub username:
set /p USERNAME=Username: 

echo.
echo Creating repository URL: https://github.com/%USERNAME%/multigames-backend
echo.
echo ⚠️  IMPORTANT: Before continuing, make sure you have created the repository on GitHub!
echo.
echo Steps:
echo 1. Go to https://github.com/new
echo 2. Repository name: multigames-backend
echo 3. Keep it PUBLIC (for free Render deployment)
echo 4. DO NOT initialize with README
echo 5. Click "Create repository"
echo.
pause

echo.
echo Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/%USERNAME%/multigames-backend.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo Repository: https://github.com/%USERNAME%/multigames-backend
    echo.
    echo Next Steps:
    echo 1. Deploy to Render: https://render.com
    echo 2. See PUSH_TO_GITHUB.md for deployment guide
    echo.
) else (
    echo.
    echo ❌ Push failed!
    echo.
    echo Common issues:
    echo - Repository not created on GitHub
    echo - Wrong username
    echo - Authentication required (use GitHub token)
    echo.
    echo For help, see: PUSH_TO_GITHUB.md
    echo.
)

pause
