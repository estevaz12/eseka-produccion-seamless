import {
  DownloadRounded,
  QuestionMarkRounded,
  SyncProblemRounded,
} from '@mui/icons-material';
import { Typography } from '@mui/joy';
import { roundUpEven } from '../../utils/progTableUtils';

// TODO: reset counter for multiple machines and for incomplete articulos
export default function TargetCol({ row, faltaUnidades }) {
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
          <Typography>
            {row.Target}
            &nbsp;
            <DownloadRounded fontSize='small' />
          </Typography>
        );
      } else if (machTarget > row.Target) {
        // Reset counter
        return (
          <Typography>
            {machTarget}
            &nbsp;
            <SyncProblemRounded fontSize='small' />
          </Typography>
        );
      } else if (
        machTarget < row.Target && // means articulo is incomplete
        row.Machines[0].TargetOrder === 0
      ) {
        // verify target
        return (
          <Typography>
            {machTarget}
            &nbsp;
            <QuestionMarkRounded fontSize='small' />
          </Typography>
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
        <Typography key={m.MachCode}>
          {`${m.MachCode} -> ${machineTarget}`}
          {(() => {
            if (row.Producido === 0)
              return (
                <>
                  &nbsp;
                  <DownloadRounded fontSize='small' />
                </>
              );
            else if (m.TargetOrder === 0)
              return (
                <>
                  &nbsp;
                  <QuestionMarkRounded fontSize='small' />
                </>
              );
          })()}
        </Typography>
      );
    });
  }
}
