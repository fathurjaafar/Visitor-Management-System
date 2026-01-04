// Dashboard initialization
let allVisitors = [];
let filteredVisitors = [];

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    document.getElementById('currentTime').textContent = now.toLocaleString('en-MY', options);
}

// Update time every second
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Load visitors from localStorage
function loadVisitors() {
    allVisitors = JSON.parse(localStorage.getItem('visitors')) || [];
    filteredVisitors = [...allVisitors];
    return allVisitors;
}

// Update statistics
function updateStats() {
    const visitors = loadVisitors();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

// Today's entries
    const todayEntries = visitors.filter(v => {
        const entryDate = new Date(v.entryTime);
        return entryDate >= today;
    });

// Currently inside (status = 'entered')
    const currentInside = visitors.filter(v => v.status === 'entered');

    // Update DOM
    document.getElementById('todayEntries').textContent = todayEntries.length;
    document.getElementById('currentInside').textContent = currentInside.length;

    // Calculate average duration (simplified - in real app would track exit times)
    document.getElementById('avgDuration').textContent = '-';
}

// Load and display notifications
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const allVisitors = JSON.parse(localStorage.getItem('visitors')) || [];
    const notificationsList = document.getElementById('notificationsList');


    // Display ALL visitors (both entered and exited) sorted by entry time
    notificationsList.innerHTML = '';
    
    if (allVisitors.length === 0) {
        notificationsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No entries yet</p>';
        return;
    }

    // Sort by entry time (most recent first)
    const sortedVisitors = [...allVisitors].sort((a, b) => 
        new Date(b.entryTime) - new Date(a.entryTime)
    );

    sortedVisitors.forEach(visitor => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';

        // 1. Set the class on the main item
notificationItem.className = 'notification-item';
if (visitor.status === 'entered') {
    notificationItem.classList.add('status-entered');
}

// 2. Create the badge using classes
const statusLabel = visitor.status === 'entered' ? 'INSIDE' : 'CHECKED OUT';
const statusClass = visitor.status === 'entered' ? 'inside' : '';

const statusBadge = `<span class="status-badge ${statusClass}">${statusLabel}</span>`;

// 3. The duration text (kept simple)
const durationText = (visitor.status === 'exited' && visitor.duration) 
    ? `<div class="duration-text">Duration: ${visitor.duration}</div>` 
    : '';
        
        notificationItem.innerHTML = `
            <div class="notification-info">
                <div class="notification-plate">
                    ${visitor.plateNumber} ${statusBadge}
                </div>
                <div class="notification-time">
                    ${visitor.name} • ${visitor.entryTimeFormatted}
                </div>
                ${durationText}
            </div>
            <button class="view-details-btn" onclick="showVisitorDetails('${visitor.id}')">
                View Details
            </button>
        `;
        
        notificationsList.appendChild(notificationItem);
    });
}

// Display visitor records in table
function displayVisitorRecords(visitors = filteredVisitors) {
    const tableBody = document.getElementById('visitorsTableBody');
    tableBody.innerHTML = '';

    // Filter to show ONLY visitors who are currently inside (status = 'entered')
    const currentVisitors = visitors.filter(v => v.status === 'entered');

    if (currentVisitors.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                    No visitors currently inside
                </td>
            </tr>
        `;
        return;
    }

    // Sort by entry time (most recent first)
    const sortedVisitors = [...currentVisitors].sort((a, b) => 
        new Date(b.entryTime) - new Date(a.entryTime)
    );

    sortedVisitors.forEach(visitor => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${visitor.plateNumber}</strong></td>
            <td>${visitor.name}</td>
            <td>${visitor.entryTimeFormatted}</td>
            <td>${formatPurpose(visitor.purpose)}</td>
            <td>
                <button class="view-details-btn" onclick="showVisitorDetails('${visitor.id}')">
                    View
                </button>
                <button class="checkout-btn" onclick="checkOutVisitor('${visitor.id}')">
                    ✓ Check Out
                </button>
            </td>
        `;

         tableBody.appendChild(row);
    });
}

