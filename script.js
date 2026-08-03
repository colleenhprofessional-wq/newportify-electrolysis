// === NAVIGATION ===
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPos = target.offsetTop - headerHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
    });
});


// === SCHEDULING SYSTEM ===
const schedulingSystem = {
    availableSlots: {},
    
    init() {
        this.generateSlots();
        this.renderCalendar();
        this.bindEvents();
    },

    generateSlots() {
        // Available: Sunday, August 16, 11 AM - 2 PM
        // 1-hour appointments with 10-minute breaks between
        const dateKey = '2026-08-16'; // Sunday, August 16, 2026
        this.availableSlots[dateKey] = [
            { time: '11:00 AM', hour: 11, minute: 0, available: true },
            { time: '12:10 PM', hour: 12, minute: 10, available: true },
            { time: '1:20 PM', hour: 13, minute: 20, available: true }
        ];
    },

    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    },

    formatDateDisplay(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    renderCalendar() {
        const calendarContainer = document.getElementById('scheduling-calendar');
        if (!calendarContainer) return;

        const dates = Object.keys(this.availableSlots);
        
        let html = '<div class="calendar-header-info"><p><strong>Next Available Date:</strong> Sunday, August 16, 2026</p><p>11:00 AM – 2:00 PM | 1-hour sessions | 10-min breaks between appointments</p></div>';
        html += '<div class="calendar-dates">';
        dates.forEach((date, index) => {
            const activeClass = index === 0 ? 'active' : '';
            html += `<button class="calendar-date-btn ${activeClass}" data-date="${date}">
                <span class="date-day">Sun</span>
                <span class="date-num">Aug 16</span>
            </button>`;
        });
        html += '</div>';
        
        html += '<div class="time-slots" id="time-slots"></div>';
        calendarContainer.innerHTML = html;
        
        // Show slots
        this.showTimeSlots(dates[0]);
    },


    showTimeSlots(dateKey) {
        const slotsContainer = document.getElementById('time-slots');
        if (!slotsContainer) return;

        const slots = this.availableSlots[dateKey];
        if (!slots) return;

        let html = `<h4>Available Times for ${this.formatDateDisplay(dateKey)}</h4>`;
        html += '<div class="slots-grid">';
        
        slots.forEach(slot => {
            if (slot.available) {
                html += `<button class="time-slot-btn" data-date="${dateKey}" data-time="${slot.time}">
                    ${slot.time}
                </button>`;
            } else {
                html += `<button class="time-slot-btn unavailable" disabled>
                    ${slot.time}
                </button>`;
            }
        });
        
        html += '</div>';
        slotsContainer.innerHTML = html;

        // Bind time slot clicks
        document.querySelectorAll('.time-slot-btn:not(.unavailable)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedDate = e.target.dataset.date;
                this.selectedTime = e.target.dataset.time;
                this.updateConfirmation();
            });
        });
    },

    updateConfirmation() {
        const confirmEl = document.getElementById('booking-confirmation');
        if (confirmEl && this.selectedDate && this.selectedTime) {
            confirmEl.innerHTML = `
                <div class="booking-selected">
                    <p><strong>Selected:</strong> ${this.formatDateDisplay(this.selectedDate)} at ${this.selectedTime}</p>
                    <p class="booking-duration">1-hour appointment session</p>
                </div>`;
            confirmEl.style.display = 'block';
        }
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('calendar-date-btn') || 
                e.target.closest('.calendar-date-btn')) {
                const btn = e.target.closest('.calendar-date-btn') || e.target;
                const date = btn.dataset.date;
                
                document.querySelectorAll('.calendar-date-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showTimeSlots(date);
            }
        });
    }
};

// Initialize scheduling when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    schedulingSystem.init();
});


// === CONTACT FORM HANDLING ===
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const selectedDate = schedulingSystem.selectedDate;
            const selectedTime = schedulingSystem.selectedTime;
            
            let message = `Thank you, ${name}! `;
            if (selectedDate && selectedTime) {
                message += `Your appointment request for ${schedulingSystem.formatDateDisplay(selectedDate)} at ${selectedTime} has been received. `;
            } else {
                message += `Your appointment request has been received. `;
            }
            message += `We'll confirm your booking shortly via email or phone.`;
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'form-success';
            successDiv.innerHTML = `<div class="success-icon">✓</div><p>${message}</p>`;
            form.parentNode.insertBefore(successDiv, form);
            form.style.display = 'none';
        });
    }
});

// === INTERSECTION OBSERVER FOR ANIMATIONS ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(
        '.stage-card, .service-card, .result-card, .location-detail, .pricing-card'
    );
    animateElements.forEach(el => observer.observe(el));
});
