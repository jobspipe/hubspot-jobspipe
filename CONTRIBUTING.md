# Contributing to JobsPipe HubSpot App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/jobspipe-hubspot-app.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Before Making Changes

1. Ensure all tests pass: `npm test`
2. Check linting: `npm run lint`
3. Review the [HubSpot Developer Documentation](https://developers.hubspot.com/docs)
4. Review the [JobsPipe API Documentation](https://docs.jobspipe.dev)

### Making Changes

1. Write code following the existing style
2. Add tests for new functionality
3. Update documentation (README, JSDoc comments)
4. Verify against JobsPipe OpenAPI spec for API changes
5. Test manually in a HubSpot developer account

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

Aim for >80% code coverage for new code.

### Code Style

- Use Prettier for formatting: `npm run format`
- Follow ESLint rules: `npm run lint`
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions focused and small

### Commit Messages

Follow conventional commit format:
```
type(scope): subject

body (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Build/tooling changes

Examples:
```
feat(card): add filtering by seniority level
fix(api): handle 429 rate limit errors gracefully
docs(readme): update installation instructions
```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Ensure all tests pass and linting succeeds
3. Update the version number following [SemVer](https://semver.org/)
4. Create a pull request with a clear title and description
5. Link any related issues
6. Wait for review and address feedback

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Verified against JobsPipe OpenAPI spec
- [ ] Tested in HubSpot developer account
- [ ] No secrets or API keys in code
- [ ] Changelog updated (if applicable)

## Code Review Guidelines

### For Reviewers

- Be respectful and constructive
- Check for test coverage
- Verify API calls match OpenAPI spec
- Test changes in a HubSpot account if possible
- Check for security issues (exposed secrets, XSS, etc.)

### For Contributors

- Respond to feedback promptly
- Don't take criticism personally
- Ask questions if feedback is unclear
- Make requested changes or explain why not

## Reporting Bugs

Create an issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- HubSpot account type (developer/production)
- Node.js version
- Error messages/logs
- Screenshots if applicable

## Suggesting Features

Create an issue with:
- Clear description of the feature
- Use cases and benefits
- Examples of how it would work
- Any implementation ideas
- Links to relevant HubSpot/JobsPipe documentation

## Areas for Contribution

### High Priority
- Additional error handling and retry logic
- Performance optimizations
- Additional unit tests
- Integration tests
- Documentation improvements

### Feature Ideas
- Filter jobs by seniority in card UI
- Export hiring data to CSV
- Scheduled automatic sync workflow
- Multi-company bulk analysis
- Historical hiring trends chart
- Email notifications for hiring signals
- Slack integration for hiring alerts

### Easy First Issues
- Add more occupation code mappings
- Improve error messages
- Add loading states
- Enhance UI styling
- Add more examples to README

## Getting Help

- Review existing issues and PRs
- Check HubSpot Developer Documentation
- Check JobsPipe API Documentation
- Ask questions in issues (tag with `question`)
- Email support@jobspipe.dev for JobsPipe questions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on what's best for the community
- Show empathy towards others
- Accept constructive criticism gracefully

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
