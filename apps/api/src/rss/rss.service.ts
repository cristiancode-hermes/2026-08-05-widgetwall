import { Injectable } from '@nestjs/common';

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export interface RssFeed {
  feedTitle: string;
  items: RssItem[];
}

@Injectable()
export class RssService {
  async fetchFeed(url: string, maxItems: number): Promise<RssFeed> {
    try {
      const response = await fetch(url);
      const xml = await response.text();
      return this.parseXml(xml, maxItems);
    } catch {
      return {
        feedTitle: 'Unable to fetch feed',
        items: [],
      };
    }
  }

  private parseXml(xml: string, maxItems: number): RssFeed {
    const feedTitle = this.extractTag(xml, 'title') || 'Untitled Feed';
    const items: RssItem[] = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < maxItems) {
      const itemXml = match[1];
      items.push({
        title: this.extractTag(itemXml, 'title') || '',
        link: this.extractTag(itemXml, 'link') || '',
        description: this.extractTag(itemXml, 'description') || '',
        pubDate: this.extractTag(itemXml, 'pubDate') || '',
      });
      count++;
    }

    return { feedTitle, items };
  }

  private extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
    const match = regex.exec(xml);
    if (match) {
      return match[1].trim();
    }
    return '';
  }
}
