import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

interface QuotePDFProps {
  data: {
    logoSrc?: string; // Binds the static branding emblem path string smoothly
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
    paddingBottom: 12,
    marginBottom: 15,
  },
  logoWrapper: {
    width: 140,
    height: 'auto',
    marginBottom: 6,
  },
  logoImage: {
    width: '100%',
  },
  brandingTextGroup: {
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  companyTagline: {
    fontSize: 8,
    color: '#b45309',
    fontWeight: 'bold',
    marginTop: 2,
  },
  contactText: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.3,
    marginTop: 4,
  },
  quoteBadgeContainer: {
    alignItems: 'flex-end',
  },
  quoteTitleBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 9,
    color: '#475569',
    marginTop: 5,
  },
  customerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerColumn: {
    width: '48%',
  },
  fieldLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  fieldValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  fieldValueMeta: {
    fontSize: 9,
    color: '#475569',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableRowAlternating: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  colDesc: { width: '40%' },
  colQty: { width: '20%', textAlign: 'right' },
  colRate: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  headerText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 'bold',
  },
  cellText: {
    fontSize: 9,
    color: '#334155',
  },
  cellTextBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  summaryWrapper: {
    width: '60%',
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
  },
  discountText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  imageSection: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  jewelryImage: {
    width: 200,
    height: 150,
    objectFit: 'contain',
    borderRadius: 6,
  },
});

