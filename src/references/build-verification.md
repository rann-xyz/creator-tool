# Production Build Verification Pattern

## Key Learning from This Session
Build verification must include: typecheck → build → git status verification → atomic commit → push verification

## Pattern: All-at-Once Commit
```bash
# After writing ALL files:
git add -A
git status --short  # Verify files staged
git commit -m "feat: complete implementation with all features"
git push -u origin main
```

## Build Command Order
```bash
npm install        # Install deps
npm run typecheck  # Type check first
npm run build      # Production build
```

## Common Pitfalls
1. Missing files after individual file writes - always `git add -A` at the end
2. Branch name mismatch - use `git branch -M main` before push
3. Partial commits - write ALL files first, then single commit

## Verification Checklist
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] All expected files exist
- [ ] No hardcoded secrets
- [ ] Git commit created
- [ ] Push verified