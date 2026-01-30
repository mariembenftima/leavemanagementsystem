import { Test, TestingModule } from '@nestjs/testing';
import { AdminLeaveRequestsService } from './admin-leave-requests.service';

describe('AdminLeaveRequestsService', () => {
  let service: AdminLeaveRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminLeaveRequestsService],
    }).compile();

    service = module.get<AdminLeaveRequestsService>(AdminLeaveRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
