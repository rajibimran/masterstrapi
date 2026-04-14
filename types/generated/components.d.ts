import type { Schema, Struct } from '@strapi/strapi';

export interface AboutGalleryItem extends Struct.ComponentSchema {
  collectionName: 'components_about_gallery_items';
  info: {
    displayName: 'About Gallery Item';
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface AboutTimelineItem extends Struct.ComponentSchema {
  collectionName: 'components_about_timeline_items';
  info: {
    displayName: 'About Timeline Item';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    year: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutValueItem extends Struct.ComponentSchema {
  collectionName: 'components_about_value_items';
  info: {
    displayName: 'About Value Item';
  };
  attributes: {
    alt: Schema.Attribute.String;
    desc: Schema.Attribute.Text;
    img: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HeroCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_hero_cta_buttons';
  info: {
    displayName: 'Hero CTA Button';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary', 'link']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SeoEntry extends Struct.ComponentSchema {
  collectionName: 'components_seo_entries';
  info: {
    description: 'Shared SEO metadata payload';
    displayName: 'SEO Entry';
  };
  attributes: {
    canonicalPath: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaKeywords: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    openGraphImage: Schema.Attribute.Media<'images'>;
    openGraphImageAlt: Schema.Attribute.String;
    snippetForAiOverview: Schema.Attribute.Text;
    structuredData: Schema.Attribute.JSON;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image']
    >;
  };
}

export interface ServiceDocumentItem extends Struct.ComponentSchema {
  collectionName: 'components_service_document_items';
  info: {
    displayName: 'Service Document Item';
  };
  attributes: {
    file: Schema.Attribute.Media<'files'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServicePricingRow extends Struct.ComponentSchema {
  collectionName: 'components_service_pricing_rows';
  info: {
    displayName: 'Service Pricing Row';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    notes: Schema.Attribute.String;
    price: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceSimpleLine extends Struct.ComponentSchema {
  collectionName: 'components_service_simple_lines';
  info: {
    displayName: 'Service Simple Line';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceTimelineStep extends Struct.ComponentSchema {
  collectionName: 'components_service_timeline_steps';
  info: {
    displayName: 'Service Timeline Step';
  };
  attributes: {
    description: Schema.Attribute.Text;
    order: Schema.Attribute.Integer;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about.gallery-item': AboutGalleryItem;
      'about.timeline-item': AboutTimelineItem;
      'about.value-item': AboutValueItem;
      'hero.cta-button': HeroCtaButton;
      'seo.entry': SeoEntry;
      'service.document-item': ServiceDocumentItem;
      'service.pricing-row': ServicePricingRow;
      'service.simple-line': ServiceSimpleLine;
      'service.timeline-step': ServiceTimelineStep;
    }
  }
}
