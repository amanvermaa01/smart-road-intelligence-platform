import { Resolver, Query, Args, Int, Subscription, Float, Mutation } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';
import { RouteHazardSummary } from './dto/route-hazard-summary.dto';
import { EventFeedItem } from './dto/event-feed-item.dto';
import { LiveAlert } from './dto/live-alert.dto';
import { RouteResponse } from './dto/route-response.dto';
import { RedisPubSubService } from '../redis/redis.pubsub';

@Resolver()
export class DashboardResolver {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly pubSubService: RedisPubSubService,
  ) {}

  @Query(() => RouteHazardSummary)
  routeHazardSummary(
    @Args('routeId') routeId: string,
  ) {
    return this.dashboardService.getRouteHazardSummary(routeId);
  }

  @Query(() => RouteResponse)
  async getRoute(
    @Args('startLat', { type: () => Float }) startLat: number,
    @Args('startLng', { type: () => Float }) startLng: number,
    @Args('endLat', { type: () => Float }) endLat: number,
    @Args('endLng', { type: () => Float }) endLng: number,
  ) {
    return this.dashboardService.getRoute(startLat, startLng, endLat, endLng);
  }

  @Query(() => [EventFeedItem])
  eventFeed(
    @Args('routeId', { nullable: true }) routeId?: string,
    @Args('severityMin', { type: () => Int, nullable: true }) severityMin?: number,
    @Args('type', { nullable: true }) type?: string,
    @Args('hoursAgo', { type: () => Int, nullable: true }) hoursAgo?: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit?: number,
  ) {
    return this.dashboardService.getEventFeed(routeId, severityMin, type, hoursAgo, limit);
  }

  @Subscription(() => LiveAlert, {
    filter: (payload, variables) =>
      !variables.routeId || payload.routeId === variables.routeId,
  })
  liveAlerts(
    @Args('routeId', { nullable: true }) routeId?: string,
  ) {
    return this.pubSubService
      .getPubSub()
      .asyncIterator('alerts:publish');
  }

  @Mutation(() => Boolean)
  async deleteEvent(@Args('id') id: string) {
    return this.dashboardService.deleteEvent(id);
  }

  @Mutation(() => Boolean)
  async voteEvent(
    @Args('id') id: string,
    @Args('type') type: string,
  ) {
    return this.dashboardService.voteEvent(id, type);
  }
}
