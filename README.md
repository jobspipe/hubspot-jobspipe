# JobsPipe HubSpot App

A HubSpot marketplace app that integrates [JobsPipe](https://jobspipe.dev) hiring intelligence directly into HubSpot CRM company records. View open roles, hiring departments, recent job postings, and hiring signals for any company with a website domain.

## Features

### 🎯 Company Record Card (UI Extension)
- **Open Roles Count** - Total number of active job postings
- **Top Departments Hiring** - Breakdown by department (Engineering, Sales, Management, etc.)
- **Recent Job Postings** - Latest 5 postings with titles, locations, seniority, and links
- **Hiring Signal Badge** - Visual indicator of hiring activity (High Activity, Active, Hiring)
- **Sync to Properties** - Save hiring data to custom HubSpot company properties
- **Direct Links** - Quick access to full company hiring profile on JobsPipe

### ⚙️ Serverless Functions
- `getCompanyDomain` - Fetches and normalizes company domain from HubSpot
- `getHiringData` - Calls JobsPipe API to retrieve hiring intelligence
- `syncHiringDataToCompany` - Updates company properties with hiring data

### 🔄 Workflow Action (Optional)
- **"Get JobsPipe hiring data"** - Custom workflow action
- Fetch hiring data for any company in automated workflows
- Output fields: open roles count, top department, hiring signal, success status
- Use in lead scoring, enrichment workflows, and automation

## Prerequisites

### Required
1. **HubSpot Developer Account** - Sign up at [developers.hubspot.com](https://developers.hubspot.com)
2. **HubSpot CLI** - Install globally: `npm install -g @hubspot/cli`
3. **JobsPipe API Key** - Get yours at [jobspipe.dev/dashboard](https://jobspipe.dev/dashboard)
4. **Node.js** - v18+ recommended

### HubSpot Requirements
- HubSpot account with access to CRM
- Permission to install apps and create custom properties
- OAuth app creation permissions (for marketplace distribution)

## Installation & Setup

### 1. Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/jobspipe-hubspot-app.git
cd jobspipe-hubspot-app
npm install
```

### 2. Authenticate with HubSpot
```bash
hs auth
```
Follow the prompts to authenticate with your HubSpot developer account.

### 3. Create Developer Test Account
If you don't have a test account:
1. Go to [app.hubspot.com](https://app.hubspot.com)
2. Create a new test account (free)
3. Note the account ID

### 4. Configure Environment
Create a `.env` file (not committed to git):
```bash
HUBSPOT_ACCOUNT_ID=your_test_account_id
JOBSPIPE_API_KEY=jp_live_your_api_key
```

### 5. Upload Project
```bash
hs project upload --account=ACCOUNT_ID
```

This builds and uploads your app to HubSpot. The CLI will:
- Bundle the React components
- Upload serverless functions
- Register the app configuration
- Create the app in your account

### 6. Install App in Test Account
1. Go to your HubSpot test account
2. Navigate to Settings → Integrations → Connected Apps
3. Find "JobsPipe - Hiring Intelligence"
4. Click "Install"
5. Enter your JobsPipe API key when prompted

### 7. Create Custom Company Properties (Optional)
For the "Sync to Properties" feature, create these custom properties in HubSpot:

| Property Name | Label | Type |
|--------------|-------|------|
| `jobspipe_open_roles_count` | Open Roles Count | Number |
| `jobspipe_top_department` | Top Hiring Department | Single-line text |
| `jobspipe_hiring_signal` | Hiring Signal | Single-line text |
| `jobspipe_last_updated` | Last Updated | Date picker |

Create these at: Settings → Properties → Company Properties → Create Property

### 8. Add Card to Company Record
1. Navigate to CRM → Companies
2. Open any company record with a domain
3. Click "Customize" in the middle column
4. Click "Card library" tab
5. Filter by "App" card types
6. Find "JobsPipe Hiring Intelligence"
7. Click "Add card"
8. Click "Save and exit"

## Local Development

### Start Development Server
```bash
hs project dev --account=ACCOUNT_ID
```

This starts a local development server with:
- Hot reload for React components
- Live updates to the card UI
- Console logging for debugging

Keep the server running and open a company record in HubSpot. Changes to `CompanyHiringCard.jsx` will update in real-time.

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Lint and Format
```bash
# Check linting
npm run lint

# Format code
npm run format
```

## JobsPipe API Integration

### Endpoints Used

This app verifies all calls against the [JobsPipe OpenAPI spec](https://jobspipe.dev/openapi.json).

#### `POST /v1/jobs/search`
Searches for job postings by company domain:
```javascript
{
  company_domain_or: ["example.com"],
  posted_at_max_age_days: 90,
  limit: 10,
  sort: "posted_at:desc"
}
```

**Response fields used:**
- `metadata.total_results` - Total job count
- `data[].title` - Job title
- `data[].url` - Job posting URL
- `data[].location` - Job location
- `data[].seniority` - Seniority level
- `data[].remote` - Remote flag
- `data[].date_posted` - Posted date
- `data[].occupation_code` - ISCO-08 occupation code for department mapping

### Occupation Code Mapping

Jobs are categorized by ISCO-08 codes into departments:

| Code | Department |
|------|-----------|
| 1xxx | Management |
| 2xxx | Professional |
| 3xxx | Technical |
| 4xxx | Administrative |
| 5xxx | Sales & Service |
| 6xxx | Agriculture |
| 7xxx | Trades |
| 8xxx | Operations |
| 9xxx | Elementary |

### Error Handling

The app handles all JobsPipe API errors:
- **401** - Invalid API key
- **402** - Quota exceeded (shows upgrade message)
- **429** - Rate limit (suggests retry)
- **500** - Server error (retry with backoff)

### Rate Limits & Costs

- **Free tier**: 100 credits/month
- **Cost**: 1 credit per job returned (deduplicated per month)
- **Rate limit**: Per-second limit shown in response headers
- **Idempotency**: Requests use `Idempotency-Key` header for safe retries

## Project Structure

```
jobspipe-hubspot-app/
├── hsproject.json                          # HubSpot project config
├── src/
│   └── app/
│       ├── app-hsmeta.json                # App configuration
│       ├── cards/                         # React UI Extensions
│       │   ├── company-hiring-card-hsmeta.json
│       │   ├── CompanyHiringCard.jsx
│       │   └── package.json
│       ├── functions/                     # Serverless functions
│       │   ├── getCompanyDomain-hsmeta.json
│       │   ├── getCompanyDomain.js
│       │   ├── getHiringData-hsmeta.json
│       │   ├── getHiringData.js
│       │   ├── syncHiringDataToCompany-hsmeta.json
│       │   ├── syncHiringDataToCompany.js
│       │   └── package.json
│       └── workflow-actions/              # Custom workflow actions
│           ├── get-hiring-data-hsmeta.json
│           └── getHiringDataAction.js
├── tests/                                 # Jest tests
│   ├── getHiringData.test.js
│   └── workflowAction.test.js
├── .github/
│   └── workflows/
│       └── test.yml                       # CI configuration
├── package.json
└── README.md
```

## Testing

### Unit Tests

Tests cover data mapping, error handling, and API integration:

- **Data Mapping Tests** - Occupation codes → departments, job formatting
- **Error Handling Tests** - 401, 402, 429 responses
- **Validation Tests** - Missing parameters, empty results
- **Signal Detection Tests** - Hiring activity classification

Run tests before deployment:
```bash
npm test
```

### Manual Testing Checklist

- [ ] Card loads on company record page
- [ ] Domain extracted correctly from company
- [ ] Hiring data displays (counts, departments, postings)
- [ ] Hiring signal badge appears with correct variant
- [ ] Links open in new tabs
- [ ] Refresh button reloads data
- [ ] Sync to properties updates company fields
- [ ] Error states display clearly
- [ ] Empty state shows for companies with no postings
- [ ] Workflow action executes in test workflow

## Deployment

### Building for Production

The HubSpot CLI handles building automatically on upload:
```bash
hs project upload --account=PROD_ACCOUNT_ID
```

### Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] API key configured in app settings
- [ ] Custom properties created in target account
- [ ] Tested in development account
- [ ] Verified against JobsPipe OpenAPI spec
- [ ] Error handling tested (invalid key, quota exceeded)

## Marketplace Listing

This app is configured for HubSpot Marketplace distribution (`"distribution": "marketplace"`).

### Requirements (Human Action Needed)

To submit to the marketplace, you'll need to:

1. **Complete App Listing**
   - Go to [developers.hubspot.com](https://developers.hubspot.com)
   - Navigate to your app
   - Fill out marketplace listing details:
     - App name, description, category
     - Screenshots (4-6 images)
     - Pricing information
     - Support email/URL
     - Privacy policy URL
     - Terms of service URL

2. **OAuth Configuration**
   - Set up OAuth redirect URLs
   - Configure required scopes (already in `app-hsmeta.json`)
   - Add webhook URLs if using webhooks

3. **Submit for Review**
   - HubSpot reviews app code and listing
   - Response typically within 5-10 business days
   - May require changes before approval

4. **Post-Approval**
   - App goes live on marketplace
   - Users can discover and install
   - Monitor installation metrics

### Marketplace Best Practices

- Clear, concise description
- Professional screenshots showing value
- Transparent pricing
- Responsive support
- Regular updates and maintenance

## What Needs a Human

The following tasks require manual human intervention:

### ✋ HubSpot Developer Account
- **What**: Create and manage HubSpot developer account
- **Where**: [developers.hubspot.com](https://developers.hubspot.com)
- **Why**: Required for app creation and management

### ✋ Upload to HubSpot
- **What**: Run `hs project upload` command
- **Where**: Terminal with authenticated HubSpot CLI
- **Why**: Automated systems can't authenticate with HubSpot CLI

### ✋ Install App in Account
- **What**: Manual app installation via HubSpot UI
- **Where**: Settings → Integrations → Connected Apps
- **Why**: OAuth flow requires user interaction

### ✋ Configure API Key
- **What**: Enter JobsPipe API key in app settings
- **Where**: App settings page in HubSpot
- **Why**: Secrets managed through HubSpot UI

### ✋ Create Custom Properties
- **What**: Create 4 custom company properties
- **Where**: Settings → Properties → Company Properties
- **Why**: Properties must exist before sync

### ✋ Marketplace Review
- **What**: Submit app to HubSpot for marketplace approval
- **Where**: HubSpot Partner Portal
- **Why**: Human review required for marketplace apps
- **Timeline**: 5-10 business days

### ✋ Add Card to Records
- **What**: Add JobsPipe card to company record layout
- **Where**: Company record → Customize → Card library
- **Why**: Card placement is user-configurable

## Troubleshooting

### Card Not Appearing
- Verify app is installed in the account
- Check that company has a domain property
- Ensure card was added to record layout via Customize
- Check browser console for errors

### "API Key Not Configured" Error
- Go to app settings in HubSpot
- Add `JOBSPIPE_API_KEY` secret
- Value should start with `jp_live_`

### "No Domain Found" Error
- Add `domain` or `website` property to company
- Format: `example.com` (no protocol or path)

### "Quota Exceeded" Error
- Check your JobsPipe dashboard for usage
- Upgrade plan at [jobspipe.dev/pricing](https://jobspipe.dev/pricing)
- Free tier: 100 credits/month

### Sync to Properties Fails
- Ensure custom properties are created
- Property names must match exactly (case-sensitive)
- Check app has `crm.objects.companies.write` scope

### Development Server Issues
- Ensure HubSpot CLI is authenticated: `hs auth`
- Use correct account ID: `hs project dev --account=ID`
- Check Node.js version (18+ required)

## Support & Resources

- **JobsPipe Docs**: [docs.jobspipe.dev](https://docs.jobspipe.dev)
- **JobsPipe API Reference**: [jobspipe.dev/openapi.json](https://jobspipe.dev/openapi.json)
- **HubSpot Developer Docs**: [developers.hubspot.com/docs](https://developers.hubspot.com/docs)
- **HubSpot CLI Docs**: [developers.hubspot.com/docs/cli](https://developers.hubspot.com/docs/cli)

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0 (2026-11-12)
- Initial release
- Company record card with hiring intelligence
- Three serverless functions
- Optional workflow action
- Comprehensive test coverage
- CI/CD pipeline

---

Built with ❤️ using [JobsPipe](https://jobspipe.dev) and [HubSpot Developer Platform](https://developers.hubspot.com)
