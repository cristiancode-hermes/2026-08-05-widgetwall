import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RssService } from './rss.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('rss')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('widgets/:widgetId/rss')
  @ApiOperation({ summary: 'Fetch and parse an RSS feed' })
  @ApiQuery({ name: 'feedUrl', required: true, example: 'https://example.com/feed.xml' })
  @ApiQuery({ name: 'maxItems', required: false, example: '10' })
  async getRss(
    @Param('widgetId') widgetId: string,
    @Query('feedUrl') feedUrl: string,
    @Query('maxItems') maxItems: string = '10',
  ) {
    return this.rssService.fetchFeed(feedUrl, parseInt(maxItems, 10) || 10);
  }
}
