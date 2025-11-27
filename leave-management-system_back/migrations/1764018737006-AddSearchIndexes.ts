import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchIndexes1764018737006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable trigram extension for better ILIKE performance
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // Index for full text search on users
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_fullname_trgm 
      ON users USING gin (fullname gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email_trgm 
      ON users USING gin (email gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username 
      ON users (username)
    `);

    // Index for role filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_roles 
      ON users USING gin (roles)
    `);

    // Index for sorting
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at 
      ON users (created_at DESC)
    `);

    // Composite index for common query pattern
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_active_created 
      ON users (is_active, created_at DESC)
    `);

    // Index on employee_profiles for join performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id 
      ON employee_profiles (user_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_fullname_trgm');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_email_trgm');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_username');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_roles');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_active_created');
    await queryRunner.query(
      'DROP INDEX IF EXISTS idx_employee_profiles_user_id',
    );
  }
}
