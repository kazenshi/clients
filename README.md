<p align="center">
  <img src="https://raw.githubusercontent.com/bitwarden/brand/main/screenshots/apps-combo-logo.png" alt="Bitwarden" />
</p>
<p align="center">
  <a href="https://github.com/bitwarden/clients/actions/workflows/build-browser.yml?query=branch:main" target="_blank"><img src="https://github.com/bitwarden/clients/actions/workflows/build-browser.yml/badge.svg?branch=main" alt="GitHub Workflow browser build on main" /></a>
  <a href="https://github.com/bitwarden/clients/actions/workflows/build-cli.yml?query=branch:main" target="_blank"><img src="https://github.com/bitwarden/clients/actions/workflows/build-cli.yml/badge.svg?branch=main" alt="GitHub Workflow CLI build on main" /></a>
  <a href="https://github.com/bitwarden/clients/actions/workflows/build-desktop.yml?query=branch:main" target="_blank"><img src="https://github.com/bitwarden/clients/actions/workflows/build-desktop.yml/badge.svg?branch=main" alt="GitHub Workflow desktop build on main" /></a>
  <a href="https://github.com/bitwarden/clients/actions/workflows/build-web.yml?query=branch:main" target="_blank"><img src="https://github.com/bitwarden/clients/actions/workflows/build-web.yml/badge.svg?branch=main" alt="GitHub Workflow web build on main" /></a>
</p>

---

# UNOFFICIAL Bitwarden Client Applications

This repository is a fork of the official client that applies a patch to enable PRF support.

This repository houses all Bitwarden client applications except the mobile applications ([iOS](https://github.com/bitwarden/ios) | [android](https://github.com/bitwarden/android)).

Please refer to the [Clients section](https://contributing.bitwarden.com/getting-started/clients/) of the [Contributing Documentation](https://contributing.bitwarden.com/) for build instructions, recommended tooling, code style tips, and lots of other great information to get you started.

## Patched browser releases in this fork

The [Release Patched Browser workflow](.github/workflows/release-patched-browser.yml)
checks `bitwarden/clients` hourly for the most recently published stable
`browser-vYYYY.M.N` release. Desktop, CLI, web, draft, and prerelease releases are
ignored. It rebases this fork's commits onto upstream `main` and force pushes the
default branch, so fork commits always sit after upstream history with no merge
commits. It then builds the exact browser release tag with
[`0001-add-proof-of-concept-prf-support-for-passkeys.patch`](0001-add-proof-of-concept-prf-support-for-passkeys.patch)
applied. Other fork changes, including Firefox extension ID changes, are not part
of these release builds.

To activate it, commit the workflow and patch to the fork's default branch, enable
GitHub Actions in the fork, and run **Actions > Release Patched Browser > Run
workflow** on that branch. Leave `upstream_tag` blank for the latest stable browser
release, or enter a specific published stable browser tag.

Create a fine-grained personal access token restricted to `kazenshi/clients` with
**Contents: Read and write** and **Workflows: Read and write**, and save it as the
repository Actions secret `FORK_SYNC_TOKEN`. The built-in `GITHUB_TOKEN` cannot
push upstream changes to workflow files, so the sync/tag job requires this secret
and fails explicitly when it is missing. Extension build jobs use read-only
permissions without this secret; release publication uses `GITHUB_TOKEN` with
job-scoped `contents: write`. No signing credentials are required. Repository rules
must permit the token owner to force push the default branch and create
`browser-v*-prf` tags, and permit Actions to create releases. Renew the sync token
before it expires.

Each `browser-vYYYY.M.N-prf` release contains open-source production builds packaged
for sideloading, plus `SHA256SUMS.txt`:

- `.crx` files for Chrome, Edge, and Opera, self-signed by
  [`pack-crx3.mjs`](.github/scripts/pack-crx3.mjs) and not published to any web
  store. Users extract the `.crx` into a permanent folder (for example
  `%USERPROFILE%\Extensions\bitwarden-prf\chrome` or
  `~/Extensions/bitwarden-prf/chrome`) with `tar -xf` on Windows and macOS, or
  `unzip` on Linux. They then load it from `chrome://extensions/`,
  `edge://extensions/`, or `opera://extensions` with **Developer mode** on and
  **Load unpacked**. `Expand-Archive` cannot read `.crx` files.
- An unsigned `.xpi` for Firefox (Manifest V2). Regular Firefox installs only
  Mozilla-signed add-ons permanently, so it is loaded through `about:debugging` >
  **This Firefox** > **Load Temporary Add-on...** and removed on restart. Firefox
  Developer Edition can install it permanently after setting
  `xpinstall.signatures.required` to `false` in `about:config`, using `about:addons`
  > **Install Add-on From File...**.

The release notes contain step-by-step extraction and loading instructions.

Extensions loaded with **Load unpacked** get an ID derived from their folder path,
so updating into the same folder keeps the ID, login, and settings. The CRX
signing key only determines the ID when a `.crx` is installed directly. Without
the optional `CRX_PRIVATE_KEY` repository secret, each release is signed with a
one-time key; set it to a PEM RSA private key, for example from
`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`, for a stable
`.crx` ID. Safari is not built.
The Firefox package keeps the upstream add-on ID and can replace an official
installation, so back up your data first. The PRF patch is experimental and these
releases are not official Bitwarden builds.

Rebase conflicts, patch conflicts, and build failures fail the workflow rather than
publishing unpatched or incomplete builds. The patched source tag is created
before building and is never moved; a release is only published after all four
builds succeed. Rerunning retries an unfinished release using the same source tag
and resumes any draft upload. Published releases are skipped, not overwritten.
If the patch changes after a tag was prepared, the workflow reports the source
mismatch instead of silently reusing or moving that tag. Resolve that mismatch
explicitly before retrying. Scheduled runs build only the latest release, not a
backlog; use the manual tag input for older releases. GitHub may delay scheduled
runs or disable them after prolonged repository inactivity.

## Related projects:

- [bitwarden/server](https://github.com/bitwarden/server): The core infrastructure backend (API, database, Docker, etc).
- [bitwarden/ios](https://github.com/bitwarden/ios): Bitwarden iOS Password Manager & Authenticator apps.
- [bitwarden/android](https://github.com/bitwarden/android): Bitwarden Android Password Manager & Authenticator apps.
- [bitwarden/directory-connector](https://github.com/bitwarden/directory-connector): A tool for syncing a directory (AD, LDAP, Azure, G Suite, Okta) to an organization.

# We're Hiring!

Interested in contributing in a big way? Consider joining our team! We're hiring for many positions. Please take a look at our [Careers page](https://bitwarden.com/careers/) to see what opportunities are [currently open](https://bitwarden.com/careers/#open-positions) as well as what it's like to work at Bitwarden.

# Contribute

Code contributions are welcome! Please commit any pull requests against the `main` branch. Learn more about how to contribute by reading the [Contributing Guidelines](https://contributing.bitwarden.com/contributing/). Check out the [Contributing Documentation](https://contributing.bitwarden.com/) for how to get started with your first contribution.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
