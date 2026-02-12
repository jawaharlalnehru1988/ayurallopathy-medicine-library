#!/bin/bash

# Setup Script for medicine.asknehru.com
# This script helps set up SSL certificate for the medicine subdomain

echo "=========================================="
echo "Medicine Library - SSL Setup"
echo "=========================================="
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Error: certbot is not installed"
    echo "Install with: sudo apt install certbot python3-certbot-nginx"
    exit 1
fi

echo "Prerequisites checklist:"
echo "========================"
echo "Before running SSL setup, make sure:"
echo ""
echo "1. ☐ DNS A record for medicine.asknehru.com points to this server's IP"
echo "2. ☐ The subdomain is configured in Hostinger DNS panel"
echo "3. ☐ DNS changes have propagated (wait 5-10 minutes after adding)"
echo "4. ☐ Port 80 and 443 are open in firewall"
echo ""
read -p "Have you completed all the above steps? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo ""
    echo "Please complete the prerequisites first:"
    echo ""
    echo "Steps to configure DNS in Hostinger:"
    echo "1. Login to Hostinger control panel"
    echo "2. Go to Domains → DNS/Name Servers"
    echo "3. Add A record:"
    echo "   Type: A"
    echo "   Name: medicine"
    echo "   Points to: $(curl -s ifconfig.me)"
    echo "   TTL: 14400 (or default)"
    echo ""
    echo "After adding, wait 5-10 minutes for DNS propagation"
    echo "Then run this script again."
    exit 0
fi

echo ""
echo "Checking DNS resolution..."
DNS_IP=$(dig +short medicine.asknehru.com | head -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ -z "$DNS_IP" ]; then
    echo "⚠️  Warning: DNS record not found for medicine.asknehru.com"
    echo "Please check your DNS configuration in Hostinger"
    exit 1
elif [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo "⚠️  Warning: DNS points to $DNS_IP but server IP is $SERVER_IP"
    echo "Please update your DNS record"
    exit 1
else
    echo "✓ DNS is correctly configured: $DNS_IP"
fi

echo ""
echo "Obtaining SSL certificate..."
echo "This will use Let's Encrypt to get a free SSL certificate"
echo ""

# Run certbot
sudo certbot --nginx -d medicine.asknehru.com

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ SSL Certificate Installed Successfully!"
    echo "=========================================="
    echo ""
    echo "Your medicine library is now available at:"
    echo "https://medicine.asknehru.com"
    echo ""
    echo "The certificate will auto-renew before expiry."
    echo ""
    echo "Next steps:"
    echo "1. Test the site: https://medicine.asknehru.com"
    echo "2. Verify API connection works"
    echo "3. Add/edit a medicine to test full functionality"
    echo ""
else
    echo ""
    echo "❌ SSL setup failed"
    echo "Please check the error messages above"
    echo ""
    echo "Common issues:"
    echo "- DNS not propagated yet (wait longer)"
    echo "- Port 80/443 blocked by firewall"
    echo "- Domain already has too many certificates this week"
    echo ""
fi
