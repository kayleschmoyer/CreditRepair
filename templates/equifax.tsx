import React from 'react';
import { BaseLetter, LetterData } from './BaseLetter';

export default function EquifaxTemplate(props: Omit<LetterData, 'bureau'>) {
  return (
    <BaseLetter
      {...props}
      bureau={{
        name: 'Equifax Information Services LLC',
        address: ['P.O. Box 740256', 'Atlanta, GA 30374'],
      }}
    />
  );
}
