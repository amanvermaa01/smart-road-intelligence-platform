import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class HazardCount {
  @Field()
  type: string;

  @Field()
  count: number;
}

@ObjectType()
export class RouteHazardSummary {
  @Field()
  routeId: string;

  @Field()
  totalHazards: number;

  @Field(() => [HazardCount])
  byType: HazardCount[];
}

@ObjectType()
export class EventFeedItem {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  severity: number;

  @Field()
  routeId: string;

  @Field()
  timestamp: Date;
}

@ObjectType()
export class LiveAlert {
  @Field()
  id: string;

  @Field()
  message: string;

  @Field()
  severity: number;

  @Field()
  routeId: string;

  @Field()
  createdAt: Date;
}
