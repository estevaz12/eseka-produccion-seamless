import CrisisAlertRounded from '@mui/icons-material/CrisisAlertRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import QuestionMarkRounded from '@mui/icons-material/QuestionMarkRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ReportRounded from '@mui/icons-material/ReportRounded';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { roundUpEven } from '../../utils/progTableUtils';

// TODO: reset counter for multiple machines and for incomplete articulos
export default function TargetCol({ row, faltaUnidades }) {
  const iconFontSize = 'small';

  const TargetData = ({ target, icon }) => (
    <Typography className='justify-end'>{target}</Typography>
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
        faltaUnidades > 0 &&
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
        Math.abs(machTarget - row.Machines[0].TargetOrder) > 2
      ) {
        // Target is different from expected
        return (
          <TargetData
            target={
              <Stack component='span' direction='column'>
                <Typography>{machTarget}</Typography>
                <Typography>(M: {row.Machines[0].TargetOrder})</Typography>
              </Stack>
            }
            icon={<CrisisAlertRounded fontSize={iconFontSize} />}
          />
        );
      } else if (row.Machines[0].TargetOrder === 0 && faltaUnidades <= 0) {
        // target met, stop machine
        return (
          <TargetData
            target={'LLEGÓ'}
            icon={<ReportRounded fontSize={iconFontSize} />}
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
    } else if (faltaUnidades <= 0) {
      // target met, not producing
      return 'LLEGÓ';
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
              <DownloadRounded fontSize='inherit' />
            ) : m.TargetOrder === 0 ? (
              <QuestionMarkRounded fontSize='inherit' />
            ) : null
          }
        />
      );
    });
  }
}
