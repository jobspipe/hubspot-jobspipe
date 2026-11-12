const axios = require('axios');

/**
 * Workflow action to fetch hiring data from JobsPipe
 * @param {object} inputFields - Input fields from workflow
 * @returns {Promise<object>} Output fields with hiring data
 */
exports.main = async (context = {}, sendResponse) => {
  const { company_domain } = context.inputFields;
  const apiKey = context.secrets.JOBSPIPE_API_KEY;

  // Default output
  const outputFields = {
    open_roles_count: 0,
    top_department: '',
    hiring_signal: '',
    success: false,
    error_message: ''
  };

  try {
    // Validate inputs
    if (!company_domain) {
      outputFields.error_message = 'Company domain is required';
      return sendResponse({ outputFields });
    }

    if (!apiKey) {
      outputFields.error_message = 'JobsPipe API key not configured';
      return sendResponse({ outputFields });
    }

    // Clean up domain
    const cleanDomain = company_domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('/')[0]
      .toLowerCase();

    // Fetch hiring data from JobsPipe
    const response = await axios.post(
      'https://api.jobspipe.dev/v1/jobs/search',
      {
        company_domain_or: [cleanDomain],
        posted_at_max_age_days: 90,
        limit: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const jobsData = response.data;
    const totalJobs = jobsData.metadata?.total_results || 0;
    const jobs = jobsData.data || [];

    outputFields.open_roles_count = totalJobs;

    // Calculate top department
    if (jobs.length > 0) {
      const departmentCounts = {};
      const occupationMap = {
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

      const topDept = Object.entries(departmentCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topDept) {
        outputFields.top_department = topDept[0];
      }

      // Calculate hiring signal
      const recentJobs = jobs.filter(job => {
        if (!job.date_posted) return false;
        const daysSincePosted = (Date.now() - new Date(job.date_posted).getTime()) / (1000 * 60 * 60 * 24);
        return daysSincePosted <= 14;
      });

      if (recentJobs.length >= 5) {
        outputFields.hiring_signal = 'High Activity';
      } else if (recentJobs.length >= 2) {
        outputFields.hiring_signal = 'Active';
      } else if (totalJobs > 0) {
        outputFields.hiring_signal = 'Hiring';
      }
    }

    outputFields.success = true;

  } catch (error) {
    console.error('Error in workflow action:', error);
    
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        outputFields.error_message = 'Invalid API key';
      } else if (status === 402) {
        outputFields.error_message = 'API quota exceeded';
      } else if (status === 429) {
        outputFields.error_message = 'Rate limit exceeded';
      } else {
        outputFields.error_message = `API error: ${status}`;
      }
    } else {
      outputFields.error_message = error.message || 'Unknown error';
    }
  }

  return sendResponse({ outputFields });
};
