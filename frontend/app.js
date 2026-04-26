document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // State
    let currentSector = '';
    let map = null;
    let authMode = 'login';
    let currentUser = null;
    let currentChart = null;

    // DOM Elements
    const homeView = document.getElementById('home-view');
    const sectorView = document.getElementById('sector-view');
    const backBtn = document.getElementById('back-to-home');
    const sectorCards = document.querySelectorAll('.sector-card');
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.getElementById('close-auth');
    const toggleAuth = document.getElementById('toggle-auth');
    const authForm = document.getElementById('auth-form');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');

    const headerIcon = document.getElementById('header-icon');
    const headerTitle = document.getElementById('header-title');
    const headerDesc = document.getElementById('header-desc');
    const quickActionsContainer = document.getElementById('quick-actions');
    const analyzeBtn = document.getElementById('analyze-btn');
    const queryInput = document.getElementById('query-input');
    const locationInput = document.getElementById('location-input');
    const resultsArea = document.getElementById('results-area');
    const loader = document.getElementById('loader');

    // Sector Metadata
    const sectorMeta = {
        'Government': { icon: 'landmark', desc: 'CSC, MeeSeva, Govt offices, eligibility & tracking', quickActions: ['Apply for Passport', 'Aadhaar Card Update', 'Income Certificate'], colorClass: 'card-govt' },
        'Education': { icon: 'graduation-cap', desc: 'Courses, career roadmap, skill trends & institutes', quickActions: ['Coding Bootcamps', 'Scholarship Guide', 'Foreign Education'], colorClass: 'card-edu' },
        'Jobs': { icon: 'briefcase', desc: 'Job search, salary data, skill gaps & apply links', quickActions: ['AI Developer Jobs', 'Resume Optimization', 'Salary Benchmarking'], colorClass: 'card-job' },
        'Finance': { icon: 'wallet', desc: 'Banking, loans, EMI, insurance & risk analysis', quickActions: ['Home Loan Comparison', 'Credit Score Fix', 'Tax Planning'], colorClass: 'card-fin' },
        'Healthcare': { icon: 'heart-pulse', desc: 'Hospitals, doctors, treatment costs & emergency care', quickActions: ['Nearby Hospitals', 'Symptom Analysis', 'Doctor Appointment'], colorClass: 'card-health' },
        'Legal': { icon: 'scale', desc: 'FIR filing, lawyers, courts & legal documentation', quickActions: ['Legal Notice Draft', 'Find Criminal Lawyer', 'Property Dispute'], colorClass: 'card-legal' },
        'Utility': { icon: 'wrench', desc: 'Electricity, water, internet, mobile & home services', quickActions: ['Plumber Nearby', 'Electrician Search', 'Gas Booking'], colorClass: 'card-util' }
    };

    // --- Authentication Logic ---
    const updateAuthUI = () => {
        if (currentUser) {
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            userProfile.classList.remove('hidden');
            usernameDisplay.textContent = currentUser.email.split('@')[0];
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    };

    loginBtn.onclick = () => { authMode = 'login'; document.getElementById('modal-title').textContent = 'Sign In'; authSubmitBtn.textContent = 'Sign In'; authModal.classList.remove('hidden'); };
    registerBtn.onclick = () => { authMode = 'register'; document.getElementById('modal-title').textContent = 'Create Account'; authSubmitBtn.textContent = 'Register'; authModal.classList.remove('hidden'); };
    closeAuth.onclick = () => authModal.classList.add('hidden');
    toggleAuth.onclick = (e) => {
        e.preventDefault();
        authMode = authMode === 'login' ? 'register' : 'login';
        document.getElementById('modal-title').textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
        authSubmitBtn.textContent = authMode === 'login' ? 'Sign In' : 'Register';
    };

    authForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        currentUser = { email };
        updateAuthUI();
        authModal.classList.add('hidden');
    };

    logoutBtn.onclick = () => { currentUser = null; updateAuthUI(); };

    // --- Navigation Logic ---
    sectorCards.forEach(card => {
        card.addEventListener('click', () => {
            const sector = card.dataset.sector;
            showSector(sector);
        });
    });

    backBtn.onclick = () => { sectorView.classList.add('hidden'); homeView.classList.remove('hidden'); resultsArea.classList.add('hidden'); };

    function showSector(sector) {
        currentSector = sector;
        const meta = sectorMeta[sector];
        headerTitle.textContent = sector;
        headerDesc.textContent = meta.desc;
        headerIcon.innerHTML = `<i data-lucide="${meta.icon}"></i>`;
        headerIcon.className = `card-icon ${meta.colorClass}`;
        
        quickActionsContainer.innerHTML = '';
        meta.quickActions.forEach(action => {
            const chip = document.createElement('div');
            chip.className = 'action-chip';
            chip.textContent = action;
            chip.onclick = () => { queryInput.value = action; analyzeBtn.click(); };
            quickActionsContainer.appendChild(chip);
        });

        homeView.classList.add('hidden');
        sectorView.classList.remove('hidden');
        lucide.createIcons();
    }

    // --- Analysis & Visualization Logic ---
    analyzeBtn.onclick = async () => {
        const query = queryInput.value.trim();
        const location = locationInput.value.trim();
        if (!query) return;

        loader.classList.remove('hidden');
        resultsArea.classList.add('hidden');

        try {
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sector: currentSector, query: `${query} in ${location}` })
            });

            const data = await response.json();
            renderResults(data);
        } catch (err) {
            console.error(err);
            alert("Connection error. Ensure the backend is running.");
        } finally {
            loader.classList.add('hidden');
        }
    };

    function renderResults(data) {
        document.querySelector('#layer-kb .content').innerHTML = `<p>${data.knowledge.explanation}</p>`;
        document.querySelector('#layer-decision .content').innerHTML = `<strong>Best Option:</strong> ${data.decision.best_option}<br><p style="margin-top:10px; font-size:14px; opacity:0.8;">${data.decision.reasoning}</p>`;
        
        document.querySelector('#layer-cost .content').innerHTML = `Low: ${data.cost_time.cost.low} | High: ${data.cost_time.cost.high}<br><small>${data.cost_time.cost.govt_vs_private}</small>`;
        document.querySelector('#layer-time .content').innerHTML = `Avg: ${data.cost_time.time.avg}<br><small style="color:#f85149;">Impact: ${data.cost_time.time.delays}</small>`;

        const workflow = document.querySelector('.workflow-list');
        workflow.innerHTML = '';
        data.execution.steps.forEach((step, i) => {
            workflow.innerHTML += `<div class="workflow-step"><div class="step-num">${i+1}</div><div>${step}</div></div>`;
        });

        const resources = document.querySelector('.resource-links');
        resources.innerHTML = '';
        data.resources.portals.forEach(p => {
            const a = document.createElement('a');
            a.href = p.url; a.target = '_blank'; a.className = 'resource-tag'; a.textContent = p.name;
            resources.appendChild(a);
        });

        // NEW: Profile Suggestions Rendering
        const profileList = document.querySelector('.profile-suggestions-list');
        profileList.innerHTML = '';
        const suggestions = data.real_world.profile_suggestions || [];
        
        if (suggestions.length === 0) {
            profileList.innerHTML = '<p style="opacity:0.5; font-size:14px;">No specific expert profiles found for this location. Searching broader area...</p>';
        } else {
            suggestions.forEach(prof => {
                const item = document.createElement('div');
                item.className = 'profile-item';
                item.innerHTML = `
                    <div class="profile-header">
                        <span class="profile-name">${prof.name}</span>
                        <span class="profile-cost">${prof.cost}</span>
                    </div>
                    <div class="profile-bio">${prof.bio}</div>
                    <div class="profile-details">
                        <span><i data-lucide="map-pin" style="width:14px;"></i> ${prof.location}</span>
                        <span><i data-lucide="phone" style="width:14px;"></i> ${prof.contact}</span>
                        <span><i data-lucide="award" style="width:14px;"></i> ${prof.experience}</span>
                        <span><i data-lucide="star" style="width:14px; color:#ffd600;"></i> Highly Recommended</span>
                    </div>
                `;
                profileList.appendChild(item);
            });
        }

        renderCharts(data);
        initMap(data.real_world.nearby);
        lucide.createIcons();

        resultsArea.classList.remove('hidden');
        resultsArea.scrollIntoView({ behavior: 'smooth' });
    }

    function renderCharts(data) {
        const ctx = document.getElementById('intelligence-chart').getContext('2d');
        if (currentChart) currentChart.destroy();

        const costData = data.cost_time.cost.chart_data || [100, 500, 300];
        const timeData = data.cost_time.time.chart_data || [10, 30, 20];

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Minimum', 'Average', 'Maximum'],
                datasets: [
                    { label: 'Cost Index', data: costData, borderColor: '#58a6ff', backgroundColor: 'rgba(88, 166, 255, 0.1)', fill: true, tension: 0.4 },
                    { label: 'Time Efficiency', data: timeData, borderColor: '#3fb950', backgroundColor: 'rgba(63, 185, 80, 0.1)', fill: true, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b949e' } },
                    x: { grid: { display: false }, ticks: { color: '#8b949e' } }
                },
                plugins: { legend: { labels: { color: '#ffffff' } } }
            }
        });
    }

    function initMap(places) {
        const container = document.getElementById('map');
        if (map) map.remove();
        
        map = L.map('map').setView([17.3850, 78.4867], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

        places.forEach(place => {
            const lat = 17.3850 + (Math.random() - 0.5) * 0.05;
            const lng = 78.4867 + (Math.random() - 0.5) * 0.05;
            const marker = L.marker([lat, lng]).addTo(map);
            
            const popupContent = `
                <div class="service-profile-popup">
                    <h4>${place.name}</h4>
                    <p>${place.profile_desc || 'Certified Service Provider'}</p>
                    <div style="margin-bottom:8px;">⭐ ${place.rating || '4.5'} | ${place.type || 'Office'}</div>
                    <strong>Contact Details:</strong>
                    <span class="contact-info">${place.contact || '+91-XXXXXXXXXX'}</span>
                    <a href="${place.link}" target="_blank" style="color:#58a6ff; font-size:12px; margin-top:5px; display:block;">View on Google Maps</a>
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    }

    queryInput.onkeypress = (e) => { if (e.key === 'Enter') analyzeBtn.click(); };
});
