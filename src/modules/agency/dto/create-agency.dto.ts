import { MinLength } from 'class-validator';

export class CreateAgencyDto {
  @MinLength(3)
  name: string;
}
