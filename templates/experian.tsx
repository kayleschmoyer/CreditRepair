import React from 'react';
import { BaseLetter, LetterData } from './BaseLetter';

export default function ExperianTemplate(props: Omit<LetterData, 'bureau'>) {
  return (
    <BaseLetter
      {...props}
      bureau={{
        name: 'Experian',
        address: ['P.O. Box 4500', 'Allen, TX 75013'],
      }}
    />
  );
}
