# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-12

### Added
- Initial release of JobsPipe HubSpot integration
- Company record card (UI extension) showing:
  - Open roles count
  - Top departments hiring
  - Recent job postings with links
  - Hiring signal badges
- Three serverless functions:
  - `getCompanyDomain` - Extracts and normalizes company domain
  - `getHiringData` - Fetches hiring data from JobsPipe API
  - `syncHiringDataToCompany` - Syncs data to company properties
  - `testJobsPipeConnection` - Tests API key validity
- Settings page for API key configuration
- Optional workflow action "Get JobsPipe hiring data"
- Comprehensive test suite with Jest
- CI/CD pipeline with GitHub Actions
- Complete documentation:
  - Installation and setup guide
  - Local development instructions
  - Deployment guide
  - Contributing guidelines
  - API endpoint verification

### Security
- API key stored securely via HubSpot secrets
- No credentials in source code
- OAuth authentication for HubSpot
- HTTPS for all API calls

### Documentation
- README with full setup and usage instructions
- DEPLOYMENT guide for production releases
- CONTRIBUTING guide for open source contributors
- Inline JSDoc comments for all functions
- OpenAPI spec verification in CI

## [Unreleased]

### Planned
- Bulk company analysis feature
- Historical hiring trends chart
- Email notifications for hiring signals
- Advanced filtering in card UI
- Export hiring data to CSV
- Scheduled sync automation

---

[1.0.0]: https://github.com/YOUR_USERNAME/jobspipe-hubspot-app/releases/tag/v1.0.0
