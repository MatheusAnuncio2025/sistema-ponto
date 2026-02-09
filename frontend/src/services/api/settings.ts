import api from "./auth";

export interface TimePolicySettings {
  allow_admin_out_of_schedule: boolean;
  allow_hr_out_of_schedule: boolean;
  allow_supervisor_out_of_schedule: boolean;
  allow_coordinator_out_of_schedule: boolean;
  allow_manager_out_of_schedule: boolean;
}

export interface SettingsResponse {
  success: boolean;
  settings: TimePolicySettings;
}

export const settingsService = {
  async get(): Promise<SettingsResponse> {
    const response = await api.get<SettingsResponse>("/settings");
    return response.data;
  },

  async update(payload: TimePolicySettings): Promise<SettingsResponse> {
    const response = await api.patch<SettingsResponse>("/settings", payload);
    return response.data;
  },
};
