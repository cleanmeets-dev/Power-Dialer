# Power Dialer Frontend - Backend Integration Guide

## ✅ Completed Implementation

All components and API integration have been successfully implemented. The frontend is now ready to communicate with your Power Dialer backend API.

## 📁 Project Structure

```
src/
├── components/
│   ├── ActiveCalls.jsx           # Display real-time active calls
│   ├── CampaignSelector.jsx      # Create/select campaigns
│   ├── DialerControls.jsx        # Start/Stop dialing
│   ├── FileUpload.jsx            # Upload leads CSV/TXT
│   ├── LeadsTable.jsx            # View and manage leads
│   ├── LoadingSpinner.jsx        # Loading indicator
│   └── StatsCard.jsx             # Reusable stats display
├── services/
│   └── api.js                    # All API endpoints
├── App.jsx                       # Main orchestrator
└── main.jsx
```

## 🚀 Getting Started

### Step 1: Start Your Backend
```bash
cd backend
npm run dev
# Backend should be running on http://localhost:3000
```

### Step 2: Start Your Frontend
```bash
cd frontend
npm run dev
# Frontend will be on http://localhost:5173
```

### Step 3: Test the Application

**Complete Workflow:**
1. Open the app in your browser
2. Click "New" to create a campaign (or select existing)
3. Upload a CSV file with phone numbers (one per line)
4. Click "Start Dialer" to begin
5. Watch stats update in real-time
6. Click "Stop Dialer" when done

## 🔌 API Integration Details

### API Service (`src/services/api.js`)

All 8 backend endpoints are wrapped in convenient functions:

#### Campaigns
- `createCampaign(name)` - Create new campaign
- `getCampaigns()` - Fetch all campaigns
- `getCampaign(id)` - Get single campaign
- `updateCampaign(id, updates)` - Update campaign
- `deleteCampaign(id)` - Delete campaign

#### Leads
- `uploadLeads(file, campaignId)` - Upload CSV file
- `getLeads(campaignId, status)` - Fetch leads with optional status filter
- `deleteLead(id)` - Delete single lead

#### Dialer
- `startDialing(campaignId)` - Start dialing campaign
- `stopDialing(campaignId)` - Stop dialing campaign
- `getDialerStatus(campaignId)` - Get real-time status
- `getCallLogs(campaignId)` - Get active calls list

### Setting API Base URL

Default: `http://localhost:3000/api`

To customize, create `.env` file:
```
VITE_API_BASE_URL=http://your-api-url/api
```

## 🎯 Key Features Implemented

### 1. Campaign Management
- **CampaignSelector** component allows:
  - Creating new campaigns
  - Selecting existing campaigns
  - Auto-loading campaign data

### 2. File Upload
- **FileUpload** component:
  - Drag-and-drop support
  - CSV/TXT file format
  - Real-time success messages
  - Error handling

### 3. Real-Time Dialing
- **DialerControls** component:
  - Start/Stop buttons
  - Poly checking before start
  - Visual feedback during dialing

### 4. Live Updates
- **Polling mechanism** (every 2 seconds):
  - Updates dialed count
  - Updates connected count
  - Updates in-progress calls
  - Fetches active call list

### 5. Error & Success Notifications
- Toast notifications appear for:
  - Successful campaign creation
  - Lead upload completion
  - Dialing started/stopped
  - Any API errors

## 🧠 How It Works

### Data Flow

```
User Action
    ↓
Component Handler
    ↓
API Service Function
    ↓
Backend API
    ↓
Response
    ↓
Update React State
    ↓
UI Re-renders
```

### Real-Time Updates

When dialing is active:
1. Polling starts every 2 seconds
2. `getDialerStatus()` fetches current stats
3. `getCallLogs()` fetches active calls
4. React state updates trigger re-render
5. Polling stops when campaign completes

## 📊 Component Hierarchy

```
App.jsx (Main Orchestrator)
├── CampaignSelector
├── StatsCard (4x)
├── FileUpload
├── DialerControls
├── ActiveCalls
└── LeadsTable
```

## 🔧 Configuration

### Environment Variables

```env
# Optional - defaults to localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
```

### Polling Interval

Edit `App.jsx` line 40 to change polling frequency:
```javascript
const interval = setInterval(pollStatus, 2000); // 2000ms = 2 seconds
```

### Notification Timeout

Edit `App.jsx` to change notification duration:
```javascript
const showSuccess = (message) => {
  setSuccessMessage(message);
  setTimeout(() => setSuccessMessage(''), 3000); // 3 second timeout
};
```

## 🧪 Testing Checklist

### Basic Functionality
- [ ] App loads without errors
- [ ] Backend connection successful
- [ ] Campaign dropdown populated or "New" button works