export const QuotePDF: React.FC<QuotePDFProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. Spiritual Invocations */}
        <View style={styles.spiritualHeader}>
          <Text>|| Om Shree Ganeshay Namah ||  •  || Om Shree Shishoda Kshetrapal Bavji Namah ||  •  || Om Shree Purvaj Bavji Namah ||</Text>
        </View>

        {/* 2. Main Store Branding Row with Dynamic Image Toggle */}
        <View style={styles.headerContainer}>
          <View>
            {data.logoSrc ? (
              <View style={styles.logoWrapper}>
                <Image src={data.logoSrc} style={styles.logoImage} />
              </View>
            ) : (
              <View style={styles.brandingTextGroup}>
                <Text style={styles.companyName}>OM DIAMONDS</Text>
                <Text style={styles.companyTagline}>EXCLUSIVE DIAMOND JEWELLERY</Text>
              </View>
            )}
            
            <View style={styles.contactText}>
              <Text>📞 +91-897 6732 617</Text>
              <Text>📞 +91-865 5558 470</Text>
              <Text>✉️ omdiamond123@gmail.com</Text>
            </View>
          </View>
          
          <View style={styles.quoteBadgeContainer}>
            <Text style={styles.quoteTitleBadge}>Quotation</Text>
            <Text style={styles.dateText}>Date: {data.quoteDate || 'N/A'}</Text>
          </View>
        </View>

        {/* 3. Customer Credentials */}
        <View style={styles.customerCard}>
          <View style={styles.customerColumn}>
            <Text style={styles.fieldLabel}>Quotation For:</Text>
            <Text style={styles.fieldValue}>{data.customerName}</Text>
            {data.customerEmail && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.fieldLabel}>Email ID:</Text>
                <Text style={styles.fieldValueMeta}>{data.customerEmail}</Text>
              </View>
            )}
          </View>
          <View style={[styles.customerColumn, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0', paddingLeft: 12 }]}>
            <Text style={styles.fieldLabel}>Contact Line:</Text>
            <Text style={styles.fieldValue}>{data.customerPhone}</Text>
            <View style={{ marginTop: 4 }}>
              <Text style={styles.fieldLabel}>Item Type:</Text>
              <Text style={[styles.fieldValueMeta, { fontWeight: 'bold', color: '#92400e' }]}>
                {data.itemType || "Ornament Estimate"}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Tabular Item Ledger */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}><Text style={styles.headerText}>Description</Text></View>
            <View style={styles.colQty}><Text style={styles.headerText}>Weight/Qty</Text></View>
            <View style={styles.colRate}><Text style={styles.headerText}>Rate (Rs.)</Text></View>
            <View style={styles.colTotal}><Text style={styles.headerText}>Net Value</Text></View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colDesc}><Text style={styles.cellText}>Gross Weight</Text></View>
            <View style={styles.colQty}><Text style={styles.cellText}>{data.grossWeight || '0.000'} g</Text></View>
            <View style={styles.colRate}><Text style={{ color: '#94a3b8', textAlign: 'right' }}>—</Text></View>
            <View style={styles.colTotal}><Text style={{ color: '#94a3b8', textAlign: 'right' }}>—</Text></View>
          </View>

          <View style={styles.tableRowAlternating}>
            <View style={styles.colDesc}><Text style={styles.cellText}>Net Gold Weight ({data.purityName || '18K'})</Text></View>
            <View style={styles.colQty}><Text style={styles.cellText}>{data.netGoldWeight || '0.000'} g</Text></View>
            <View style={styles.colRate}><Text style={styles.cellText}>{Number(data.goldRate || 0).toLocaleString('en-IN')}</Text></View>
            <View style={styles.colTotal}><Text style={styles.cellTextBold}>Rs. {Number(data.goldValue || 0).toLocaleString('en-IN')}</Text></View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.cellText}>
                {data.costType === 'Labor' ? 'Labor Charges' : `Wastage Premium (${data.wastagePct || '0.0'}%)`}
              </Text>
            </View>
            <View style={styles.colQty}><Text style={styles.cellText}>{data.netGoldWeight || '0.000'} g</Text></View>
            <View style={styles.colRate}>
              <Text style={styles.cellText}>
                {data.costType === 'Labor' ? `${data.laborRate}` : 'Dynamic'}
              </Text>
            </View>
            <View style={styles.colTotal}><Text style={styles.cellTextBold}>Rs. {Number(data.processingCharge || 0).toLocaleString('en-IN')}</Text></View>
          </View>

          {Number(data.diamondWeight || 0) > 0 && (
            <View style={styles.tableRowAlternating}>
              <View style={styles.colDesc}><Text style={styles.cellText}>Diamonds</Text></View>
              <View style={styles.colQty}><Text style={styles.cellText}>{data.diamondWeight} ct</Text></View>
              <View style={styles.colRate}><Text style={styles.cellText}>{Number(data.diamondRate || 0).toLocaleString('en-IN')}</Text></View>
              <View style={styles.colTotal}><Text style={styles.cellTextBold}>Rs. {Number(data.totalDiamondCost || 0).toLocaleString('en-IN')}</Text></View>
            </View>
          )}

          {data.isCertEnabled && Number(data.totalCertCost || 0) > 0 && (
            <View style={styles.tableRow}>
              <View style={styles.colDesc}><Text style={styles.cellText}>Diamond Lab Cert Fee</Text></View>
              <View style={styles.colQty}><Text style={styles.cellText}>{data.diamondWeight} ct</Text></View>
              <View style={styles.colRate}><Text style={styles.cellText}>{Number(data.certRate || 0).toLocaleString('en-IN')}</Text></View>
              <View style={styles.colTotal}><Text style={styles.cellTextBold}>Rs. {Number(data.totalCertCost || 0).toLocaleString('en-IN')}</Text></View>
            </View>
          )}

          {Number(data.colorStoneWeight || 0) > 0 && (
            <View style={data.isCertEnabled ? styles.tableRowAlternating : styles.tableRow}>
              <View style={styles.colDesc}><Text style={styles.cellText}>Color Stones</Text></View>
              <View style={styles.colQty}><Text style={styles.cellText}>{data.colorStoneWeight} ct</Text></View>
              <View style={styles.colRate}><Text style={styles.cellText}>{Number(data.colorStoneRate || 0).toLocaleString('en-IN')}</Text></View>
              <View style={styles.colTotal}><Text style={styles.cellTextBold}>Rs. {Number(data.totalColorStoneCost || 0).toLocaleString('en-IN')}</Text></View>
            </View>
          )}
        </View>

        {/* 5. Pricing Summarization Ledger */}
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

        {/* 6. Live Snap Reference Attachment */}
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
