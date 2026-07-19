// Initialize Lucide SVG Icons
lucide.createIcons();

// ─── Package Pricing Configuration ───
const PACKAGES = {
    'Package 1': {
        label: 'Essential',
        baseRate: 85,
        includedGuests: 2,
        extraAdult: 15,
        extraChild: 10,
        features: 'Queen Bed · Compact Kitchen · Desk Nook · High-Speed WiFi'
    },
    'Package 2': {
        label: 'Comfort',
        baseRate: 110,
        includedGuests: 2,
        extraAdult: 20,
        extraChild: 12,
        features: 'Queen Bed + Sofa · Full Kitchen · Dedicated Workspace · Ocean View Balcony'
    },
    'Package 3': {
        label: 'Deluxe',
        baseRate: 145,
        includedGuests: 2,
        extraAdult: 25,
        extraChild: 15,
        features: 'King Bed · Premium Kitchen · Private Garden · Outdoor Shower · Fiber WiFi'
    }
};

// ─── Loader ───
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader.classList.add('fade-out'), 600);
});

// ─── Navbar & Scroll ───
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
        scrollProgress.style.width = (window.scrollY / totalHeight) * 100 + '%';
    }

    backToTop.classList.toggle('visible', window.scrollY > 600);

    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        heroBg.style.transform = `scale(1.05) translateY(${window.pageYOffset * 0.4}px)`;
    }

    trackActiveNavigation();
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Mobile Menu ───
const menuBtn = document.getElementById('menu-btn');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMobileMenu() {
    menuBtn.classList.toggle('open');
    mobileOverlay.classList.toggle('open');
    document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : 'auto';
}

menuBtn.addEventListener('click', toggleMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMobileMenu));

// ─── Booking Modal ───
const bookingButtons = document.querySelectorAll('.booking-open');
const bookingModal = document.getElementById('booking-modal');
const bookingClose = document.getElementById('booking-close');
const studioSelect = document.getElementById('studio-type');
const checkInInput = document.getElementById('check-in');
const checkOutInput = document.getElementById('check-out');
const nightsCount = document.getElementById('nights-count');
const adultsInput = document.getElementById('adults');
const childrenInput = document.getElementById('children');
const infantsInput = document.getElementById('infants');
const bookingForm = document.getElementById('booking-form');
const packagePreview = document.getElementById('package-preview');
const summaryPackage = document.getElementById('summary-package');
const costBreakdown = document.getElementById('cost-breakdown');
const costTotal = document.getElementById('cost-total');

const today = new Date().toISOString().split('T')[0];
checkInInput.min = today;
checkOutInput.min = today;

function calculateNights() {
    const start = new Date(checkInInput.value);
    const end = new Date(checkOutInput.value);
    const valid = checkInInput.value && checkOutInput.value && end > start;
    const nights = valid ? Math.round((end - start) / (1000 * 60 * 60 * 24)) : 0;
    nightsCount.value = nights;
    if (checkInInput.value) {
        const minOut = new Date(start);
        minOut.setDate(minOut.getDate() + 1);
        checkOutInput.min = minOut.toISOString().split('T')[0];
    }
    updateCost();
    return nights;
}

function getGuestFees(pkg, adults, children) {
    const billable = adults + children;
    const extra = Math.max(0, billable - pkg.includedGuests);
    if (extra === 0) return { extraAdults: 0, extraChildren: 0, total: 0 };

    const extraAdults = Math.max(0, adults - pkg.includedGuests);
    const remaining = Math.max(0, pkg.includedGuests - adults);
    const extraChildren = Math.max(0, children - remaining);

    const total = extraAdults * pkg.extraAdult + extraChildren * pkg.extraChild;
    return { extraAdults, extraChildren, total };
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US');
}

function updatePackagePreview() {
    const pkg = PACKAGES[studioSelect.value];
    if (!pkg) return;
    packagePreview.innerHTML = `<strong>${studioSelect.value} — ${pkg.label}</strong>${pkg.features}`;
    summaryPackage.textContent = `${studioSelect.value} — ${pkg.label}`;
}

function updateCost() {
    const pkg = PACKAGES[studioSelect.value];
    if (!pkg) return;

    const nights = parseInt(nightsCount.value, 10) || 0;
    const adults = parseInt(adultsInput.value, 10) || 0;
    const children = parseInt(childrenInput.value, 10) || 0;
    const baseTotal = pkg.baseRate * nights;
    const guestFees = getGuestFees(pkg, adults, children);
    const guestTotal = guestFees.total * nights;
    const grandTotal = baseTotal + guestTotal;

    costBreakdown.innerHTML = `
        <li><span>${pkg.baseRate}/night × ${nights} night${nights !== 1 ? 's' : ''}</span><span>${nights ? formatCurrency(baseTotal) : '—'}</span></li>
        <li><span>Extra guests${guestFees.total ? ` ($${guestFees.total}/night)` : ''}</span><span>${guestTotal ? formatCurrency(guestTotal) : '—'}</span></li>
        <li><span>Infants</span><span>Free</span></li>
    `;
    costTotal.textContent = grandTotal > 0 ? formatCurrency(grandTotal) : '$0';
}

