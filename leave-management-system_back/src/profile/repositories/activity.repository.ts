export class ActivityRepository {
  async createActivity(dto: any) {
    return {};
  }
  async getRecentActivities(userId: any, count: number) {
    return [{ toSummary: () => ({}) }];
  }
}
