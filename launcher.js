#!/usr/bin/env node

/**
 * Launcher script for the packaged executable
 * This script starts the server and opens the browser automatically
 */

import { createServer } from 'http';
import { spawn } from 'child_process';
import app from './src/server.js';

const PORT = 3000;

console.log('🚀 Starting Client Automation Platform...\n');

// Function to check if port is available
function checkPort(port) {
    return new Promise((resolve) => {
        const server = createServer();

        server.listen(port, () => {
            server.close();
            resolve(true);
        });

        server.on('error', () => {
            resolve(false);
        });
    });
}

// Function to open browser
function openBrowser(url) {
    const platform = process.platform;
    let command;

    if (platform === 'win32') {
        command = `start ${url}`;
    } else if (platform === 'darwin') {
        command = `open ${url}`;
    } else {
        command = `xdg-open ${url}`;
    }

    // Add a small delay to ensure server is ready
    setTimeout(() => {
        console.log(`🌐 Opening browser at ${url}...\n`);
        spawn(command, { shell: true, detached: true });
    }, 1500);
}

// Main function
async function main() {
    try {
        // Check if port is available
        const isPortAvailable = await checkPort(PORT);

        if (!isPortAvailable) {
            console.error(`❌ Error: Port ${PORT} is already in use.`);
            console.error('Please close any other instances of the application (or the dev terminal) and try again.\n');
            console.log('Press any key to exit...');
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', process.exit.bind(process, 1));
            return;
        }

        // Start the server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            // Open browser after server starts
            openBrowser(`http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Run the launcher
main();
