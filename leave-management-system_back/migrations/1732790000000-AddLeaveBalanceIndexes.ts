import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeaveBalanceIndexes1732790000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leave_balances_user_id" 
      ON "leave_balances" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leave_balances_user_year" 
      ON "leave_balances" ("user_id", "year" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leave_balances_leave_type_id" 
      ON "leave_balances" ("leave_type_id")
    `);

    console.log('✅ Leave balance indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_leave_balances_user_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_leave_balances_user_year"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_leave_balances_leave_type_id"
    `);

    console.log('✅ Leave balance indexes dropped successfully');
  }
}
