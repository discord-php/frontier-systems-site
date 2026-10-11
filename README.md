# Frontier Systems website

Public marketing, fundraisers and release availability for Frontier Systems. Intended host: **https://frontier-systems.discordphp.org/**, separately hosted on GitHub Pages in `discord-php/frontier-systems-site`. The main DiscordPHP.org site is unaffected.

## Develop

Node 22 or later; no third-party dependencies or install step.

```powershell
npm run build
npm run check
npm run serve
```

Preview at http://127.0.0.1:4186. Source is `site/`; generator and checks are `tools/`. PR checks do not publish. Merging to `main` validates and deploys only `dist/` with the existing Pages environment. `dist/build.json` records the deployed source SHA.

## Content and sales

Review prototype evidence and limitations before updating `site/content.json` or prose. Support links target the existing Ko-fi one-time campaign and memberships. The initial goal is USD 5,000 gross; totals remain on Ko-fi. Memberships are $5/$15/$30 monthly, without game keys or gameplay advantages. No finished-game sale is currently offered.

To enable sales later, obtain the owner's approved official storefront URL and offer details, then set `storeUrl`, `saleLabel` and `saleDescription` together. The build rejects an incomplete offer. Review the generated buy page and component previews; never turn support into an implied preorder. No payments, credentials or checkout processing live in this site.

## Domain setup

Configure this repository's GitHub Pages source as GitHub Actions, set its custom domain to `frontier-systems.discordphp.org`, then add only that DNS name as a DNS-only CNAME to `discord-php.github.io`. Keep the existing apex, www, mail and verification records intact. Enforce HTTPS once GitHub issues the certificate. Do not create wildcard DNS. DiscordPHP.org is already verified in the hosting organization.

If a path deployment is needed, build with `SITE_ORIGIN=https://discordphp.org/frontier-systems`; relative asset/navigation URLs and generated canonical/preview URLs support that base. Do not silently replace the parent site's Pages configuration.

## Discord link previews

Every primary page emits one inline `discord:component-embed` JSON script in its static head, with one Container, text, a separator and three link-style buttons. No bot, token or interaction is involved. Serialization escapes `<`, measures the emitted UTF-8 bytes and rejects payloads over 3,000. Checks cover component counts, prohibited button keys, nested containers, gallery limits, Unicode/script hazards, metadata fallback, alternate origins and future sale configuration.

Open Graph and Twitter Card fallbacks use a real generated 1200×630 PNG, original geometric branding **not gameplay**. Verify deployed HTML with Discordbot's documented user agent and verify the PNG response. Local schema guards and crawler requests do not prove Discord's final rendered preview; use Discord's official Embed Debugger for that separate acceptance step.

Official references reviewed 2026-10-10:
- https://docs.discord.com/developers/link-previews/component-embeds
- https://docs.discord.com/developers/link-previews/overview
- https://docs.discord.com/developers/change-log#component-embeds-and-link-preview-docs
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Provenance

All code, CSS, SVG geometry and generated raster branding are original first-party work under MIT. No external fonts, creative assets, screenshot uploads, analytics, cookies, embeds or third-party JavaScript. `station.svg` is an explicitly labeled concept schematic; `brand.png` is generated from geometric drawing code. Current gameplay verification images remain internal. Ko-fi and GitHub have their own terms/privacy policies when visited.
