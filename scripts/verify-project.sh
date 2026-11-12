#!/bin/bash

# Project verification script for JobsPipe HubSpot App
# Checks that all required files exist and are valid

set -e

echo "🔍 Verifying JobsPipe HubSpot App Project..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Check required root files
echo "📁 Checking root files..."
required_files=(
  "hsproject.json"
  "package.json"
  "README.md"
  ".gitignore"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - MISSING"
    ((errors++))
  fi
done

echo ""

# Check app configuration
echo "📱 Checking app configuration..."
if [ -f "src/app/app-hsmeta.json" ]; then
  echo -e "${GREEN}✓${NC} src/app/app-hsmeta.json"
  
  # Verify it's valid JSON
  if cat src/app/app-hsmeta.json | python3 -m json.tool > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Valid JSON"
  else
    echo -e "${RED}✗${NC} Invalid JSON"
    ((errors++))
  fi
else
  echo -e "${RED}✗${NC} src/app/app-hsmeta.json - MISSING"
  ((errors++))
fi

echo ""

# Check card files
echo "🎴 Checking card files..."
card_files=(
  "src/app/cards/company-hiring-card-hsmeta.json"
  "src/app/cards/CompanyHiringCard.jsx"
  "src/app/cards/package.json"
)

for file in "${card_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - MISSING"
    ((errors++))
  fi
done

echo ""

# Check function files
echo "⚙️  Checking serverless functions..."
functions=(
  "getCompanyDomain"
  "getHiringData"
  "syncHiringDataToCompany"
  "testJobsPipeConnection"
)

for func in "${functions[@]}"; do
  hsmeta="src/app/functions/${func}-hsmeta.json"
  js="src/app/functions/${func}.js"
  
  if [ -f "$hsmeta" ] && [ -f "$js" ]; then
    echo -e "${GREEN}✓${NC} $func (hsmeta + js)"
  else
    echo -e "${RED}✗${NC} $func - MISSING FILES"
    [ ! -f "$hsmeta" ] && echo "  Missing: $hsmeta"
    [ ! -f "$js" ] && echo "  Missing: $js"
    ((errors++))
  fi
done

echo ""

# Check workflow action
echo "🔄 Checking workflow action..."
if [ -f "src/app/workflow-actions/get-hiring-data-hsmeta.json" ] && \
   [ -f "src/app/workflow-actions/getHiringDataAction.js" ]; then
  echo -e "${GREEN}✓${NC} Workflow action files present"
else
  echo -e "${YELLOW}⚠${NC} Workflow action files missing (optional)"
  ((warnings++))
fi

echo ""

# Check settings page
echo "⚙️  Checking settings page..."
if [ -f "src/app/settings/settings-hsmeta.json" ] && \
   [ -f "src/app/settings/Settings.jsx" ]; then
  echo -e "${GREEN}✓${NC} Settings page files present"
else
  echo -e "${YELLOW}⚠${NC} Settings page files missing (optional)"
  ((warnings++))
fi

echo ""

# Check tests
echo "🧪 Checking tests..."
test_files=(
  "tests/getHiringData.test.js"
  "tests/workflowAction.test.js"
)

for file in "${test_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${YELLOW}⚠${NC} $file - MISSING"
    ((warnings++))
  fi
done

echo ""

# Check CI configuration
echo "🚀 Checking CI configuration..."
if [ -f ".github/workflows/test.yml" ]; then
  echo -e "${GREEN}✓${NC} GitHub Actions workflow present"
else
  echo -e "${YELLOW}⚠${NC} No CI configuration"
  ((warnings++))
fi

echo ""

# Validate all JSON files
echo "📋 Validating JSON files..."
json_valid=true
for file in $(find src -name "*.json" -o -name "hsproject.json"); do
  if cat "$file" | python3 -m json.tool > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - INVALID JSON"
    json_valid=false
    ((errors++))
  fi
done

echo ""

# Check JavaScript syntax (JS files only, JSX requires transpilation)
echo "🔍 Checking JavaScript syntax..."
js_valid=true
for file in $(find src -name "*.js"); do
  if node --check "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - SYNTAX ERROR"
    js_valid=false
    ((errors++))
  fi
done

# Check JSX files exist (can't validate syntax without transpiler)
for file in $(find src -name "*.jsx"); do
  echo -e "${GREEN}✓${NC} $file (JSX - will be transpiled by HubSpot)"
done

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Project is ready for:"
  echo "  • Local development (hs project dev)"
  echo "  • Testing (npm test)"
  echo "  • Upload to HubSpot (hs project upload)"
  exit 0
elif [ $errors -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Passed with $warnings warning(s)${NC}"
  echo ""
  echo "Project should work, but review warnings."
  exit 0
else
  echo -e "${RED}❌ Failed with $errors error(s) and $warnings warning(s)${NC}"
  echo ""
  echo "Please fix errors before proceeding."
  exit 1
fi
