import api from "./auth";

export type WorkScheduleType = "5x2" | "6x1" | "custom";

export interface WorkSchedule {
  id: string;
  name: string;
  type: WorkScheduleType;
  work_days: number[];
  start_time: string;
  lunch_start?: string | null;
  lunch_end?: string | null;
  end_time: string;
  day_rules?: Record<
    number,
    {
      start_time?: string;
      end_time?: string;
      lunch_start?: string;
      lunch_end?: string;
    }
  > | null;
  tolerance_minutes: number;
  weekly_hours: number;
  has_alternating_saturdays: boolean;
}

export interface WorkScheduleListResponse {
  success: boolean;
  schedules: WorkSchedule[];
}

export interface WorkScheduleResponse {
  success: boolean;
  schedule: WorkSchedule;
}

export const workScheduleService = {
  async list(): Promise<WorkScheduleListResponse> {
    const response = await api.get<WorkScheduleListResponse>("/work-schedules");
    return response.data;
  },

  async create(payload: {
    name: string;
    type: WorkScheduleType;
    work_days: number[];
    start_time: string;
    lunch_start?: string | null;
    lunch_end?: string | null;
    end_time: string;
    day_rules?: Record<
      number,
      {
        start_time?: string;
        end_time?: string;
        lunch_start?: string;
        lunch_end?: string;
      }
    > | null;
    tolerance_minutes?: number;
    weekly_hours: number;
    has_alternating_saturdays?: boolean;
  }): Promise<WorkScheduleResponse> {
    const response = await api.post<WorkScheduleResponse>("/work-schedules", payload);
    return response.data;
  },

  async update(
    id: string,
    payload: Partial<{
      name: string;
      type: WorkScheduleType;
      work_days: number[];
      start_time: string;
      lunch_start?: string | null;
      lunch_end?: string | null;
      end_time: string;
      day_rules?: Record<
        number,
        {
          start_time?: string;
          end_time?: string;
          lunch_start?: string;
          lunch_end?: string;
        }
      > | null;
      tolerance_minutes: number;
      weekly_hours: number;
      has_alternating_saturdays: boolean;
    }>,
  ): Promise<WorkScheduleResponse> {
    const response = await api.put<WorkScheduleResponse>(`/work-schedules/${id}`, payload);
    return response.data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/work-schedules/${id}`);
    return response.data;
  },
};
