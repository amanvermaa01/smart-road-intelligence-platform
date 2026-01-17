import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { EventsService } from './services/events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.service.createEvent(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteEvent(id);
  }

  @Post('near')
  getNear(@Body() body: { geometry: any; distanceMeters?: number }) {
    return this.service.getEventsNearGeometry(body.geometry, body.distanceMeters);
  }

  @Post(':id/vote')
  async vote(@Param('id') id: string, @Body('type') type: 'up' | 'down') {
    return this.service.voteEvent(id, type);
  }
}
