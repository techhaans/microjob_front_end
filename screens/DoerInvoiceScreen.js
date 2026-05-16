import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import RNFS from 'react-native-fs';
import { getDoerInvoice, downloadDoerInvoicePdf } from '../api/doer';

const DoerInvoiceScreen = ({ route }) => {
  const { jobId } = route.params;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await getDoerInvoice(jobId);
      setInvoice(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const downloadPdf = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied');
      return;
    }

    try {
      const res = await downloadDoerInvoicePdf(jobId);
      const path = `${RNFS.DownloadDirectoryPath}/doer-invoice-${jobId}.pdf`;

      await RNFS.writeFile(path, res.data, 'base64');

      Alert.alert('Success', `PDF saved to Downloads`);
    } catch (err) {
      Alert.alert('Error', 'PDF download failed');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Invoice</Text>

      <Text>Invoice ID: {invoice.invoiceId}</Text>
      <Text>Job Title: {invoice.jobTitle}</Text>
      <Text>Poster: {invoice.posterName}</Text>
      <Text>Doer: {invoice.doerName}</Text>

      <Text style={styles.section}>Items</Text>
      {invoice.items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text>{item.label}</Text>
          <Text>Rs {item.priceRupees}</Text>
        </View>
      ))}

      <Text style={styles.total}>
        Total: Rs {invoice.grossAmountPaise}
      </Text>

      <Button title="Download PDF" onPress={downloadPdf} />
    </ScrollView>
  );
};

export default DoerInvoiceScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  section: { marginTop: 20, fontWeight: 'bold' },
  item: { flexDirection: 'row', justifyContent: 'space-between' },
  total: { fontSize: 18, marginTop: 20, fontWeight: 'bold' },
});
