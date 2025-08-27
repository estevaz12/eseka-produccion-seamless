import {
  axisClasses,
  legendClasses,
  chartsTooltipClasses,
  chartsGridClasses,
} from '@mui/x-charts';

/* eslint-disable import/prefer-default-export */
export const getChartsCustomizations = (theme) => ({
  MuiChartsAxis: {
    styleOverrides: {
      root: {
        [`& .${axisClasses.line}`]: {
          stroke: theme.vars.palette.neutral[300],
        },
        [`& .${axisClasses.tick}`]: { stroke: theme.vars.palette.neutral[300] },
        [`& .${axisClasses.tickLabel}`]: {
          fill: theme.vars.palette.neutral[500],
          fontWeight: theme.vars.fontWeight.md,
        },
      },
    },
  },
  MuiChartsTooltip: {
    styleOverrides: {
      root: {
        [`& .${chartsTooltipClasses.mark}`]: {
          ry: 6,
          boxShadow: 'none',
        },
        [`& .${chartsTooltipClasses.table}`]: {
          borderRadius: theme.vars.radius.sm,
          background: 'hsl(0, 0%, 100%)',
        },
        [`& .${chartsTooltipClasses.valueCell}`]: {
          fontWeight: theme.vars.fontWeight.lg,
        },
        [`& .${chartsTooltipClasses.paper}`]: {
          background: 'hsl(220, 35%, 97%)',
        },
      },
    },
  },
  MuiChartsLegend: {
    styleOverrides: {
      root: {
        [`& .${legendClasses.mark}`]: {
          ry: 6,
        },
      },
    },
  },
  MuiChartsGrid: {
    styleOverrides: {
      root: {
        [`& .${chartsGridClasses.line}`]: {
          stroke: theme.vars.palette.neutral[200],
          strokeDasharray: '4 2',
          strokeWidth: 0.8,
        },
      },
    },
  },
});
