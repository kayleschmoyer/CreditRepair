import React from 'react';
import { BaseLetter, LetterData } from './BaseLetter';

export default function TransUnionTemplate(props: Omit<LetterData, 'bureau'>) {
  return (
    <BaseLetter
      {...props}
      bureau={{
        name: 'TransUnion LLC',
        address: ['P.O. Box 2000', 'Chester, PA 19016'],
      }}
    />
  );
}
