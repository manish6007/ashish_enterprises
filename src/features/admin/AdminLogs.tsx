import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, LinearProgress, alpha, useTheme, IconButton, Tooltip,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { activityService } from '../../services/firestore';
import { ActivityLog } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ACTION_COLORS: Record<string, string> = {
  ADD_NUMBER: '#10b981',
  UPDATE_NUMBER: '#f59e0b',
  DELETE_NUMBER: '#E63946',
  BULK_IMPORT: '#0066CC',
  UPDATE_BOOKING: '#8b5cf6',
  DEFAULT: '#888',
};

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await activityService.getAll(100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, ' ');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Activity Logs</Typography>
          <Typography variant="body2" color="text.secondary">Recent system activities</Typography>
        </Box>
        <Tooltip title="Refresh"><IconButton onClick={load}><Refresh /></IconButton></Tooltip>
      </Box>

      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Performed By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => {
                const color = ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT;
                return (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Chip
                        label={getActionLabel(log.action)}
                        size="small"
                        sx={{ background: alpha(color, 0.15), color, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', background: alpha('#0066CC', 0.15), color: 'primary.main' }}>
                          {log.performedBy.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {log.performedBy.slice(0, 12)}…
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {log.targetId?.slice(0, 10) || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={dayjs(log.timestamp).format('DD MMM YYYY, HH:mm:ss')}>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(log.timestamp).fromNow()}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {logs.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No activity logs yet</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminLogs;
