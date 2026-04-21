import { Injectable } from '@nestjs/common';
import * as https from 'https';

type CacheEntry = { value: number; expiresAt: number };

@Injectable()
export class YoutubeDurationService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs = 6 * 60 * 60 * 1000; // 6h

  async getDurationSec(youtubeId: string): Promise<number> {
    const trimmed = (youtubeId ?? '').trim();
    if (!trimmed) throw new Error('youtubeId missing');

    const now = Date.now();
    const cached = this.cache.get(trimmed);
    if (cached && cached.expiresAt > now) return cached.value;

    const html = await this.fetchText(
      `https://www.youtube.com/watch?v=${encodeURIComponent(trimmed)}`,
    );

    // watch 페이지 HTML 내에 lengthSeconds가 포함됩니다.
    const match = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (!match) throw new Error('lengthSeconds not found');

    const seconds = Number(match[1]);
    if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('invalid lengthSeconds');

    this.cache.set(trimmed, { value: seconds, expiresAt: now + this.ttlMs });
    return seconds;
  }

  private fetchText(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
              'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            },
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}`));
              res.resume();
              return;
            }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(data));
          },
        )
        .on('error', reject);
    });
  }
}
