import { Download, QuestionMark, SyncProblem } from '@mui/icons-material';
import { Typography } from '@mui/joy';
import { roundUpEven } from '../../utils/progTableUtils';

// TODO: reset counter for multiple machines and for incomplete articulos
export default function TargetCol({ row, faltaUnidades, matchingMachines }) {
  if (matchingMachines.length <= 1) {
    // if one machine, just add pieces to remaining
    // if no machines, just show remaining
    const machPieces = matchingMachines[0]?.Pieces;
    const machTarget = roundUpEven(faltaUnidades + (machPieces || 0));

    if (machPieces) {
      // if producing
      if (row.Producido === 0) {
        // Download production record
        return (
          <Typography>
            {row.Target}
            &nbsp;
            <Download fontSize='md' />
          </Typography>
        );
      } else if (machTarget > row.Target) {
        // Reset counter
        return (
          <Typography>
            {machTarget}
            &nbsp;
            <SyncProblem fontSize='md' />
          </Typography>
        );
      } else if (
        machTarget < row.Target && // means articulo is incomplete
        matchingMachines[0].TargetOrder === 0
      ) {
        // verify target
        return (
          <Typography>
            {machTarget}
            &nbsp;
            <QuestionMark fontSize='md' />
          </Typography>
        );
      }
    }

    return machTarget;
  } else {
    return matchingMachines.map((m) => {
      // if multiple machines, calculate target per machine
      // divide remaining pieces by number of machines
      let machineTarget = roundUpEven(
        m.Pieces +
          (row.Producido === 0 ? row.Target : faltaUnidades) /
            matchingMachines.length
      );

      return (
        <Typography key={m.MachCode}>
          {`${m.MachCode} -> ${machineTarget}`}
          {(() => {
            if (row.Producido === 0)
              return (
                <>
                  &nbsp;
                  <Download fontSize='md' />
                </>
              );
            else if (m.TargetOrder === 0)
              return (
                <>
                  &nbsp;
                  <QuestionMark fontSize='md' />
                </>
              );
          })()}
        </Typography>
      );
    });
  }
}
