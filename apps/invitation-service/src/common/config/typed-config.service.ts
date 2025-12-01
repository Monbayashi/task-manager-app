// src/common/config/typed-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvType } from './env.schema';

@Injectable()
export class TypedConfigService {
  constructor(private config: ConfigService<EnvType>) {}

  get<K extends keyof EnvType>(key: K): EnvType[K] {
    return this.config.get(key) as EnvType[K];
  }
}
