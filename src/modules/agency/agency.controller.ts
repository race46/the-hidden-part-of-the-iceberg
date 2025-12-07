import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post()
  async create(@Body() createAgencyDto: CreateAgencyDto) {
    try {
      const result = await this.agencyService.create(createAgencyDto);
      return result;
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Something bad happened', {
        description: 'contact advisor',
      });
    }
  }

  @Get()
  findAll() {
    return this.agencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agencyService.update(+id, updateAgencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agencyService.remove(+id);
  }

  @Get(':id/wallet-transactions')
  getWalletTransactions(@Param('id') id: string) {
    try {
      return this.agencyService.getWalletTransactions(id);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('something went wrong');
    }
  }
}
