# Fixing a failed upstream sync

The [Release Patched Browser workflow](workflows/release-patched-browser.yml) fails with
`Fork commits conflict with upstream main` when upstream changes conflict with the fork
commit, or with a patch error when
[`0001-add-proof-of-concept-prf-support-for-passkeys.patch`](../0001-add-proof-of-concept-prf-support-for-passkeys.patch)
no longer applies. Fix it locally using the rules below, then force push.

## Rules

- `main` is upstream `main` plus **exactly one** fork commit on top.
- **No merge commits.** Never run `git merge` or a plain `git pull` (it merges by
  default). Sync only with `git rebase`.
- **Never add a second commit.** Fold every fix into the fork commit with
  `git commit --amend --no-edit`, which keeps the existing commit message.
- Push only with `--force-with-lease` so you never overwrite a sync pushed meanwhile.

## 1. Start from the fork and fetch upstream

```sh
git fetch origin
git switch main
git reset --hard origin/main      # discards local changes to main
git remote add upstream https://github.com/bitwarden/clients.git   # once
git fetch --no-tags upstream main
git branch -f backup/main-before-fix origin/main
```

## 2. Rebase the fork commit onto upstream

```sh
git rebase upstream/main
```

If it stops on conflicts, edit each conflicted file and keep **both** sides' intent. For
example, in `apps/browser/src/manifest*.json` keep the fork's Firefox `id` and upstream's
other changes such as `strict_min_version`. Then:

```sh
git add <resolved files>
GIT_EDITOR=true git rebase --continue   # PowerShell: $env:GIT_EDITOR='true'; git rebase --continue
```

Continuing a rebase keeps the original commit message, so the result is still one commit.

## 3. Fix the patch if it no longer applies

The workflow applies the patch with plain `git apply` (no three-way merge) to the latest
upstream `browser-v*` tag, so it must apply cleanly there and on upstream `main`:

```sh
git apply --check 0001-add-proof-of-concept-prf-support-for-passkeys.patch
```

If that fails, regenerate the patch against upstream:

```sh
git worktree add --detach ../prf-fix upstream/main
cd ../prf-fix
git apply --3way ../clients/0001-add-proof-of-concept-prf-support-for-passkeys.patch
# resolve conflicts, then stage everything
git add -A
git diff --cached > ../clients/0001-add-proof-of-concept-prf-support-for-passkeys.patch
cd ../clients
git worktree remove --force ../prf-fix
git apply --check 0001-add-proof-of-concept-prf-support-for-passkeys.patch
```

Also confirm it applies to the latest browser release tag:

```sh
git fetch --no-tags upstream "refs/tags/<browser-vYYYY.M.N>:refs/tags/<browser-vYYYY.M.N>"
git worktree add --detach ../prf-tag <browser-vYYYY.M.N>
git -C ../prf-tag apply --check ../clients/0001-add-proof-of-concept-prf-support-for-passkeys.patch
git worktree remove --force ../prf-tag
```

Fold the updated patch (and any other fixes) into the fork commit:

```sh
git add 0001-add-proof-of-concept-prf-support-for-passkeys.patch
git commit --amend --no-edit
```

## 4. Validate

```sh
git rev-list --count upstream/main..main            # must print 1
git rev-list --count --merges upstream/main..main   # must print 0
```

Optionally check the patched code, then revert it:

```sh
git apply 0001-add-proof-of-concept-prf-support-for-passkeys.patch
npm ci
npx tsc -p apps/browser/tsconfig.json --noEmit
npx jest -c libs/common/jest.config.js libs/common/src/platform/services/fido2
npx jest -c apps/browser/jest.config.js apps/browser/src/autofill/fido2
git apply -R 0001-add-proof-of-concept-prf-support-for-passkeys.patch
git status --short                                   # must be empty
```

## 5. Force push and rerun

```sh
git fetch origin
git push --force-with-lease=refs/heads/main:$(git rev-parse backup/main-before-fix) origin main
gh workflow run release-patched-browser.yml --repo kazenshi/clients --ref main
gh run watch --repo kazenshi/clients
```

If the push is rejected as stale, the hourly sync changed `main`. Inspect
`git log origin/main`, then restart from step 1.

Once the run succeeds, delete the backup branch with
`git branch -D backup/main-before-fix`.
