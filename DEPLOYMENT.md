# Deployment Guide

This guide covers deploying the JobsPipe HubSpot app to production and the marketplace.

## Prerequisites

- [ ] HubSpot Developer Account with app created
- [ ] JobsPipe API key (production key, not test)
- [ ] All tests passing locally
- [ ] Manual testing completed in dev account
- [ ] Custom properties documented

## Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests passing (`npm test`)
- [ ] Test coverage >80% (`npm run test:coverage`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or API keys

### API Verification
- [ ] All endpoints verified against JobsPipe OpenAPI spec
- [ ] Error handling tested for 401, 402, 429 responses
- [ ] Rate limiting respected
- [ ] Idempotency keys used where needed

### HubSpot Configuration
- [ ] App metadata complete (name, description, icon)
- [ ] OAuth scopes correctly configured
- [ ] Secrets configuration documented
- [ ] Card configuration validated
- [ ] Function configurations validated
- [ ] Workflow action tested

### Documentation
- [ ] README.md up to date
- [ ] Installation instructions clear
- [ ] API integration documented
- [ ] Troubleshooting section complete
- [ ] Changelog updated

## Deployment Steps

### 1. Version Bump

Update version in `package.json`:
```bash
npm version patch  # or minor/major
```

### 2. Build and Validate

```bash
# Install dependencies
npm ci

# Run full test suite
npm test

# Verify build
npm run lint
```

### 3. Upload to HubSpot Production

```bash
# Authenticate with production account
hs auth

# Upload project
hs project upload --account=PROD_ACCOUNT_ID
```

The CLI will:
- Bundle React components
- Upload functions to HubSpot serverless runtime
- Register card and workflow action
- Deploy app configuration

### 4. Configure Production Secrets

In HubSpot account:
1. Navigate to app settings
2. Add `JOBSPIPE_API_KEY` secret
3. Use production API key (starts with `jp_live_`)
4. Test the connection

### 5. Create Custom Properties

Create these in production account:
```
Settings → Properties → Company Properties → Create property
```

Properties:
- `jobspipe_open_roles_count` (Number)
- `jobspipe_top_department` (Single-line text)
- `jobspipe_hiring_signal` (Single-line text)
- `jobspipe_last_updated` (Date picker)

### 6. Install and Test

1. Install app in production account
2. Add card to a company record
3. Test with real company data
4. Verify all features work:
   - Card loads
   - Data displays correctly
   - Refresh works
   - Sync to properties works
   - Error handling works
   - Workflow action executes

### 7. Monitor

After deployment:
- Check HubSpot logs for errors
- Monitor JobsPipe API usage
- Watch for support requests
- Track installation metrics

## Marketplace Submission

For public marketplace distribution:

### 1. Prepare Listing Assets

#### Required
- App icon (512x512 PNG)
- 4-6 screenshots showing features
- Privacy policy URL
- Terms of service URL
- Support email/URL
- Pricing information

#### Screenshots to Include
1. Company card showing hiring data
2. Open roles and departments view
3. Recent postings list
4. Hiring signal badge
5. Workflow action in editor
6. Properties sync confirmation

### 2. Complete App Listing

Go to [HubSpot Partner Portal](https://developers.hubspot.com):

1. Navigate to your app
2. Click "Marketplace Listing"
3. Fill out all required fields:
   - **Name**: JobsPipe - Hiring Intelligence
   - **Tagline**: View hiring data for companies in HubSpot CRM
   - **Description**: Full description with features, benefits, use cases
   - **Category**: Sales → Sales Enablement
   - **Pricing**: Freemium (free tier, paid plans available)
   - **Support Email**: Your support email
   - **Support URL**: Support page URL
   - **Privacy Policy**: Privacy policy URL
   - **Terms of Service**: Terms URL

### 3. Configure OAuth

1. Set redirect URLs:
   ```
   https://app.hubspot.com/oauth-callback/{APP_ID}
   ```

2. Verify scopes in `app-hsmeta.json`:
   - `crm.objects.companies.read`
   - `crm.objects.companies.write`

3. Test OAuth flow in developer account

### 4. Submit for Review

1. Click "Submit for Review"
2. Add reviewer notes explaining:
   - What the app does
   - How to test it
   - Any special configuration needed
   - JobsPipe account needed for testing

3. Wait for review (typically 5-10 business days)

### 5. Review Process

HubSpot will check:
- App functionality and stability
- OAuth implementation
- Error handling
- User experience
- Security and privacy
- Marketplace listing quality

Common rejection reasons:
- Incomplete testing
- Poor error messages
- Security issues
- Broken features
- Unclear documentation

### 6. Address Feedback

If changes requested:
1. Make required changes
2. Re-test thoroughly
3. Re-upload via `hs project upload`
4. Respond to reviewer comments
5. Resubmit

### 7. Go Live

Once approved:
- App appears in marketplace
- Users can discover and install
- Monitor reviews and feedback
- Respond to support requests
- Track usage metrics

## Post-Deployment

### Monitoring

Set up monitoring for:
- Error rates (HubSpot logs)
- API usage (JobsPipe dashboard)
- Installation count
- Active users
- Support tickets

### Maintenance

Regular tasks:
- Update dependencies monthly
- Monitor HubSpot platform changes
- Check JobsPipe API updates
- Respond to user feedback
- Fix bugs promptly
- Release feature updates

### Updates

For app updates:
1. Make changes in development branch
2. Test thoroughly
3. Bump version number
4. Update changelog
5. Upload to production
6. Notify users if breaking changes

## Rollback Plan

If issues occur:

### Quick Rollback
```bash
# Upload previous version
git checkout v1.0.0  # previous stable version
hs project upload --account=PROD_ACCOUNT_ID
```

### Incident Response
1. Disable app in marketplace (if public)
2. Fix issue in code
3. Test thoroughly
4. Re-deploy
5. Re-enable marketplace listing
6. Notify affected users

## Support Plan

### Support Channels
- GitHub Issues: Bug reports, feature requests
- Email: Direct support for paying customers
- Documentation: Self-service help

### Response Times
- Critical bugs: 24 hours
- Standard bugs: 3-5 business days
- Feature requests: Best effort

### Escalation Path
1. GitHub issue or email
2. Investigate and reproduce
3. Fix and test
4. Deploy patch
5. Notify reporter

## Compliance

### Data Handling
- No PII stored outside HubSpot
- API calls use company domains only
- Secrets encrypted by HubSpot
- No data retention beyond session

### Privacy
- Privacy policy required
- GDPR compliant
- No data sharing with third parties (except JobsPipe API)
- User can delete data anytime

### Security
- OAuth for authentication
- Secrets managed by HubSpot
- HTTPS for all API calls
- No hardcoded credentials
- Regular dependency updates

## Troubleshooting Deployment

### Upload Fails
```bash
# Check authentication
hs auth

# Verify account ID
hs accounts list

# Try with explicit account
hs project upload --account=12345678
```

### Functions Not Working
- Check Node.js version (18+)
- Verify function secrets configured
- Check HubSpot logs
- Test locally with `hs project dev`

### Card Not Appearing
- Verify upload succeeded
- Check card configuration in HubSpot UI
- Ensure app installed in account
- Check browser console for errors

### Marketplace Rejection
- Read reviewer feedback carefully
- Test the exact scenario they mention
- Make requested changes
- Provide clear response
- Resubmit with notes

## Success Metrics

Track these KPIs:
- Installations (cumulative and active)
- Card views per day
- API calls per installation
- Error rate (target <1%)
- User reviews and ratings
- Support ticket volume
- Feature usage (workflow action, sync)

## Resources

- [HubSpot Deployment Docs](https://developers.hubspot.com/docs/apps/deployment)
- [Marketplace Guidelines](https://developers.hubspot.com/docs/apps/marketplace-guidelines)
- [JobsPipe Status Page](https://status.jobspipe.dev)
- [HubSpot CLI Reference](https://developers.hubspot.com/docs/cli)

---

Need help? Contact support@jobspipe.dev or open an issue on GitHub.
