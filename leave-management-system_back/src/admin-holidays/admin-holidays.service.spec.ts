import { Test, TestingModule } from '@nestjs/testing';
import { AdminHolidaysService } from './admin-holidays.service';

describe('AdminHolidaysService', () => {
  let service: AdminHolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminHolidaysService],
    }).compile();

    service = module.get<AdminHolidaysService>(AdminHolidaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
