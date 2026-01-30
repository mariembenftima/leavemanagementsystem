import { Test, TestingModule } from '@nestjs/testing';
import { AdminLeaveRequestsController } from './admin-leave-requests.controller';

describe('AdminLeaveRequestsController', () => {
  let controller: AdminLeaveRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminLeaveRequestsController],
    }).compile();

    controller = module.get<AdminLeaveRequestsController>(AdminLeaveRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
