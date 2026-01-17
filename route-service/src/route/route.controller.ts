import { Body, Controller, Post } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteRequestDto } from './dto/route-request.dto';

@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  async calculateRoute(@Body() dto: RouteRequestDto) {
    return this.routeService.getRoute(dto.start, dto.end);
  }
}
