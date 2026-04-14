# Website type → content types & REST APIs (`unvback`)

Use this as a **routing table**: enable or ignore collection types in the Content Manager depending on the project. All routes assume `populate=*` (Strapi v5–safe baseline). Base URL: `https://YOUR_DOMAIN` (local: `http://localhost:1337`).

**Universal (almost every marketing site)**  
Single types: `site-config`, `about-page`  
Collections: `navigation`, `hero`, `service`, `faq`, `testimonial`, `stat`, `gallery-image`, `footer-quick-link`, `footer-service-link`, `certification` (if you show trust badges)

| Purpose | Content type | Example API |
|---------|--------------|-------------|
| Global brand + SEO defaults | `site-config` | `GET /api/site-config?populate=*` |
| About / corporate story | `about-page` | `GET /api/about-page?populate=*` |
| Menus | `navigation` | `GET /api/navigations?populate=*&sort=order:asc` |
| Page heroes | `hero` | `GET /api/heroes?filters[page][$eq]=home&populate=*` |
| Services / offers | `service` | `GET /api/services?populate=*&sort=order:asc` |
| FAQ blocks | `faq` | `GET /api/faqs?populate=*&sort=order:asc` |
| Quotes | `testimonial` | `GET /api/testimonials?populate=*&sort=order:asc` |
| KPI numbers | `stat` | `GET /api/stats?populate=*&sort=order:asc` |
| Masonry / gallery | `gallery-image` | `GET /api/gallery-images?populate=*&sort=order:asc` |
| Footer legal / quick | `footer-quick-link` | `GET /api/footer-quick-links?populate=*&sort=order:asc` |
| Footer service links | `footer-service-link` | `GET /api/footer-service-links?populate=*&sort=order:asc` |
| Trust logos / certs | `certification` | `GET /api/certifications?populate=*&sort=order:asc` |

---

## Portfolio / creative agency

**Use:** `site-config`, `about-page`, `navigation`, `hero`, `gallery-image`, `footer-*`, `team-member` (people), `article` or `news-post` (blog optional)  
**Usually skip:** `equipment-item`, `fitness-criterion`, `country-guideline`, `gcc-country`, `service-package`, `product` (unless you sell products)

| Need | API |
|------|-----|
| Work gallery | `GET /api/gallery-images?populate=*&sort=order:asc` |
| Team | `GET /api/team-members?populate=*&sort=order:asc` |

---

## Corporate / professional services

**Use:** universal set + `article`, `news-post`, `resource-item` (downloads), `location` (offices)  
**Skip unless domain fits:** `equipment-item`, `fitness-criterion`, `gcc-country`

| Need | API |
|------|-----|
| Blog | `GET /api/articles?populate=*&sort=date:desc` |
| News | `GET /api/news-posts?populate=*&sort=date:desc` |
| Downloads | `GET /api/resource-items?populate=*&sort=publishDate:desc` |
| Offices | `GET /api/locations?populate=*&sort=order:asc` |

---

## Clinic / medical (non-module baseline)

**Use:** universal + `service`, `faq`, `testimonial`, `team-member`, `location`, `article` (education)  
**Skip (unless you add industry modules later):** `equipment-item`, `fitness-criterion`, `gcc-country`, `country-guideline`, `product`  
**Note:** Doctor/treatment/condition types from the universal guide are **optional modules** — not in this repo by default.

| Need | API |
|------|-----|
| Staff | `GET /api/team-members?populate=*&sort=order:asc` |
| Locations | `GET /api/locations?populate=*&sort=order:asc` |

---

## Recruitment / HR firm

**Use:** universal + `article`, `testimonial`, `stat`, `team-member`, `resource-item` (employer packs)  
**Skip:** `equipment-item`, `fitness-criterion`, `product`, `gcc-country` (unless relocation content)

---

## Industrial / manufacturing / logistics

**Use:** universal + `product`, `equipment-item`, `certification`, `resource-item` (datasheets), `service-package` (bundles)  
**Skip:** `fitness-criterion` (unless occupational health), `gcc-country` (unless trade corridor content)

| Need | API |
|------|-----|
| Products | `GET /api/products?populate=*&sort=order:asc` |
| Equipment | `GET /api/equipment-items?populate=*&sort=order:asc` |
| Packages | `GET /api/service-packages?populate=*&sort=order:asc` |

---

## Relocation / visa / mobility (GCC-style)

**Use:** universal + `country-guideline`, `gcc-country`, `faq`, `resource-item`  
**Skip:** `equipment-item`, `fitness-criterion`, `product` (unless merchandised)

| Need | API |
|------|-----|
| Country rules | `GET /api/country-guidelines?populate=*` |
| GCC list | `GET /api/gcc-countries?populate=*&sort=order:asc` |

---

## Fitness / wellness center (baseline only)

**Use:** universal + `service`, `testimonial`, `faq`, `gallery-image`, `team-member`  
**Use if relevant:** `fitness-criterion`  
**Skip:** `equipment-item` (unless gym sells gear as catalog), `gcc-country`

| Need | API |
|------|-----|
| Criteria / rules | `GET /api/fitness-criteria?populate=*&sort=order:asc` |

---

## SaaS / product company (single product or suite)

**Use:** universal + `service`, `service-package`, `article`, `resource-item`, `faq`, `stat`  
**Use if you sell hardware add-ons:** `product`, `equipment-item`  
**Skip:** `gcc-country`, `country-guideline` unless GTM is region-specific

---

## Hiding unused types from editors

Strapi always loads defined APIs. For a **portfolio** site you can:

- Leave unused types **empty** and simply not call their APIs from the frontend, or  
- Later split “core” vs “extensions” into separate Strapi apps or use Role-Based **Admin** permissions to reduce noise (advanced).

This document is the **contract hint** for which endpoints your frontend should implement per vertical.
