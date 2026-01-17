import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { redisPubSub } from './pubsub.provider';
import { LiveAlert } from '../dashboard/dashboard.types';

@Resolver(() => LiveAlert)
export class AlertsResolver {
  @Subscription(() => LiveAlert, {
    filter: (payload, variables) =>
      !variables.routeId || payload.routeId === variables.routeId,
  })
  liveAlerts(
    @Args('routeId', { nullable: true }) routeId?: string,
  ) {
    return redisPubSub.asyncIterator('alerts:publish');
  }
}
