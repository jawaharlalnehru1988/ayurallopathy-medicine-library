# Medicine Library - API Integration Guide

## Overview
The Ayurallopathy Medicine Library frontend has been successfully integrated with the Spring Boot backend API. This document provides details on the integration, configuration, and usage.

## Integration Architecture

### Frontend (React + TypeScript + Vite)
- **Location**: `/var/www/ayurallopathy-medicine-library`
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **API Client**: Custom fetch-based service

### Backend (Spring Boot)
- **Location**: `/var/www/spring-apps/asknehrubackend`
- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL
- **API Base URL**: `http://localhost:8082/api/medicines`

## Files Modified/Created

### New Files
1. **`services/medicineApi.ts`** - API client service for CRUD operations
2. **`.env`** - Environment configuration (not committed)
3. **`.env.example`** - Environment configuration template
4. **`API_INTEGRATION.md`** - This documentation

### Modified Files
1. **`App.tsx`** - Updated to use API instead of localStorage
2. **`.gitignore`** - Added .env to prevent committing secrets

## Configuration

### 1. Environment Variables

Create a `.env` file in the project root (already created):

```env
VITE_API_URL=http://localhost:8082/api/medicines
```

For production, update this to your production API URL:

```env
VITE_API_URL=https://api.yourdomain.com/api/medicines
```

### 2. Backend Configuration

Ensure the Spring Boot backend is running on port 8082:

```properties
# application.properties
server.port=8082
spring.datasource.url=jdbc:postgresql://localhost:5432/demoappdb
```

### 3. CORS Configuration

The backend controller already includes CORS support:

```java
@CrossOrigin(origins = "*")
public class MedicineController {
    // ...
}
```

For production, restrict to specific origins:

```java
@CrossOrigin(origins = "https://yourdomain.com")
```

## API Service Methods

The `medicineApi` service provides the following methods:

### Basic CRUD Operations

```typescript
// Get all medicines
const medicines = await medicineApi.getAll();

// Get medicine by ID
const medicine = await medicineApi.getById('123');

// Create new medicine
const newMedicine = await medicineApi.create({
  name: 'Ashwagandha',
  category: MedicineCategory.AYURVEDIC,
  quantity: 100,
  unit: 'Tablets',
  expiryDate: '2025-12-31'
});

// Update medicine
const updated = await medicineApi.update('123', {
  quantity: 150,
  location: 'Shelf B2'
});

// Delete medicine
await medicineApi.delete('123');
```

### Advanced Queries

```typescript
// Get by category
const ayurvedicMeds = await medicineApi.getByCategory(MedicineCategory.AYURVEDIC);

// Search by name
const results = await medicineApi.searchByName('ashwa');

// Get expiring soon (within 30 days)
const expiring = await medicineApi.getExpiringSoon(30);

// Get expired medicines
const expired = await medicineApi.getExpired();

// Get low stock medicines (below threshold)
const lowStock = await medicineApi.getLowStock(10);
```

## Features

### 1. Automatic Data Mapping
The API service automatically converts between frontend and backend data formats:
- Backend uses `Long` for IDs, frontend uses `string`
- Backend uses `LocalDate`, frontend uses `string` (ISO format)
- All date/time conversions are handled automatically

### 2. Error Handling
The app includes comprehensive error handling:
- API failures fall back to localStorage
- User-friendly error messages
- Console logging for debugging

### 3. Loading States
The UI shows loading indicators during API calls:
```typescript
const [loading, setLoading] = useState(true);
```

### 4. Offline Fallback
If the API is unavailable:
- App falls back to localStorage for reading
- Changes are still saved locally
- Data syncs when API becomes available again

## Running the Application

### 1. Start the Backend

```bash
cd /var/www/spring-apps/asknehrubackend
./mvnw spring-boot:run
```

Backend will be available at: `http://localhost:8082`

### 2. Start the Frontend

