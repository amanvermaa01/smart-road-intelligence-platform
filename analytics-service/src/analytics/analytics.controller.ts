import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('heatmap')
  async getHeatmap(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('resolution') resolution: '5m' | '15m' | '1h',
    @Query('bbox') bbox: string,
  ) {
    if (!from || !to || !bbox) {
      throw new BadRequestException('from, to, and bbox are required parameters');
    }
    return this.analyticsService.getHeatmap(from, to, resolution || '5m', bbox);
  }
}
