import { Request, Response } from "express";
import { HttpStatus } from "../constants/httpStatus";
import { healthService } from "../services/health.service";
import { sendOk } from "../utils/response";

export class HealthController {
  async getHealth(_req: Request, res: Response): Promise<void> {
    const health = await healthService.getHealth();

    // DB 의존성 실패는 공통 CRUD 코드(200~500)와 별도로 503을 사용한다.
    if (health.status !== "ok") {
      res.status(503).json({ data: health });
      return;
    }

    sendOk(res, health, HttpStatus.OK);
  }
}

export const healthController = new HealthController();
