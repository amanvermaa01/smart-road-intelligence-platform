import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LiveAlert {
  @Field(() => ID)
  id: string;

  @Field()
  message: string;

  @Field(() => Int)
  severity: number;

  @Field(() => ID)
  routeId: string;

  @Field()
  createdAt: Date;
}
