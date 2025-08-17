// DOM Elements
const hoursDisplay = document.getElementById('hoursDisplay');
const emailsInput = document.getElementById('emailsPerWeek');
const dataEntryInput = document.getElementById('dataEntry');
const followUpsInput = document.getElementById('followUps');
const reportingInput = document.getElementById('reporting');

// Calculation constants (time saved per unit)
const TIME_SAVINGS = {
    emailsPerWeek: 0.02, // 1.2 minutes per email saved
    dataEntry: 0.7, // 70% of data entry time can be automated
    followUps: 0.08, // 5 minutes per follow-up saved
    reporting: 0.6 // 60% of reporting time can be automated
};

// Calculate total hours saved
function calculateHoursSaved() {
    const emails = parseInt(emailsInput.value) || 0;
    const dataEntry = parseFloat(dataEntryInput.value) || 0;
    const followUps = parseInt(followUpsInput.value) || 0;
    const reporting = parseFloat(reportingInput.value) || 0;

    const emailHours = emails * TIME_SAVINGS.emailsPerWeek;
    const dataEntryHours = dataEntry * TIME_SAVINGS.dataEntry;
    const followUpHours = followUps * TIME_SAVINGS.followUps;
    const reportingHours = reporting * TIME_SAVINGS.reporting;

    const totalHours = emailHours + dataEntryHours + followUpHours + reportingHours;
    
    return Math.max(Math.round(totalHours), 1); // Minimum 1 hour
}

// Update display with animation
function updateDisplay() {
    const newHours = calculateHoursSaved();
    const currentHours = parseInt(hoursDisplay.textContent);
    
    if (newHours !== currentHours) {
        hoursDisplay.style.transform = 'scale(1.1)';
        hoursDisplay.style.color = '#48bb78';
        
        setTimeout(() => {
            hoursDisplay.textContent = newHours;
            hoursDisplay.style.transform = 'scale(1)';
            hoursDisplay.style.color = '#667eea';
        }, 150);
    }
}

// Add event listeners
emailsInput.addEventListener('input', updateDisplay);
dataEntryInput.addEventListener('input', updateDisplay);
followUpsInput.addEventListener('input', updateDisplay);
reportingInput.addEventListener('input', updateDisplay);

// Initialize display
updateDisplay();

// Add smooth scroll for CTA button
document.querySelector('.cta-button').addEventListener('click', function(e) {
    // Add click animation
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 100);
});

// Add input validation
function validateInput(input, min = 0, max = 1000) {
    input.addEventListener('blur', function() {
        let value = parseFloat(this.value);
        if (isNaN(value) || value < min) {
            this.value = min;
        } else if (value > max) {
            this.value = max;
        }
        updateDisplay();
    });
}

// Apply validation to all inputs
validateInput(emailsInput, 0, 500);
validateInput(dataEntryInput, 0, 80);
validateInput(followUpsInput, 0, 200);
validateInput(reportingInput, 0, 40);

// Add hover effects for process steps
document.querySelectorAll('.process-step').forEach(step => {
    step.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    step.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Track user interactions for analytics (placeholder)
function trackEvent(eventName, properties = {}) {
    // This would integrate with your analytics service
    console.log(`Event: ${eventName}`, properties);
}

// Track calculator usage
let calculatorUsed = false;
[emailsInput, dataEntryInput, followUpsInput, reportingInput].forEach(input => {
    input.addEventListener('input', function() {
        if (!calculatorUsed) {
            trackEvent('calculator_used', {
                initial_hours: hoursDisplay.textContent
            });
            calculatorUsed = true;
        }
    });
});

// Track CTA clicks
document.querySelector('.cta-button').addEventListener('click', function() {
    trackEvent('cta_clicked', {
        hours_displayed: hoursDisplay.textContent,
        emails_per_week: emailsInput.value,
        data_entry_hours: dataEntryInput.value,
        follow_ups: followUpsInput.value,
        reporting_hours: reportingInput.value
    });
});
