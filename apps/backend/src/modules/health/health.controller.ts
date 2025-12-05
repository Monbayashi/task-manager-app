import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  /** ヘルスチェック */
  @Get('api/health')
  healthCheck() {
    return { status: 'ok' };
  }

  @Get('api/healthz')
  healthzCheck() {
    return { status: 'ok' };
  }
}
