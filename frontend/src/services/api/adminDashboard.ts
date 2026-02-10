import api from "./auth";

export interface AdminDashboardSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  entry_time: string | null;
}

export interface AdminDashboardResponse {
  success: boolean;
  date: string;
  range?: {
    start: string;
    end: string;
  };
  totals: {
    employees: number;
    punched: number;
    late: number;
    absent: number;
  };
  periods?: {
    day: {
      employees: number;
      punched: number;
      late: number;
      absent: number;
    };
    week: {
      employees: number;
      punched: number;
      late: number;
      absent: number;
    };
    month: {
      employees: number;
      punched: number;
      late: number;
      absent: number;
    };
  };
  lists: {
    punched: AdminDashboardSummary[];
    late: AdminDashboardSummary[];
    absent: AdminDashboardSummary[];
  };
  series?: {
    date: string;
    punched: number;
    late: number;
    absent: number;
  }[];
  rankings?: {
    late: Array<AdminDashboardSummary & { count: number }>;
    absent: Array<AdminDashboardSummary & { count: number }>;
  };
  filters?: {
    departments: string[];
    schedules: Array<{ id: string; name: string }>;
  };
}

export interface ReprocessLogItem {
  id: string;
  start_at: string;
  end_at: string;
  updated_count: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at?: string;
}

export const adminDashboardService = {
  async get(params?: { date?: string; start?: string; end?: string }): Promise<AdminDashboardResponse> {
    const response = await api.get<AdminDashboardResponse>("/admin/dashboard", {
      params,
    });
    return response.data;
  },
  async reprocessHours(payload?: { start?: string; end?: string }): Promise<{ success: boolean; updated: number }> {
    const response = await api.post<{ success: boolean; updated: number }>(
      "/admin/reprocess-hours",
      payload || {},
    );
    return response.data;
  },
  async getReprocessLogs(params?: { start?: string; end?: string }): Promise<{ success: boolean; logs: ReprocessLogItem[] }> {
    const response = await api.get<{ success: boolean; logs: ReprocessLogItem[] }>(
      "/admin/reprocess-logs",
      { params },
    );
    return response.data;
  },
};