```bash
cd /var/www/ayurallopathy-medicine-library
npm install  # If not already installed
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Data Flow

### Creating a Medicine

```
User fills form → MedicineForm calls onSubmit() →
App.handleAddMedicine() → medicineApi.create() →
POST /api/medicines → Spring Controller →
Service Layer → Repository → PostgreSQL →
Response flows back → UI updates
```

### Updating a Medicine

```
User edits form → MedicineForm calls onSubmit() →
App.handleUpdateMedicine() → medicineApi.update() →
PUT /api/medicines/{id} → Spring Controller →
Service Layer → Repository → PostgreSQL →
Response flows back → UI updates
```

### Deleting a Medicine

```
User clicks delete → Confirmation dialog →
App.handleDeleteMedicine() → medicineApi.delete() →
DELETE /api/medicines/{id} → Spring Controller →
Service Layer → Repository → PostgreSQL →
Success response → UI updates
```

## Database Schema

The backend automatically creates the following tables:

### medicines (Main Table)
- `id` - bigint (Primary Key)
- `name` - varchar(200)
- `brand` - varchar(200)
- `category` - varchar(50)
- `quantity` - integer
- `unit` - varchar(50)
- `expiry_date` - date
- `manufacture_date` - date
- `description` - text
- `dosage_instructions` - text
- `location` - varchar(200)
- `created_at` - timestamp
- `last_updated` - timestamp

### medicine_ingredients (Junction Table)
- `medicine_id` - bigint (Foreign Key)
- `ingredient` - varchar(255)

### medicine_side_effects (Junction Table)
- `medicine_id` - bigint (Foreign Key)
- `side_effect` - varchar(255)

### medicine_benefits (Junction Table)
- `medicine_id` - bigint (Foreign Key)
- `benefit` - varchar(255)

## Testing the Integration

### 1. Test Backend Directly

```bash
# Get all medicines
curl http://localhost:8082/api/medicines

# Create a medicine
curl -X POST http://localhost:8082/api/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Medicine",
    "category": "AYURVEDIC",
    "quantity": 50,
    "unit": "Tablets",
    "expiryDate": "2025-12-31"
  }'
```

### 2. Test Frontend
1. Open `http://localhost:5173` in your browser
2. Click "Add Medicine"
3. Fill in the form and submit
4. Verify the medicine appears in the list
5. Check the Spring Boot console for API calls
6. Verify data in PostgreSQL

### 3. Verify Database

```sql
-- Connect to PostgreSQL
psql -U demoappuser -d demoappdb

-- Query medicines
SELECT * FROM medicines;

-- Query with related data
SELECT m.name, m.category, string_agg(mb.benefit, ', ') as benefits
FROM medicines m
LEFT JOIN medicine_benefits mb ON m.id = mb.medicine_id
GROUP BY m.id, m.name, m.category;
```

## Troubleshooting

### Problem: API calls fail with CORS errors

**Solution**: 
1. Check backend CORS configuration in `MedicineController.java`
2. Ensure `@CrossOrigin(origins = "*")` is present
3. Restart the Spring Boot application

### Problem: "Failed to load medicines" error

**Solution**:
1. Verify backend is running: `curl http://localhost:8082/api/medicines`
2. Check database connection in `application.properties`
3. Review Spring Boot logs for errors
4. Ensure PostgreSQL is running: `sudo systemctl status postgresql`

### Problem: Data not persisting

**Solution**:
1. Check database configuration
2. Verify `spring.jpa.hibernate.ddl-auto=update` in `application.properties`
3. Check database user permissions
4. Review Spring Boot logs for JPA/Hibernate errors

### Problem: Environment variables not loading

**Solution**:
1. Ensure `.env` file exists in project root
2. Restart the Vite dev server
3. Verify variable name starts with `VITE_`
4. Check for syntax errors in `.env` file

### Problem: Type mismatches

**Solution**:
The API service handles type conversions automatically. If you see errors:
1. Check the `toMedicine()` function in `medicineApi.ts`
2. Verify backend response format matches `MedicineResponse` interface
3. Check TypeScript console for type errors

## Advanced Features

### 1. Search Functionality

You can add a search feature to the UI:

