const anchorData = [
    { year: '2016', mocupass: 94.5, natl: 91.2, delta: 3.3 },
    { year: '2017', mocupass: 95.1, natl: 90.8, delta: 4.3 },
    { year: '2018', mocupass: 96.8, natl: 93.9, delta: 2.9 },
    { year: '2019', mocupass: 95.5, natl: 91.8, delta: 3.7 },
    { year: '2020', mocupass: 94.0, natl: 92.7, delta: 1.3 },
    { year: '2021', mocupass: 93.5, natl: 92.2, delta: 1.3 },
    { year: '2022', mocupass: 92.1, natl: 90.6, delta: 1.5 },
    { year: '2023', mocupass: 94.2, natl: 90.0, delta: 4.2 },
    { year: '2024', mocupass: 95.8, natl: 90.3, delta: 5.5 },
    { year: '2025', mocupass: 97.2, natl: 91.1, delta: 6.1 },
    { year: '2026', mocupass: 98.0, natl: 91.5, delta: 6.5 }
];

const courseData = [
    { name: 'Physiology & Homeostasis I', role: 'Foundational', year: 'M1', score: 91.2, rank: 1 },
    { name: 'Clinical Anatomy & Imaging', role: 'Foundational', year: 'M1', score: 88.5, rank: 2 },
    { name: 'Molecular Foundations', role: 'Foundational', year: 'M1', score: 87.9, rank: 3 },
    { name: 'Integrative Systems II', role: 'Adaptive', year: 'M2', score: 93.4, rank: 1 },
    { name: 'Host Defense & Micro', role: 'Adaptive', year: 'M2', score: 92.1, rank: 2 },
    { name: 'Longitudinal Clinical Clerkship', role: 'Adaptive', year: 'M3', score: 91.8, rank: 3 },
    { name: 'Emergency Medicine Sub-I', role: 'Outcomes', year: 'M4', score: 96.1, rank: 1 },
    { name: 'Adv. Rural Medicine', role: 'Outcomes', year: 'M4', score: 95.4, rank: 2 },
    { name: 'Pediatric Specialty Rotation', role: 'Outcomes', year: 'M4', score: 94.7, rank: 3 }
];

const cqiActions = [
    { category: "Curriculum", action: "AY2025-2026 Integrated Board Review" },
    { category: "Support", action: "AI-Driven Academic Mentoring Launch" },
    { category: "Assessment", action: "Adaptive Formative Assessment Implementation" },
    { category: "Curriculum", action: "Enhanced OPP Lab integration" }
];

let anchorChart, deltaChart, isDarkMode = false;
let currentEraFilter = 'All';

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.getElementById('theme-icon').innerText = isDarkMode ? '☀️' : '🌙';
    document.getElementById('theme-text').innerText = isDarkMode ? 'Light Mode' : 'Dark Mode';
    initCharts(currentEraFilter);
}

