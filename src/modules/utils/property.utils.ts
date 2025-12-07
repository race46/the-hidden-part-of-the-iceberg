import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Property } from 'src/schemas/property.schema';

@Injectable()
export class PropertyUtils {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async integrateToTransaction(session: ClientSession, propertyId: string) {
    const property = await this.propertyModel
      .findById(propertyId)
      .session(session);

    if (
      property == null ||
      !property.is_listing ||
      property.has_active_transaction
    ) {
      throw new BadRequestException('invalid property');
    }

    property.is_listing = false;
    property.has_active_transaction = true;

    await property.save({ session: session });
    console.log('session:', session);
    console.log('property:', propertyId);
    console.log(property);
  }
}
