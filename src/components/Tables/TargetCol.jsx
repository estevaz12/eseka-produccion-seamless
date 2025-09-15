import FlagRounded from '@mui/icons-material/FlagRounded';
import ReportRounded from '@mui/icons-material/ReportRounded';
import Typography from '@mui/joy/Typography';
import { roundUpEven } from '../../utils/progTableUtils';

export default function TargetCol({ row, faltaUnidades }) {
  const iconFontSize = 'small';

  const TargetData = ({ target, icon }) => (
    <Typography
      className='justify-end'
      endDecorator={icon}
      sx={{ '& .MuiTypography-endDecorator': { m: 0 } }}
    >
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
      if (row.Machines[0].TargetOrder === 0 && faltaUnidades <= 0) {
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
          icon={m.TargetOrder === 0 ? <FlagRounded fontSize='inherit' /> : null}
        />
      );
    });
  }
}
