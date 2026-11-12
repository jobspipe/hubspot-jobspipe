const axios = require('axios');
const { main } = require('../src/app/functions/getHiringData');

// Mock axios
jest.mock('axios');

describe('getHiringData function', () => {
  let mockSendResponse;
  let mockContext;

  beforeEach(() => {
    mockSendResponse = jest.fn();
    mockContext = {
      parameters: {
        domain: 'example.com'
      },
      secrets: {
        JOBSPIPE_API_KEY: 'test_api_key'
      }
    };
    jest.clearAllMocks();
  });

  test('should return error when domain is missing', async () => {
    mockContext.parameters.domain = null;

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      statusCode: 400,
      body: { error: 'domain parameter is required' }
    });
  });

  test('should return error when API key is missing', async () => {
    mockContext.secrets.JOBSPIPE_API_KEY = null;

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      statusCode: 500,
      body: { error: 'JobsPipe API key not configured. Please add JOBSPIPE_API_KEY in app settings.' }
    });
  });

  test('should return empty result when no jobs found', async () => {
    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 0 },
        data: []
      }
    });

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      statusCode: 200,
      body: {
        openRolesCount: 0,
        topDepartments: [],
        newestPostings: [],
        hiringSignal: null
      }
    });
  });

  test('should correctly map job data to hiring data structure', async () => {
    const mockJobs = [
      {
        title: 'Software Engineer',
        url: 'https://example.com/job1',
        location: 'San Francisco, CA',
        seniority: 'senior',
        remote: true,
        date_posted: '2026-11-01T00:00:00Z',
        occupation_code: '2511'
      },
      {
        title: 'Product Manager',
        url: 'https://example.com/job2',
        location: 'New York, NY',
        seniority: 'mid',
        remote: false,
        date_posted: '2026-11-05T00:00:00Z',
        occupation_code: '1219'
      },
      {
        title: 'Senior Developer',
        url: 'https://example.com/job3',
        location: 'Remote',
        seniority: 'senior',
        remote: true,
        date_posted: '2026-11-10T00:00:00Z',
        occupation_code: '2512'
      }
    ];

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 3 },
        data: mockJobs
      }
    });

    await main(mockContext, mockSendResponse);

    const response = mockSendResponse.mock.calls[0][0];
    
    expect(response.statusCode).toBe(200);
    expect(response.body.openRolesCount).toBe(3);
    expect(response.body.topDepartments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Professional', count: 2 }),
        expect.objectContaining({ name: 'Management', count: 1 })
      ])
    );
    expect(response.body.newestPostings).toHaveLength(3);
    expect(response.body.newestPostings[0].title).toBe('Software Engineer');
    expect(response.body.hiringSignal).toEqual(
      expect.objectContaining({
        label: expect.any(String),
        variant: expect.any(String)
      })
    );
  });

  test('should correctly identify high hiring activity', async () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5);

    const mockJobs = Array(6).fill(null).map((_, i) => ({
      title: `Job ${i}`,
      url: `https://example.com/job${i}`,
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
    
    expect(response.body.hiringSignal.label).toBe('High Hiring Activity');
    expect(response.body.hiringSignal.variant).toBe('success');
  });

  test('should handle 401 unauthorized error', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 401,
        data: {}
      }
    });

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      statusCode: 401,
      body: { error: 'Invalid JobsPipe API key. Please check your configuration.' }
    });
  });

  test('should handle 402 quota exceeded error', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 402,
        data: { message: 'Monthly quota exceeded' }
      }
    });

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      statusCode: 402,
      body: { 
        error: 'JobsPipe quota exceeded',
        message: 'Monthly quota exceeded'
      }
    });
  });

  test('should handle 429 rate limit error', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 429,
        data: {}
      }
    });

    await main(mockContext, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      statusCode: 429,
      body: { error: 'Rate limit exceeded. Please try again later.' }
    });
  });

  test('should correctly map occupation codes to departments', async () => {
    const mockJobs = [
      { title: 'Manager', occupation_code: '1234' },
      { title: 'Engineer', occupation_code: '2111' },
      { title: 'Technician', occupation_code: '3111' },
      { title: 'Admin', occupation_code: '4111' },
      { title: 'Sales Rep', occupation_code: '5111' }
    ];

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 5 },
        data: mockJobs
      }
    });

    await main(mockContext, mockSendResponse);

    const response = mockSendResponse.mock.calls[0][0];
    const deptNames = response.body.topDepartments.map(d => d.name);
    
    expect(deptNames).toContain('Management');
    expect(deptNames).toContain('Professional');
    expect(deptNames).toContain('Technical');
    expect(deptNames).toContain('Administrative');
    expect(deptNames).toContain('Sales & Service');
  });

  test('should format posting dates correctly', async () => {
    const mockJobs = [{
      title: 'Test Job',
      url: 'https://example.com/job',
      date_posted: '2026-11-01T12:30:00Z',
      occupation_code: '2511'
    }];

    axios.post.mockResolvedValue({
      data: {
        metadata: { total_results: 1 },
        data: mockJobs
      }
    });

    await main(mockContext, mockSendResponse);

    const response = mockSendResponse.mock.calls[0][0];
    
    expect(response.body.newestPostings[0].postedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
