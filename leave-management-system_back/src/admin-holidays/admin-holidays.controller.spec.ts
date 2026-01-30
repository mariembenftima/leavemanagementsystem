import { Test, TestingModule } from '@nestjs/testing';
import { AdminHolidaysController } from './admin-holidays.controller';

describe('AdminHolidaysController', () => {
  let controller: AdminHolidaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHolidaysController],
    }).compile();

    controller = module.get<AdminHolidaysController>(AdminHolidaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
