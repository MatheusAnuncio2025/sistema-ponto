// Arquivo: frontend/src/pages/dashboard/DashboardPage.tsx

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckIcon from "@mui/icons-material/Check";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { DayRecord, useTimeRecord } from "../../contexts/TimeRecordContext";
import { Employee, employeesService } from "../../services/api/employees";

const PUNCH_CONFIG = [
  { type: "entrada" as const, label: "Entrada", icon: LoginIcon },
  {
    type: "saidaAlmoco" as const,
    label: "Saída Almoço",
    icon: LunchDiningIcon,
  },
  { type: "retornoAlmoco" as const, label: "Retorno Almoço", icon: ReplayIcon },
  { type: "saida" as const, label: "Saída", icon: LogoutIcon },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function calcHours(record: DayRecord | null): {
  worked: string;
  interval: string;
} {
  if (!record?.entrada || !record?.saida)
    return { worked: "--:--", interval: "--:--" };
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const totalMin = toMin(record.saida) - toMin(record.entrada);
  const intervalMin =
    record.saidaAlmoco && record.retornoAlmoco
      ? toMin(record.retornoAlmoco) - toMin(record.saidaAlmoco)
      : 0;
  const workedMin = totalMin - intervalMin;
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { worked: fmt(workedMin), interval: fmt(intervalMin) };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    todayRecord,
    punch,
    getNextPunch,
    currentLocation,
    locationUpdatedAt,
    locationLoading,
    locationError,
    refreshLocation,
    records,
  } = useTimeRecord();
  const [now, setNow] = useState(new Date());
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeError, setEmployeeError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await employeesService.me();
        setEmployee(resp.employee);
      } catch (err: any) {
        setEmployeeError(
          err.message || "Erro ao carregar dados do colaborador",
        );
      }
    };
    load();
  }, []);

  const nextPunch = getNextPunch();
  const { worked, interval } = calcHours(todayRecord);
  const firstName = useMemo(() => user?.name.split(" ")[0], [user?.name]);
  const initials = useMemo(() => {
    if (!user?.name) return "US";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const buildTodaySchedule = () => {
    const schedule = employee?.workSchedule;
    if (!schedule) return null;
    const day = new Date().getDay();
    const dayRule =
      schedule.day_rules && typeof schedule.day_rules === "object"
        ? (schedule.day_rules as any)[String(day)] || schedule.day_rules[day]
        : null;
    const base = {
      start_time: schedule.start_time,
      lunch_start: schedule.lunch_start || "",
      lunch_end: schedule.lunch_end || "",
      end_time: schedule.end_time,
    };
    const resolved = { ...base, ...(dayRule || {}) };
    if (employee?.lunch_start) resolved.lunch_start = employee.lunch_start;
    if (employee?.lunch_end) resolved.lunch_end = employee.lunch_end;
    return resolved;
  };

  const todaySchedule = buildTodaySchedule();

  const calcExpectedMinutes = () => {
    if (!todaySchedule?.start_time || !todaySchedule?.end_time) return null;
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const start = toMin(todaySchedule.start_time);
    const end = toMin(todaySchedule.end_time);
    const lunchStart = todaySchedule.lunch_start
      ? toMin(todaySchedule.lunch_start)
      : null;
    const lunchEnd = todaySchedule.lunch_end
      ? toMin(todaySchedule.lunch_end)
      : null;
    const lunch =
      lunchStart !== null && lunchEnd !== null ? lunchEnd - lunchStart : 0;
    return end - start - lunch;
  };

  const expectedMin = calcExpectedMinutes();
  const workedMin =
    todayRecord?.entrada && todayRecord?.saida
      ? (() => {
          const toMin = (t: string) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
          };
          const intervalMin =
            todayRecord.saidaAlmoco && todayRecord.retornoAlmoco
              ? toMin(todayRecord.retornoAlmoco) -
                toMin(todayRecord.saidaAlmoco)
              : 0;
          return (
            toMin(todayRecord.saida) - toMin(todayRecord.entrada) - intervalMin
          );
        })()
      : null;

  const fmtHM = (min: number | null) => {
    if (min === null || Number.isNaN(min)) return "--:--";
    const hours = Math.floor(Math.abs(min) / 60);
    const minutes = Math.abs(min) % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const balanceMin =
    expectedMin !== null && workedMin !== null ? workedMin - expectedMin : null;
  const extraMin = balanceMin !== null ? Math.max(balanceMin, 0) : null;
  const missingMin = balanceMin !== null ? Math.max(-balanceMin, 0) : null;

  const formatBalance = (hoursBalance?: number | null) => {
    if (hoursBalance === null || hoursBalance === undefined || Number.isNaN(hoursBalance)) {
      return "--:--";
    }
    const totalMin = Math.round(Number(hoursBalance) * 60);
    const sign = totalMin >= 0 ? "+" : "-";
    const absMin = Math.abs(totalMin);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekData = Array.from({ length: 7 }).map((_, idx) => {
    const day = addDays(weekStart, idx);
    const dayRecord = records.find((r) => isSameDay(parseISO(r.date), day));
    const expected = (() => {
      if (!employee?.workSchedule) return 0;
      const dayIdx = day.getDay();
      const schedule = employee.workSchedule;
      const dayRule =
        schedule.day_rules && typeof schedule.day_rules === "object"
          ? (schedule.day_rules as any)[String(dayIdx)] ||
            schedule.day_rules[dayIdx]
          : null;
      const base = {
        start_time: schedule.start_time,
        lunch_start: schedule.lunch_start || "",
        lunch_end: schedule.lunch_end || "",
        end_time: schedule.end_time,
      };
      const resolved = { ...base, ...(dayRule || {}) };
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      if (!resolved.start_time || !resolved.end_time) return 0;
      const start = toMin(resolved.start_time);
      const end = toMin(resolved.end_time);
      const lunchStart = resolved.lunch_start
        ? toMin(resolved.lunch_start)
        : null;
      const lunchEnd = resolved.lunch_end ? toMin(resolved.lunch_end) : null;
      const lunch =
        lunchStart !== null && lunchEnd !== null ? lunchEnd - lunchStart : 0;
      return Math.max(end - start - lunch, 0);
    })();

    const worked = (() => {
      if (!dayRecord?.entrada || !dayRecord?.saida) return 0;
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const intervalMin =
        dayRecord.saidaAlmoco && dayRecord.retornoAlmoco
          ? toMin(dayRecord.retornoAlmoco) - toMin(dayRecord.saidaAlmoco)
          : 0;
      return toMin(dayRecord.saida) - toMin(dayRecord.entrada) - intervalMin;
    })();

    const extra = Math.max(worked - expected, 0);
    const missing = Math.max(expected - worked, 0);

    return {
      name: format(day, "EEE", { locale: ptBR }),
      trabalhadas: Math.max(worked / 60, 0),
      extras: Math.max(extra / 60, 0),
      faltantes: Math.max(missing / 60, 0),
    };
  });

  const playSuccessTone = () => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      osc.onended = () => ctx.close();
    } catch {
      // silêncio se o browser bloquear
    }
  };

  const handlePunch = async (type: (typeof PUNCH_CONFIG)[number]["type"]) => {
    try {
      setActionError("");
      setActionInfo("");
      const resp = await punch(type);
      playSuccessTone();
      if (resp.warning) {
        setActionInfo(resp.warning);
      }
      if (resp.record && resp.record.is_within_radius === false) {
        const radius = resp.workLocation?.radius;
        const distance = resp.record.distance_meters;
        const extra =
          radius && distance
            ? ` Distância: ${distance}m (raio permitido ${radius}m).`
            : "";
        setActionInfo(`⚠️ Fora do perímetro permitido.${extra}`);
      }
      if (resp.scheduleOverride) {
        setActionInfo(
          "⚠️ Registro feito fora do horário permitido (liberação aplicada).",
        );
      }
    } catch (err: any) {
      setActionError(err.message || "Erro ao registrar ponto");
    }
  };

  const nextPunchLabel = nextPunch
    ? {
        entrada: "Entrada",
        saidaAlmoco: "Saída Almoço",
        retornoAlmoco: "Retorno Almoço",
        saida: "Saída",
      }[nextPunch]
    : null;

  const nextPunchTime =
    nextPunch && todaySchedule
      ? {
          entrada: todaySchedule.start_time,
          saidaAlmoco: todaySchedule.lunch_start,
          retornoAlmoco: todaySchedule.lunch_end,
          saida: todaySchedule.end_time,
        }[nextPunch] || null
      : null;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </Typography>
          <Typography variant="h4" fontWeight={600} mt={0.5}>
            {getGreeting()}, {firstName}
          </Typography>
          <Typography
            variant="h2"
            fontWeight={300}
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {format(now, "HH:mm:ss")}
          </Typography>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems="center"
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 96,
                  height: 96,
                  fontSize: 36,
                  boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee?.position || "Colaborador"}
                </Typography>
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  <Chip label={employee?.department || "Sem departamento"} />
                  <Chip label={employee?.workSchedule?.name || "Sem escala"} />
                  {employee?.workLocation?.name && (
                    <Chip label={`Local: ${employee.workLocation.name}`} />
                  )}
                </Stack>
                {employeeError && (
                  <Typography
                    variant="caption"
                    color="error"
                    display="block"
                    mt={1}
                  >
                    {employeeError}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Escala de hoje
            </Typography>
            {todaySchedule ? (
              <Stack spacing={1} mt={1}>
                <Typography variant="body2">
                  Entrada: <strong>{todaySchedule.start_time}</strong>
                </Typography>
                <Typography variant="body2">
                  Almo?o:{" "}
                  <strong>
                    {todaySchedule.lunch_start || "--:--"} ?{" "}
                    {todaySchedule.lunch_end || "--:--"}
                  </strong>
                </Typography>
                <Typography variant="body2">
                  Sa?da: <strong>{todaySchedule.end_time}</strong>
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Sem escala definida para hoje.
              </Typography>
            )}
          </Paper>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 2,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Registrar Ponto
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {PUNCH_CONFIG.map(({ type, label, icon: Icon }) => {
                const done = todayRecord?.[type];
                const isNext = nextPunch === type;
                return (
                  <Button
                    key={type}
                    variant={
                      done ? "outlined" : isNext ? "contained" : "outlined"
                    }
                    color={done ? "inherit" : "primary"}
                    onClick={() => handlePunch(type)}
                    disabled={!!done || !isNext}
                    sx={{
                      height: 90,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      background: done
                        ? "transparent"
                        : isNext
                          ? "#0a7a2c"
                          : "transparent",
                      color: done ? "inherit" : isNext ? "#fff" : "inherit",
                      borderColor: "rgba(15,23,42,0.12)",
                      "&:hover": {
                        background: isNext ? "#086424" : "rgba(15,23,42,0.03)",
                      },
                    }}
                  >
                    {done ? <CheckIcon /> : <Icon />}
                    <Typography variant="caption" fontWeight={600}>
                      {label}
                    </Typography>
                    {done && (
                      <Typography variant="caption" color="text.secondary">
                        {done}
                      </Typography>
                    )}
                  </Button>
                );
              })}
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              mt={2}
            >
              <Typography variant="body2" color="text.secondary">
                Próxima marcação prevista:
              </Typography>
              <Chip
                label={
                  nextPunchLabel && nextPunchTime
                    ? `${nextPunchLabel} · ${nextPunchTime}`
                    : "Sem marcações pendentes"
                }
                color={nextPunchLabel ? "primary" : "default"}
                variant={nextPunchLabel ? "filled" : "outlined"}
                size="small"
              />
              {todaySchedule?.start_time && (
                <Typography variant="caption" color="text.secondary">
                  Tolerância: {employee?.workSchedule?.tolerance_minutes ?? 0} min
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, border: "1px solid rgba(15,23,42,0.06)" }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Localização atual
                </Typography>
                {currentLocation ? (
                  <Typography variant="body2" color="text.secondary">
                    Lat: {currentLocation.latitude.toFixed(6)} · Lng:{" "}
                    {currentLocation.longitude.toFixed(6)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Localização não capturada.
                  </Typography>
                )}
                {locationUpdatedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Atualizado em: {format(locationUpdatedAt, "HH:mm:ss")}
                  </Typography>
                )}
                {locationError && (
                  <Typography variant="caption" color="error" display="block">
                    {locationError}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<MyLocationIcon />}
                onClick={() => refreshLocation()}
                disabled={locationLoading}
              >
                {locationLoading ? "Atualizando..." : "Atualizar"}
              </Button>
            </Stack>
          </Paper>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
            gap: 2,
          }}
        >
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              {formatBalance(employee?.hours_balance)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Banco de horas
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              {fmtHM(extraMin)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Horas extras (hoje)
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              {fmtHM(missingMin)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Horas faltantes (hoje)
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
            }}
          >
            <AccessTimeIcon color="action" sx={{ mb: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              {worked}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Horas trabalhadas
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
            }}
          >
            <LunchDiningIcon color="action" sx={{ mb: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              {interval}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Intervalo
            </Typography>
          </Paper>
        </Box>

        {actionError && (
          <Typography align="center" variant="body2" color="error">
            {actionError}
          </Typography>
        )}
        {actionInfo && !actionError && (
          <Typography align="center" variant="body2" color="warning.main">
            {actionInfo}
          </Typography>
        )}

        {!nextPunch && todayRecord?.saida && (
          <Typography align="center" variant="body2" color="text.secondary">
            ✅ Todos os registros do dia foram feitos. Bom descanso!
          </Typography>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Resumo da semana (horas)
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trabalhadas" stackId="a" fill="#0a7a2c" />
              <Bar dataKey="extras" stackId="a" fill="#16a34a" />
              <Bar dataKey="faltantes" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>
    </Box>
  );
};

export default DashboardPage;
