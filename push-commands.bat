@echo off
echo Removing old remote...
git remote remove origin 2>nul

echo Adding new remote...
git remote add origin https://github.com/vivekx11/multigames-backend.git

echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Done! Check: https://github.com/vivekx11/multigames-backend
pause