function initCharts(filter = 'All') {
    const ctx1 = document.getElementById('anchorChart').getContext('2d');
    const ctx2 = document.getElementById('deltaChart').getContext('2d');
    if (anchorChart) anchorChart.destroy();
    if (deltaChart) deltaChart.destroy();

    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
    const deltaColor = isDarkMode ? '#38bdf8' : '#2563eb';
    const covidLineColor = isDarkMode ? '#fb7185' : '#e11d48';

    let filteredData = [...anchorData];
    if (filter === 'Foundational') filteredData = anchorData.filter(d => parseInt(d.year) <= 2019);
    else if (filter === 'Adaptive') filteredData = anchorData.filter(d => parseInt(d.year) >= 2020 && parseInt(d.year) <= 2022);
    else if (filter === 'Outcomes') filteredData = anchorData.filter(d => parseInt(d.year) >= 2023);

    const getSharedAnnotations = (isDeltaChart = false) => {
        const ann = {};
        const startYear = parseInt(filteredData[0].year);
        const endYear = parseInt(filteredData[filteredData.length - 1].year);

        if (startYear <= 2019 && endYear >= 2020) {
            const idx = filteredData.findIndex(d => d.year === '2019');
            if (idx !== -1) {
                ann.preCovidLine = {
                    type: 'line', xMin: idx + 0.5, xMax: idx + 0.5,
                    borderColor: covidLineColor, borderWidth: 3,
                    label: { display: true, content: 'PRE-COVID', backgroundColor: covidLineColor, color: 'white', font: { size: 10, weight: 'bold' }, padding: 4, yAdjust: -120 }
                };
            }
        }
        
        if (startYear <= 2022 && endYear >= 2023) {
            const idx = filteredData.findIndex(d => d.year === '2022');
            if (idx !== -1) {
                ann.postCovidLine = {
                    type: 'line', xMin: idx + 0.5, xMax: idx + 0.5,
                    borderColor: covidLineColor, borderWidth: 3,
                    label: { display: true, content: 'POST-COVID', backgroundColor: covidLineColor, color: 'white', font: { size: 10, weight: 'bold' }, padding: 4, yAdjust: -120 }
                };
            }
        }

        if (!isDeltaChart) {
            filteredData.forEach((d, idx) => {
                ann[`deltaLine_${idx}`] = { type: 'line', xMin: idx, xMax: idx, yMin: d.natl, yMax: d.mocupass, borderColor: deltaColor, borderWidth: 2, z: -1 };
            });
        }
        return ann;
    };

    const baseOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { weight: 'bold' } } } },
        scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => v + '%' } }
        }
    };

    anchorChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: filteredData.map(d => d.year),
            datasets: [
                { label: 'MU COM Pass Rate', data: filteredData.map(d => d.mocupass), borderColor: isDarkMode ? '#22c55e' : '#10b981', backgroundColor: isDarkMode ? '#22c55e' : '#10b981', borderWidth: 3, tension: 0.3, pointRadius: 5 },
                { label: 'National Mean', data: filteredData.map(d => d.natl), borderColor: '#f43f5e', backgroundColor: '#f43f5e', borderWidth: 2, tension: 0.3, pointRadius: 2 }
            ]
        },
        options: { ...baseOptions, plugins: { ...baseOptions.plugins, annotation: { annotations: getSharedAnnotations(false) } }, scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, min: 85, max: 100 } } }
    });

    deltaChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: filteredData.map(d => d.year),
            datasets: [{ label: 'MU COM vs National Delta', data: filteredData.map(d => d.delta), backgroundColor: deltaColor, borderRadius: 4 }]
        },
        options: { ...baseOptions, plugins: { ...baseOptions.plugins, annotation: { annotations: getSharedAnnotations(true) } }, scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, min: 0, max: 10 } } }
    });
}

function renderPipeline() {
    const cols = { 'Foundational': document.getElementById('foundational-col'), 'Adaptive': document.getElementById('adaptive-col'), 'Outcomes': document.getElementById('outcomes-col') };
    Object.values(cols).forEach(c => c.innerHTML = '');
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    courseData.forEach(course => {
        const div = document.createElement('div');
        const isTopThree = course.rank <= 3;
        const barClass = course.role === 'Foundational' ? 'bar-foundational' : course.role === 'Adaptive' ? 'bar-adaptive' : 'bar-outcomes';
        div.className = `pipeline-card ${isTopThree ? 'top-mark' : ''}`;
        div.innerHTML = `
            ${isTopThree ? `<div class="medal-badge">${medals[course.rank]}</div>` : ''}
            <div class="flex justify-between items-center mb-2"><span class="text-[10px] font-black tracking-widest text-white/60">${course.year}</span><span class="text-xs font-black ${isTopThree ? 'text-amber-400' : 'text-white'}">${course.score}%</span></div>
            <p class="text-sm font-bold leading-tight mb-3 text-white">${course.name}</p>
            <div class="h-2 w-full bar-track rounded-full overflow-hidden"><div class="h-full ${barClass} rounded-full" style="width: ${course.score}%"></div></div>`;
        cols[course.role].appendChild(div);
    });
}

function filterEra(era) {
    document.querySelectorAll('.era-btn').forEach(btn => btn.classList.remove('active-era'));
    if (era === 'All') {
        currentEraFilter = 'All';
    } else {
        currentEraFilter = era;
        const activeBtn = document.getElementById(`btn-${era}`);
        if (activeBtn) activeBtn.classList.add('active-era');
    }
    initCharts(currentEraFilter);
}

function openModal() {
    const list = document.getElementById('cqiList');
    list.innerHTML = cqiActions.map((item, idx) => `
        <div class="flex gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <span class="text-xs font-bold text-purple-500 min-w-[20px]">${idx + 1}.</span>
            <div><span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">${item.category}</span><p class="text-sm font-medium">${item.action}</p></div>
        </div>`).join('');
    document.getElementById('cqiModal').style.display = 'flex';
}
function closeModal() { document.getElementById('cqiModal').style.display = 'none'; }

window.onload = () => { 
    initCharts('All'); 
    renderPipeline(); 
};