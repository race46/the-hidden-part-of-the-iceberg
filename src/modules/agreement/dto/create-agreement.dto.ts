import { IsEnum, IsInt, IsMongoId, IsPositive } from 'class-validator';
import { AgreementType } from 'src/schemas/agreement.schema';

export class CreateAgreementDto {
  @IsMongoId()
  listing_agent_id: string;

  @IsMongoId()
  selling_agent_id: string;

  @IsMongoId()
  property_id: string;

  @IsEnum(AgreementType)
  type: AgreementType;

  @IsInt()
  @IsPositive()
  price: number;
}
