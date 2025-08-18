import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheModuleConfig: CacheModuleOptions = {
  ttl: 5 * 60, // 5분
  max: 100,
  isGlobal: true,
};
