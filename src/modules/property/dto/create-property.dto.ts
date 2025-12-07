import { IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePropertyDto {
  @MinLength(3)
  @MaxLength(128)
  @IsString()
  name: string;

  @IsMongoId()
  agent_id: string;
}
