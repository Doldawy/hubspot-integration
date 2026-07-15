const fetch = require('node-fetch');

/**
 * Fetches all contacts from HubSpot with comprehensive error handling
 * @param {string} token - HubSpot API access token
 * @returns {Promise<{success: boolean, contactsCount: number, duration: number, error?: string, data?: Array}>}
 */
async function syncContacts(token) {
  const startTime = Date.now();

  try {
    // Validate input
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid or missing HubSpot token');
    }

    const apiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('📤 Sending request to HubSpot API...');

    // Make the API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(apiUrl, { 
      headers,
      signal: controller.signal 
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      // Parse error details from response
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(`HubSpot API Error: ${errorMessage}`);
    }

    // Parse the response
    const data = await response.json();

    // Validate response structure
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid API response: missing or invalid results field');
    }

    const contactsCount = data.results.length;
    const duration = Date.now() - startTime;

    console.log(`✅ Successfully fetched ${contactsCount} contacts in ${duration}ms`);

    return {
      success: true,
      contactsCount,
      duration,
      data: data.results
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log detailed error information
    console.error(`❌ Error during sync: ${error.message}`);

    // Provide helpful hints based on error type
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   → Connection refused. Check your internet connection or HubSpot API status');
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('   → Invalid authentication. Check your HUBSPOT_TOKEN');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.error('   → Permission denied. Check your API token scopes');
    } else if (error.message.includes('429')) {
      console.error('   → Rate limit exceeded. Please try again later');
    } else if (error.message.includes('AbortError')) {
      console.error('   → Request timeout. The API took too long to respond');
    }

    return {
      success: false,
      contactsCount: 0,
      duration,
      error: error.message
    };
  }
}

/**
 * Exports the syncContacts function for use in other modules
 */
module.exports = {
  syncContacts
};
