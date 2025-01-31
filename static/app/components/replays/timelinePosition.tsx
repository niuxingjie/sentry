import React from 'react';
import styled from '@emotion/styled';

import * as Progress from 'sentry/components/replays/progress';
import {divide} from 'sentry/components/replays/utils';
import space from 'sentry/styles/space';

type Props = {
  currentTime: number;
  duration: number;
  color?: string;
};

function TimelinePosition({color, currentTime, duration}: Props) {
  const percentComplete = divide(currentTime, duration);

  return (
    <Progress.Meter>
      <Value color={color} percent={percentComplete} />
    </Progress.Meter>
  );
}

const Value = styled(Progress.Value)<Pick<Props, 'color'>>`
  ${p => p.color && `border-right: ${space(0.25)} solid ${p.color};`}
`;

export default TimelinePosition;
