import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  body: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  addressBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  table: {
    display: 'table' as unknown as 'flex',
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '50%',
    fontWeight: 'bold',
    borderBottom: 1,
    paddingBottom: 5,
  },
  tableCol: {
    width: '50%',
    paddingVertical: 5,
  },
  paragraph: {
    marginBottom: 10,
  },
  qr: {
    width: 80,
    height: 80,
    marginTop: 10,
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 10,
  },
});
