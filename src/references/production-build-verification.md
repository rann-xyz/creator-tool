# Production Build Verification Checklist

## Pre-Build Checklist
1. **Dependencies**: Ensure all dependencies are properly declared
   ```bash
   cat package.json | grep dependencies
   ```

2. **Type Safety**: Run type checking before build
   ```bash
   npx tsc --noEmit
   ```

3. **File Structure**: Verify all required files exist
   ```bash
   # Check for missing pages
   ls -la src/app/
   # Check for missing components
   ls -la src/components/
   # Check for required API routes
   ls -la src/app/api/
   ```

## Build Verification Steps

### Next.js Production Build
```bash
# Clean install
rm -rf node_modules .next
npm install

# Type check
npm run typecheck || echo "Type errors found"

# Build
npm run build
```

Expected output:
- ✅ "validating" 
- ✅ "building"
- ✅ "generating static pages"
- ✅ "exporting"
- ✅ No errors

### Database Schema Verification
```bash
# Verify Prisma schema
npx prisma validate

# Check migration status (if applicable)
npx prisma migrate status
```

### Git Commit Verification
```bash
# Check all files are tracked
git status --short

# Verify expected files exist
git ls-files | grep -E "(package\.json|tsconfig\.json|prisma/schema)"

# Single atomic commit
git add .
git commit -m "feat: [descriptive summary]

Detailed description:
- Feature 1
- Feature 2
- Test coverage"

# Verify commit
git log --oneline -1
```

## Common Build Issues & Solutions

### Missing Dependencies
**Symptom**: "Cannot find module" during build
**Solution**: Ensure dependency is in `dependencies` (not `devDependencies`) in package.json

### Path Aliases Not Resolving
**Symptom**: Module not found errors
**Solution**: Verify tsconfig.json has correct `paths` configuration
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Environment Variables Missing
**Symptom**: Build fails with "AUTH_SECRET not defined"
**Solution**: Check .env.example has all required variables documented
```bash
# Verify no hardcoded secrets
grep -r "sk-" src/ --include="*.ts" --include="*.tsx" || echo "No API keys in source"
```

### Empty API Responses
**Symptom**: API returns no data
**Solution**: Verify API route handlers return valid JSON
```bash
# Test API locally
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## Post-Build Verification

### Check Bundle Size
```bash
# Look for bundle warnings
npm run build 2>&1 | grep -i "warning\|chunk"
```

### Verify Key Routes Work
After running `npm run build`:
1. Start dev server: `npm run dev`
2. Test critical paths:
   - `/` - Landing page
   - `/login` - Login page
   - `/signup` - Signup page
   - `/dashboard` - Dashboard (requires auth)
   - Protected routes redirect properly when not logged in

## Production Deployment Checklist

Before pushing to GitHub:
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `git status --short` shows expected files
- [ ] No hardcoded credentials/secrets
- [ ] README.md is complete
- [ ] .env.example is complete and accurate

## Commit Quality Check
```bash
# View last commit
git log --oneline -1

# Check commit message is descriptive
git show --stat HEAD
```

## Reference Files
- `git-workflows/SKILL.md` - Core git workflow patterns
- `package.json` - Dependencies and scripts