```typescript
const [searchTerm, setSearchTerm] = useState('');

const handleSearch = async () => {
  if (searchTerm) {
    const results = await medicineApi.searchByName(searchTerm);
    setMedicines(results);
  } else {
    // Reload all medicines
    const all = await medicineApi.getAll();
    setMedicines(all);
  }
};
```

### 2. Filtering by Category

```typescript
const handleFilterByCategory = async (category: MedicineCategory) => {
  const filtered = await medicineApi.getByCategory(category);
  setMedicines(filtered);
};
```

### 3. Expiry Alerts

```typescript
useEffect(() => {
  const checkExpiring = async () => {
    const expiring = await medicineApi.getExpiringSoon(30);
    if (expiring.length > 0) {
      alert(`${expiring.length} medicines expiring soon!`);
    }
  };
  
  checkExpiring();
}, []);
```

### 4. Low Stock Alerts

```typescript
useEffect(() => {
  const checkLowStock = async () => {
    const lowStock = await medicineApi.getLowStock(10);
    if (lowStock.length > 0) {
      alert(`${lowStock.length} medicines are low on stock!`);
    }
  };
  
  checkLowStock();
}, []);
```

## Production Deployment

### 1. Update API URL

In `.env`:
```env
VITE_API_URL=https://api.yourdomain.com/api/medicines
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Deploy Files

Copy `dist/` contents to your web server:

```bash
# Example: Copy to nginx
sudo cp -r dist/* /var/www/html/medicine-library/
```

### 4. Configure Backend CORS

Update `MedicineController.java`:

```java
@CrossOrigin(origins = "https://yourdomain.com")
```

### 5. Update Nginx (if applicable)

```nginx
location /api/ {
    proxy_pass http://localhost:8082/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Security Considerations

### Frontend
- ✅ API URL configurable via environment variables
- ✅ No sensitive data in code
- ✅ `.env` excluded from git
- ⚠️ Add authentication headers if needed

### Backend
- ✅ Input validation with Jakarta Validation
- ✅ Exception handling for errors
- ✅ Transaction management
- ⚠️ Consider adding JWT authentication
- ⚠️ Restrict CORS in production
- ⚠️ Add rate limiting for API endpoints

## Performance Optimization

### Frontend
- Implement pagination for large datasets
- Add caching for frequently accessed data
- Use React.memo for expensive components
- Lazy load components

### Backend
- Add database indexes on frequently queried columns
- Implement query optimization
- Add caching layer (Redis)
- Enable GZIP compression

## Maintenance

### Regular Tasks
1. Monitor API response times
2. Check database size and performance
3. Review error logs regularly
4. Update dependencies
5. Backup database regularly

### Monitoring

Add logging to track API usage:

```typescript
// In medicineApi.ts
console.log(`[API] ${method} ${url}`, { timestamp: new Date() });
```

### Database Backup

```bash
# Backup PostgreSQL
pg_dump -U demoappuser demoappdb > backup_$(date +%Y%m%d).sql

# Restore
psql -U demoappuser demoappdb < backup_20260212.sql
```

## Future Enhancements

Potential improvements:
- [ ] Add pagination to API and UI
- [ ] Implement real-time updates with WebSockets
- [ ] Add batch operations (import/export CSV)
- [ ] Implement medicine image upload
- [ ] Add barcode scanning integration
- [ ] Create mobile-responsive PWA
- [ ] Add multi-user support with authentication
- [ ] Implement audit logging
- [ ] Add analytics dashboard
- [ ] Create automated backup system

## Support

For issues or questions:
- Check Spring Boot logs: `/var/www/spring-apps/asknehrubackend/logs`
- Check browser console for frontend errors
- Review PostgreSQL logs if database issues occur
- Refer to backend API documentation: `/var/www/spring-apps/asknehrubackend/MEDICINE_API_README.md`

## License

This integration is part of the AskNehru Backend and Ayurallopathy Medicine Library projects.

---

**Last Updated**: February 12, 2026
**Integration Version**: 1.0.0
