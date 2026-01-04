// Get form and elements
const visitorForm = document.getElementById('visitorForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const entryTimeElement = document.getElementById('entryTime');

// Function to format date and time in Malaysian format
function formatDateTime(date) {
    const option = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        seecond: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-MY',option);
}

// Function to generate unique visitor ID 
function generateVisitorId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VIS-${timestamp}-${random}`;
}

// Function to save visitor data to localStorage (simulating database)
function saveVisitorData(visitorData) {
    // Get existing visitors from localStorage
    let visitors = JSON.parse(localStorage.getItem('visitors')) || [];

    // Add new visitor
    visitors.push(visitorData);

    // Save back to localStorage
    localStorage.setItem('visitors', JSON.stringify(visitors));

    // Store latest visitor for security dashboard notification
    localStorage.setItem('latestVisitor', JSON.stringify(visitorData))

    return true;
}

// Form submission handler
visitorForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission

    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // Get form data
    const formData = new FormData(visitorForm);

    // Create visitor object
    const visitorData = {
        id: generateVisitorId(),
        name: formData.get('visitorName').trim(),
        plateNumber: formData.get('plateNumber').trim().toUpperCase(),
        phoneNumber: formData.get('phoneNumber').trim(),
        purpose: formData.get('visitPurpose'),
        unitNumber: formData.get('unitNumber').trim() || 'N/A',
        entryTime: new Date().toISOString(),
        entryTimeFormatted: formatDateTime(new Date()),
        status: 'entered' // Could be: entered, exited
    };

    // Simulate API call delay 
    setTimeout(() => {
        // Save data
        const saved = saveVisitorData(visitorData);

        if (saved) {
           // Hide form
           visitorForm.style.display = 'none';

           // Show success message
           successMessage.style.display = 'block';
           entryTimeElement.textContent = `Entry Time: ${visitorData.entryTimeFormatted}`;

           // Trigger notification event for security dashboard
           // In real application, this would be a WebSocket or server push
           triggerSecurityNotification(visitorData);

           // Reset form after 3 seconds and show form again
            setTimeout(() => {
                visitorForm.reset();
                visitorForm.style.display = 'flex';
                successMessage.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Entry';
            }, 3000);
        }
    }, 1000);
});

// Function to trigger security dashboard notification
function triggerSecurityNotification(visitorData) {
    // Create a notification flag
    const notification = {
        visitorId: visitorData.id,
        plateNumber: visitorData.plateNumber,
        timestamp: new Date().toISOString(),
        read: false
    };

    // Store notification
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift(notification); // Add to beginning of array
    
    // Keep only last 10 notifications
    if (notifications.length > 10) {
        notifications = notifications.slice(0, 10);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    console.log('Security notification triggered:', notification);
}

// Auto-format plate number to uppercase as user types
document.getElementById('plateNumber').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Validate phone number format
document.getElementById('phoneNumber').addEventListener('input', function(e) {
    // Remove any non-digit characters
    e.target.value = e.target.value.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (e.target.value.length > 11) {
        e.target.value = e.target.value.slice(0, 11);
    }
});

// Show unit number field only for certain purposes
document.getElementById('visitPurpose').addEventListener('change', function(e) {
    const unitNumberGroup = document.querySelector('[for="unitNumber"]').parentElement;
    
    if (e.target.value === 'visiting-resident') {
        unitNumberGroup.style.display = 'flex';
        document.getElementById('unitNumber').required = true;
    } else {
        unitNumberGroup.style.display = 'flex'; // Keep visible but optional
        document.getElementById('unitNumber').required = false;
    }
});

// Initialize: Log that the script is loaded
console.log('Visitor Management System Initialized');
console.log('Current Time:',formatDateTime(new Date()));