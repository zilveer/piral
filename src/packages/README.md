# Piral Packages

Piral is developed as a monorepo.

## Available Core Packages

- [piral](./piral/README.md) is the standard library
- [piral-cli](./piral-cli/README.md) provides some command line tooling
- [piral-core](./piral-core/README.md) represents the base library
- [piral-ext](./piral-ext/README.md) bundles some useful standard plugins for use in `piral`

## Available Utility Packages

- [piral-ssr-utils](./piral-ssr-utils/README.md) provides utilities for enabling server-side rendering

## Available Opt-Out Pilet API Plugins

- [piral-dashboard](./piral-dashboard/README.md) offers the ability to show tiles registered by different pilets
- [piral-feeds](./piral-feeds/README.md) establishes an easy way to connect to a remote data source
- [piral-fetch](./piral-fetch/README.md) provides the `fetch` API
- [piral-menu](./piral-menu/README.md) includes the menu item registration API
- [piral-modals](./piral-modals/README.md) features showing and registration of modal dialogs
- [piral-notifications](./piral-notifications/README.md) offers the ability to show notifications
- [piral-translate](./piral-translate/README.md) provides the translation API
- [piral-urql](./piral-urql/README.md) provides the `query`, `mutate`, and `subscribe` API

## Available Opt-In Pilet API Plugins

- [piral-auth](./piral-auth/README.md) provides the `getUser` API
- [piral-adal](./piral-adal/README.md) integrates MSAL for authentication with a fetch middleware
- [piral-axios](./piral-axios/README.md) provides the `axios` API for making HTTP requests
- [piral-containers](./piral-containers/README.md) allows individual pilets to use their own global state
- [piral-forms](./piral-forms/README.md) allows construction of reusable forms
- [piral-pwa](./piral-pwa/README.md) enables out-of-the-box PWA support with benefits
- [piral-search](./piral-search/README.md) provides enhanced search capability
- [piral-tracking](./piral-tracking/README.md) provides the tracking API

## Available Opt-In Converter Packages

- [piral-hyperapp](./piral-hyperapp/README.md) provides integration for *Hyperapp*
- [piral-inferno](./piral-inferno/README.md) provides integration for *Inferno*
- [piral-ng](./piral-ng/README.md) provides integration for *Angular*
- [piral-ngjs](./piral-ngjs/README.md) provides integration for *Angular.js*
- [piral-preact](./piral-preact/README.md) provides integration for *Preact*
- [piral-vue](./piral-vue/README.md) provides integration for *Vue*
