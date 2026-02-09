import api from "./auth";
import { WorkSchedule } from "./workSchedules";
import { WorkLocation } from "./workLocations";

export interface Employee {
  id: string;
  employee_code: string;
  department?: string | null;
  position?: string | null;
  work_schedule_id?: string | null;
  work_location_id?: string | null;
  lunch_start?: string | null;
  lunch_end?: string | null;
  punch_override_until?: string | null;
  punch_override_by?: string | null;
  punch_override_reason?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "hr" | "supervisor" | "coordinator" | "manager" | "employee";
  };
  workSchedule?: WorkSchedule | null;
  workLocation?: WorkLocation | null;
}

export interface EmployeeListResponse {
  success: boolean;
  employees: Employee[];
}

export const employeesService = {
  async list(): Promise<EmployeeListResponse> {
    const response = await api.get<EmployeeListResponse>("/employees");
    return response.data;
  },

  async updateWorkSchedule(
    employeeId: string,
    work_schedule_id: string,
  ): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(
      `/employees/${employeeId}/work-schedule`,
      { work_schedule_id },
    );
    return response.data;
  },

  async updateLunch(
    employeeId: string,
    payload: { lunch_start?: string; lunch_end?: string },
  ): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(
      `/employees/${employeeId}/lunch`,
      payload,
    );
    return response.data;
  },

  async setPunchOverride(
    employeeId: string,
    payload: { override_until?: string; reason?: string },
  ): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(
      `/employees/${employeeId}/punch-override`,
      payload,
    );
    return response.data;
  },

  async clearPunchOverride(employeeId: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(
      `/employees/${employeeId}/punch-override`,
    );
    return response.data;
  },
};
