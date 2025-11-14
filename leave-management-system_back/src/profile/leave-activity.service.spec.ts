import { Test, TestingModule } from '@nestjs/testing';
import { LeaveActivityService } from './leave-activity.service';

describe('LeaveActivityService', () => {
  let service: LeaveActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaveActivityService],
    }).compile();

    service = module.get<LeaveActivityService>(LeaveActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
