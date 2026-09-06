import { healthRepository } from "../repositories/health.repository";

export type HealthStatus = {
  status: "ok" | "degraded";
  uptime: number;
  database: "up" | "down";
};

export class HealthService {
  async getHealth(): Promise<HealthStatus> {
    let database: "up" | "down" = "down";

    try {
      const ok = await healthRepository.pingDatabase();
      database = ok ? "up" : "down";
    } catch {
      database = "down";
    }

    return {
      status: database === "up" ? "ok" : "degraded",
      uptime: process.uptime(),
      database,
    };
  }
}

export const healthService = new HealthService();
