import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { HazardCount } from './hazard-count.dto';

@ObjectType()
export class RouteHazardSummary {
  @Field(() => ID)
  routeId: string;

  @Field(() => Int)
  totalHazards: number;

  @Field(() => [HazardCount])
  byType: HazardCount[];

  @Field(() => [HazardCount])
  bySeverity: HazardCount[];
}
