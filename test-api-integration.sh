#!/bin/bash

# Integration Test Script for Medicine Library API
# This script tests the API integration between frontend and backend

echo "==================================="
echo "Medicine Library API Integration Test"
echo "==================================="
echo ""

API_URL="http://localhost:8082/api/medicines"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -n "1. Checking if backend is running..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL" | grep -q "200"; then
    echo -e " ${GREEN}✓ Backend is running${NC}"
else
    echo -e " ${RED}✗ Backend is not responding${NC}"
    echo "   Please start the backend first:"
    echo "   cd /var/www/spring-apps/asknehrubackend && ./mvnw spring-boot:run"
    exit 1
fi

echo ""

# Test GET all medicines
echo -n "2. Testing GET all medicines..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e " ${GREEN}✓ Success${NC}"
    COUNT=$(echo "$RESPONSE" | head -n-1 | jq '. | length' 2>/dev/null || echo "0")
    echo "   Found $COUNT medicine(s)"
else
    echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test POST create medicine
echo -n "3. Testing POST create medicine..."
CREATE_DATA='{
  "name": "Integration Test Medicine",
  "brand": "Test Brand",
  "category": "AYURVEDIC",
  "quantity": 100,
  "unit": "Tablets",
  "expiryDate": "2025-12-31",
  "description": "This is a test medicine created by the integration test script"
}'

CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$CREATE_DATA")

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "201" ]; then
    echo -e " ${GREEN}✓ Success${NC}"
    CREATED_ID=$(echo "$CREATE_RESPONSE" | head -n-1 | jq -r '.id' 2>/dev/null)
    echo "   Created medicine with ID: $CREATED_ID"
else
    echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    CREATED_ID=""
fi

echo ""

# Test GET by ID (if we created one)
if [ -n "$CREATED_ID" ]; then
    echo -n "4. Testing GET medicine by ID..."
    GET_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/$CREATED_ID")
    HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e " ${GREEN}✓ Success${NC}"
        NAME=$(echo "$GET_RESPONSE" | head -n-1 | jq -r '.name' 2>/dev/null)
        echo "   Retrieved: $NAME"
    else
        echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    fi
    
    echo ""
    
    # Test PUT update medicine
    echo -n "5. Testing PUT update medicine..."
    UPDATE_DATA='{
      "quantity": 50,
      "description": "Updated test description"
    }'
    
    UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/$CREATED_ID" \
      -H "Content-Type: application/json" \
      -d "$UPDATE_DATA")
    
    HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e " ${GREEN}✓ Success${NC}"
        NEW_QTY=$(echo "$UPDATE_RESPONSE" | head -n-1 | jq -r '.quantity' 2>/dev/null)
        echo "   Updated quantity: $NEW_QTY"
    else
        echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    fi
    
    echo ""
    
    # Test DELETE medicine
    echo -n "6. Testing DELETE medicine..."
    DELETE_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$API_URL/$CREATED_ID")
    if [ "$DELETE_RESPONSE" == "204" ]; then
        echo -e " ${GREEN}✓ Success${NC}"
        echo "   Test medicine deleted"
    else
        echo -e " ${RED}✗ Failed (HTTP $DELETE_RESPONSE)${NC}"
    fi
fi

echo ""

# Test search functionality
echo -n "7. Testing search by name..."
SEARCH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/search?name=test")
HTTP_CODE=$(echo "$SEARCH_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e " ${GREEN}✓ Success${NC}"
else
    echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test expiring soon
echo -n "8. Testing expiring soon query..."
EXPIRING_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/expiring-soon?days=90")
HTTP_CODE=$(echo "$EXPIRING_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e " ${GREEN}✓ Success${NC}"
    COUNT=$(echo "$EXPIRING_RESPONSE" | head -n-1 | jq '. | length' 2>/dev/null || echo "0")
    echo "   Found $COUNT medicine(s) expiring in 90 days"
else
    echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test low stock
echo -n "9. Testing low stock query..."
LOW_STOCK_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/low-stock?threshold=20")
HTTP_CODE=$(echo "$LOW_STOCK_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e " ${GREEN}✓ Success${NC}"
    COUNT=$(echo "$LOW_STOCK_RESPONSE" | head -n-1 | jq '. | length' 2>/dev/null || echo "0")
    echo "   Found $COUNT medicine(s) with low stock"
else
    echo -e " ${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "==================================="
echo "Integration Test Complete"
echo "==================================="
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start the frontend: cd /var/www/ayurallopathy-medicine-library && npm run dev"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Test the UI by adding, editing, and deleting medicines"
echo ""
