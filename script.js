// --- CONFIGURATION ---
const STORAGE_KEY = "shivsadhana_students";
const PASSWORD = "suhaspatilsir";
const WHATSAPP_NUM = "919834252755";

// --- STATE ---
let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let barChartInstance = null;
let lineChartInstance = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Splash Screen Logic
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }, 2000);

    // Setup Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login Form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('password-input').value;
        const error = document.getElementById('login-error');
        
        if (input === PASSWORD) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            navigateTo('dashboard');
        } else {
            error.classList.remove('hidden');
            setTimeout(() => error.classList.add('hidden'), 3000);
        }
    });

    // Add Student Form
    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);

    // Dynamic Due Calculation in Form
    const totalInput = document.getElementById('totalFees');
    const paidInput = document.getElementById('paidFees');
    const dueDisplay = document.getElementById('calculated-due');

    function updateDue() {
        const total = Number(totalInput.value) || 0;
        const paid = Number(paidInput.value) || 0;
        const due = total - paid;
        dueDisplay.textContent = `₹${due.toLocaleString()}`;
        
        if (due > 0) {
            dueDisplay.classList.remove('text-green-600');
            dueDisplay.classList.add('text-red-600');
        } else {
            dueDisplay.classList.remove('text-red-600');
            dueDisplay.classList.add('text-green-600');
        }
    }

    totalInput.addEventListener('input', updateDue);
    paidInput.addEventListener('input', updateDue);

    // Search Input
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderStudentList(e.target.value);
    });

    // Remove Screen Filter
    document.getElementById('remove-class-filter').addEventListener('change', (e) => {
        renderRemoveList(e.target.value);
    });
}

// --- NAVIGATION ---
function navigateTo(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(el => {
        if (el.id !== 'splash-screen' && el.id !== 'login-screen') {
            el.classList.add('hidden');
        }
    });

    // Update Bottom Nav Active State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.target === screenId) {
            btn.classList.add('text-brand-600');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('text-brand-600');
            btn.classList.add('text-gray-500');
        }
    });

    // Show specific screen & Refresh Data
    if (screenId === 'dashboard') {
        document.getElementById('dashboard-screen').classList.remove('hidden');
        updateDashboard();
    } else if (screenId === 'add-student') {
        document.getElementById('add-student-screen').classList.remove('hidden');
        resetForm();
    } else if (screenId === 'view-students') {
        document.getElementById('view-students-screen').classList.remove('hidden');
        renderStudentList();
    } else if (screenId === 'fees-reminder') {
        document.getElementById('fees-reminder-screen').classList.remove('hidden');
        renderReminders();
    } else if (screenId === 'remove-students') {
        document.getElementById('remove-students-screen').classList.remove('hidden');
        document.getElementById('remove-class-filter').value = "";
        renderRemoveList("");
    }
}

function logout() {
    document.getElementById('password-input').value = '';
    document.getElementById('app-layout').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

// --- DATA MANAGEMENT ---
function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    updateDashboard(); // Background update
}

function handleStudentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('student-id').value;
    const name = document.getElementById('name').value;
    const classGrade = document.getElementById('classGrade').value;
    const totalFees = Number(document.getElementById('totalFees').value);
    const paidFees = Number(document.getElementById('paidFees').value);

    const studentData = {
        id: id || Date.now().toString(),
        name,
        classGrade,
        totalFees,
        paidFees,
        dueFees: totalFees - paidFees
    };

    if (id) {
        // Edit existing
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) students[index] = studentData;
    } else {
        // Add new
        students.push(studentData);
    }

    saveStudents();
    alert('Student saved successfully!');
    
    if (id) {
        navigateTo('view-students');
    } else {
        resetForm(); // Keep on adding more
    }
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to remove this student?')) {
        students = students.filter(s => s.id !== id);
        saveStudents();
        // Re-render current view
        const currentScreen = document.querySelector('.nav-btn.text-brand-600')?.dataset.target;
        if (currentScreen === 'remove-students') {
            renderRemoveList(document.getElementById('remove-class-filter').value);
        }
    }
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('student-id').value = student.id;
    document.getElementById('name').value = student.name;
    document.getElementById('classGrade').value = student.classGrade;
    document.getElementById('totalFees').value = student.totalFees;
    document.getElementById('paidFees').value = student.paidFees;
    document.getElementById('form-title').innerText = "Edit Student";
    document.getElementById('calculated-due').innerText = `₹${student.dueFees.toLocaleString()}`;

    navigateTo('add-student');
}

function resetForm() {
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('form-title').innerText = "Add New Student";
    document.getElementById('calculated-due').innerText = "₹0";
    document.getElementById('calculated-due').classList.remove('text-red-600');
    document.getElementById('calculated-due').classList.add('text-green-600');
}

// --- RENDER FUNCTIONS ---

