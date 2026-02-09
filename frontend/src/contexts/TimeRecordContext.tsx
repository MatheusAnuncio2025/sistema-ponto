// Arquivo: frontend/src/contexts/TimeRecordContext.tsx

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { timeRecordService, TimeRecord, TimeRecordResponse } from "../services/api/timeRecords";

export interface DayRecord {
  date: string; // YYYY-MM-DD
  entrada?: string;
  saidaAlmoco?: string;
  retornoAlmoco?: string;
  saida?: string;
  locations?: Partial<
    Record<
      "entrada" | "saidaAlmoco" | "retornoAlmoco" | "saida",
      { latitude: number; longitude: number }
    >
  >;
}

type PunchType = "entrada" | "saidaAlmoco" | "retornoAlmoco" | "saida";

interface TimeRecordContextType {
  records: DayRecord[];
  todayRecord: DayRecord | null;
  punch: (type: PunchType) => Promise<TimeRecordResponse>;
  getNextPunch: () => PunchType | null;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
  currentLocation: { latitude: number; longitude: number } | null;
  locationUpdatedAt: Date | null;
  locationLoading: boolean;
  locationError: string | null;
  refreshLocation: (opts?: { silent?: boolean }) => Promise<void>;
  lastPunch: TimeRecordResponse | null;
}

const TimeRecordContext = createContext<TimeRecordContextType>({} as TimeRecordContextType);

const recordTypeToField: Record<TimeRecord["record_type"], keyof DayRecord> = {
  entry: "entrada",
  lunch_start: "saidaAlmoco",
  lunch_end: "retornoAlmoco",
  exit: "saida",
};

const punchToRecordType: Record<PunchType, TimeRecord["record_type"]> = {
  entrada: "entry",
  saidaAlmoco: "lunch_start",
  retornoAlmoco: "lunch_end",
  saida: "exit",
};

const aggregateByDay = (records: TimeRecord[]): DayRecord[] => {
  const byDate: Record<string, DayRecord> = {};
  records.forEach((record) => {
    const dateKey = format(new Date(record.timestamp), "yyyy-MM-dd");
    if (!byDate[dateKey]) {
      byDate[dateKey] = { date: dateKey, locations: {} };
    }
    const field = recordTypeToField[record.record_type];
    byDate[dateKey][field] = format(new Date(record.timestamp), "HH:mm");
    if (record.latitude != null && record.longitude != null) {
      byDate[dateKey].locations = byDate[dateKey].locations || {};
      (byDate[dateKey].locations as any)[field] = {
        latitude: Number(record.latitude),
        longitude: Number(record.longitude),
      };
    }
  });
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
};

const getCurrentPosition = (): Promise<{ latitude: number; longitude: number } | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 },
    );
  });

export function TimeRecordProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationUpdatedAt, setLocationUpdatedAt] = useState<Date | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastPunch, setLastPunch] = useState<TimeRecordResponse | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = await timeRecordService.list("month");
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      const prevMonth = await timeRecordService.list(
        "month",
        format(prevMonthDate, "yyyy-MM-dd"),
      );
      const merged = [...prevMonth.records, ...currentMonth.records];
      setRecords(aggregateByDay(merged));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar registros");
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLocationLoading(true);
    }
    const location = await getCurrentPosition();
    if (!location) {
      if (!opts?.silent) {
        setLocationError(
          "Não foi possível capturar a localização. Verifique as permissões do navegador.",
        );
      }
      if (!opts?.silent) {
        setLocationLoading(false);
      }
      return;
    }
    setCurrentLocation(location);
    setLocationUpdatedAt(new Date());
    setLocationError(null);
    if (!opts?.silent) {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    refreshLocation({ silent: true });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshLocation({ silent: true });
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecord = useMemo(
    () => records.find((r) => r.date === today) || null,
    [records, today],
  );

  const punch = async (type: PunchType) => {
    const recordType = punchToRecordType[type];
    const location = await getCurrentPosition();
    if (location) {
      setCurrentLocation(location);
      setLocationUpdatedAt(new Date());
      setLocationError(null);
    }

    const response = await timeRecordService.createRecord({
      record_type: recordType,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    });
    setLastPunch(response);
    await refresh();
    return response;
  };

  const getNextPunch = (): PunchType | null => {
    if (!todayRecord) return "entrada";
    if (!todayRecord.entrada) return "entrada";
    if (!todayRecord.saidaAlmoco) return "saidaAlmoco";
    if (!todayRecord.retornoAlmoco) return "retornoAlmoco";
    if (!todayRecord.saida) return "saida";
    return null;
  };

  return (
    <TimeRecordContext.Provider
      value={{
        records,
        todayRecord,
      punch,
      getNextPunch,
      refresh,
      loading,
      error,
      currentLocation,
      locationUpdatedAt,
      locationLoading,
      locationError,
      refreshLocation,
      lastPunch,
    }}
  >
      {children}
    </TimeRecordContext.Provider>
  );
}

export const useTimeRecord = () => useContext(TimeRecordContext);
