import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('weather')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('widgets/:widgetId/weather')
  @ApiOperation({ summary: 'Get mock weather data for a location' })
  @ApiQuery({ name: 'location', required: false, example: 'Madrid' })
  @ApiQuery({ name: 'units', required: false, example: 'celsius' })
  getWeather(
    @Param('widgetId') widgetId: string,
    @Query('location') location: string = 'Madrid',
    @Query('units') units: string = 'celsius',
  ) {
    return this.weatherService.getWeather(location, units);
  }
}
