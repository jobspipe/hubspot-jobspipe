import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Flex,
  Divider,
  LoadingSpinner,
  Alert,
  Link,
  Tag,
  EmptyState,
  hubspot
} from '@hubspot/ui-extensions';

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <CompanyHiringCard
    context={context}
    runServerlessFunction={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

const CompanyHiringCard = ({ context, runServerlessFunction, sendAlert }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiringData, setHiringData] = useState(null);
  const [companyDomain, setCompanyDomain] = useState(null);

  useEffect(() => {
    initializeAndFetch();
  }, [context.crm.objectId]);

  const initializeAndFetch = async () => {
    // Ensure custom properties exist (idempotent)
    try {
      await runServerlessFunction({
        name: 'ensureCustomProperties'
      });
    } catch (err) {
      // Non-fatal - properties might already exist
      console.warn('Property initialization check:', err);
    }
    
    // Proceed with normal data fetch
    fetchCompanyDomain();
  };

  const fetchCompanyDomain = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get company domain from HubSpot company record
      const result = await runServerlessFunction({
        name: 'getCompanyDomain',
        parameters: {
          companyId: context.crm.objectId
        }
      });

      if (result.status === 'SUCCESS') {
        const domain = result.response?.domain;
        setCompanyDomain(domain);
        
        if (domain) {
          await fetchHiringData(domain);
        } else {
          setError('No domain found for this company. Please add a website domain to the company record.');
          setLoading(false);
        }
      } else {
        setError(result.message || 'Failed to fetch company domain');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching company domain:', err);
      setError('Failed to fetch company information');
      setLoading(false);
    }
  };

  const fetchHiringData = async (domain) => {
    try {
      const result = await runServerlessFunction({
        name: 'getHiringData',
        parameters: {
          domain: domain
        }
      });

      if (result.status === 'SUCCESS') {
        setHiringData(result.response);
      } else {
        setError(result.message || 'Failed to fetch hiring data');
      }
    } catch (err) {
      console.error('Error fetching hiring data:', err);
      setError('Failed to fetch hiring data from JobsPipe');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (companyDomain) {
      setLoading(true);
      setError(null);
      fetchHiringData(companyDomain);
    }
  };

  const handleSyncToProperties = async () => {
    if (!hiringData) return;

    try {
      const result = await runServerlessFunction({
        name: 'syncHiringDataToCompany',
        parameters: {
          companyId: context.crm.objectId,
          hiringData: hiringData
        }
      });

      if (result.status === 'SUCCESS') {
        sendAlert({
          type: 'success',
          message: 'Hiring data synced to company properties'
        });
      } else {
        sendAlert({
          type: 'danger',
          message: result.message || 'Failed to sync data'
        });
      }
    } catch (err) {
      console.error('Error syncing data:', err);
      sendAlert({
        type: 'danger',
        message: 'Failed to sync hiring data'
      });
    }
  };

  if (loading) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner label="Loading hiring data..." />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" gap="medium">
        <Alert title="Error" variant="error">
          {error}
        </Alert>
        {companyDomain && (
          <Button onClick={handleRefresh}>Retry</Button>
        )}
      </Flex>
    );
  }

  if (!hiringData || hiringData.openRolesCount === 0) {
    return (
      <EmptyState
        title="No hiring activity"
        message="This company has no open job postings in JobsPipe's database."
        actions={
          <Button onClick={handleRefresh}>Refresh</Button>
        }
      />
    );
  }

  return (
    <Flex direction="column" gap="medium">
      {/* Header with key metrics */}
      <Flex direction="row" justify="between" align="center">
        <Flex direction="column" gap="xs">
          <Text format={{ fontWeight: 'bold' }}>Open Roles</Text>
          <Text format={{ fontWeight: 'bold', fontSize: 'x-large' }}>
            {hiringData.openRolesCount}
          </Text>
        </Flex>
        <Flex direction="row" gap="xs">
          <Button onClick={handleRefresh} variant="secondary">
            Refresh
          </Button>
          <Button onClick={handleSyncToProperties}>
            Sync to Properties
          </Button>
        </Flex>
      </Flex>

      {/* Hiring Signal Badge */}
      {hiringData.hiringSignal && (
        <>
          <Divider />
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: 'bold' }}>Hiring Signal</Text>
            <Tag variant={hiringData.hiringSignal.variant}>
              {hiringData.hiringSignal.label}
            </Tag>
            {hiringData.hiringSignal.description && (
              <Text>{hiringData.hiringSignal.description}</Text>
            )}
          </Flex>
        </>
      )}

      {/* Top Departments Hiring */}
      {hiringData.topDepartments && hiringData.topDepartments.length > 0 && (
        <>
          <Divider />
          <Flex direction="column" gap="small">
            <Text format={{ fontWeight: 'bold' }}>Top Departments Hiring</Text>
            {hiringData.topDepartments.map((dept, index) => (
              <Flex key={index} direction="row" justify="between">
                <Text>{dept.name}</Text>
                <Text format={{ fontWeight: 'demibold' }}>{dept.count} roles</Text>
              </Flex>
            ))}
          </Flex>
        </>
      )}

      {/* Newest Postings */}
      {hiringData.newestPostings && hiringData.newestPostings.length > 0 && (
        <>
          <Divider />
          <Flex direction="column" gap="small">
            <Text format={{ fontWeight: 'bold' }}>Recent Job Postings</Text>
            {hiringData.newestPostings.map((job, index) => (
              <Flex key={index} direction="column" gap="xs">
                <Link href={job.url} external>
                  {job.title}
                </Link>
                <Flex direction="row" gap="small">
                  {job.location && <Text>📍 {job.location}</Text>}
                  {job.seniority && <Text>👤 {job.seniority}</Text>}
                  {job.remote && <Text>🏠 Remote</Text>}
                </Flex>
                {job.postedDate && (
                  <Text format={{ fontSize: 'small' }}>Posted: {job.postedDate}</Text>
                )}
              </Flex>
            ))}
          </Flex>
        </>
      )}

      {/* Link to full company profile */}
      {companyDomain && (
        <>
          <Divider />
          <Link 
            href={`https://jobspipe.dev/companies/${encodeURIComponent(companyDomain)}`} 
            external
          >
            View full hiring profile on JobsPipe →
          </Link>
        </>
      )}
    </Flex>
  );
};
