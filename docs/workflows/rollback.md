# Workflow - Safe Rollback for Failed Changes

When a change cannot be made safe and correct, this workflow guides you through recovery using a prepared rollback plan.

## Prerequisites

Before starting ANY change that touches:
- Tracked files
- Dependencies or package configuration
- Build configuration or scripts
- Deployment or CI/CD configuration
- External integrations or state

You must **prepare a rollback plan** in your active work file (under `docs/plans/`) or keep an in-session checklist. The plan must identify:

1. **Baseline:** The starting Git state, affected files, and any deployed version
2. **Trigger:** The exact failed check, regression, or unsafe condition
3. **Reversal:** The narrow steps to undo only the current task
4. **Verification:** Checks that prove baseline behavior is restored

See [`docs/plans/_template.md`](../plans/_template.md) for the template.

## Recovery Steps

### 1. Diagnose the Failure

```bash
# Check current status
git status --short
git diff --name-only

# Run the failed verification
npm run lint
npm run typecheck
npm run build
```

**Decision:** Does the failure match the rollback trigger?
- **Yes** → Proceed to step 2 (execute rollback)
- **No** → Fix the root cause first; do not use rollback if the issue can be corrected

### 2. Review the Rollback Plan

From your active work file (e.g., `docs/plans/my-work.md`):
- Confirm the **Baseline** matches your current working state
- Confirm the **Trigger** matches the exact failure
- Verify the **Reversal** steps are safe (narrow, no `git reset --hard` or force-push)
- Review **Recovery Checks** to confirm restoration

### 3. Execute Rollback

**For local file changes only:**

```bash
# Identify files modified
git status --short

# Restore specific files (example)
git checkout app/page.tsx
git checkout components/Hero.tsx

# Or restore directory
git checkout app/
```

**For staged changes:**

```bash
# Unstage
git reset HEAD <file>

# Restore
git checkout <file>
```

**For uncommitted deletions:**

```bash
# Restore deleted file
git checkout <deleted-file>
```

**DO NOT:**
- Use `git reset --hard` (destroys uncommitted work)
- Use `git clean -fd` (deletes untracked files)
- Rewrite history or force-push (affects collaborators)

### 4. Verify Recovery

Run the recovery checks from your plan:

```bash
# Example checks for this repository
npm run lint
npm run typecheck
npm run build
```

**Confirm:**
- All checks pass
- No files are staged or modified beyond plan scope
- Any deployed state is also restored (if applicable)

### 5. Record the Outcome

Update your work plan or session notes:

```markdown
## Rollback Executed

**Date/Time:** YYYY-MM-DD HH:MM UTC

**Trigger:** [Failure condition]

**Reversal:** [Files restored with git commands]

**Verification:**
- [Check 1] ✓ passed
- [Check 2] ✓ passed

**Status:** Baseline restored successfully
```

If rollback succeeds, decide:
1. Abandon the task (keep it closed in `docs/plans/`)
2. Attempt a narrower fix (start a new plan)
3. Raise a blocker to the team (document in plan)

## Agent-Driven Rollback Rules

Agents may execute rollback automatically **only when:**
1. They can isolate the current task's changes
2. All pre-existing user work is preserved
3. The rollback itself uses safe, reversible commands
4. Recovery checks pass after rollback

**Agents must STOP and report if:**
- The rollback scope is uncertain
- Pre-existing work might be touched
- The rollback itself fails
- External state (production, database) needs recovery

## When You Cannot Rollback Safely

**STOP immediately** and report:
1. The exact current state (run `git status --short` and `git diff --name-only`)
2. The affected files and systems
3. Why the rollback cannot be safely isolated
4. The prepared recovery plan (if any)
5. Next steps (manual intervention, team discussion, etc.)

Do not attempt speculative recovery or keep applying rollback steps.

## Example: Rollback for a Failed Feature

**Scenario:** TypeScript changes broke type checking.

**Baseline:** Last successful build before starting feature work

**Trigger:** `npm run typecheck` exits with errors

**Reversal:**
```bash
# Identify changed files
git status --short
# Output: M  components/NewFeature.tsx
#         M  app/page.tsx

# Restore both
git checkout components/NewFeature.tsx app/page.tsx
```

**Recovery Checks:**
```bash
npm run typecheck    # Must pass
npm run build        # Must succeed
```

**Outcome:** Feature files reverted; repository is at baseline.

## Related Documentation

- **Work Plan Template:** [`docs/plans/_template.md`](../plans/_template.md) (includes rollback plan section)
- **AGENTS.md Rollback Rules:** [`AGENTS.md`](../../AGENTS.md) (critical rules section)
- **Bootstrap Prompt:** Describes mandatory rollback planning for all changes
