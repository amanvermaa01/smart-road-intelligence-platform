import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HazardCount {
  @Field()
  type: string;

  @Field(() => Int)
  count: number;
}
