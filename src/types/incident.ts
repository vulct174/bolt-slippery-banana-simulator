export interface Incident {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface IncidentsResponse {
  incidents: Incident[];
  page: number;
  limit: number;
  total: number;
}