// Format purpose for display
function formatPurpose(purpose) {
    const purposeMap = {
        'food-delivery': 'Food Delivery',
        'parcel-delivery': 'Parcel Delivery',
        'visiting-resident': 'Visiting Resident',
        'service-provider': 'Service Provider',
        'service-provider': 'Wedding Event / Party / Any Ceremony Event',
        'other': 'Other'
    };
    return purposeMap[purpose] || purpose;
}

// Show visitor details in modal
function showVisitorDetails(visitorId) {
    const visitor = allVisitors.find(v => v.id === visitorId);
    
    if (!visitor) return;

    const modal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');

    // Build exit information if available
    const exitInfo = visitor.status === 'exited' ? `
        <div class="detail-row">
            <div class="detail-label">Exit Time</div>
            <div class="detail-value">${visitor.exitTimeFormatted}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Visit Duration</div>
            <div class="detail-value"><strong style="color: #4CAF50;">${visitor.duration}</strong></div>
        </div>
    ` : '';

    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Visitor ID</div>
            <div class="detail-value">${visitor.id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Full Name</div>
            <div class="detail-value">${visitor.name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Plate Number</div>
            <div class="detail-value"><strong>${visitor.plateNumber}</strong></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Phone Number</div>
            <div class="detail-value">${visitor.phoneNumber}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Purpose of Visit</div>
            <div class="detail-value">${formatPurpose(visitor.purpose)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Unit Number</div>
            <div class="detail-value">${visitor.unitNumber}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Entry Time</div>
            <div class="detail-value">${visitor.entryTimeFormatted}</div>
        </div>
        ${exitInfo}
        <div class="detail-row">
            <div class="detail-label">Status</div>
            <div class="detail-value">
                <span class="status-badge ${visitor.status}">
                    ${visitor.status.toUpperCase()}
                </span>
            </div>
        </div>
    `;

    // Show checkout button only if visitor is still inside
    if (visitor.status === 'entered') {
        modalFooter.innerHTML = `
            <button class="modal-checkout-btn" onclick="checkOutVisitorFromModal('${visitor.id}')">
                Check Out Visitor
            </button>
        `;
    } else {
        modalFooter.innerHTML = '';
    }

    modal.classList.add('active');

    // Mark notification as read
    markNotificationAsRead(visitorId);
}

// Mark notification as read
function markNotificationAsRead(visitorId) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications = notifications.map(n => {
        if (n.visitorId === visitorId) {
            n.read = true;
        }
        return n;
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    loadNotifications(); // Refresh notifications display
}

// Close modal
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('detailsModal').classList.remove('active');
});

// Close modal when clicking outside
document.getElementById('detailsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
    }
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    filterVisitors(searchTerm);
});

// History search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    const allVisitors = JSON.parse(localStorage.getItem('visitors')) || [];
    
    if (searchTerm === '') {
        loadNotifications(); // Show all
        return;
    }
    
    const filteredHistory = allVisitors.filter(visitor =>
        visitor.name.toLowerCase().includes(searchTerm) ||
        visitor.plateNumber.toLowerCase().includes(searchTerm) ||
        visitor.phoneNumber.includes(searchTerm)
    );
    
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        notificationsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No matching records found</p>';
        return;
    }

   // Sort by entry time
    const sortedHistory = [...filteredHistory].sort((a, b) => 
        new Date(b.entryTime) - new Date(a.entryTime)
    );
    
    sortedHistory.forEach(visitor => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        const durationText = visitor.status === 'exited' && visitor.duration 
            ? `<div style="font-size: 12px; color: #666; margin-top: 3px;">Duration: ${visitor.duration}</div>`
            : '';
        
        notificationItem.innerHTML = `
            <div class="notification-info">
                <div class="notification-plate">
                    ${visitor.plateNumber} ${statusBadge}
                </div>
                <div class="notification-time">
                    ${visitor.name} • ${visitor.entryTimeFormatted}
                </div>
                ${durationText}
            </div>
            <button class="view-details-btn" onclick="showVisitorDetails('${visitor.id}')">
                View Details
            </button>
        `;
        
         notificationsList.appendChild(notificationItem);
    });
});

// Purpose filter
document.getElementById('purposeFilter').addEventListener('change', function(e) {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    filterVisitors(searchTerm);
});

// Filter visitors based on search and purpose
function filterVisitors(searchTerm = '') {
    const purposeFilter = document.getElementById('purposeFilter').value;

    // Filter only visitors who are currently inside
    const insideVisitors = allVisitors.filter(v => v.status === 'entered');

    filteredVisitors = insideVisitors.filter(visitor => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            visitor.name.toLowerCase().includes(searchTerm) ||
            visitor.plateNumber.toLowerCase().includes(searchTerm) ||
            visitor.phoneNumber.includes(searchTerm);

        // Purpose filter
        const matchesPurpose = purposeFilter === '' || visitor.purpose === purposeFilter;

        return matchesSearch && matchesPurpose;
    });

    displayVisitorRecords(filteredVisitors);
}

// Check out visitor function
function checkOutVisitor(visitorId) {
    if (!confirm('Check out this visitor?')) return;
    
    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    const exitTime = new Date();
    
    const updatedVisitors = visitors.map(v => {
        if (v.id === visitorId) {
            const duration = calculateDuration(new Date(v.entryTime), exitTime);
            return {
                ...v,
                status: 'exited',
                exitTime: exitTime.toISOString(),
                exitTimeFormatted: formatDateTime(exitTime),
                duration: duration
            };
        }
        return v;
    });
    
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));

   // Create exit notification
    const visitor = updatedVisitors.find(v => v.id === visitorId);
    createExitNotification(visitor);
    
    // Show success message
    showSuccessNotification(`${visitor.plateNumber} checked out successfully!`);
    
    // Refresh dashboard
    loadVisitors();
    updateStats();
    loadNotifications();
    displayVisitorRecords();
}

// Check out from modal
function checkOutVisitorFromModal(visitorId) {
    // Close modal first
    document.getElementById('detailsModal').classList.remove('active');
    
    // Then check out
    checkOutVisitor(visitorId);
}

// Calculate duration helper
function calculateDuration(entryTime, exitTime) {
    const diffMs = exitTime - entryTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}

// Format date time helper
function formatDateTime(date) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-MY', options);
}

// Create exit notification
function createExitNotification(visitor) {
    const notification = {
        visitorId: visitor.id,
        plateNumber: visitor.plateNumber,
        type: 'exit',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift(notification);
    
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Show success notification
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Refresh data
document.getElementById('refreshBtn').addEventListener('click', function() {
    this.textContent = '🔄 Refreshing...';
    
    setTimeout(() => {
        loadVisitors();
        updateStats();
        loadNotifications();
        displayVisitorRecords();
        this.textContent = '🔄 Refresh';
    }, 500);
});

// Auto-refresh every 30 seconds
setInterval(() => {
    loadVisitors();
    updateStats();
    loadNotifications();
    // Only refresh table if no search/filter is active
    if (document.getElementById('searchInput').value === '' && 
        document.getElementById('purposeFilter').value === '') {
        displayVisitorRecords();
    }
}, 30000);

function clearVisitorLogs() {
    localStorage.removeItem('visitors');
    localStorage.removeItem('latestVisitor');
    console.log("Visitor logs cleared, but other data kept.");
}

// Initialize dashboard
function initDashboard() {
    loadVisitors();
    updateStats();
    loadNotifications();
    displayVisitorRecords();
    console.log('Security Dashboard Initialized');
}

// Run initialization when page loads
initDashboard();







    

    
    
        
       