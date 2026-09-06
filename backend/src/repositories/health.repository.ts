import { pool } from "../config/database";

export class HealthRepository {
  async pingDatabase(): Promise<boolean> {
    const result = await pool.query("SELECT 1 AS ok");
    return result.rows[0]?.ok === 1;
  }
}

export const healthRepository = new HealthRepository();
