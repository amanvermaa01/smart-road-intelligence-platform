import { ObjectType, Field, Float } from '@nestjs/graphql';
import { JSONScalar } from '../../graphql/scalars/json.scalars';
import { RouteHazardSummary } from './route-hazard-summary.dto';

@ObjectType()
export class RouteResponse {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  distanceMeters: number;

  @Field(() => Float)
  etaSeconds: number;

  @Field(() => JSONScalar)
  geometry: any;

  @Field(() => RouteHazardSummary, { nullable: true })
  hazardSummary?: RouteHazardSummary;

  @Field(() => JSONScalar, { nullable: true })
  alternativeRoute?: any;

  @Field(() => Boolean, { defaultValue: false })
  isBlocked: boolean;
}
