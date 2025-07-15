import mongoose from 'mongoose';
import os from 'os';
import { 
  HealthStatus,
  ServiceStatus,
  HealthCheckResponse,
  DatabaseHealth,
  ServiceHealth,
  SystemMetrics
} from '../types/health';

export class HealthService {
  private static instance: HealthService;

  private constructor() {}

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  private async checkDatabase(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    try {
      if (mongoose.connection.readyState !== 1) {
        return {
          status: ServiceStatus.MAJOR_OUTAGE,
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          connections: 0,
          error: 'Database disconnected'
        };
      }

      return {
        status: ServiceStatus.OPERATIONAL,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        connections: mongoose.connection.readyState
      };
    } catch (error) {
      return {
        status: ServiceStatus.MAJOR_OUTAGE,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        connections: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkAPI(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      return {
        status: ServiceStatus.OPERATIONAL,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        status: ServiceStatus.MAJOR_OUTAGE,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getSystemMetrics(): SystemMetrics {
    return {
      cpuUsage: os.loadavg()[0],
      memoryUsage: (os.totalmem() - os.freemem()) / os.totalmem(),
      uptime: process.uptime()
    };
  }

  public async checkHealth(): Promise<HealthCheckResponse> {
    const [dbHealth, apiHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkAPI()
    ]);

    const systemMetrics = this.getSystemMetrics();

    const status = this.determineOverallStatus(dbHealth, apiHealth);

    return {
      status,
      timestamp: new Date(),
      database: dbHealth,
      api: apiHealth,
      system: systemMetrics,
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  private determineOverallStatus(
    dbHealth: DatabaseHealth,
    apiHealth: ServiceHealth
  ): HealthStatus {
    if (
      dbHealth.status === ServiceStatus.MAJOR_OUTAGE ||
      apiHealth.status === ServiceStatus.MAJOR_OUTAGE
    ) {
      return HealthStatus.UNHEALTHY;
    }

    if (
      dbHealth.status === ServiceStatus.PARTIAL_OUTAGE ||
      apiHealth.status === ServiceStatus.PARTIAL_OUTAGE
    ) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }
}