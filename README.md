# JobsPipe HubSpot App

A HubSpot marketplace app that displays [JobsPipe](https://jobspipe.dev) hiring intelligence directly in CRM company records.

## Features

- **Company Hiring Card** - View open roles, top departments, recent postings, and hiring signals
- **Auto-sync Properties** - Custom company properties created automatically
- **Workflow Action** - Optional "Get JobsPipe hiring data" for automation
- **Settings Page** - Easy API key configuration with connection testing

## Quick Start

### Prerequisites

- **HubSpot Developer Account** - [Sign up](https://developers.hubspot.com)
- **HubSpot CLI** - `npm install -g @hubspot/cli`
- **JobsPipe API Key** - Get yours at [jobspipe.dev/dashboard](https://jobspipe.dev/dashboard)
- **Node.js 20+**

### Installation

```bash
# Clone and install
git clone https://github.com/jobspipe/hubspot-jobspipe.git
cd hubspot-jobspipe
npm install

# Authenticate with HubSpot
hs auth

# Upload to your developer account
hs project upload --account=YOUR_ACCOUNT_ID
```

### Configuration

1. **Install App** - Go to Settings → Integrations → Connected Apps → Install "JobsPipe"
2. **Add API Key** - In app settings, enter your JobsPipe API key (starts with `jp_live_`)
3. **Add Card** - On any company record → Customize → Card library → Add "JobsPipe Hiring Intelligence"

Custom properties are created automatically on first use.

## Local Development

```bash
# Start development server
hs project dev --account=YOUR_ACCOUNT_ID

# In another terminal, run tests
npm test

# Run linting
npm run lint
```

Changes to the card UI update in real-time. Keep a company record open in HubSpot to see live updates.

## Project Structure

```
src/app/
├── app-hsmeta.json                # App configuration
├── cards/
│   ├── CompanyHiringCard.jsx      # React UI extension
│   └── company-hiring-card-hsmeta.json
├── functions/                      # 5 serverless functions
│   ├── getCompanyDomain.js
│   ├── getHiringData.js
│   ├── syncHiringDataToCompany.js
│   ├── testJobsPipeConnection.js
│   └── ensureCustomProperties.js  # Auto-creates properties
├── settings/
│   └── Settings.jsx               # Settings page
└── workflow-actions/
    └── getHiringDataAction.js     # Workflow action
```

## JobsPipe API Integration

Uses `POST /v1/jobs/search` with company domain filtering:
```javascript
{
  company_domain_or: ["example.com"],
  posted_at_max_age_days: 90,
  limit: 10,
  sort: "posted_at:desc"
}
```

All endpoints verified against [JobsPipe OpenAPI spec](https://jobspipe.dev/openapi.json).

### Custom Properties (Auto-Created)

The app automatically creates these company properties:
- `jobspipe_open_roles_count` (Number)
- `jobspipe_top_department` (Text)
- `jobspipe_hiring_signal` (Text)
- `jobspipe_last_updated` (Datetime)

## Publishing to Marketplace

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed marketplace submission guide.

**Quick checklist:**
1. ✅ All tests passing (`npm test`)
2. ✅ Tested in developer account
3. ✅ App listing complete (screenshots, description, pricing)
4. ✅ OAuth configured
5. ✅ Submit for review (5-10 business days)

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Tests cover data mapping, error handling, API integration, and workflow actions.

## Troubleshooting

**Card not appearing**
- Verify app is installed
- Check company has a domain property
- Ensure card was added via Customize

**"API Key Not Configured"**
- Go to app settings
- Add `JOBSPIPE_API_KEY` secret
- Value should start with `jp_live_`

**"No Domain Found"**
- Add `domain` or `website` to company record
- Format: `example.com` (no protocol)

**"Quota Exceeded"**
- Check [JobsPipe dashboard](https://jobspipe.dev/dashboard)
- Free tier: 100 credits/month
- Upgrade at [jobspipe.dev/pricing](https://jobspipe.dev/pricing)

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Marketplace submission and deployment
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[JobsPipe Docs](https://docs.jobspipe.dev)** - API documentation
- **[HubSpot Dev Docs](https://developers.hubspot.com/docs)** - Platform docs

## Support

- **Issues** - [GitHub Issues](https://github.com/jobspipe/hubspot-jobspipe/issues)
- **Email** - support@jobspipe.dev
- **JobsPipe Status** - [status.jobspipe.dev](https://status.jobspipe.dev)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repo
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [JobsPipe](https://jobspipe.dev) and [HubSpot Developer Platform](https://developers.hubspot.com)
