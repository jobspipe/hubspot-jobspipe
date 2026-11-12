const axios = require('axios');

/**
 * Tests JobsPipe API connection with provided API key
 * @param {string} apiKey - JobsPipe API key to test
 * @returns {Promise<object>} Connection test result
 */
exports.main = async (context = {}, sendResponse) => {
  const { apiKey } = context.parameters;

  if (!apiKey) {
    return sendResponse({
      statusCode: 400,
      body: { error: 'apiKey parameter is required' }
    });
  }

  if (!apiKey.startsWith('jp_live_')) {
    return sendResponse({
      statusCode: 400,
      body: { error: 'API key must start with jp_live_' }
    });
  }

  try {
    // Make a minimal API call to test the key
    // Using the sandbox endpoint which is free and doesn't consume credits
    const response = await axios.post(
      'https://api.jobspipe.dev/v1/sandbox/jobs/search',
      {},
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    // If we get here, the API key is valid
    return sendResponse({
      statusCode: 200,
      body: {
        success: true,
        message: 'Connection successful',
        apiVersion: 'v1'
      }
    });

  } catch (error) {
    console.error('Connection test failed:', error);

    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        return sendResponse({
          statusCode: 401,
          body: {
            success: false,
            error: 'Invalid API key',
            message: 'The provided API key is not valid. Please check your JobsPipe dashboard for the correct key.'
          }
        });
      } else if (status === 403) {
        return sendResponse({
          statusCode: 403,
          body: {
            success: false,
            error: 'Access denied',
            message: 'Your API key does not have the required permissions.'
          }
        });
      } else {
        return sendResponse({
          statusCode: status,
          body: {
            success: false,
            error: 'API error',
            message: `JobsPipe API returned status ${status}`
          }
        });
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return sendResponse({
        statusCode: 503,
        body: {
          success: false,
          error: 'Connection timeout',
          message: 'Unable to reach JobsPipe API. Please check your internet connection.'
        }
      });
    }

    return sendResponse({
      statusCode: 500,
      body: {
        success: false,
        error: 'Connection test failed',
        message: error.message || 'Unknown error occurred'
      }
    });
  }
};
