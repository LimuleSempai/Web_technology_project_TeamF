# Makefile for managing backend and frontend development servers

# --- Configuration ---
BACKEND_DIR = backend
FRONTEND_DIR = my-app
BACKEND_PORT = 5000
FRONTEND_PORT = 3000

# Use PowerShell as the shell
SHELL = pwsh.exe
.SHELLFLAGS = -Command

# Phony targets are not files
.PHONY: all start-backend start-frontend stop-backend stop-frontend restart-backend restart-frontend restart-all help

# Default target
all: help

# --- Start Targets ---
start-backend:
	@echo "Starting backend server..."
	cd $(BACKEND_DIR) ; npm start

start-frontend:
	@echo "Starting frontend development server..."
	cd $(FRONTEND_DIR) ; npm start

# --- Stop Targets (Windows/PowerShell specific) ---
# Note: These commands forcefully stop processes using the specified ports. Use with caution.
stop-backend:
	@echo "Attempting to stop backend server on port $(BACKEND_PORT)..."
	@powershell -Command "try { Get-Process -Id (Get-NetTCPConnection -LocalPort $(BACKEND_PORT)).OwningProcess -ErrorAction Stop | Stop-Process -Force } catch { Write-Host 'Backend process not found or could not be stopped.' }"

stop-frontend:
	@echo "Attempting to stop frontend server on port $(FRONTEND_PORT)..."
	@powershell -Command "try { Get-Process -Id (Get-NetTCPConnection -LocalPort $(FRONTEND_PORT)).OwningProcess -ErrorAction Stop | Stop-Process -Force } catch { Write-Host 'Frontend process not found or could not be stopped.' }"

# --- Restart Targets ---
# Note: Starting processes in the background from Make isn't straightforward.
# These targets will stop the old process and then start the new one in the *current* terminal.
# You'll likely want to run start-backend and start-frontend in separate terminals.
restart-backend: stop-backend
	@echo "Restarting backend server..."
	@echo "Starting backend in this terminal. Run 'make start-backend' in a separate terminal for background execution."
	cd $(BACKEND_DIR) ; npm start

restart-frontend: stop-frontend
	@echo "Restarting frontend development server..."
	@echo "Starting frontend in this terminal. Run 'make start-frontend' in a separate terminal for background execution."
	cd $(FRONTEND_DIR) ; npm start

# --- Combined Restart Target ---
# This will stop both, but only start the frontend in the current terminal due to Make limitations.
restart-all: stop-backend stop-frontend
	@echo "Restarting both servers..."
	@echo "Starting frontend in this terminal. Run 'make start-backend' in a separate terminal."
	cd $(FRONTEND_DIR) ; npm start


# --- Help Target ---
help:
	@echo "Makefile Commands:"
	@echo "  make start-backend    - Starts the backend server (run in its own terminal)"
	@echo "  make start-frontend   - Starts the frontend dev server (run in its own terminal)"
	@echo "  make stop-backend     - Attempts to stop the process using port $(BACKEND_PORT)"
	@echo "  make stop-frontend    - Attempts to stop the process using port $(FRONTEND_PORT)"
	@echo "  make restart-backend  - Stops then starts the backend in the current terminal"
	@echo "  make restart-frontend - Stops then starts the frontend in the current terminal"
	@echo "  make restart-all      - Stops both, then starts frontend in the current terminal"
	@echo "  make help             - Shows this help message"
