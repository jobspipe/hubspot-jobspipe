const axios = require('axios');

/**
 * Fetches hiring data for a company from JobsPipe API
 * @param {string} domain - Company domain (e.g., 'example.com')
 * @returns {Promise<object>} Hiring data including open roles, departments, and postings
 */
exports.main = async (context = {}, sendResponse) => {
  const { domain } = context.parameters;
  const apiKey = context.secrets.JOBSPIPE_API_KEY;

  if (!domain) {
    return sendResponse({
      statusCode: 400,
      body: { error: 'domain parameter is required' }
    });
  }

  if (!apiKey) {
    return sendResponse({
      statusCode: 500,
      body: { error: 'JobsPipe API key not configured. Please add JOBSPIPE_API_KEY in app settings.' }
    });
  }

  try {
    // First, search for jobs at this company domain
    const jobsResponse = await axios.post(
      'https://api.jobspipe.dev/v1/jobs/search',
      {
        company_domain_or: [domain],
        posted_at_max_age_days: 90,
        limit: 10,
        sort: 'posted_at:desc'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const jobsData = jobsResponse.data;
    const totalJobs = jobsData.metadata?.total_results || 0;
    const jobs = jobsData.data || [];

    // If no jobs found, return empty result
    if (totalJobs === 0) {
      return sendResponse({
        statusCode: 200,
        body: {
          openRolesCount: 0,
          topDepartments: [],
          newestPostings: [],
          hiringSignal: null
        }
      });
    }

    // Calculate top departments from job occupations
    const departmentCounts = {};
    const occupationMap = {
      // Map ISCO-08 occupation codes to department names
      '1': 'Management',
      '2': 'Professional',
      '3': 'Technical',
      '4': 'Administrative',
      '5': 'Sales & Service',
      '6': 'Agriculture',
      '7': 'Trades',
      '8': 'Operations',
      '9': 'Elementary'
    };

    jobs.forEach(job => {
      if (job.occupation_code) {
        const firstDigit = job.occupation_code.charAt(0);
        const deptName = occupationMap[firstDigit] || 'Other';
        departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
      }
    });

    const topDepartments = Object.entries(departmentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format newest postings
    const newestPostings = jobs.slice(0, 5).map(job => ({
      title: job.title,
      url: job.url || job.source_url,
      location: job.location,
      seniority: job.seniority,
      remote: job.remote,
      postedDate: job.date_posted ? new Date(job.date_posted).toLocaleDateString() : null
    }));

    // Determine hiring signal based on recent activity
    let hiringSignal = null;
    const recentJobs = jobs.filter(job => {
      if (!job.date_posted) return false;
      const daysSincePosted = (Date.now() - new Date(job.date_posted).getTime()) / (1000 * 60 * 60 * 24);
      return daysSincePosted <= 14;
    });

    if (recentJobs.length >= 5) {
      hiringSignal = {
        label: 'High Hiring Activity',
        variant: 'success',
        description: `${recentJobs.length} roles posted in the last 2 weeks`
      };
    } else if (recentJobs.length >= 2) {
      hiringSignal = {
        label: 'Actively Hiring',
        variant: 'info',
        description: `${recentJobs.length} recent postings`
      };
    } else if (totalJobs > 0) {
      hiringSignal = {
        label: 'Hiring',
        variant: 'default',
        description: 'Some open positions available'
      };
    }

    return sendResponse({
      statusCode: 200,
      body: {
        openRolesCount: totalJobs,
        topDepartments,
        newestPostings,
        hiringSignal,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching hiring data from JobsPipe:', error);
    
    // Check for specific error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        return sendResponse({
          statusCode: 401,
          body: { error: 'Invalid JobsPipe API key. Please check your configuration.' }
        });
      } else if (status === 402) {
        return sendResponse({
          statusCode: 402,
          body: { 
            error: 'JobsPipe quota exceeded',
            message: errorData.message || 'API quota limit reached'
          }
        });
      } else if (status === 429) {
        return sendResponse({
          statusCode: 429,
          body: { error: 'Rate limit exceeded. Please try again later.' }
        });
      }
    }

    return sendResponse({
      statusCode: 500,
      body: {
        error: 'Failed to fetch hiring data from JobsPipe',
        message: error.message
      }
    });
  }
};
