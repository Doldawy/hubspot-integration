require('dotenv').config();
const { syncContacts } = require('./sync');

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

/**
 * Validates that required environment variables are set
 */
function validateEnvironment() {
  if (!HUBSPOT_TOKEN) {
    console.error('❌ Error: HUBSPOT_TOKEN is not defined in environment variables');
    console.error('Please set HUBSPOT_TOKEN in your .env file or environment');
    process.exit(1);
  }
}

/**
 * Main application entry point
 * Orchestrates the contact syncing workflow
 */
async function main() {
  try {
    // Validate environment setup
    validateEnvironment();

    console.log('🚀 Starting HubSpot integration...');
    console.log('📡 Syncing contacts from HubSpot...\n');

    // Call the sync function from sync.js
    const result = await syncContacts(HUBSPOT_TOKEN);

    if (result.success) {
      console.log(`✅ Sync completed successfully`);
      console.log(`📊 Total contacts synced: ${result.contactsCount}`);
      console.log(`⏱️ Sync time: ${result.duration}ms\n`);
    } else {
      console.error(`❌ Sync failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error in main:', error.message);
    process.exit(1);
  }
}

// Run the application
main();
