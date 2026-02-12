# Medicine Library - Deployment Guide

## 🚀 Deployment Summary

The Ayurallopathy Medicine Library has been successfully configured for deployment at **medicine.asknehru.com**.

## 📋 Configuration Files

### Nginx Configuration
- **File**: `/etc/nginx/sites-available/medicine.asknehru`
- **Enabled**: `/etc/nginx/sites-enabled/medicine.asknehru`
- **Web Root**: `/var/www/ayurallopathy-medicine-library/dist`
- **Subdomain**: medicine.asknehru.com

### Application Configuration
- **Source**: `/var/www/ayurallopathy-medicine-library`
- **Built Files**: `/var/www/ayurallopathy-medicine-library/dist`
- **API URL**: `https://api.asknehru.com/api/medicines`
- **Environment**: Production

## 🔧 What Has Been Done

### 1. Nginx Configuration ✅
- Created nginx server block for medicine.asknehru.com
- Configured static file serving from dist folder
- Set up API proxy to Spring Boot backend (port 8082)
- Added gzip compression for better performance
- Configured proper caching headers
- Added security headers
- Set up SPA routing (all routes serve index.html)

### 2. Application Build ✅
- Updated .env file with production API URL
- Built production bundle with `npm run build`
- Generated optimized assets in dist/ folder

### 3. Site Enablement ✅
- Created symbolic link in sites-enabled
- Tested nginx configuration
- Reloaded nginx service

## 📝 DNS Configuration Required

Before the site can be accessed, you need to configure DNS in **Hostinger**:

### Steps:

1. **Login to Hostinger Control Panel**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)

2. **Navigate to DNS Settings**
   - Select your domain: asknehru.com
   - Go to: DNS/Name Servers section

3. **Add A Record**
   ```
   Type: A Record
   Name: medicine
   Points to: [Your Server IP]
   TTL: 14400 (or default)
   ```

4. **Get Your Server IP**
   ```bash
   curl ifconfig.me
   ```

5. **Wait for DNS Propagation**
   - Usually takes 5-10 minutes
   - Can take up to 24 hours in some cases

## 🔐 SSL Certificate Setup

Once DNS is configured and propagated, run the SSL setup script:

```bash
cd /var/www/ayurallopathy-medicine-library
./setup-ssl.sh
```

The script will:
- Check DNS configuration
- Verify DNS points to correct IP
- Install SSL certificate via Let's Encrypt
- Configure automatic certificate renewal
- Update nginx configuration for HTTPS

### Manual SSL Setup (Alternative)

If you prefer to run manually:

```bash
sudo certbot --nginx -d medicine.asknehru.com
```

## 🌐 Site Access

### After DNS + SSL Setup:
- **Main Site**: https://medicine.asknehru.com
- **API Endpoint**: https://api.asknehru.com/api/medicines

### Temporary Access (Before DNS):
You can test locally by adding to `/etc/hosts`:
```
[Your-Server-IP] medicine.asknehru.com
```

Then access via: http://medicine.asknehru.com

## 🔄 Deployment Workflow

### For Future Updates:

```bash
# 1. Navigate to project directory
cd /var/www/ayurallopathy-medicine-library

# 2. Pull latest changes (if using git)
git pull origin main

# 3. Install dependencies (if package.json changed)
npm install

# 4. Build production bundle
npm run build

# 5. Nginx will automatically serve new files
# No restart needed - files are read on each request
```

### Quick Deploy Script

Create a deploy script:

```bash
#!/bin/bash
cd /var/www/ayurallopathy-medicine-library
git pull origin main
npm install
npm run build
echo "✓ Deployment complete!"
```

## 📊 Monitoring

### Check Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/medicine_asknehru_access.log

