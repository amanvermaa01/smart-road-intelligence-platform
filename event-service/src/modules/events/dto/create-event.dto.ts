  import { IsInt, IsNumber, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsInt()
  @Min(1)
  @Max(5)
  severity: number;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  expiresInSeconds: number;
}
