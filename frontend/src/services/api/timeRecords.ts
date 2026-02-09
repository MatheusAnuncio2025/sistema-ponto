import api from "./auth";

export type RecordType = "entry" | "lunch_start" | "lunch_end" | "exit";

export interface TimeRecord {
  id: string;
  employee_id: string;
  record_type: RecordType;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  is_within_radius: boolean;
  distance_meters?: number | null;
  confirmation_code: string;
}

export interface TimeRecordResponse {
  success: boolean;
  record: TimeRecord;
  warning?: string;
  scheduleOverride?: boolean;
  schedule?: {
    min: number;
    max: number;
  };
  workLocation?: {
    id: string;
    name: string;
    radius: number;
  } | null;
}

export interface TimeRecordListResponse {
  success: boolean;
  range: "day" | "week" | "month";
  start: string;
  end: string;
  records: TimeRecord[];
}

export const timeRecordService = {
  async createRecord(payload: {
    record_type: RecordType;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<TimeRecordResponse> {
    try {
      const response = await api.post<TimeRecordResponse>("/time-records", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao registrar ponto");
    }
  },

  async list(range: "day" | "week" | "month", date?: string): Promise<TimeRecordListResponse> {
    try {
      const response = await api.get<TimeRecordListResponse>("/time-records", {
        params: { range, date },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao carregar registros");
    }
  },
};
