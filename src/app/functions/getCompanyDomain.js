const hubspot = require('@hubspot/api-client');

/**
 * Fetches the website domain from a HubSpot company record
 * @param {number} companyId - HubSpot company ID
 * @returns {Promise<{domain: string|null}>}
 */
exports.main = async (context = {}, sendResponse) => {
  const { companyId } = context.parameters;

  if (!companyId) {
    return sendResponse({
      statusCode: 400,
      body: { error: 'companyId parameter is required' }
    });
  }

  try {
    const hubspotClient = new hubspot.Client({
      accessToken: context.secrets.accessToken
    });

    // Fetch company properties
    const company = await hubspotClient.crm.companies.basicApi.getById(
      companyId,
      ['domain', 'website']
    );

    // Extract domain from either 'domain' or 'website' property
    let domain = company.properties.domain || company.properties.website;

    // Clean up domain (remove protocol, www, trailing slashes)
    if (domain) {
      domain = domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .split('/')[0]
        .toLowerCase();
    }

    return sendResponse({
      statusCode: 200,
      body: {
        domain: domain || null,
        companyId: companyId
      }
    });
  } catch (error) {
    console.error('Error fetching company domain:', error);
    return sendResponse({
      statusCode: 500,
      body: {
        error: 'Failed to fetch company information',
        message: error.message
      }
    });
  }
};
