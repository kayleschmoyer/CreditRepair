import React from 'react';
import { Document, Page, Text, View, Image, Link } from '@react-pdf/renderer';
import { styles } from './styles';

export interface DisputeItem {
  account: string;
  reason: string;
}

export interface LetterData {
  consumer: {
    name: string;
    address1: string;
    address2: string;
  };
  bureau: {
    name: string;
    address: string[];
  };
  items: DisputeItem[];
  exhibits: string[];
  detailUrl: string;
  qrDataUrl: string;
}

export const BaseLetter: React.FC<LetterData> = ({ consumer, bureau, items, exhibits, detailUrl, qrDataUrl }) => (
  <Document>
    <Page size="LETTER" style={styles.body}>
      <View style={styles.header}>
        <Text>Dispute Letter</Text>
      </View>
      <View style={styles.addressBlock}>
        <View>
          <Text>{consumer.name}</Text>
          <Text>{consumer.address1}</Text>
          <Text>{consumer.address2}</Text>
        </View>
        <View>
          <Text>{bureau.name}</Text>
          {bureau.address.map((line) => (
            <Text key={line}>{line}</Text>
          ))}
        </View>
      </View>
      <Text style={styles.paragraph}>Re: Request for Investigation</Text>
      <Text style={styles.paragraph}>
        Under the Fair Credit Reporting Act (FCRA), I am disputing the following items on my credit report:
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Account</Text>
          <Text style={styles.tableColHeader}>Reason</Text>
        </View>
        {items.map((item, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={styles.tableCol}>{item.account}</Text>
            <Text style={styles.tableCol}>{item.reason}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.paragraph}>Please see the attached exhibits supporting my dispute:</Text>
      {exhibits.map((ex, idx) => (
        <Text key={idx}>{`Exhibit ${idx + 1}: ${ex}`}</Text>
      ))}
      <Text style={styles.paragraph}>Sincerely,</Text>
      <Text>{consumer.name}</Text>
      <Image style={styles.qr} src={qrDataUrl} />
      <Link src={detailUrl}>{detailUrl}</Link>
    </Page>
  </Document>
);
