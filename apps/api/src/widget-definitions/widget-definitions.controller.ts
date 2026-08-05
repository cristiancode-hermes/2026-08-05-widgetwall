import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WidgetDefinitionsService } from './widget-definitions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('widget-definitions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('widget-definitions')
export class WidgetDefinitionsController {
  constructor(private readonly definitionsService: WidgetDefinitionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all widget definitions' })
  findAll() {
    return this.definitionsService.findAll();
  }
}
