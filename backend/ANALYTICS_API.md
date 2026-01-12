# Voucher Analytics API

API endpoints for tracking voucher usage by users and vendors.

## Endpoints

### 1. Get User Voucher Usage
**GET** `/api/analytics/vouchers/user/:delegateId`

Get total voucher usage for a specific delegate.

**Authentication:** Required (delegates can view their own, admins can view any)

**Response:**
```json
{
  "success": true,
  "delegateId": "HRC-01",
  "summary": {
    "totalClaims": 5,
    "totalRedeemed": 3,
    "totalActive": 1,
    "totalExpired": 1
  },
  "vendorUsage": [
    {
      "vendorName": "Café Central",
      "totalClaims": 3,
      "totalRedeemed": 2,
      "vouchers": [...]
    }
  ],
  "claims": [...]
}
```

### 2. Get Vendor Usage
**GET** `/api/analytics/vouchers/vendor/:vendorName`

Get total usage statistics for a specific vendor.

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "vendorName": "Café Central",
  "summary": {
    "totalUsage": 150,
    "totalRedeemed": 120,
    "totalActive": 25,
    "uniqueUsers": 45
  },
  "vouchers": [...],
  "usageByVoucher": [
    {
      "voucherId": "...",
      "voucherName": "Free Coffee",
      "totalClaims": 80,
      "totalRedeemed": 65
    }
  ],
  "usageByDelegate": [...],
  "recentClaims": [...]
}
```

### 3. Get Overall Summary
**GET** `/api/analytics/vouchers/summary`

Get overall voucher usage statistics across all vendors and users.

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalClaims": 500,
    "totalRedeemed": 400,
    "totalActive": 80,
    "uniqueVendors": 5,
    "uniqueVouchers": 12,
    "uniqueUsers": 120
  },
  "vendorStats": [
    {
      "vendorName": "Café Central",
      "totalUsage": 150,
      "totalRedeemed": 120,
      "uniqueVouchers": 3,
      "uniqueUsers": 45
    }
  ],
  "voucherStats": [...],
  "topUsers": [...]
}
```

## Usage Examples

### Get a user's voucher usage:
```javascript
const response = await api.getUserVoucherUsage('HRC-01');
console.log(`Total vouchers claimed: ${response.summary.totalClaims}`);
```

### Get vendor statistics:
```javascript
const response = await api.getVendorUsage('Café Central');
console.log(`Total usage: ${response.summary.totalUsage}`);
console.log(`Unique users: ${response.summary.uniqueUsers}`);
```

### Get overall summary:
```javascript
const response = await api.getVoucherSummary();
console.log(`Total claims: ${response.summary.totalClaims}`);
console.log(`Top vendor: ${response.vendorStats[0].vendorName}`);
```

