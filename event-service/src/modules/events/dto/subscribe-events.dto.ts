import { IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class BoundingBoxDto {
  @IsNumber()
  north: number;

  @IsNumber()
  south: number;

  @IsNumber()
  east: number;

  @IsNumber()
  west: number;
}

export class SubscribeEventsDto {
  @ValidateNested()
  @Type(() => BoundingBoxDto)
  bbox: BoundingBoxDto;
}
