import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

interface QuotePDFProps {
  data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    itemType?: string;
    goldRate: string;
    diamondRate: string;
    totalAmount: number;
    imageSrc?: string | null;
    grossWeight?: string;
    netGoldWeight?: string;
    goldValue?: string;
    purityName?: string;
    diamondWeight?: string;
    totalDiamondCost?: string;
    processingCharge?: string;
    costType?: "Labor" | "Wastage";
    wastagePct?: string;
    laborRate?: string;
    appliedDiscount?: string;
    discountType?: "Percentage" | "Amount";
    discountValue?: string;
    subtotal?: string;
    colorStoneWeight?: string;
    colorStoneRate?: string;
    totalColorStoneCost?: string;
    isCertEnabled?: boolean;
    certRate?: string;
    totalCertCost?: string;
    quoteDate?: string;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 35,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  spiritualHeader: {
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#b45309',
    marginTop: 2,
    fontWeight: 'bold',
  },
  metaText: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
  },
  quoteBadgeContainer: {
    alignItems: 'flex-end',
  },
  quoteBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateText: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 15,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableHeaderRow: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 9,
  },
  colDesc: { width: '40%', paddingLeft: 8 },
  colWeight: { width: '20%', textAlign: 'right', paddingRight: 8 },
  colRate: { width: '20%', textAlign: 'right', paddingRight: 8 },
  colTotal: { width: '20%', textAlign: 'right', paddingRight: 8 },
  
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  summaryWrapper: {
    width: 240,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    fontSize: 9,
  },
  discountText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  totalBox: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalLabel: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalPrice: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageSection: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imageLabel: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  jewelryImage: {
    width: 140,
    height: 100,
    objectFit: 'contain',
  },
});

export const QuotePDF = ({ data }: QuotePDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <Text style={styles.spiritualHeader}>
          || Om Shree Ganeshay Namah ||   || Om Shree Shishoda Kshetrapal Bavji Namah ||   || Om Shree Purvaj Bavji Namah ||
        </Text>

        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.brandName}>Om Diamonds</Text>
            <Text style={styles.brandSubtitle}>EXCLUSIVE DIAMOND JEWELLERY</Text>
            <Text style={styles.metaText}>Phone: +91 897 6732 617  |  +91 865 5558 470</Text>
            <Text style={styles.metaText}>Email: omdiamond123@gmail.com</Text>
          </View>
          
          <View style={styles.quoteBadgeContainer}>
            <Text style={styles.quoteBadge}>Quotation</Text>
            <Text style={styles.dateText}>Date: {data.quoteDate}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>QUOTATION FOR:</Text>
              <Text style={styles.infoValue}>{data.customerName}</Text>
            </View>
            {data.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>EMAIL:</Text>
                <Text style={styles.infoValue}>{data.customerEmail}</Text>
              </View>
            )}
          </View>
          <View style={[styles.infoColumn, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0', paddingLeft: 10 }]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CONTACT LINE:</Text>
              <Text style={styles.infoValue}>{data.customerPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ITEM TYPE:</Text>
              <Text style={styles.infoValue}>{data.itemType || 'Ornament Estimate'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.colDesc, styles.tableHeaderCell]}>Description</Text>
            <Text style={[styles.colWeight, styles.tableHeaderCell]}>Weight/Qty</Text>
            <Text style={[styles.colRate, styles.tableHeaderCell]}>Rate (Rs.)</Text>
            <Text style={[styles.colTotal, styles.tableHeaderCell]}>Net Value</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Gross Weight</Text>
            <Text style={styles.colWeight}>{data.grossWeight || '0.000'} g</Text>
            <Text style={styles.colRate}>—</Text>
            <Text style={styles.colTotal}>—</Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
            <Text style={styles.colDesc}>Net Gold ({data.purityName})</Text>
            <Text style={styles.colWeight}>{data.netGoldWeight} g</Text>
            <Text style={styles.colRate}>Rs. {Number(data.goldRate).toLocaleString('en-IN')}</Text>
            <Text style={styles.colTotal}>Rs. {Number(data.goldValue || 0).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>
              {data.costType === 'Labor' ? 'Labor Charges' : `Wastage Premium (${data.wastagePct}%)`}
            </Text>
            <Text style={styles.colWeight}>{data.netGoldWeight} g</Text>
            <Text style={styles.colRate}>
              {data.costType === 'Labor' ? `Rs. ${data.laborRate}` : 'Dynamic'}
            </Text>
            <Text style={styles.colTotal}>
              Rs. {Number(data.processingCharge || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          {Number(data.diamondWeight) > 0 && (
            <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
              <Text style={styles.colDesc}>Diamonds</Text>
              <Text style={styles.colWeight}>{data.diamondWeight} ct</Text>
              <Text style={styles.colRate}>Rs. {Number(data.diamondRate).toLocaleString('en-IN')}</Text>
              <Text style={styles.colTotal}>Rs. {Number(data.totalDiamondCost || 0).toLocaleString('en-IN')}</Text>
            </View>
          )}

          {data.isCertEnabled && Number(data.totalCertCost) > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Diamond Lab Cert Fee</Text>
              <Text style={styles.colWeight}>{data.diamondWeight} ct</Text>
              <Text style={styles.colRate}>Rs. {Number(data.certRate || 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.colTotal}>Rs. {Number(data.totalCertCost || 0).toLocaleString('en-IN')}</Text>
            </View>
          )}

          {Number(data.colorStoneWeight) > 0 && (
            <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
              <Text style={styles.colDesc}>Color Stones</Text>
              <Text style={styles.colWeight}>{data.colorStoneWeight} ct</Text>
              <Text style={styles.colRate}>Rs. {Number(data.colorStoneRate || 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.colTotal}>Rs. {Number(data.totalColorStoneCost || 0).toLocaleString('en-IN')}</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryWrapper}>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#64748b' }}>Subtotal Framework:</Text>
              <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>Rs. {Number(data.subtotal || 0).toLocaleString('en-IN')}</Text>
            </View>
            
            {Number(data.appliedDiscount) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.discountText}>
                  Discount ({data.discountType === 'Percentage' ? `${data.discountValue}%` : 'Fixed'}):
                </Text>
                <Text style={styles.discountText}>-Rs. {Number(data.appliedDiscount).toLocaleString('en-IN')}</Text>
              </View>
            )}
            
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>TOTAL VALUATION:</Text>
              <Text style={styles.totalPrice}>Rs. {data.totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {data.imageSrc && (
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>ATTACHED ORNAMENT REFERENCE</Text>
            <Image src={data.imageSrc} style={styles.jewelryImage} />
          </View>
        )}

      </Page>
    </Document>
  );
};
