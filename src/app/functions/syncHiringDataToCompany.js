const hubspot = require('@hubspot/api-client');

/**
 * Syncs JobsPipe hiring data to HubSpot company properties
 * @param {number} companyId - HubSpot company ID
 * @param {object} hiringData - Hiring data from JobsPipe
 * @returns {Promise<object>}
 */
exports.main = async (context = {}, sendResponse) => {
  const { companyId, hiringData } = context.parameters;

  if (!companyId || !hiringData) {
    return sendResponse({
      statusCode: 400,
      body: { error: 'companyId and hiringData parameters are required' }
    });
  }

  try {
    const hubspotClient = new hubspot.Client({
      accessToken: context.secrets.accessToken
    });

    // Prepare properties to update
    // Note: These custom properties would need to be created in HubSpot first
    const properties = {
      jobspipe_open_roles_count: hiringData.openRolesCount?.toString() || '0',
      jobspipe_last_updated: hiringData.lastUpdated || new Date().toISOString()
    };

    // Add top department if available
    if (hiringData.topDepartments && hiringData.topDepartments.length > 0) {
      properties.jobspipe_top_department = hiringData.topDepartments[0].name;
    }

    // Add hiring signal if available
    if (hiringData.hiringSignal) {
      properties.jobspipe_hiring_signal = hiringData.hiringSignal.label;
    }

    // Update company properties
    await hubspotClient.crm.companies.basicApi.update(companyId, {
      properties
    });

    return sendResponse({
      statusCode: 200,
      body: {
        success: true,
        message: 'Hiring data synced successfully',
        updatedProperties: Object.keys(properties)
      }
    });

  } catch (error) {
    console.error('Error syncing hiring data:', error);
    
    // Check if error is due to missing properties
    if (error.message?.includes('Property') && error.message?.includes('does not exist')) {
      return sendResponse({
        statusCode: 400,
        body: {
          error: 'Custom properties not configured',
          message: 'Please create custom company properties: jobspipe_open_roles_count, jobspipe_top_department, jobspipe_hiring_signal, jobspipe_last_updated',
          details: error.message
        }
      });
    }

    return sendResponse({
      statusCode: 500,
      body: {
        error: 'Failed to sync hiring data',
        message: error.message
      }
    });
  }
};
