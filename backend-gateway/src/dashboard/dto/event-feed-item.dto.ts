import { Field, ID, Int, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class EventFeedItem {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field(() => Int)
  severity: number;

  @Field(() => Float, { nullable: true })
  lat?: number;

  @Field(() => Float, { nullable: true })
  lng?: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { defaultValue: 0 })
  upvotes: number;

  @Field(() => Int, { defaultValue: 0 })
  downvotes: number;

  @Field(() => ID)
  routeId: string;

  @Field()
  timestamp: Date;
}
