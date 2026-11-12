const axios = require('axios');
const { main } = require('../src/app/workflow-actions/getHiringDataAction');

jest.mock('axios');

describe('getHiringDataAction workflow action', () => {
  let mockSendResponse;
  let mockContext;

  beforeEach(() => {
    mockSendResponse = jest.fn();
    mockContext = {
      inputFields: {
        company_domain: 'example.com'
      },
      secrets: {
        JOBSPIPE_API_KEY: 'test_api_key'
      }
    };
    jest.clearAllMocks();
  });

  test('should return error when company_domain is missing', async () => {
    mockContext.inputFields.company_domain = null;

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      outputFields: expect.objectContaining({
        success: false,
        error_message: 'Company domain is required'
      })
    });
  });

  test('should return error when API key is missing', async () => {
    mockContext.secrets.JOBSPIPE_API_KEY = null;

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      outputFields: expect.objectContaining({
        success: false,
        error_message: 'JobsPipe API key not configured'
      })
    });
  });

  test('should clean up domain URL correctly', async () => {
    mockContext.inputFields.company_domain = 'https://www.example.com/';

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 0 },
        data: []
      }
    });

    await main(mockContext, mockSendResponse);

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        company_domain_or: ['example.com']
      }),
      expect.any(Object)
    );
  });

  test('should return correct output fields for successful request', async () => {
    const mockJobs = [
      {
        title: 'Engineer',
        date_posted: new Date().toISOString(),
        occupation_code: '2511'
      },
      {
        title: 'Manager',
        date_posted: new Date().toISOString(),
        occupation_code: '1111'
      }
    ];

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 2 },
        data: mockJobs
      }
    });

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      outputFields: expect.objectContaining({
        open_roles_count: 2,
        top_department: expect.any(String),
        hiring_signal: expect.any(String),
        success: true,
        error_message: ''
      })
    });
  });

  test('should correctly calculate top department', async () => {
    const mockJobs = [
      { occupation_code: '2511' },
      { occupation_code: '2512' },
      { occupation_code: '1111' }
    ];

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 3 },
        data: mockJobs
      }
    });

    await main(mockContext, mockSendResponse);

    const response = mockSendResponse.mock.calls[0][0];
    expect(response.outputFields.top_department).toBe('Professional');
  });

  test('should set hiring signal based on recent activity', async () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5);

    const mockJobs = Array(6).fill(null).map(() => ({
      title: 'Job',
      date_posted: recentDate.toISOString(),
      occupation_code: '2511'
    }));

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 6 },
        data: mockJobs
      }
    });

    await main(mockContext, mockSendResponse);

    const response = mockSendResponse.mock.calls[0][0];
    expect(response.outputFields.hiring_signal).toBe('High Activity');
  });

  test('should handle API errors gracefully', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 401
      }
    });

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      outputFields: expect.objectContaining({
        success: false,
        error_message: 'Invalid API key'
      })
    });
  });
});
