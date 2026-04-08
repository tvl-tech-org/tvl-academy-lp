# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for **TVL Academy** — an AI training program for corporate teams. Single-page site in Romanian, hosted on GitHub Pages with custom domain `academy.tvl.tech`.

## Architecture

No build tools, bundler, or package manager. The entire site is three files:

- `index.html` — single-page structure with all sections (hero, problem, sessions, benefits, before/after, testimonial, trainer, FAQ, contact form)
- `index.css` — all styles, mobile-responsive at 768px breakpoint
- `index.js` — minimal JS: hamburger menu, FAQ accordion, dynamic year, email anti-obfuscation

## Development

Open `index.html` directly in a browser or use any local server. No build/install step.

## Integrations

- **Pipedrive** — contact form via embedded Pipedrive web form (`webforms.pipedrive.com`)
- **Cloudflare** — email obfuscation script (`/cdn-cgi/scripts/...`)
- **Google Fonts** — Open Sans (300, 400, 600, 700)
- **Unsplash** — external images loaded via URL

## Design System

- Brand color (red): `#FF4931` / `rgb(255, 73, 49)` — defined as `--red` in CSS custom properties
- Font: Open Sans
- Light background: `#f7f6f4` (`--light-bg`)
- All CSS variables are in `:root` at the top of `index.css`

## Deployment

Pushes to `main` deploy via GitHub Pages. Custom domain configured in `CNAME` file. SEO assets: `robots.txt`, `sitemap.xml`, `favicon.svg`, and JSON-LD structured data in the HTML head.
