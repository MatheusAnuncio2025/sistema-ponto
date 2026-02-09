import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { settingsService, TimePolicySettings } from "../../services/api/settings";
import { useNavigate } from "react-router-dom";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TimePolicySettings>({
    allow_admin_out_of_schedule: true,
    allow_hr_out_of_schedule: true,
    allow_supervisor_out_of_schedule: true,
    allow_coordinator_out_of_schedule: true,
    allow_manager_out_of_schedule: false,
  });

  const load = async () => {
    try {
      setLoading(true);
      const resp = await settingsService.get();
      setForm(resp.settings);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = (key: keyof TimePolicySettings) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await settingsService.update(form);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const rows: Array<{ key: keyof TimePolicySettings; label: string; desc: string }> = [
    {
      key: "allow_admin_out_of_schedule",
      label: "Administrador",
      desc: "Pode bater ponto em qualquer horário.",
    },
    {
      key: "allow_hr_out_of_schedule",
      label: "RH",
      desc: "Pode bater ponto em qualquer horário.",
    },
    {
      key: "allow_supervisor_out_of_schedule",
      label: "Supervisor",
      desc: "Pode bater ponto em qualquer horário.",
    },
    {
      key: "allow_coordinator_out_of_schedule",
      label: "Coordenador",
      desc: "Pode bater ponto em qualquer horário.",
    },
    {
      key: "allow_manager_out_of_schedule",
      label: "Gerente",
      desc: "Pode bater ponto em qualquer horário.",
    },
  ];

  return (
    <Box>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Configurações de Ponto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defina quais perfis podem registrar ponto fora da janela.
            </Typography>
          </Box>
          <Button variant="text" onClick={() => navigate("/")}>
            Voltar
          </Button>
        </Stack>

        <Paper
          sx={{
            p: 3,
            border: "1px solid rgba(15,23,42,0.06)",
            background: "linear-gradient(180deg, #ffffff, rgba(0,149,48,0.02))",
          }}
        >
          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Carregando...
            </Typography>
          ) : (
            <Stack spacing={2}>
              {rows.map((row) => (
                <Paper
                  key={row.key}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>{row.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.desc}
                    </Typography>
                  </Box>
                  <Switch
                    checked={form[row.key]}
                    onChange={() => handleToggle(row.key)}
                  />
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Box>
          <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
