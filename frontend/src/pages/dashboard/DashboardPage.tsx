// Arquivo: frontend/src/pages/dashboard/DashboardPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import ReplayIcon from "@mui/icons-material/Replay";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useAuth } from "../../contexts/AuthContext";
import { useTimeRecord, DayRecord } from "../../contexts/TimeRecordContext";

const PUNCH_CONFIG = [
  { type: "entrada" as const, label: "Entrada", icon: LoginIcon },
  { type: "saidaAlmoco" as const, label: "Saída Almoço", icon: LunchDiningIcon },
  { type: "retornoAlmoco" as const, label: "Retorno Almoço", icon: ReplayIcon },
  { type: "saida" as const, label: "Saída", icon: LogoutIcon },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function calcHours(record: DayRecord | null): { worked: string; interval: string } {
  if (!record?.entrada || !record?.saida) return { worked: "--:--", interval: "--:--" };
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
  } = useTimeRecord();
  const [now, setNow] = useState(new Date());
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextPunch = getNextPunch();
  const { worked, interval } = calcHours(todayRecord);
  const firstName = useMemo(() => user?.name.split(" ")[0], [user?.name]);

  const playSuccessTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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
        setActionInfo("⚠️ Registro feito fora do horário permitido (liberação aplicada).");
      }
    } catch (err: any) {
      setActionError(err.message || "Erro ao registrar ponto");
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Stack spacing={3}>
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(0,149,48,0.12), rgba(11,93,42,0.04))",
          }}
        >
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

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Registrar Ponto
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            {PUNCH_CONFIG.map(({ type, label, icon: Icon }) => {
              const done = todayRecord?.[type];
              const isNext = nextPunch === type;
              return (
                <Button
                  key={type}
                  variant={done ? "outlined" : isNext ? "contained" : "outlined"}
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
                        ? "linear-gradient(135deg, rgba(0,149,48,0.95), rgba(11,93,42,0.95))"
                        : "transparent",
                    color: done ? "inherit" : isNext ? "#fff" : "inherit",
                    borderColor: "rgba(15,23,42,0.12)",
                    "&:hover": {
                      background: isNext
                        ? "linear-gradient(135deg, rgba(0,149,48,1), rgba(11,93,42,1))"
                        : "rgba(15,23,42,0.03)",
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
        </Paper>

        <Paper
          sx={{
            p: 3,
            border: "1px solid rgba(15,23,42,0.06)",
            background: "linear-gradient(180deg, #ffffff, rgba(0,149,48,0.02))",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
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

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(0,149,48,0.1), #ffffff)",
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
              background: "linear-gradient(135deg, rgba(0,149,48,0.08), #ffffff)",
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
      </Stack>
    </Box>
  );
};

export default DashboardPage;
