import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dtos/create-holiday.dto';
import { UpdateHolidayDto } from './dtos/update-holiday.dto';

@Injectable()
export class AdminHolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto): Promise<Holiday> {
    const holiday = this.holidayRepository.create({
      ...createHolidayDto,
      date: new Date(createHolidayDto.date),
    });

    return this.holidayRepository.save(holiday);
  }

  async findAll(): Promise<Holiday[]> {
    return this.holidayRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findUpcoming(limit: number = 10): Promise<Holiday[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.holidayRepository
      .createQueryBuilder('holiday')
      .where('holiday.date >= :today', { today })
      .orderBy('holiday.date', 'ASC')
      .limit(limit)
      .getMany();
  }

  async findByYear(year: number): Promise<Holiday[]> {
    return this.holidayRepository
      .createQueryBuilder('holiday')
      .where('EXTRACT(YEAR FROM holiday.date) = :year', { year })
      .orderBy('holiday.date', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }

    return holiday;
  }

  async update(
    id: number,
    updateHolidayDto: UpdateHolidayDto,
  ): Promise<Holiday> {
    const holiday = await this.findOne(id);

    if (updateHolidayDto.date) {
      holiday.date = new Date(updateHolidayDto.date);
    }

    Object.assign(holiday, updateHolidayDto);

    return this.holidayRepository.save(holiday);
  }

  async remove(id: number): Promise<void> {
    const holiday = await this.findOne(id);
    await this.holidayRepository.remove(holiday);
  }

  async getHolidayStatistics() {
    const currentYear = new Date().getFullYear();

    const [totalHolidays, upcomingHolidays, thisYearHolidays] =
      await Promise.all([
        this.holidayRepository.count(),
        this.findUpcoming(5),
        this.findByYear(currentYear),
      ]);

    return {
      totalHolidays,
      upcomingCount: upcomingHolidays.length,
      thisYearCount: thisYearHolidays.length,
      upcomingHolidays: upcomingHolidays.slice(0, 3),
    };
  }
}
