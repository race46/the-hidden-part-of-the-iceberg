import { IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateAgentDto {
  @IsMongoId()
  agency_id: string;

  @IsString()
  @MinLength(5)
  name: string;
}
