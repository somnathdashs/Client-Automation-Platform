#!/usr/bin/env node

import readlineSync from 'readline-sync';
import config, { validateConfig } from './config.js';
import { searchAllNiches } from './scraper.js';
import { processSearchResults } from './emailExtractor.js';
import { generateEmailsForClients } from './geminiClient.js';
import { saveClients, getUnemailedClients, getAllClients } from './dbClient.js';
import { sendEmailsToClients, verifySmtpConnection } from './emailSender.js';
import {
    hasIncompleteRun,
    promptUserForAction,
    loadCheckpoint,
    saveCheckpoint,
    clearCheckpoints,
    markRunComplete,
    incrementRetryCount
} from './recoveryManager.js';

/**
 * Displays the main menu and gets user choice
 */
const showMainMenu = () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Email Automation for Web Development Outreach       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('Choose an option:\n');
    console.log('  1. Run Full Automation (Search → Extract → Generate → Send)');
    console.log('  2. Send Unsent Emails (from database)');
    console.log('  3. Force Regenerate Emails (for existing clients)');
    console.log('  4. Exit\n');

    const choice = readlineSync.question('Enter your choice (1/2/3/4): ');
    return choice.trim();
};

/**
 * Option 1: Full automation workflow with recovery support
 */
const runFullAutomation = async () => {
    console.log('\n🚀 Starting Full Automation...\n');

    // Variables to hold our data
    let searchResults = null;
    let clients = null;
    let clientsWithEmails = null;
    let resumeMode = false;

    // Check for incomplete run
    if (hasIncompleteRun()) {
        const action = promptUserForAction();

        if (action === 'exit') {
            console.log('\n👋 Returning to main menu...\n');
            return;
        }

        if (action === 'fresh') {
            console.log('\n🔄 Starting fresh run...\n');
            clearCheckpoints();
        } else if (action === 'resume') {
            console.log('\n▶️  Resuming from last checkpoint...\n');
            resumeMode = true;
            incrementRetryCount();

            // Load checkpoints
            searchResults = loadCheckpoint('searchResults');
            clients = loadCheckpoint('extractedClients');
            clientsWithEmails = loadCheckpoint('generatedEmails');

            console.log('📦 Loaded checkpoints:');
            if (searchResults) console.log('   ✅ Search results');
            if (clients) console.log('   ✅ Extracted emails');
            if (clientsWithEmails) console.log('   ✅ Generated emails\n');
        }
    }

    // Step 1: Verify SMTP connection
    console.log('📋 Step 1: Verifying SMTP connection...\n');
    const smtpValid = await verifySmtpConnection();
    if (!smtpValid) {
        console.error('\n❌ SMTP verification failed. Please check your credentials.\n');
        return;
    }

    // Step 2: Search Google for potential clients (skip if already loaded)
    if (!searchResults) {
        console.log('\n📋 Step 2: Searching Google for potential clients...\n');
        console.log(`   Niches: ${config.search.niches.join(', ')}`);
        console.log(`   Platforms: ${config.search.socialPlatforms.join(', ')}\n`);

        searchResults = await searchAllNiches();

        if (searchResults.length === 0) {
            console.log('⚠️  No search results found. Try different niches or check your SerpAPI key.\n');
            return;
        }

        // Save checkpoint
        saveCheckpoint('searchResults', searchResults);
    } else {
        console.log('\n📋 Step 2: ✅ Loaded search results from checkpoint\n');
        console.log(`   Found ${searchResults.length} search results\n`);
    }

    // Step 3: Extract emails from search results (skip if already loaded)
    if (!clients) {
        console.log('📋 Step 3: Extracting email addresses...\n');
        clients = processSearchResults(searchResults);

        if (clients.length === 0) {
            console.log('⚠️  No email addresses found in search results.\n');
            return;
        }

        // Save checkpoint
        saveCheckpoint('extractedClients', clients);
    } else {
        console.log('📋 Step 3: ✅ Loaded extracted emails from checkpoint\n');
        console.log(`   Found ${clients.length} unique emails\n`);
    }

    // Step 4: Generate personalized emails using Gemini (skip if already loaded)
    if (!clientsWithEmails) {
        console.log('📋 Step 4: Generating personalized emails with Gemini AI...\n');
        clientsWithEmails = await generateEmailsForClients(clients);

        // Save checkpoint
        saveCheckpoint('generatedEmails', clientsWithEmails);
    } else {
        console.log('📋 Step 4: ✅ Loaded generated emails from checkpoint\n');
        console.log(`   ${clientsWithEmails.length} emails ready\n`);
    }

    // Step 5: Save all clients to Appwrite
    console.log('📋 Step 5: Saving clients to Appwrite database...\n');
    await saveClients(clientsWithEmails);

    // Step 6: Get clients who haven't been emailed yet
    console.log('📋 Step 6: Fetching unemailed clients...\n');
    const { unemailedClients, totalClients } = await getUnemailedClients();
    console.log(`   Found ${totalClients} clients who haven't been emailed yet\n`);

    if (totalClients === 0) {
        console.log('✅ All clients have already been emailed!\n');
        markRunComplete();
        return;
    }

    // Step 7: Send emails
    console.log('📋 Step 7: Sending emails...\n');
    const sendResults = await sendEmailsToClients(unemailedClients);

    // Final Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    FINAL SUMMARY                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   🔍 Search results found: ${searchResults.length}`);
    console.log(`   📧 Unique emails extracted: ${clients.length}`);
    console.log(`   🤖 Emails generated: ${clientsWithEmails.length}`);
    console.log(`   💾 Clients saved to database: ${clientsWithEmails.length}`);
    console.log(`   ✅ Emails sent successfully: ${sendResults.sent}`);
    console.log(`   ❌ Emails failed: ${sendResults.failed}`);
    console.log('\n✨ Automation complete!\n');

    // Mark run as complete
    markRunComplete();
};

