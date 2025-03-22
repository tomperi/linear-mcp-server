export interface MCPMetricsResponse {
  apiMetrics: {
    requestsInLastHour: number;
    remainingRequests: number;
    averageRequestTime: string;
    queueLength: number;
  };
}
