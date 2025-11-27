export interface BackendStatusResult {
  dbConnected: boolean;
  mqttConnected: boolean;
}

export interface BackendStatusResponse {
  result: BackendStatusResult;
  message: string;
}