/**
 * Option 2: Send unsent emails from database
 */
const sendUnsentEmails = async () => {
    console.log('\n📧 Sending Unsent Emails...\n');

    // Verify SMTP connection
    console.log('📋 Verifying SMTP connection...\n');
    const smtpValid = await verifySmtpConnection();
    if (!smtpValid) {
        console.error('\n❌ SMTP verification failed. Please check your credentials.\n');
        return;
    }

    // Get unsent emails
    console.log('📋 Fetching unsent emails from database...\n');
    const { unemailedClients, totalClients } = await getUnemailedClients();

    if (totalClients === 0) {
        console.log('✅ No unsent emails found. All clients have been emailed!\n');
        return;
    }

    console.log(`📊 Total unsent emails: ${totalClients}\n`);

    // Ask user how many to send
    const maxToSend = Math.min(totalClients, config.rateLimit.maxEmailsPerRun);
    console.log(`You can send up to ${maxToSend} emails (rate limit: ${config.rateLimit.maxEmailsPerRun} per run)\n`);

    const numToSend = readlineSync.question(`How many emails do you want to send? (1-${maxToSend}): `);
    const count = parseInt(numToSend.trim());

    if (isNaN(count) || count < 1 || count > maxToSend) {
        console.log(`\n⚠️  Invalid number. Please enter a number between 1 and ${maxToSend}.\n`);
        return;
    }

    // Send the specified number of emails
    const clientsToEmail = unemailedClients.slice(0, count);
    console.log(`\n📧 Sending ${count} email(s)...\n`);

    const sendResults = await sendEmailsToClients(clientsToEmail);

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    SEND SUMMARY                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   📊 Total unsent emails: ${totalClients}`);
    console.log(`   📧 Emails attempted: ${count}`);
    console.log(`   ✅ Emails sent successfully: ${sendResults.sent}`);
    console.log(`   ❌ Emails failed: ${sendResults.failed}`);
    console.log(`   📬 Remaining unsent: ${totalClients - count}\n`);
};

/**
 * Option 3: Force regenerate emails for existing clients
 */
const forceRegenerateEmails = async () => {
    console.log('\n🔄 Force Regenerating Emails...\n');

    // Get all clients from database
    console.log('📋 Fetching all clients from database...\n');
    const allClients = await getAllClients();

    if (allClients.length === 0) {
        console.log('⚠️  No clients found in database.\n');
        return;
    }

    console.log(`📊 Found ${allClients.length} client(s) in database\n`);

    // Confirm action
    const confirm = readlineSync.question(`This will regenerate emails for ALL ${allClients.length} client(s). Continue? (yes/no): `);

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
        console.log('\n❌ Operation cancelled.\n');
        return;
    }

    // Regenerate emails
    console.log('\n🤖 Regenerating emails with Gemini AI...\n');
    const clientsWithNewEmails = await generateEmailsForClients(allClients);

    // Update database
    console.log('\n💾 Updating clients in database...\n');
    await saveClients(clientsWithNewEmails);

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                REGENERATION SUMMARY                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   📊 Total clients: ${allClients.length}`);
    console.log(`   🤖 Emails regenerated: ${clientsWithNewEmails.length}`);
    console.log(`   💾 Database updated: ${clientsWithNewEmails.length}\n`);
    console.log('✨ Email regeneration complete!\n');
};

// Validate configuration before starting
if (!validateConfig()) {
    process.exit(1);
}

/**
 * Main entry point with menu loop
 */
const main = async () => {
    try {
        while (true) {
            const choice = showMainMenu();

            switch (choice) {
                case '1':
                    await runFullAutomation();
                    break;
                case '2':
                    await sendUnsentEmails();
                    break;
                case '3':
                    await forceRegenerateEmails();
                    break;
                case '4':
                    console.log('\n👋 Goodbye!\n');
                    process.exit(0);
                default:
                    console.log('\n⚠️  Invalid choice. Please enter 1, 2, 3, or 4.\n');
            }

            // Ask if user wants to continue
            const continueChoice = readlineSync.question('\nPress Enter to return to main menu or type "exit" to quit: ');
            if (continueChoice.toLowerCase() === 'exit') {
                console.log('\n👋 Goodbye!\n');
                process.exit(0);
            }
        }
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        console.log('\n💾 Progress has been saved. Run again to resume from last checkpoint.\n');
        process.exit(1);
    }
};

// Global error handlers to prevent crashes and provide debugging info
process.on('uncaughtException', (err) => {
    console.error('\n❌ Uncaught Exception:', err);
    console.log('\n💾 Progress has been saved. Run again to resume.\n');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
    console.log('\n💾 Progress has been saved. Run again to resume.\n');
    process.exit(1);
});

// Run the automation with top-level error catching
main().catch(err => {
    console.error('\n❌ Fatal Error in main execution:', err);
    console.log('\n💾 Progress has been saved. Run again to resume.\n');
    process.exit(1);
});
