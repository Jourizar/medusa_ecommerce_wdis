#!/bin/bash
# Fix sales channels for seeded products
# Run this from the project root: bash fix-sales-channels.sh

ADMIN_TOKEN=$(curl -s -X POST http://localhost:9000/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@store.com","password":"admin_password"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

SC_ID=$(curl -s http://localhost:9000/admin/sales-channels \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sales_channels'][0]['id'])")

echo "Sales Channel ID: $SC_ID"

PRODUCT_IDS=(
  "prod_01KNTGPYHY1D1KYV396BWAJRQV"
  "prod_01KNTGPYMQ6PNEJ25A9E0TCGTW"
  "prod_01KNTGPYP43BMP04XSWM8BPRW0"
  "prod_01KNTGPYQ91DBK6M6WJHZ7XE6H"
  "prod_01KNTGPYRC92DWNDKADPFWAQQ7"
)

for PROD_ID in "${PRODUCT_IDS[@]}"; do
  curl -s -X POST "http://localhost:9000/admin/products/$PROD_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"sales_channels\": [{\"id\": \"$SC_ID\"}]}" > /dev/null 2>&1
  echo "Updated: $PROD_ID"
done

echo ""
echo "Done! Refresh http://localhost:3000 to see products."
