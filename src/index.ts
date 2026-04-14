import type { Core } from '@strapi/strapi';

const CONTENT_TYPES = [
  'about-page',
  'article',
  'certification',
  'country-guideline',
  'equipment-item',
  'faq',
  'fitness-criterion',
  'footer-quick-link',
  'footer-service-link',
  'gallery-image',
  'gcc-country',
  'hero',
  'location',
  'navigation',
  'news-post',
  'product',
  'resource-item',
  'service',
  'service-package',
  'site-config',
  'stat',
  'team-member',
  'testimonial',
];

const COLLECTION_SEEDS: Record<string, Record<string, unknown>> = {
  'api::navigation.navigation': { label: 'Home', href: '/', location: 'header', order: 1 },
  'api::hero.hero': { page: 'home', title: 'Welcome', subtitle: 'Guide bootstrap hero', order: 1 },
  'api::service.service': { title: 'General Service', slug: 'general-service', description: 'Seeded service description', order: 1 },
  'api::news-post.news-post': { title: 'Launch News', slug: 'launch-news', content: 'Seeded news content' },
  'api::article.article': { title: 'First Article', slug: 'first-article', content: 'Seeded article content' },
  'api::faq.faq': { question: 'How does this work?', answer: 'This is seeded from bootstrap.', order: 1 },
  'api::testimonial.testimonial': { name: 'Sample Client', quote: 'Great service.', order: 1 },
  'api::stat.stat': { label: 'Years of Experience', value: '10+', order: 1 },
  'api::service-package.service-package': { title: 'Starter Package', slug: 'starter-package', order: 1 },
  'api::country-guideline.country-guideline': { countryName: 'UAE', slug: 'uae', guideline: 'General compliance guidance.' },
  'api::gcc-country.gcc-country': { name: 'United Arab Emirates', slug: 'united-arab-emirates', order: 1 },
  'api::equipment-item.equipment-item': { title: 'Standard Kit', slug: 'standard-kit', order: 1 },
  'api::fitness-criterion.fitness-criterion': { title: 'Medical Clearance', description: 'Basic fitness requirement.', order: 1 },
  'api::certification.certification': { title: 'ISO 9001', issuer: 'ISO', order: 1 },
  'api::gallery-image.gallery-image': { title: 'Gallery Placeholder', order: 1 },
  'api::footer-quick-link.footer-quick-link': { label: 'Contact', href: '/contact', order: 1 },
  'api::footer-service-link.footer-service-link': { label: 'Services', href: '/services', order: 1 },
  'api::resource-item.resource-item': { title: 'Company Brochure', slug: 'company-brochure', resourceType: 'brochure', summary: 'Seed brochure summary.', order: 1 },
  'api::team-member.team-member': { name: 'Jane Doe', designation: 'Director', order: 1 },
  'api::location.location': { name: 'Head Office', address: 'Main street', order: 1 },
  'api::product.product': { name: 'Core Product', slug: 'core-product', description: 'Seed product description', order: 1 },
};

async function ensurePublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) return;

  for (const contentType of CONTENT_TYPES) {
    for (const actionType of ['find', 'findOne']) {
      const action = `api::${contentType}.${contentType}.${actionType}`;
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { role: publicRole.id, action },
      });

      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { role: publicRole.id, action, enabled: true },
        });
      } else if (!existing.enabled) {
        await strapi.db.query('plugin::users-permissions.permission').update({
          where: { id: existing.id },
          data: { enabled: true },
        });
      }
    }
  }
}

async function ensureSeeds(strapi: Core.Strapi) {
  const siteConfig = await strapi.entityService.findMany('api::site-config.site-config');
  if (!siteConfig) {
    await strapi.entityService.create('api::site-config.site-config', {
      data: {
        siteName: 'Uniweb',
        tagline: 'Unified content backend',
        phone: '+971-000-0000',
        email: 'info@uniweb.local',
        address: 'Dubai, UAE',
        workingHours: 'Mon-Fri 9am-6pm',
      },
    });
  }

  const aboutPage = await strapi.entityService.findMany('api::about-page.about-page');
  if (!aboutPage) {
    await strapi.entityService.create('api::about-page.about-page', {
      data: {
        missionTitle: 'Our Mission',
        missionText: 'Deliver reusable CMS contracts for multiple frontends.',
        centerTitle: 'What We Do',
        centerText: 'We keep content semantic and design-agnostic.',
      },
    });
  }

  for (const [uid, seed] of Object.entries(COLLECTION_SEEDS)) {
    const existing = await strapi.entityService.findMany(uid as any, { limit: 1 });
    if (Array.isArray(existing) && existing.length === 0) {
      await strapi.entityService.create(uid as any, {
        data: seed as any,
      });
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensurePublicReadPermissions(strapi);
    await ensureSeeds(strapi);
  },
};