### Campaign Management
- [ ] Create new campaign
- [ ] Campaign appears in dropdown
- [ ] Select campaign shows "✓ Campaign selected"

### Lead Upload
- [ ] Upload CSV file
- [ ] Success message appears
- [ ] Leads table populates
- [ ] Total Leads stat updates

### Dialing
- [ ] Click Start Dialer
- [ ] "Dialing running..." indicator shows
- [ ] Stats update in real-time
- [ ] Click Stop Dialer
- [ ] Dialing stops

### Real-Time Updates
- [ ] Dialed count increases
- [ ] Connected count increases
- [ ] Active calls list updates
- [ ] Call status changes (connecting → connected)

### Error Handling
- [ ] Try upload without campaign → Error message
- [ ] Try start without leads → Error message
- [ ] Try upload invalid file → Error message
- [ ] Disconnect backend → Error messages show

### UI/UX
- [ ] Dark theme displays correctly
- [ ] Responsive on mobile
- [ ] Buttons disable properly
- [ ] Icons load correctly
- [ ] Text is readable

## 🐛 Troubleshooting

### Backend Not Responding

```bash
# Check backend is running
curl http://localhost:3000/api/campaigns

# If error, check:
# 1. Backend is running
# 2. Port 3000 is available
# 3. No firewall blocking
# 4. Check backend logs
```

### Stats Not Updating

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Verify campaignId is being sent
5. Check backend is processing

### File Upload Fails

1. Verify file is CSV or TXT
2. Check file has phone numbers
3. Ensure campaign is selected
4. Check backend file upload handler
5. Check file size limits

### API Connection Error

```javascript
// Test in browser console:
import { getCampaigns } from './services/api.js'
getCampaigns().then(console.log)

// Should return campaign array or error
```

## 📝 Code Examples

### Adding a New Feature

**Example: Add refresh campaigns button**

```jsx
// In CampaignSelector.jsx
<button onClick={loadCampaigns} className="...">
  <RefreshCw className="w-5 h-5" />
  Refresh
</button>
```

### Modifying Polling Rate

```jsx
// In App.jsx, change polling interval
const interval = setInterval(pollStatus, 5000); // 5 seconds instead of 2
```

### Adding Custom Styles

```jsx
// All components use Tailwind CSS
// Add classes directly to elements
className="bg-gradient-to-r from-cyan-500 to-cyan-600 ..."
```

## 🔐 Security Considerations

- Keep API base URL in environment variables
- Don't hardcode sensitive data
- Validate file uploads on backend
- Use HTTPS in production
- Implement authentication if needed

## 📚 Additional Resources

### API Endpoints Reference
- **POST** `/api/campaigns` - Create campaign
- **GET** `/api/campaigns` - List campaigns
- **GET** `/api/campaigns/:id` - Get campaign
- **PUT** `/api/campaigns/:id` - Update campaign
- **DELETE** `/api/campaigns/:id` - Delete campaign
- **POST** `/api/leads/upload` - Upload leads
- **GET** `/api/leads` - Get leads
- **DELETE** `/api/leads/:id` - Delete lead
- **POST** `/api/dialer/start` - Start dialing
- **POST** `/api/dialer/stop` - Stop dialing
- **GET** `/api/dialer/status` - Get status
- **GET** `/api/dialer/calls` - Get calls

### Useful Libraries
- `axios` - HTTP client
- `lucide-react` - Icons
- `tailwindcss` - Styling

## ✨ What's Next?

### Enhancement Ideas
1. **Campaign Analytics**
   - Add charts showing call outcomes
   - Success rate percentages

2. **Advanced Filtering**
   - Filter leads by status
   - Search by phone number

3. **Batch Operations**
   - Retry failed calls
   - Bulk delete leads

4. **Export & Reports**
   - Export call logs to CSV
   - Generate PDF reports

5. **Agent Performance**
   - Track individual agent stats
   - Agent assignment panel

6. **Call Recording**
   - Play call recordings
   - Review conversations

## 🎓 Learning Path

1. **Understand Components** - Read each component file
2. **Understand API Layer** - Review `services/api.js`
3. **Understand State Management** - Read `App.jsx` hooks
4. **Customize Styling** - Modify Tailwind classes
5. **Add New Features** - Follow existing patterns

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check network tab for failed requests
3. Verify backend is responding
4. Try refreshing the page
5. Check this documentation

## 🎉 You're All Set!

Your Power Dialer frontend is now fully integrated with the backend. The application is ready for:

✅ Campaign creation and management  
✅ Lead file uploads  
✅ Real-time dialing  
✅ Live statistics  
✅ Error handling and notifications  

Happy dialing! 📞
