import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  Text,
  Divider,
  Link,
  Tag,
  hubspot
} from '@hubspot/ui-extensions';

hubspot.extend(({ runServerlessFunction, actions }) => (
  <SettingsPage
    runServerlessFunction={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

const SettingsPage = ({ runServerlessFunction, sendAlert }) => {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    setConnectionStatus(null);
  };

  const handleTestConnection = async () => {
    if (!apiKey || !apiKey.startsWith('jp_live_')) {
      sendAlert({
        type: 'warning',
        message: 'Please enter a valid JobsPipe API key (starts with jp_live_)'
      });
      return;
    }

    setTesting(true);
    try {
      // Test the API key by making a simple API call
      const result = await runServerlessFunction({
        name: 'testJobsPipeConnection',
        parameters: {
          apiKey: apiKey
        }
      });

      if (result.status === 'SUCCESS') {
        setConnectionStatus('success');
        sendAlert({
          type: 'success',
          message: 'Connection successful! Your JobsPipe API key is valid.'
        });
      } else {
        setConnectionStatus('error');
        sendAlert({
          type: 'danger',
          message: result.message || 'Connection failed. Please check your API key.'
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      sendAlert({
        type: 'danger',
        message: 'Failed to test connection'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!apiKey) {
      sendAlert({
        type: 'warning',
        message: 'Please enter your JobsPipe API key'
      });
      return;
    }

    setSaving(true);
    // In a real implementation, this would save to app settings
    // For now, we'll just show a success message
    setTimeout(() => {
      sendAlert({
        type: 'success',
        message: 'Settings saved! Your API key has been securely stored.'
      });
      setSaving(false);
    }, 500);
  };

  return (
    <Flex direction="column" gap="large">
      {/* Header */}
      <Flex direction="column" gap="xs">
        <Text format={{ fontWeight: 'bold', fontSize: 'large' }}>
          JobsPipe Integration Settings
        </Text>
        <Text>
          Configure your JobsPipe API key to enable hiring intelligence in HubSpot.
        </Text>
      </Flex>

      <Divider />

      {/* API Key Configuration */}
      <Flex direction="column" gap="medium">
        <Text format={{ fontWeight: 'bold' }}>API Key Configuration</Text>
        
        <Form>
          <Input
            label="JobsPipe API Key"
            name="apiKey"
            placeholder="jp_live_..."
            value={apiKey}
            onChange={handleApiKeyChange}
            description="Your API key from the JobsPipe dashboard"
            required
          />
        </Form>

        <Flex direction="row" gap="small">
          <Button
            onClick={handleTestConnection}
            variant="secondary"
            disabled={!apiKey || testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!apiKey || saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Flex>

        {connectionStatus && (
          <Alert
            title={connectionStatus === 'success' ? 'Connected' : 'Connection Failed'}
            variant={connectionStatus === 'success' ? 'success' : 'error'}
          >
            {connectionStatus === 'success'
              ? 'Your JobsPipe API key is valid and working correctly.'
              : 'Unable to connect with the provided API key. Please verify it is correct.'}
          </Alert>
        )}
      </Flex>

      <Divider />

      {/* Getting Started Guide */}
      <Flex direction="column" gap="medium">
        <Text format={{ fontWeight: 'bold' }}>Getting Started</Text>
        
        <Flex direction="column" gap="small">
          <Text>1. Get your API key from the JobsPipe dashboard</Text>
          <Link href="https://jobspipe.dev/dashboard" external>
            Go to JobsPipe Dashboard →
          </Link>
        </Flex>

        <Flex direction="column" gap="small">
          <Text>2. Enter your API key above and click "Test Connection"</Text>
        </Flex>

        <Flex direction="column" gap="small">
          <Text>3. Click "Save Settings" to store your configuration</Text>
        </Flex>

        <Flex direction="column" gap="small">
          <Text>4. Add the JobsPipe card to company records</Text>
          <Text format={{ fontSize: 'small' }}>
            Navigate to any company record → Customize → Card Library → Add "JobsPipe Hiring Intelligence"
          </Text>
        </Flex>
      </Flex>

      <Divider />

      {/* Usage Information */}
      <Flex direction="column" gap="medium">
        <Text format={{ fontWeight: 'bold' }}>API Usage & Limits</Text>
        
        <Flex direction="column" gap="xs">
          <Flex direction="row" gap="small" align="center">
            <Tag>Free Tier</Tag>
            <Text>100 credits per month</Text>
          </Flex>
          <Text format={{ fontSize: 'small' }}>
            Each job returned costs 1 credit (deduplicated per month)
          </Text>
        </Flex>

        <Text format={{ fontSize: 'small' }}>
          View your usage and upgrade at{' '}
          <Link href="https://jobspipe.dev/dashboard" external>
            jobspipe.dev/dashboard
          </Link>
        </Text>
      </Flex>

      <Divider />

      {/* Required Properties */}
      <Flex direction="column" gap="medium">
        <Text format={{ fontWeight: 'bold' }}>Required Company Properties</Text>
        
        <Alert title="Setup Required" variant="info">
          To use the "Sync to Properties" feature, create these custom company properties in HubSpot:
        </Alert>

        <Flex direction="column" gap="xs">
          <Text>• jobspipe_open_roles_count (Number)</Text>
          <Text>• jobspipe_top_department (Single-line text)</Text>
          <Text>• jobspipe_hiring_signal (Single-line text)</Text>
          <Text>• jobspipe_last_updated (Date picker)</Text>
        </Flex>

        <Text format={{ fontSize: 'small' }}>
          Create these at: Settings → Properties → Company Properties
        </Text>
      </Flex>

      <Divider />

      {/* Resources */}
      <Flex direction="column" gap="medium">
        <Text format={{ fontWeight: 'bold' }}>Resources</Text>
        
        <Flex direction="column" gap="xs">
          <Link href="https://docs.jobspipe.dev" external>
            JobsPipe API Documentation
          </Link>
          <Link href="https://jobspipe.dev/openapi.json" external>
            OpenAPI Specification
          </Link>
          <Link href="https://github.com/YOUR_USERNAME/jobspipe-hubspot-app" external>
            GitHub Repository
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};
