import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AgreementService } from './agreement.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @Post()
  create(@Body() createAgreementDto: CreateAgreementDto) {
    return this.agreementService.create(createAgreementDto);
  }

  @Get()
  findAll() {
    return this.agreementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agreementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgreementDto: UpdateAgreementDto,
  ) {
    return this.agreementService.update(+id, updateAgreementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agreementService.remove(+id);
  }

  @Put(':id/earnest-money')
  earnestMoney(@Param('id') id: string) {
    try {
      return this.agreementService.earnestMoney(id);
    } catch (e) {
      if (
        e instanceof NotFoundException ||
        e instanceof InternalServerErrorException
      ) {
        throw e;
      }

      console.log(e);

      throw new InternalServerErrorException('something went wrong');
    }
  }

  @Put(':id/title-deed')
  titleDeed(@Param('id') id: string) {
    try {
      return this.agreementService.titleDeed(id);
    } catch (e) {
      if (
        e instanceof NotFoundException ||
        e instanceof InternalServerErrorException
      ) {
        throw e;
      }

      console.log(e);

      throw new InternalServerErrorException('something went wrong');
    }
  }

  @Put(':id/complete')
  complete(@Param('id') id: string) {
    try {
      return this.agreementService.complete(id);
    } catch (e) {
      if (
        e instanceof NotFoundException ||
        e instanceof InternalServerErrorException
      ) {
        throw e;
      }

      console.log(e);

      throw new InternalServerErrorException('something went wrong');
    }
  }

  @Get(':id/stage')
  get_stages(@Param('id') id: string) {
    try {
      return this.agreementService.getStages(id);
    } catch (e) {
      console.log(e);
      throw new NotFoundException('stages are not found');
    }
  }
}
