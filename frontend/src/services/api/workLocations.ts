import api from "./auth";

export interface WorkLocation {
  id: string;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
}

export interface WorkLocationListResponse {
  success: boolean;
  locations: WorkLocation[];
}

export interface WorkLocationResponse {
  success: boolean;
  location: WorkLocation;
}

export const workLocationService = {
  async list(): Promise<WorkLocationListResponse> {
    const response = await api.get<WorkLocationListResponse>("/work-locations");
    return response.data;
  },

  async create(payload: {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    radius?: number;
  }): Promise<WorkLocationResponse> {
    const response = await api.post<WorkLocationResponse>("/work-locations", payload);
    return response.data;
  },

  async update(
    id: string,
    payload: {
      name?: string;
      address?: string | null;
      latitude?: number;
      longitude?: number;
      radius?: number;
      is_active?: boolean;
    }
  ): Promise<WorkLocationResponse> {
    const response = await api.put<WorkLocationResponse>(`/work-locations/${id}`, payload);
    return response.data;
  },

  async deactivate(id: string): Promise<WorkLocationResponse> {
    const response = await api.delete<WorkLocationResponse>(`/work-locations/${id}`);
    return response.data;
  },
};
