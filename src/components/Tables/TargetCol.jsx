import {
  CrisisAlertRounded,
  DownloadRounded,
  FlagRounded,
  QuestionMarkRounded,
  SyncProblemRounded,
} from '@mui/icons-material';
import { Stack, Typography } from '@mui/joy';
import { roundUpEven } from '../../utils/progTableUtils';

// TODO: reset counter for multiple machines and for incomplete articulos
export default function TargetCol({ row, faltaUnidades }) {
  const iconFontSize = 'small';

  const TargetData = ({ target, icon }) => (
    <Typography className='justify-end' endDecorator={icon}>
      {target}
    </Typography>
  );

  if (row.Machines.length <= 1) {
    // if one machine, just add pieces to remaining
    // if no machines, just show remaining
    const machPieces = row.Machines[0]?.Pieces;
    const machTarget = roundUpEven(faltaUnidades + (machPieces || 0));

    if (machPieces) {
      // if producing
      if (row.Producido === 0) {
        // Download production record
        return (
          <TargetData
            target={row.Target}
            icon={<DownloadRounded fontSize={iconFontSize} />}
          />
        );
      } else if (machTarget > row.Target) {
        // Reset counter
        return (
          <TargetData
            target={machTarget}
            icon={<SyncProblemRounded fontSize={iconFontSize} />}
          />
        );
      } else if (
        machTarget < row.Target && // means articulo is incomplete
        row.Machines[0].TargetOrder === 0
      ) {
        // verify counter
        return (
          <TargetData
            target={machTarget}
            icon={<QuestionMarkRounded fontSize={iconFontSize} />}
          />
        );
      } else if (
        row.Machines[0].TargetOrder !== 0 &&
        row.Machines[0].TargetOrder !== machTarget
      ) {
        // Target is different from expected
        return (
          <TargetData
            target={
              <Stack direction='column'>
                <Typography>{machTarget}</Typography>
                <Typography>(M: {row.Machines[0].TargetOrder})</Typography>
              </Stack>
            }
            icon={<CrisisAlertRounded fontSize={iconFontSize} />}
          />
        );
      } else if (row.Machines[0].TargetOrder === 0) {
        // no target
        return (
          <TargetData
            target={machTarget}
            icon={<FlagRounded fontSize={iconFontSize} />}
          />
        );
      }
    }

    return machTarget;
  } else {
    return row.Machines.map((m) => {
      // if multiple machines, calculate target per machine
      // divide remaining pieces by number of machines
      let machineTarget = roundUpEven(
        m.Pieces +
          (row.Producido === 0 ? row.Target : faltaUnidades) /
            row.Machines.length
      );

      return (
        <TargetData
          key={m.MachCode}
          target={`${m.MachCode} -> ${machineTarget}`}
          icon={
            row.Producido === 0 ? (
              <DownloadRounded fontSize={iconFontSize} />
            ) : m.TargetOrder === 0 ? (
              <QuestionMarkRounded fontSize={iconFontSize} />
            ) : null
          }
        />
      );
    });
  }
}
