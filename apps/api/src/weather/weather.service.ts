import { Injectable } from '@nestjs/common';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

@Injectable()
export class WeatherService {
  private readonly conditions = [
    { name: 'Sunny', icon: '01d' },
    { name: 'Partly Cloudy', icon: '02d' },
    { name: 'Cloudy', icon: '03d' },
    { name: 'Overcast', icon: '04d' },
    { name: 'Light Rain', icon: '10d' },
    { name: 'Clear', icon: '01n' },
  ];

  async getWeather(location: string, units: string): Promise<WeatherData> {
    const condition = this.conditions[Math.floor(Math.random() * this.conditions.length)];
    const baseTemp = units === 'celsius' ? 22 : 72;
    const variance = Math.floor(Math.random() * 10) - 5;

    return {
      temp: baseTemp + variance,
      feelsLike: baseTemp + variance - 2,
      condition: condition.name,
      icon: condition.icon,
      location: location || 'Madrid',
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 25),
    };
  }
}
