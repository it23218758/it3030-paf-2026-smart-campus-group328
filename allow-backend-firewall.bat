@echo off
echo Adding Windows Firewall rules for SmartCampus...
netsh advfirewall firewall add rule name="SmartCampus Backend - Port 8080" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="SmartCampus Frontend - Port 5173" dir=in action=allow protocol=TCP localport=5173
echo.
echo Firewall rules added successfully.
echo Backend and frontend should now be accessible from the network.
echo.
pause
