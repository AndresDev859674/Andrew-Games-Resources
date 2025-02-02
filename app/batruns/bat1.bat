@echo off
title Delete All Data For Andrew Games
:menu
echo ==============================================
echo          Welcome to the Data Deletion
echo ==============================================
echo.
echo ARE YOU SURE YOU WANT TO DELETE ALL ANDREW GAMES DATA?
echo.
echo 1. Permanently Delete
echo 2. Exit
echo.
echo Before Starting The Elimination: https://andrewgamesweb.blogspot.com/p/blog-page.html
echo.
set /p choice=Please select an option (1 or 2): 
if "%choice%"=="1" (
    rd /s /q "%appdata%\andrew-games"
    echo All data from Andrew Games has been deleted.
    pause
    exit
)
if "%choice%"=="2" (
    echo Exiting...
    exit
)
echo Invalid choice, please try again.
pause
goto menu
