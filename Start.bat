@echo off
REM ============================================================
REM  start.bat — PizzaTarcsa helyi teszt-inditasa (Windows)
REM  Ezt a fajlt tedd ugyanabba a mappaba, ahol az index.html es
REM  a serve.py van, majd dupla-kattintassal indithato.
REM ============================================================

setlocal

REM Lepjunk be abba a mappaba, ahol ez a .bat fajl van, akkor is,
REM ha valaki maskonnan inditja (pl. Start menu parancsikonbol).
cd /d "%~dp0"

if not exist "serve.py" (
    echo [HIBA] Nem talalom a serve.py fajlt ebben a mappaban:
    echo        %~dp0
    echo        Masold a serve.py-t ide, az index.html melle.
    echo.
    pause
    exit /b 1
)

REM Python keresese - eloszor a "py" launcher-t probaljuk (ez a
REM hivatalos Windows-os Python telepitovel jon), utana a python-t,
REM utana a python3-at.
where py >nul 2>nul
if %errorlevel%==0 (
    echo Python inditasa: py launcher
    py serve.py %*
    goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
    echo Python inditasa: python
    python serve.py %*
    goto :eof
)

where python3 >nul 2>nul
if %errorlevel%==0 (
    echo Python inditasa: python3
    python3 serve.py %*
    goto :eof
)

echo [HIBA] Nem talalok telepitett Python-t (py / python / python3).
echo        Toltsd le innen: https://www.python.org/downloads/
echo        Telepitesnel pipald be az "Add python.exe to PATH" opciot.
echo.
pause
exit /b 1

:eof
echo.
echo A szerver leallt.
pause