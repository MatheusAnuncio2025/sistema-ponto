// Arquivo: frontend/src/pages/time/TimeRecordPage.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import {
  timeRecordService,
  TimeRecord,
  RecordType,
  TimeRecordResponse,
} from "../../services/api/timeRecords";
import { useAuth } from "../../contexts/AuthContext";

const recordTypeLabels: Record<RecordType, string> = {
  entry: "Entrada",
  lunch_start: "Início do Almoço",
  lunch_end: "Fim do Almoço",
  exit: "Saída",
};

const recordTypeColors: Record<RecordType, "success" | "warning" | "info" | "error"> = {
  entry: "success",
  lunch_start: "warning",
  lunch_end: "info",
  exit: "error",
};

const getNextRecordType = (records: TimeRecord[]): RecordType => {
  if (!records.length) return "entry";
  const last = records[records.length - 1];
  switch (last.record_type) {
    case "entry":
      return "lunch_start";
    case "lunch_start":
      return "lunch_end";
    case "lunch_end":
      return "exit";
    case "exit":
    default:
      return "entry";
  }
};

const playSuccessBeep = () => {
  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext })
        .webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.2;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
    oscillator.onended = () => {
      context.close();
    };
  } catch {
    // Sem áudio
  }
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));

const buildPerimeterWarning = (response: TimeRecordResponse | null) => {
  if (!response || !response.record) return null;
  if (response.record.is_within_radius !== false) return null;
  const distance = response.record.distance_meters ?? null;
  const radius = response.workLocation?.radius ?? null;
  const distanceLabel = distance !== null ? `${Math.round(distance)}m` : "distância desconhecida";
  const radiusLabel = radius !== null ? `${Math.round(radius)}m` : "raio não informado";
  return `Fora do perímetro permitido: ${distanceLabel} (raio ${radiusLabel}).`;
};

const TimeRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [now, setNow] = useState(new Date());
  const [recordsToday, setRecordsToday] = useState<TimeRecord[]>([]);
  const [recordsWeek, setRecordsWeek] = useState<TimeRecord[]>([]);
  const [recordsMonth, setRecordsMonth] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<TimeRecord | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [scheduleWarning, setScheduleWarning] = useState<string | null>(null);
  const [perimeterWarning, setPerimeterWarning] = useState<string | null>(null);

  const nextRecordType = useMemo(
    () => getNextRecordType(recordsToday),
    [recordsToday],
  );

  const loadRecords = useCallback(async () => {
    try {
      const [todayResponse, weekResponse, monthResponse] = await Promise.all([
        timeRecordService.list("day"),
        timeRecordService.list("week"),
        timeRecordService.list("month"),
      ]);
      setRecordsToday(todayResponse.records);
      setRecordsWeek(weekResponse.records);
      setRecordsMonth(monthResponse.records);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar registros");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getCurrentPosition = () =>
    new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 },
      );
    });

  const handleRecord = async () => {
    setError("");
    setSuccess(null);
    setLocationWarning(null);
    setScheduleWarning(null);
    setPerimeterWarning(null);
    setLoading(true);

    try {
      const location = await getCurrentPosition();
      if (!location) {
        setLocationWarning(
          "Não foi possível capturar a localização. O registro será enviado sem GPS.",
        );
      }

      const response = await timeRecordService.createRecord({
        record_type: nextRecordType,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      });

      setSuccess(response.record);
      if (response.warning) {
        setScheduleWarning(response.warning);
      }
      const perimeterAlert = buildPerimeterWarning(response);
      if (perimeterAlert) {
        setPerimeterWarning(perimeterAlert);
      }
      playSuccessBeep();
      await loadRecords();
    } catch (err: any) {
      setError(err.message || "Erro ao registrar ponto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ borderBottom: "1px solid rgba(15,23,42,0.08)" }}>
          <Button onClick={() => navigate("/dashboard")}>← Voltar ao Dashboard</Button>
          <Box sx={{ flex: 1 }} />
          <Stack alignItems="flex-end">
            <Typography variant="body2" color="text.secondary">
              Horário atual
            </Typography>
            <Typography variant="h6">{now.toLocaleTimeString("pt-BR")}</Typography>
            <Typography variant="caption" color="text.secondary">
              {now.toLocaleDateString("pt-BR")}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  Próxima marcação
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {recordTypeLabels[nextRecordType]}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Clique no botão para registrar o ponto com confirmação imediata.
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  {user?.name} · {user?.role}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={handleRecord}
                disabled={loading}
                startIcon={<AccessTimeIcon />}
                sx={{ px: 5, py: 2 }}
              >
                {loading ? "Registrando..." : "Registrar Ponto"}
              </Button>
            </Stack>

            {(locationWarning || error || perimeterWarning) && (
              <Stack spacing={1} mt={3}>
                {locationWarning && (
                  <Chip label={locationWarning} color="warning" variant="outlined" />
                )}
                {perimeterWarning && (
                  <Chip label={perimeterWarning} color="warning" variant="outlined" />
                )}
                {error && <Chip label={error} color="error" variant="outlined" />}
              </Stack>
            )}

            {success && (
              <Paper
                sx={{
                  mt: 3,
                  p: 3,
                  border: "1px solid rgba(0,149,48,0.2)",
                  backgroundColor: "rgba(0,149,48,0.06)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="primary">
                      Registro confirmado
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {recordTypeLabels[success.record_type]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Horário: {formatDateTime(success.timestamp)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Código: {success.confirmation_code}
                    </Typography>
                    {success.distance_meters !== null &&
                      success.distance_meters !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          Distância do local: {Math.round(success.distance_meters)}m
                        </Typography>
                      )}
                    {!success.is_within_radius && (
                      <Typography variant="body2" color="warning.main" mt={1}>
                        Atenção: registro fora do perímetro permitido.
                      </Typography>
                    )}
                    {scheduleWarning && (
                      <Typography variant="body2" color="warning.main" mt={1}>
                        {scheduleWarning}
                      </Typography>
                    )}
                  </Box>
                  <CheckCircleIcon color="primary" sx={{ fontSize: 44 }} />
                </Stack>
              </Paper>
            )}
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {[
              { title: "Registros de Hoje", data: recordsToday },
              { title: "Registros da Semana", data: recordsWeek },
              { title: "Registros do Mês", data: recordsMonth },
            ].map((section) => (
              <Paper key={section.title} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {section.title}
                </Typography>
                <Stack spacing={1}>
                  {section.data.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum registro encontrado.
                    </Typography>
                  )}
                  {section.data.slice(-6).map((record) => (
                    <Stack
                      key={record.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={recordTypeLabels[record.record_type]}
                          size="small"
                          color={recordTypeColors[record.record_type]}
                        />
                        {!record.is_within_radius && (
                          <Chip label="Fora do perímetro" size="small" color="warning" />
                        )}
                      </Stack>
                      <Stack alignItems="flex-end" spacing={0.25}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(record.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.latitude != null && record.longitude != null
                            ? `Lat ${record.latitude.toFixed(5)} · Lng ${record.longitude.toFixed(5)}`
                            : "Sem GPS"}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default TimeRecordPage;