# Error logs
tail -f /var/log/nginx/medicine_asknehru_error.log
```

### Check Nginx Status

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx (if needed)
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## 🛠️ Troubleshooting

### Issue: Site Not Loading

**Check DNS:**
```bash
dig medicine.asknehru.com
nslookup medicine.asknehru.com
```

**Check Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Check if files exist:**
```bash
ls -la /var/www/ayurallopathy-medicine-library/dist/
```

### Issue: API Not Working

**Test API directly:**
```bash
curl https://api.asknehru.com/api/medicines
```

**Check backend is running:**
```bash
curl http://localhost:8082/api/medicines
```

**Check Spring Boot logs:**
```bash
cd /var/www/spring-apps/asknehrubackend
./mvnw spring-boot:run
```

### Issue: 502 Bad Gateway

- Backend Spring Boot server is not running
- Check port 8082 is accessible
- Review Spring Boot logs

**Start backend:**
```bash
cd /var/www/spring-apps/asknehrubackend
./mvnw spring-boot:run
```

Or if using systemd service:
```bash
sudo systemctl status asknehru-backend
sudo systemctl start asknehru-backend
```

### Issue: 404 on Refresh

- This usually means SPA routing is not configured properly
- Check nginx `try_files $uri $uri/ /index.html;` directive

### Issue: CORS Errors

- Backend already has CORS configured
- If still having issues, check nginx proxy headers
- Verify API URL in browser console

## 🔒 Security Checklist

- ✅ HTTPS/SSL certificate (after running setup-ssl.sh)
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- ✅ Gzip compression enabled
- ✅ Static asset caching
- ⚠️ Consider adding rate limiting
- ⚠️ Consider adding fail2ban for brute force protection

## 📈 Performance Optimization

### Current Optimizations:
- Gzip compression enabled
- Static assets cached for 30 days
- JS/CSS bundles minified
- Production build optimized

### Future Improvements:
- Add CDN (Cloudflare)
- Implement HTTP/2
- Add service worker for offline support
- Optimize images with lazy loading

## 🔄 Backup Strategy

### Application Files:
```bash
# Backup entire application
tar -czf ayurallopathy-backup-$(date +%Y%m%d).tar.gz \
  /var/www/ayurallopathy-medicine-library

# Restore
tar -xzf ayurallopathy-backup-20260212.tar.gz -C /
```

### Database:
```bash
# Backup PostgreSQL
pg_dump -U demoappuser demoappdb > medicine-db-$(date +%Y%m%d).sql

# Restore
psql -U demoappuser demoappdb < medicine-db-20260212.sql
```

## 📞 Support Information

### Important URLs:
- **Frontend**: https://medicine.asknehru.com (after DNS setup)
- **Backend API**: https://api.asknehru.com/api/medicines
- **Backend Docs**: [MEDICINE_API_README.md](/var/www/spring-apps/asknehrubackend/MEDICINE_API_README.md)

### Log Locations:
- **Nginx Access**: `/var/log/nginx/medicine_asknehru_access.log`
- **Nginx Error**: `/var/log/nginx/medicine_asknehru_error.log`
- **Spring Boot**: Check application logs in Spring Boot directory

### Service Commands:
```bash
# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo systemctl restart nginx

# PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

## 📋 Post-Deployment Checklist

After DNS and SSL are configured:

- [ ] Site loads at https://medicine.asknehru.com
- [ ] SSL certificate is valid (green padlock)
- [ ] API calls work (test adding a medicine)
- [ ] All pages load correctly
- [ ] Search functionality works
- [ ] Create/Read/Update/Delete operations work
- [ ] Dashboard displays data correctly
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] SSL auto-renewal is configured

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ DNS resolves to correct IP
2. ✅ HTTPS is working with valid certificate
3. ✅ Application loads without errors
4. ✅ API integration works
5. ✅ All CRUD operations function
6. ✅ Data persists in database

---

**Last Updated**: February 12, 2026  
**Deployment Status**: Configured (Awaiting DNS + SSL)  
**Version**: 1.0.0
