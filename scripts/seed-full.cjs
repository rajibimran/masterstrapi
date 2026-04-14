/**
 * Full demo seed: fills every content type with sample text and uploads images/files where applicable.
 * Run from project root: npm run seed:full
 *
 * Requires network access to download placeholder images (and optional tiny video).
 * Destructive: removes existing rows for all collection types listed below, then recreates one rich row each.
 * Single types (site-config, about-page) are updated in place or created if missing.
 *
 * Uses CommonJS so Node can load @strapi/strapi without ESM/lodash resolution issues.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

/** Rich text fields in this project validate as HTML strings (not block JSON). */
const RT = (text) => `<p>${String(text)}</p>`;

const SEO_SAMPLE = (imgId) => ({
  metaTitle: 'Sample SEO title',
  metaDescription: 'Sample meta description for demo content.',
  metaKeywords: 'demo, strapi, cms',
  canonicalPath: '/',
  openGraphImage: imgId,
  openGraphImageAlt: 'Open Graph placeholder',
  twitterCard: 'summary_large_image',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Demo Organization',
  },
  noIndex: false,
  snippetForAiOverview: 'Short editorial summary for AI-style previews.',
});

async function downloadToTemp(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(os.tmpdir(), `unvback-${filename}-${Date.now()}`);
  fs.writeFileSync(tmp, buf);
  return tmp;
}

async function uploadFile(strapi, tmpPath, originalFilename, mimetype) {
  const stat = fs.statSync(tmpPath);
  const uploadService = strapi.plugin('upload').service('upload');
  const files = [
    {
      filepath: tmpPath,
      originalFilename,
      mimetype,
      size: stat.size,
    },
  ];
  const uploaded = await uploadService.upload({ data: {}, files });
  try {
    fs.unlinkSync(tmpPath);
  } catch {
    /* ignore */
  }
  return uploaded[0]?.id;
}

async function uploadImageUrl(strapi, url, name) {
  const ext = url.includes('.png') ? 'png' : 'jpg';
  const tmp = await downloadToTemp(url, `${name}.${ext}`);
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return uploadFile(strapi, tmp, `${name}.${ext}`, mime);
}

async function wipeCollection(strapi, uid) {
  const rows = await strapi.entityService.findMany(uid, { fields: ['id'], limit: 500 });
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  for (const row of list) {
    const rid = row.id ?? row.documentId;
    if (rid != null) await strapi.entityService.delete(uid, rid);
  }
}

async function replaceSingle(strapi, uid, data) {
  const rows = await strapi.entityService.findMany(uid, { fields: ['id'], limit: 20 });
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  for (const row of list) {
    const rid = row.id ?? row.documentId;
    if (rid != null) await strapi.entityService.delete(uid, rid);
  }
  await strapi.entityService.create(uid, { data });
}

