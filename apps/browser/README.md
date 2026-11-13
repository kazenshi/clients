[![Github Workflow build browser on main](https://github.com/bitwarden/clients/actions/workflows/build-browser.yml/badge.svg?branch=main)](https://github.com/bitwarden/clients/actions/workflows/build-browser.yml?query=branch:main)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/bitwarden-browser/localized.svg)](https://crowdin.com/project/bitwarden-browser)

# Bitwarden Browser Extension

<a href="https://chromewebstore.google.com/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/3C4iKO0.png" width="64" height="64"></a>
<a href="https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="https://imgur.com/ihXsdDO.png" width="64" height="64"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/bitwarden-free-password/jbkfoedolllekgbhcbcoahefnbanhhlh" target="_blank"><img src="https://imgur.com/vMcaXaw.png" width="64" height="64"></a>
<a href="https://addons.opera.com/extensions/details/bitwarden-free-password-manager/" target="_blank"><img src="https://imgur.com/nSJ9htU.png" width="64" height="64"></a>
<a href="https://bitwarden.com/download/" target="_blank"><img src="https://imgur.com/ENbaWUu.png" width="64" height="64"></a>
<a href="https://chromewebstore.google.com/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/EuDp4vP.png" width="64" height="64"></a>
<a href="https://chromewebstore.google.com/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/z8yjLZ2.png" width="64" height="64"></a>
<a href="https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="https://imgur.com/MQYBSrD.png" width="64" height="64"></a>

The Bitwarden browser extension is written using the Web Extension API and Angular.

![My Vault](https://raw.githubusercontent.com/bitwarden/brand/main/screenshots/web-browser-extension-generator.png)

## Documentation

Please refer to the [Browser section](https://contributing.bitwarden.com/getting-started/clients/browser/) of the [Contributing Documentation](https://contributing.bitwarden.com/) for build instructions, recommended tooling, code style tips, and lots of other great information to get you started.

## Signing this Firefox fork

Stable Firefox builds use the extension ID `{dbc1291d-eb8c-4534-8653-535bea12bab2}`
in both manifest templates, allowing submission under a separate Mozilla Add-ons
account. Keep this ID unchanged for subsequent updates. This is a separate
installation from the official extension and does not inherit its local settings.
Official Bitwarden desktop native messaging does not allow this ID, so desktop
integration is unavailable without a separately configured native messaging host.
Beta builds still use the upstream beta ID and are not covered by these instructions.

To reproduce the production Manifest V2 build, use Windows with Node.js 24.19.0
and npm 11.17.0. From the repository root, run:

```powershell
npm ci
npm run build:prod:firefox --workspace @bitwarden/browser
```

The generated extension is in `apps/browser/build`. Submit that directory using
`web-ext sign --channel=unlisted`, along with matching source code and these build
instructions. Supply credentials through `WEB_EXT_API_KEY` (JWT issuer) and
`WEB_EXT_API_SECRET` (JWT secret); do not put them in source files.
