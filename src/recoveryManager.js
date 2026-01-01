import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readlineSync from 'readline-sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recovery directory path
const RECOVERY_DIR = path.join(__dirname, '../.recovery');

// Checkpoint file names
const CHECKPOINTS = {
    metadata: 'run_metadata.json',
    searchResults: 'search_results.json',
    extractedClients: 'extracted_clients.json',
    generatedEmails: 'generated_emails.json',
};

/**
 * Ensures recovery directory exists
 */
const ensureRecoveryDir = () => {
    if (!fs.existsSync(RECOVERY_DIR)) {
        fs.mkdirSync(RECOVERY_DIR, { recursive: true });
    }
};

/**
 * Saves a checkpoint for a specific step
 * @param {string} step - Step name (search, extract, generate)
 * @param {any} data - Data to save
 */
export const saveCheckpoint = (step, data) => {
    ensureRecoveryDir();

    const checkpointFile = path.join(RECOVERY_DIR, CHECKPOINTS[step]);
    const checkpoint = {
        timestamp: new Date().toISOString(),
        step,
        data,
    };

    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
    console.log(`   💾 Checkpoint saved: ${step}`);

    // Update metadata
    updateMetadata(step);
};

/**
 * Updates run metadata
 * @param {string} lastStep - Last completed step
 */
const updateMetadata = (lastStep) => {
    ensureRecoveryDir();

    const metadataFile = path.join(RECOVERY_DIR, CHECKPOINTS.metadata);
    let metadata = {};

    if (fs.existsSync(metadataFile)) {
        metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    } else {
        metadata = {
            runId: Date.now().toString(),
            startTime: new Date().toISOString(),
            retryCount: 0,
        };
    }

    metadata.lastCheckpoint = lastStep;
    metadata.lastUpdate = new Date().toISOString();
    metadata.status = 'incomplete';

    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
};

/**
 * Loads checkpoint data for a specific step
 * @param {string} step - Step name
 * @returns {any|null} - Checkpoint data or null
 */
export const loadCheckpoint = (step) => {
    const checkpointFile = path.join(RECOVERY_DIR, CHECKPOINTS[step]);

    if (fs.existsSync(checkpointFile)) {
        try {
            const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf-8'));
            return checkpoint.data;
        } catch (error) {
            console.error(`⚠️  Error loading checkpoint ${step}: ${error.message}`);
            return null;
        }
    }

    return null;
};

/**
 * Checks if there's an incomplete run
 * @returns {boolean}
 */
export const hasIncompleteRun = () => {
    const metadataFile = path.join(RECOVERY_DIR, CHECKPOINTS.metadata);

    if (!fs.existsSync(metadataFile)) {
        return false;
    }

    try {
        const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
        return metadata.status === 'incomplete';
    } catch (error) {
        return false;
    }
};

/**
 * Gets metadata about the incomplete run
 * @returns {object|null}
 */
export const getRunMetadata = () => {
    const metadataFile = path.join(RECOVERY_DIR, CHECKPOINTS.metadata);

    if (!fs.existsSync(metadataFile)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    } catch (error) {
        console.error(`⚠️  Error reading metadata: ${error.message}`);
        return null;
    }
};

/**
 * Prompts user for action when incomplete run is detected
 * @returns {string} - 'resume', 'fresh', or 'exit'
 */
export const promptUserForAction = () => {
    const metadata = getRunMetadata();

    if (!metadata) {
        return 'fresh';
    }

    console.log('\n⚠️  INCOMPLETE RUN DETECTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Started: ${new Date(metadata.startTime).toLocaleString()}`);
    console.log(`   Last checkpoint: ${metadata.lastCheckpoint || 'none'}`);
    console.log(`   Retry count: ${metadata.retryCount || 0}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (metadata.retryCount >= 3) {
        console.log('⚠️  This run has failed 3 times. Starting fresh is recommended.\n');
    }

    console.log('Choose an option:');
    console.log('  1. Resume from last checkpoint');
    console.log('  2. Start fresh (discard previous data)');
    console.log('  3. Exit\n');

    const choice = readlineSync.question('Enter choice (1/2/3): ');

    switch (choice.trim()) {
        case '1':
            return 'resume';
        case '2':
            return 'fresh';
        case '3':
            return 'exit';
        default:
            console.log('Invalid choice. Starting fresh.');
            return 'fresh';
    }
};

/**
 * Increments retry count in metadata
 */
export const incrementRetryCount = () => {
    const metadataFile = path.join(RECOVERY_DIR, CHECKPOINTS.metadata);

    if (fs.existsSync(metadataFile)) {
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
            metadata.retryCount = (metadata.retryCount || 0) + 1;
            metadata.lastUpdate = new Date().toISOString();
            fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.error(`⚠️  Error updating retry count: ${error.message}`);
        }
    }
};

/**
 * Clears all checkpoint files
 */
export const clearCheckpoints = () => {
    if (fs.existsSync(RECOVERY_DIR)) {
        try {
            const files = fs.readdirSync(RECOVERY_DIR);
            files.forEach(file => {
                fs.unlinkSync(path.join(RECOVERY_DIR, file));
            });
            fs.rmdirSync(RECOVERY_DIR);
            console.log('✅ Recovery checkpoints cleared');
        } catch (error) {
            console.error(`⚠️  Error clearing checkpoints: ${error.message}`);
        }
    }
};

/**
 * Marks run as complete
 */
export const markRunComplete = () => {
    const metadataFile = path.join(RECOVERY_DIR, CHECKPOINTS.metadata);

    if (fs.existsSync(metadataFile)) {
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
            metadata.status = 'complete';
            metadata.completedTime = new Date().toISOString();
            fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.error(`⚠️  Error marking run complete: ${error.message}`);
        }
    }
};

/**
 * Gets available recovery steps
 * @returns {object} - Object with available steps
 */
export const getAvailableSteps = () => {
    return {
        searchResults: loadCheckpoint('searchResults') !== null,
        extractedClients: loadCheckpoint('extractedClients') !== null,
        generatedEmails: loadCheckpoint('generatedEmails') !== null,
    };
};