function openBookingModal(packageName = '') {
    if (packageName && PACKAGES[packageName]) {
        studioSelect.value = packageName;
    }
    updatePackagePreview();
    calculateNights();
    prefillGuestInfo();
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeBookingModal() {
    bookingModal.classList.remove('open');
    document.body.style.overflow = 'auto';
}

bookingButtons.forEach(button => {
    button.addEventListener('click', () => {
        openBookingModal(button.dataset.package || '');
    });
});

bookingClose.addEventListener('click', closeBookingModal);
bookingModal.addEventListener('click', e => {
    if (e.target === bookingModal) closeBookingModal();
});

[checkInInput, checkOutInput, adultsInput, childrenInput, infantsInput].forEach(el => {
    el.addEventListener('change', () => {
        calculateNights();
        updateCost();
    });
    el.addEventListener('input', updateCost);
});

studioSelect.addEventListener('change', () => {
    updatePackagePreview();
    updateCost();
});

bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    calculateNights();

    const nights = parseInt(nightsCount.value, 10);
    if (nights < 1) {
        alert('Please select valid check-in and check-out dates.');
        return;
    }

    const selectedRequests = [...bookingForm.querySelectorAll('input[name="requests"]:checked')]
        .map(cb => cb.value);
    const notes = document.getElementById('special-notes').value.trim();
    const total = costTotal.textContent;

    closeBookingModal();

    const summary = [
        `Booking Request Sent!`,
        ``,
        `Package: ${studioSelect.value}`,
        `Dates: ${checkInInput.value} → ${checkOutInput.value} (${nights} nights)`,
        `Guests: ${adultsInput.value} adults, ${childrenInput.value} children, ${infantsInput.value} infants`,
        `Estimated Total: ${total}`,
        selectedRequests.length ? `Requests: ${selectedRequests.join(', ')}` : '',
        notes ? `Notes: ${notes}` : '',
        ``,
        `We'll confirm availability within 24 hours.`
    ].filter(Boolean).join('\n');

    alert(summary);
    bookingForm.reset();
    adultsInput.value = 2;
    childrenInput.value = 0;
    infantsInput.value = 0;
    nightsCount.value = '0';
    updateCost();
});

// ─── Auth (Login / Logout) ───
const AUTH_KEY = 'elu_user';
const authBtn = document.getElementById('auth-btn');
const mobileAuthBtn = document.getElementById('mobile-auth-btn');
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmit = document.getElementById('auth-submit');

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch {
        return null;
    }
}

function setUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearUser() {
    localStorage.removeItem(AUTH_KEY);
}

function updateAuthUI() {
    const user = getUser();
    const loggedIn = !!user;
    const label = loggedIn ? 'Logout' : 'Login';

    authBtn.textContent = label;
    mobileAuthBtn.textContent = label;
    authBtn.classList.toggle('logged-in', loggedIn);
    mobileAuthBtn.classList.toggle('logged-in', loggedIn);
}

function prefillGuestInfo() {
    const user = getUser();
    if (!user) return;
    document.getElementById('guest-name').value = user.name || '';
    document.getElementById('guest-email').value = user.email || '';
}

function openAuthModal() {
    const user = getUser();
    if (user) {
        clearUser();
        updateAuthUI();
        return;
    }
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Sign in to manage your bookings and save your details.';
    authSubmit.textContent = 'Login';
    authForm.reset();
    authModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    authModal.classList.remove('open');
    if (!bookingModal.classList.contains('open')) {
        document.body.style.overflow = 'auto';
    }
}

authBtn.addEventListener('click', openAuthModal);
mobileAuthBtn.addEventListener('click', () => {
    toggleMobileMenu();
    setTimeout(openAuthModal, 300);
});

authClose.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', e => {
    if (e.target === authModal) closeAuthModal();
});

authForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    setUser({ email, name });
    updateAuthUI();
    closeAuthModal();
});

updateAuthUI();

// ─── Keyboard & Escape ───
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (bookingModal.classList.contains('open')) closeBookingModal();
        if (authModal.classList.contains('open')) closeAuthModal();
    }
});

// ─── Reveal on Scroll ───
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ─── Active Nav ───
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function trackActiveNavigation() {
    let currentSectionId = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 300) {
            currentSectionId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
        if (window.scrollY < 200 && link.getAttribute('href') === '#') {
            link.classList.add('active');
        }
    });
}

// ─── Init ───
updatePackagePreview();
updateCost();
