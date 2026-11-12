const hubspot = require('@hubspot/api-client');

/**
 * Ensures required custom company properties exist, creating them if needed.
 * Called automatically on first use of the app.
 * @returns {Promise<object>} Status of property creation
 */
exports.main = async (context = {}, sendResponse) => {
  try {
    const hubspotClient = new hubspot.Client({
      accessToken: context.secrets.accessToken
    });

    const requiredProperties = [
      {
        name: 'jobspipe_open_roles_count',
        label: 'JobsPipe: Open Roles Count',
        type: 'number',
        fieldType: 'number',
        groupName: 'jobspipe',
        description: 'Total number of open job postings from JobsPipe'
      },
      {
        name: 'jobspipe_top_department',
        label: 'JobsPipe: Top Hiring Department',
        type: 'string',
        fieldType: 'text',
        groupName: 'jobspipe',
        description: 'Department with the most open positions'
      },
      {
        name: 'jobspipe_hiring_signal',
        label: 'JobsPipe: Hiring Signal',
        type: 'string',
        fieldType: 'text',
        groupName: 'jobspipe',
        description: 'Hiring activity level (High Activity, Active, Hiring)'
      },
      {
        name: 'jobspipe_last_updated',
        label: 'JobsPipe: Last Updated',
        type: 'datetime',
        fieldType: 'date',
        groupName: 'jobspipe',
        description: 'Last time hiring data was synced from JobsPipe'
      }
    ];

    const results = {
      created: [],
      existing: [],
      errors: []
    };

    // Check and create each property
    for (const propConfig of requiredProperties) {
      try {
        // Try to get the property
        await hubspotClient.crm.properties.coreApi.getByName(
          'companies',
          propConfig.name
        );
        results.existing.push(propConfig.name);
      } catch (error) {
        if (error.statusCode === 404) {
          // Property doesn't exist, create it
          try {
            await hubspotClient.crm.properties.coreApi.create('companies', {
              name: propConfig.name,
              label: propConfig.label,
              type: propConfig.type,
              fieldType: propConfig.fieldType,
              groupName: propConfig.groupName,
              description: propConfig.description,
              hidden: false,
              hasUniqueValue: false,
              formField: false
            });
            results.created.push(propConfig.name);
          } catch (createError) {
            console.error(`Failed to create property ${propConfig.name}:`, createError);
            results.errors.push({
              property: propConfig.name,
              error: createError.message
            });
          }
        } else {
          // Some other error
          console.error(`Error checking property ${propConfig.name}:`, error);
          results.errors.push({
            property: propConfig.name,
            error: error.message
          });
        }
      }
    }

    const allPropertiesReady = 
      results.created.length + results.existing.length === requiredProperties.length;

    return sendResponse({
      statusCode: 200,
      body: {
        success: allPropertiesReady,
        message: allPropertiesReady 
          ? 'All required properties are ready' 
          : 'Some properties could not be created',
        created: results.created,
        existing: results.existing,
        errors: results.errors,
        totalRequired: requiredProperties.length,
        totalReady: results.created.length + results.existing.length
      }
    });

  } catch (error) {
    console.error('Error in ensureCustomProperties:', error);
    return sendResponse({
      statusCode: 500,
      body: {
        success: false,
        error: 'Failed to ensure custom properties',
        message: error.message
      }
    });
  }
};
