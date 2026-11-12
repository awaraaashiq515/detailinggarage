import fs from 'fs/promises';
import path from 'path';
import { WebsiteContent, defaultWebsiteContent } from './website-content.types';

export * from './website-content.types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'website-content.json');

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    // Deep merge with defaultWebsiteContent to ensure any missing fields are present
    return {
      ...defaultWebsiteContent,
      ...parsed,
      topbar: { ...defaultWebsiteContent.topbar, ...(parsed.topbar || {}) },
      header: { ...defaultWebsiteContent.header, ...(parsed.header || {}) },
      hero: { ...defaultWebsiteContent.hero, ...(parsed.hero || {}) },
      ticker: { ...defaultWebsiteContent.ticker, ...(parsed.ticker || {}) },
      pdi: { ...defaultWebsiteContent.pdi, ...(parsed.pdi || {}) },
      services: { ...defaultWebsiteContent.services, ...(parsed.services || {}) },
      packages: { ...defaultWebsiteContent.packages, ...(parsed.packages || {}) },
      customers: { ...defaultWebsiteContent.customers, ...(parsed.customers || {}) },
      videos: { ...defaultWebsiteContent.videos, ...(parsed.videos || {}) },
      studio: { ...defaultWebsiteContent.studio, ...(parsed.studio || {}) },
      creators: { ...defaultWebsiteContent.creators, ...(parsed.creators || {}) },
      faq: { ...defaultWebsiteContent.faq, ...(parsed.faq || {}) },
      contact: { ...defaultWebsiteContent.contact, ...(parsed.contact || {}) },
      about: parsed.about || defaultWebsiteContent.about,
      gallery: parsed.gallery || defaultWebsiteContent.gallery,
      testimonials: parsed.testimonials || defaultWebsiteContent.testimonials,
      social: { ...defaultWebsiteContent.social, ...(parsed.social || {}) },
      footer: { ...defaultWebsiteContent.footer, ...(parsed.footer || {}) },
    };
  } catch (error) {
    // Write the default file if it doesn't exist
    try {
      await fs.writeFile(dataFilePath, JSON.stringify(defaultWebsiteContent, null, 2), 'utf-8');
    } catch (_) {}
    return defaultWebsiteContent;
  }
}

export async function updateWebsiteContent(newContent: Partial<WebsiteContent>): Promise<WebsiteContent> {
  const currentContent = await getWebsiteContent();
  const updatedContent = {
    ...currentContent,
    ...newContent,
    topbar: { ...currentContent.topbar, ...(newContent.topbar || {}) },
    header: { ...currentContent.header, ...(newContent.header || {}) },
    hero: { ...currentContent.hero, ...(newContent.hero || {}) },
    ticker: { ...currentContent.ticker, ...(newContent.ticker || {}) },
    pdi: { ...currentContent.pdi, ...(newContent.pdi || {}) },
    services: { ...currentContent.services, ...(newContent.services || {}) },
    packages: { ...currentContent.packages, ...(newContent.packages || {}) },
    customers: { ...currentContent.customers, ...(newContent.customers || {}) },
    videos: { ...currentContent.videos, ...(newContent.videos || {}) },
    studio: { ...currentContent.studio, ...(newContent.studio || {}) },
    creators: { ...currentContent.creators, ...(newContent.creators || {}) },
    faq: { ...currentContent.faq, ...(newContent.faq || {}) },
    contact: { ...currentContent.contact, ...(newContent.contact || {}) },
    about: newContent.about !== undefined ? newContent.about : currentContent.about,
    gallery: newContent.gallery !== undefined ? newContent.gallery : currentContent.gallery,
    testimonials: newContent.testimonials !== undefined ? newContent.testimonials : currentContent.testimonials,
    social: { ...currentContent.social, ...(newContent.social || {}) },
    footer: { ...currentContent.footer, ...(newContent.footer || {}) },
  };

  await fs.writeFile(dataFilePath, JSON.stringify(updatedContent, null, 2), 'utf-8');
  return updatedContent;
}
