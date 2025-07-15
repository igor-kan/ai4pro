export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

export enum ServiceStatus {
  OPERATIONAL = 'operational',
  PARTIAL_OUTAGE = 'partial_outage',
  MAJOR_OUTAGE = 'major_outage'
}

export interface ServiceHealth {
  status: ServiceStatus;
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export interface DatabaseHealth extends ServiceHealth {
  connections: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: Date;
  database: DatabaseHealth;
  api: ServiceHealth;
  system: SystemMetrics;
  version: string;
}