async function main() {
  const { distDir, appDir } = await compileStrapi({ appDir: ROOT, ignoreDiagnostics: true });
  const app = createStrapi({
    appDir,
    distDir,
    autoReload: false,
    serveAdminPanel: false,
  });
  await app.load();

  const strapi = app;

  const img1 = await uploadImageUrl(strapi, 'https://picsum.photos/seed/unvback1/800/600.jpg', 'sample-1');
  const img2 = await uploadImageUrl(strapi, 'https://picsum.photos/seed/unvback2/800/600.jpg', 'sample-2');
  const img3 = await uploadImageUrl(strapi, 'https://picsum.photos/seed/unvback3/400/400.jpg', 'sample-3');

  let pdfId;
  try {
    const pdfTmp = await downloadToTemp(
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'dummy.pdf'
    );
    pdfId = await uploadFile(strapi, pdfTmp, 'dummy.pdf', 'application/pdf');
  } catch {
    pdfId = undefined;
  }

  let videoId;
  try {
    const vidTmp = await downloadToTemp(
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      'flower.mp4'
    );
    videoId = await uploadFile(strapi, vidTmp, 'flower.mp4', 'video/mp4');
  } catch {
    videoId = undefined;
  }

  await replaceSingle(strapi, 'api::site-config.site-config', {
    siteName: 'Demo Site (seed)',
    tagline: 'Seeded universal Strapi backend',
    logo: img1,
    phone: '+1-555-0100',
    email: 'hello@example.com',
    address: '123 Demo Street, Sample City',
    workingHours: 'Mon–Fri 9:00–17:00',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=demo',
    facebookUrl: 'https://facebook.com/example',
    instagramUrl: 'https://instagram.com/example',
    linkedinUrl: 'https://linkedin.com/company/example',
    defaultSeo: SEO_SAMPLE(img2),
  });

  const aboutData = {
    missionTitle: 'Mission (seed)',
    missionText: RT('We build design-agnostic content APIs.'),
    missionImage: img1,
    centerTitle: 'Center column',
    centerText: RT('Structured content for any frontend.'),
    centerImage: img2,
    valuesSectionTitle: 'Our values',
    values: [
      { title: 'Quality', desc: 'We care about accuracy.', alt: 'Value 1', img: img3 },
      { title: 'Speed', desc: 'Ship safely and quickly.', alt: 'Value 2', img: img1 },
    ],
    facilityGalleryTitle: 'Facilities',
    facilityGallerySubtitle: 'A glimpse of our space',
    gallery: [{ image: img2, alt: 'Facility photo' }],
    visionTitle: 'Vision',
    visionText: RT('A single CMS contract for many brands.'),
    corporateProfileTitle: 'Corporate profile',
    corporateProfileText: RT('Overview of the organization.'),
    historyTitle: 'History',
    historyText: RT('Founded as a demo, grown as a pattern.'),
    chairmanMessageTitle: 'Chairman message',
    chairmanMessageText: RT('Thank you for visiting our demo site.'),
    chairmanPhoto: img3,
    managingDirectorMessageTitle: 'Managing Director',
    managingDirectorMessageText: RT('We invest in people and platforms.'),
    managingDirectorPhoto: img1,
    timelineTitle: 'Milestones',
    timeline: [
      { year: '2020', title: 'Launch', description: 'Initial release.' },
      { year: '2024', title: 'Scale', description: 'Multi-frontend rollout.' },
    ],
    seo: SEO_SAMPLE(img3),
  };
  if (pdfId) aboutData.brochureFile = pdfId;
  await replaceSingle(strapi, 'api::about-page.about-page', aboutData);

  const collectionUids = [
    'api::navigation.navigation',
    'api::hero.hero',
    'api::service.service',
    'api::news-post.news-post',
    'api::article.article',
    'api::faq.faq',
    'api::testimonial.testimonial',
    'api::stat.stat',
    'api::service-package.service-package',
    'api::country-guideline.country-guideline',
    'api::gcc-country.gcc-country',
    'api::equipment-item.equipment-item',
    'api::fitness-criterion.fitness-criterion',
    'api::certification.certification',
    'api::gallery-image.gallery-image',
    'api::footer-quick-link.footer-quick-link',
    'api::footer-service-link.footer-service-link',
    'api::resource-item.resource-item',
    'api::team-member.team-member',
    'api::location.location',
    'api::product.product',
  ];

  for (const uid of collectionUids) {
    await wipeCollection(strapi, uid);
  }

  await strapi.entityService.create('api::navigation.navigation', {
    data: {
      label: 'Home',
      href: '/',
      location: 'header',
      order: 1,
    },
  });

  const heroData = {
    page: 'home',
    title: 'Welcome home',
    subtitle: 'Hero subtitle with slides and CTAs',
    slides: [img1, img2, img3],
    ctas: [
      { label: 'Primary CTA', href: '/contact', variant: 'primary' },
      { label: 'Secondary', href: '/services', variant: 'secondary' },
    ],
    seo: SEO_SAMPLE(img1),
    order: 1,
  };
  if (videoId) heroData.promoVideo = videoId;
  await strapi.entityService.create('api::hero.hero', { data: heroData });

  const serviceData = {
    title: 'Consulting',
    slug: 'consulting',
    summary: 'End-to-end consulting service.',
    description: RT('Full service description with rich text.'),
    featuredImage: img1,
    iconImage: img3,
    benefits: [{ text: 'Fast delivery' }, { text: 'Clear scope' }],
    pricingRows: [
      { label: 'Starter', price: '$999', notes: 'per month' },
      { label: 'Pro', price: '$2499', notes: 'per month' },
    ],
    timeline: [
      { title: 'Discovery', description: 'Week 1', order: 1 },
      { title: 'Build', description: 'Weeks 2–4', order: 2 },
    ],
    order: 1,
    seo: SEO_SAMPLE(img2),
  };
  if (pdfId) serviceData.documents = [{ title: 'Brochure', file: pdfId }];
  await strapi.entityService.create('api::service.service', { data: serviceData });

  await strapi.entityService.create('api::news-post.news-post', {
    data: {
      title: 'Company update',
      slug: 'company-update',
      summary: 'Short news summary.',
      content: RT('News body content.'),
      coverImage: img2,
      date: new Date().toISOString(),
      seo: SEO_SAMPLE(img3),
    },
  });

  await strapi.entityService.create('api::article.article', {
    data: {
      title: 'Deep dive article',
      slug: 'deep-dive-article',
      summary: 'Educational article summary.',
      content: RT('Article body with multiple paragraphs worth of demo text.'),
      coverImage: img1,
      date: new Date().toISOString(),
      seo: SEO_SAMPLE(img2),
    },
  });

  await strapi.entityService.create('api::faq.faq', {
    data: {
      question: 'What is this demo?',
      answer: RT('It is a fully seeded Strapi instance for local and staging use.'),
      order: 1,
    },
  });

  await strapi.entityService.create('api::testimonial.testimonial', {
    data: {
      name: 'Alex Reader',
      role: 'CTO',
      quote: 'The API contract made our frontend swap trivial.',
      avatar: img3,
      order: 1,
    },
  });

  await strapi.entityService.create('api::stat.stat', {
    data: { label: 'Projects shipped', value: '120+', order: 1 },
  });

  await strapi.entityService.create('api::service-package.service-package', {
    data: {
      title: 'Growth package',
      slug: 'growth-package',
      summary: 'Marketing + CMS rollout.',
      order: 1,
      seo: SEO_SAMPLE(img1),
    },
  });

  await strapi.entityService.create('api::country-guideline.country-guideline', {
    data: {
      countryName: 'United Arab Emirates',
      slug: 'united-arab-emirates',
      guideline: RT('Sample residency and compliance notes.'),
      flagImage: img2,
      seo: SEO_SAMPLE(img3),
    },
  });

  await strapi.entityService.create('api::gcc-country.gcc-country', {
    data: {
      name: 'UAE',
      slug: 'uae',
      summary: 'GCC hub',
      flagImage: img1,
      order: 1,
      seo: SEO_SAMPLE(img2),
    },
  });

  await strapi.entityService.create('api::equipment-item.equipment-item', {
    data: {
      title: 'Lab analyzer',
      slug: 'lab-analyzer',
      summary: 'High throughput diagnostic unit.',
      image: img3,
      order: 1,
      seo: SEO_SAMPLE(img1),
    },
  });

  await strapi.entityService.create('api::fitness-criterion.fitness-criterion', {
    data: {
      title: 'VO2 threshold',
      description: 'Minimum aerobic capacity for program entry.',
      order: 1,
    },
  });

  const certData = {
    title: 'ISO 9001',
    issuer: 'ISO',
    logo: img2,
    order: 1,
  };
  if (pdfId) certData.documentFile = pdfId;
  await strapi.entityService.create('api::certification.certification', { data: certData });

  await strapi.entityService.create('api::gallery-image.gallery-image', {
    data: {
      title: 'Lobby',
      image: img1,
      alt: 'Office lobby',
      order: 1,
    },
  });

  await strapi.entityService.create('api::footer-quick-link.footer-quick-link', {
    data: { label: 'Privacy', href: '/privacy', order: 1 },
  });

  await strapi.entityService.create('api::footer-service-link.footer-service-link', {
    data: { label: 'Consulting', href: '/services/consulting', order: 1 },
  });

  const resourceData = {
    title: 'Product overview PDF',
    slug: 'product-overview-pdf',
    resourceType: 'brochure',
    summary: 'Downloadable overview of offerings.',
    content: RT('Optional landing copy for the resource.'),
    featuredImage: img3,
    externalUrl: 'https://example.com/resources',
    publishDate: new Date().toISOString(),
    categoryLabel: 'Sales',
    isFeatured: true,
    order: 1,
    seo: SEO_SAMPLE(img2),
  };
  if (pdfId) resourceData.downloadFile = pdfId;
  await strapi.entityService.create('api::resource-item.resource-item', { data: resourceData });

  await strapi.entityService.create('api::team-member.team-member', {
    data: {
      name: 'Jamie Lead',
      slug: 'jamie-lead',
      designation: 'Engineering Lead',
      bio: RT('Bio text for leadership profile.'),
      photo: img1,
      email: 'jamie@example.com',
      linkedinUrl: 'https://linkedin.com/in/example',
      order: 1,
      seo: SEO_SAMPLE(img3),
    },
  });

  await strapi.entityService.create('api::location.location', {
    data: {
      name: 'HQ',
      slug: 'hq',
      address: '1 Demo Plaza',
      phone: '+1-555-0199',
      email: 'hq@example.com',
      googleMapsEmbed: 'https://www.google.com/maps/embed?pb=hq',
      workingHours: '24/7 reception',
      heroImage: img2,
      order: 1,
      seo: SEO_SAMPLE(img1),
    },
  });

  const productData = {
    name: 'Sensor Pro',
    slug: 'sensor-pro',
    summary: 'Industrial IoT sensor.',
    description: RT('Long-form product description with specs narrative.'),
    featuredImage: img3,
    gallery: [img1, img2],
    categoryLabel: 'Hardware',
    order: 1,
    seo: SEO_SAMPLE(img2),
  };
  if (pdfId) {
    productData.brochureFile = pdfId;
    productData.specificationFile = pdfId;
  }
  await strapi.entityService.create('api::product.product', { data: productData });

  strapi.log.info('[seed-full] Completed: all collection types re-seeded; singles updated.');
  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
