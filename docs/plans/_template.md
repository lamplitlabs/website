# Work Plan: [Plan Title]

**Date:** YYYY-MM-DD  
**Goal:** [Desired outcome]  
**Owner:** [Name/Agent]  
**Estimated Duration:** [time estimate]

## Objective

Clear, measurable statement of what we're building or fixing and why.

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Tasks

### Phase 1: [Phase Name]

- [ ] Task 1.1 — [Description]
- [ ] Task 1.2 — [Description]
- [ ] Task 1.3 — [Description]

### Phase 2: [Phase Name]

- [ ] Task 2.1 — [Description]
- [ ] Task 2.2 — [Description]

## Verification Steps

1. **Step 1:** [Verification command or manual test]
   ```bash
   npm run typecheck
   ```
2. **Step 2:** [Next verification]
3. **Step 3:** [Final verification]

## Rollback Plan (REQUIRED)

**Baseline:** [Current Git state and affected files]

**Trigger:** [Failed check or regression condition that requires rollback]

**Reversal Steps:**
1. Undo changed files: [files to restore]
2. Verify baseline restored: [command to confirm]

**Recovery Checks:**
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] [Specific regression test]

## Dependencies

- [ ] Depends on task X (link)
- [ ] Requires decision Y (link)
- [ ] Needs external resource Z

## Related Artifacts

- Feature spec: [link]
- Architecture decision: [link]
- Issue/PR: [link]