function updateDashboard() {
    // Stats
    const totalColl = students.reduce((acc, s) => acc + s.paidFees, 0);
    const totalDue = students.reduce((acc, s) => acc + s.dueFees, 0);
    
    document.getElementById('stat-students').innerText = students.length;
    document.getElementById('stat-collected').innerText = `₹${totalColl.toLocaleString()}`;
    document.getElementById('stat-due').innerText = `₹${totalDue.toLocaleString()}`;

    // Charts Data Preparation
    const classes = ["5th", "6th", "7th", "8th", "9th", "10th"];
    const countData = classes.map(c => students.filter(s => s.classGrade === c).length);
    const collectedData = classes.map(c => students.filter(s => s.classGrade === c).reduce((sum, s) => sum + s.paidFees, 0));
    const dueData = classes.map(c => students.filter(s => s.classGrade === c).reduce((sum, s) => sum + s.dueFees, 0));

    // Render Charts
    renderCharts(classes, countData, collectedData, dueData);
}

function renderCharts(labels, countData, collectedData, dueData) {
    // Destroy old instances if they exist
    if (barChartInstance) barChartInstance.destroy();
    if (lineChartInstance) lineChartInstance.destroy();

    // Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Students',
                data: countData,
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
    });

    // Line Chart
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    lineChartInstance = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Collected',
                    data: collectedData,
                    borderColor: '#10b981',
                    tension: 0.3,
                    pointRadius: 4
                },
                {
                    label: 'Due',
                    data: dueData,
                    borderColor: '#ef4444',
                    tension: 0.3,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } }
        }
    });
}

function renderStudentList(filterText = "") {
    const grid = document.getElementById('students-grid');
    grid.innerHTML = "";
    
    const filtered = students.filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">No students found.</div>`;
        return;
    }

    filtered.forEach(s => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-lg text-gray-900">${s.name}</h3>
                    <p class="text-sm text-gray-500">Class: ${s.classGrade}</p>
                </div>
                <div class="w-3 h-3 rounded-full ${s.dueFees > 0 ? 'bg-red-500' : 'bg-green-500'}"></div>
            </div>
            <div class="space-y-2 text-sm border-t border-gray-100 pt-3">
                <div class="flex justify-between"><span class="text-gray-500">Total</span><span class="font-medium">₹${s.totalFees}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Paid</span><span class="font-medium text-green-600">₹${s.paidFees}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Due</span><span class="font-medium text-red-600">₹${s.dueFees}</span></div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button onclick="editStudent('${s.id}')" class="text-sm font-medium text-brand-600 hover:text-brand-800">Edit Profile</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

function renderReminders() {
    const grid = document.getElementById('reminder-grid');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    grid.innerHTML = "";
    
    const dueStudents = students.filter(s => s.dueFees > 0);
    whatsappBtn.disabled = dueStudents.length === 0;

    if (dueStudents.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full bg-white p-12 text-center rounded-xl shadow-sm">
                <div class="flex justify-center mb-4">
                    <div class="bg-green-100 p-4 rounded-full text-green-600"><i data-lucide="check-circle" class="w-8 h-8"></i></div>
                </div>
                <h3 class="text-lg font-medium">No Pending Dues!</h3>
                <p class="text-gray-500">All students have cleared their fees.</p>
            </div>
        `;
        return;
    }

    dueStudents.forEach(s => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-red-500";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${s.name}</h3>
                <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">${s.classGrade}</span>
            </div>
            <div class="text-sm space-y-1">
                <div class="flex justify-between"><span class="text-gray-500">Paid:</span><span class="font-medium">₹${s.paidFees}</span></div>
                <div class="flex justify-between text-red-600 font-bold"><span>Due:</span><span>₹${s.dueFees}</span></div>
            </div>
        `;
        grid.appendChild(div);
    });
    
    // Refresh icons since we added HTML
    lucide.createIcons();
}

function sendWhatsApp() {
    const dueStudents = students.filter(s => s.dueFees > 0);
    if (dueStudents.length === 0) return;

    const list = dueStudents.map(s => `${s.name}(${s.classGrade})`).join(', ');
    const text = encodeURIComponent(`Following students have pending fees: ${list}`);
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${text}`, '_blank');
}

function renderRemoveList(cls) {
    const grid = document.getElementById('remove-grid');
    grid.innerHTML = "";
    
    if (!cls) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-4">Please select a class to view students.</p>`;
        return;
    }

    const filtered = students.filter(s => s.classGrade === cls);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-4">No students found in ${cls}.</p>`;
        return;
    }

    filtered.forEach(s => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center";
        div.innerHTML = `
            <div>
                <h3 class="font-bold">${s.name}</h3>
                <p class="text-xs text-gray-500">Due: ₹${s.dueFees}</p>
            </div>
            <button onclick="deleteStudent('${s.id}')" class="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        grid.appendChild(div);
    });
    
    lucide.createIcons();
}