import fs from 'fs/promises';
import path from 'path';

export interface WebsiteContent {
  about: {
    title: string;
    description: string;
    image: string;
    stats: { label: string; value: string }[];
  };
  services: {
    id: string;
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
  }[];
  gallery: {
    id: string;
    url: string;
    category: string;
    title: string;
    isActive: boolean;
  }[];
  testimonials: {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatarUrl: string;
    isActive: boolean;
  }[];
  social: {
    instagramUrl: string;
    facebookUrl: string;
    widgetType: string;
    widgetId: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    mapUrl: string;
  };
}

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'website-content.json');

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data) as WebsiteContent;
  } catch (error) {
    console.error("Error reading website content:", error);
    // Return a default empty structure if file is missing
    return {
      about: { title: '', description: '', image: '', stats: [] },
      services: [],
      gallery: [],
      testimonials: [],
      social: { instagramUrl: '', facebookUrl: '', widgetType: '', widgetId: '' },
      contact: { address: '', phone: '', email: '', mapUrl: '' }
    };
  }
}

export async function updateWebsiteContent(newContent: Partial<WebsiteContent>): Promise<WebsiteContent> {
  const currentContent = await getWebsiteContent();
  const updatedContent = { ...currentContent, ...newContent };
  
  await fs.writeFile(dataFilePath, JSON.stringify(updatedContent, null, 2), 'utf-8');
  return updatedContent;
}
