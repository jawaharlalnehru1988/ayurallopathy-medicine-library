# Medicine Library - Quick Reference

## ✅ Current Status

- **Nginx**: ✅ Configured and running
- **Application**: ✅ Built and deployed
- **Site**: ✅ Enabled at medicine.asknehru.com
- **DNS**: ⏳ Needs configuration in Hostinger
- **SSL**: ⏳ Pending (after DNS)

---

## 🎯 Next Steps

### 1. Configure DNS in Hostinger (REQUIRED)

```
Login: https://hpanel.hostinger.com
Domain: asknehru.com
Section: DNS/Name Servers

Add A Record:
  Type: A
  Name: medicine
  Points to: [Run: curl ifconfig.me]
  TTL: 14400
```

**Wait 5-10 minutes for propagation**

### 2. Verify DNS

```bash
# Check if DNS is propagated
dig medicine.asknehru.com

# Should return your server IP
```

### 3. Install SSL Certificate

```bash
cd /var/www/ayurallopathy-medicine-library
./setup-ssl.sh
```

---

## 📍 Important Locations

| Item | Path |
|------|------|
| Application Source | `/var/www/ayurallopathy-medicine-library` |
| Built Files | `/var/www/ayurallopathy-medicine-library/dist` |
| Nginx Config | `/etc/nginx/sites-available/medicine.asknehru` |
| Access Logs | `/var/log/nginx/medicine_asknehru_access.log` |
| Error Logs | `/var/log/nginx/medicine_asknehru_error.log` |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | https://medicine.asknehru.com (after DNS+SSL) |
| API | https://api.asknehru.com/api/medicines |
| Backend (local) | http://localhost:8082 |

---

## 🔧 Common Commands

### Deploy Updates
```bash
cd /var/www/ayurallopathy-medicine-library
npm run build
# Nginx serves files immediately
```

### Check Logs
```bash
# Access logs (real-time)
tail -f /var/log/nginx/medicine_asknehru_access.log

# Error logs (real-time)
tail -f /var/log/nginx/medicine_asknehru_error.log
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload (graceful)
sudo systemctl reload nginx

# Restart (if needed)
sudo systemctl restart nginx

# Status
sudo systemctl status nginx
```

### Backend Management
```bash
# Start backend
cd /var/www/spring-apps/asknehrubackend
./mvnw spring-boot:run

# Or if using service
sudo systemctl status asknehru-backend
sudo systemctl start asknehru-backend
```

---

## 🧪 Testing

### Test Backend API
```bash
# Local
curl http://localhost:8082/api/medicines

# Production
curl https://api.asknehru.com/api/medicines
```

### Test Frontend (after DNS)
```bash
# Check if site loads
curl -I http://medicine.asknehru.com

# Check if HTTPS works (after SSL)
curl -I https://medicine.asknehru.com
```

### Run Integration Tests
```bash
cd /var/www/ayurallopathy-medicine-library
./test-api-integration.sh
```

---

## 🐛 Troubleshooting

### Site Not Loading?
```bash
# 1. Check DNS
dig medicine.asknehru.com

# 2. Check Nginx
sudo nginx -t
sudo systemctl status nginx

# 3. Check files exist
ls -la /var/www/ayurallopathy-medicine-library/dist/
```

### API Not Working?
```bash
# 1. Check backend
curl http://localhost:8082/api/medicines

# 2. Check backend service
sudo systemctl status asknehru-backend

# 3. Check Spring Boot logs
cd /var/www/spring-apps/asknehrubackend
tail -f logs/application.log
```

### 502 Bad Gateway?
```bash
# Backend is not running
cd /var/www/spring-apps/asknehrubackend
./mvnw spring-boot:run
```

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| DNS not resolving | Wait 10 minutes, check Hostinger config |
| SSL not working | Run `./setup-ssl.sh` after DNS works |
| 404 errors | Check nginx config, run `nginx -t` |
| API errors | Check backend is running on port 8082 |
| Build errors | Run `npm install` then `npm run build` |

---

## 🎯 Full Deployment Steps

1. ✅ Build application: `npm run build`
2. ✅ Configure nginx
3. ✅ Enable site
4. ✅ Reload nginx
5. ⏳ Configure DNS in Hostinger
6. ⏳ Wait for DNS propagation (5-10 min)
7. ⏳ Run `./setup-ssl.sh` for HTTPS
8. ⏳ Test site at https://medicine.asknehru.com

---

**Status**: Ready for DNS configuration  
**Updated**: February 12, 2026
