import { Router, Request, Response } from 'express';
import { HealthService } from '../services/healthService';

const router = Router();
const healthService = HealthService.getInstance();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const healthStatus = await healthService.checkHealth();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                       healthStatus.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;