// GLOBAL STATE
// ==========================================
let currentTab = 'dashboard';
let eventSource = null;
let selectedClientId = null;
let allClients = [];
let selectedClients = new Set(); // Track selected client IDs

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Show toast notification
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Show/hide loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

/**
 * Format date for display
 */
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Update active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');

            currentTab = targetTab;

            // Load data when switching tabs
            if (targetTab === 'dashboard') loadDashboardStats();
            if (targetTab === 'clients') loadClients();
            if (targetTab === 'automate') prefillAutomationForm();
            if (targetTab === 'settings') loadSettings();
        });
    });
}

// ==========================================
// DASHBOARD FUNCTIONS
// ==========================================

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        document.getElementById('statTotalClients').textContent = stats.totalClients || 0;
        document.getElementById('statEmailsSent').textContent = stats.emailsSent || 0;
        document.getElementById('statUnsent').textContent = stats.unsentEmails || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Failed to load dashboard stats', 'error');
    }
}

// ==========================================
// CLIENTS TAB FUNCTIONS
// ==========================================

async function loadClients() {
    try {
        const status = document.getElementById('filterStatus').value;
        const niche = document.getElementById('filterNiche').value;
        const platform = document.getElementById('filterPlatform').value;
        const sortBy = document.getElementById('sortBy').value;

        const params = new URLSearchParams();
        if (status !== 'all') params.append('status', status);
        if (niche !== 'all') params.append('niche', niche);

        const response = await fetch(`/api/clients?${params.toString()}`);
        let clients = await response.json();

        // Client-side platform filtering
        if (platform !== 'all') {
            clients = clients.filter(c => c.platform === platform);
        }

        // Client-side sorting
        clients = sortClients(clients, sortBy);

        allClients = clients;

        renderClientsTable(clients);
        updateNicheFilter(clients);
        updatePlatformFilter(clients);
    } catch (error) {
        console.error('Error loading clients:', error);
        showNotification('Failed to load clients', 'error');
    }
}

function renderClientsTable(clients) {
    const tbody = document.getElementById('clientsTableBody');

    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No clients found. Try different filters or run automation.</td></tr>';
        return;
    }

    tbody.innerHTML = clients.map(client => `
        <tr data-client-id="${escapeHtml(client.$id)}" class="${selectedClients.has(client.$id) ? 'selected' : ''}">
            <td onclick="event.stopPropagation();">
                <input type="checkbox" class="client-checkbox" data-client-id="${escapeHtml(client.$id)}" ${selectedClients.has(client.$id) ? 'checked' : ''}>
            </td>
            <td>${escapeHtml(client.email)}</td>
            <td>${escapeHtml(client.niche || 'N/A')}</td>
            <td>${escapeHtml(client.platform || 'N/A')}</td>
            <td>
                <span style="color: ${client.emailSent ? 'var(--accent-success)' : 'var(--accent-warning)'};">
                    ${client.emailSent ? '✅ Sent' : '⏳ Pending'}
                </span>
            </td>
            <td>${formatDate(client.foundDate || client.$createdAt)}</td>
        </tr>
    `).join('');

    // Add click handlers for rows (not checkboxes)
    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', (e) => {
            // Don't open modal if clicking checkbox
            if (e.target.type !== 'checkbox') {
                const clientId = row.getAttribute('data-client-id');
                openClientModal(clientId);
            }
        });
    });

    // Add change handlers for checkboxes
    tbody.querySelectorAll('.client-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    updateBulkActionsBar();
    updateSelectAllCheckbox();
}

function updateNicheFilter(clients) {
    const nicheSelect = document.getElementById('filterNiche');
    const currentValue = nicheSelect.value;

    // Get unique niches
    const niches = [...new Set(clients.map(c => c.niche).filter(n => n))];

    nicheSelect.innerHTML = '<option value="all">All</option>';
    niches.forEach(niche => {
        const option = document.createElement('option');
        option.value = niche;
        option.textContent = niche;
        nicheSelect.appendChild(option);
    });

    // Restore previous selection if it exists
    if (niches.includes(currentValue)) {
        nicheSelect.value = currentValue;
    }
}

function updatePlatformFilter(clients) {
    const platformSelect = document.getElementById('filterPlatform');
    const currentValue = platformSelect.value;

    // Get unique platforms
    const platforms = [...new Set(clients.map(c => c.platform).filter(p => p))];

    platformSelect.innerHTML = '<option value="all">All</option>';
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform;
        option.textContent = platform;
        platformSelect.appendChild(option);
    });

    // Restore previous selection if it exists
    if (platforms.includes(currentValue)) {
        platformSelect.value = currentValue;
    }
}

function sortClients(clients, sortBy) {
    const sorted = [...clients];

    switch (sortBy) {
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.foundDate || b.$createdAt) - new Date(a.foundDate || a.$createdAt));
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.foundDate || a.$createdAt) - new Date(b.foundDate || b.$createdAt));
        case 'email-asc':
            return sorted.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
        case 'email-desc':
            return sorted.sort((a, b) => (b.email || '').localeCompare(a.email || ''));
        case 'niche-asc':
            return sorted.sort((a, b) => (a.niche || '').localeCompare(b.niche || ''));
        default:
            return sorted;
    }
}

// ==========================================
// CLIENT MODAL FUNCTIONS
// ==========================================

function openClientModal(clientId) {
    const client = allClients.find(c => c.$id === clientId);
    if (!client) return;

    selectedClientId = clientId;

    document.getElementById('modalEmail').textContent = client.email;
    document.getElementById('modalNiche').textContent = client.niche || 'N/A';
    document.getElementById('modalPlatform').textContent = client.platform || 'N/A';
    document.getElementById('modalSubject').value = client.emailSubject || '';
    document.getElementById('modalBody').value = client.emailBody || '';

    const modal = document.getElementById('clientModal');
    modal.classList.add('active');
}

function closeClientModal() {
    const modal = document.getElementById('clientModal');
    modal.classList.remove('active');
    selectedClientId = null;
}

async function saveClientEmail() {
    if (!selectedClientId) return;

    const subject = document.getElementById('modalSubject').value;
    const body = document.getElementById('modalBody').value;

    try {
        showLoading();
        const response = await fetch(`/api/clients/${selectedClientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailSubject: subject, emailBody: body })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Email saved successfully', 'success');
            loadClients(); // Refresh list
        } else {
            showNotification('Failed to save email', 'error');
        }
    } catch (error) {
        console.error('Error saving email:', error);
        showNotification('Failed to save email', 'error');
    } finally {
        hideLoading();
    }
}

async function sendClientEmail() {
    if (!selectedClientId) return;

    if (!confirm('Are you sure you want to send this email?')) return;

    try {
        showLoading();
        const response = await fetch(`/api/clients/${selectedClientId}/send`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Email sent successfully! 🎉', 'success');
            closeClientModal();
            loadClients();
        } else {
            showNotification('Failed to send email: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        showNotification('Failed to send email', 'error');
    } finally {
        hideLoading();
    }
}

async function regenerateClientEmail() {
    if (!selectedClientId) return;

    if (!confirm('This will regenerate the email using Gemini AI. Continue?')) return;

    try {
        showLoading();
        const response = await fetch(`/api/clients/${selectedClientId}/regenerate`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Email regenerated successfully! ✨', 'success');
            document.getElementById('modalSubject').value = result.client.emailSubject || '';
            document.getElementById('modalBody').value = result.client.emailBody || '';
        } else {
            showNotification('Failed to regenerate email', 'error');
        }
    } catch (error) {
        console.error('Error regenerating email:', error);
        showNotification('Failed to regenerate email', 'error');
    } finally {
        hideLoading();
    }
}

// ==========================================
// AUTOMATION WORKFLOW FUNCTIONS
// ==========================================

/**
 * Pre-fill automation form from settings or localStorage
 */
async function prefillAutomationForm() {
    // Try to get last used values from localStorage first
    const lastValues = localStorage.getItem('automationFormValues');
    if (lastValues) {
        try {
            const values = JSON.parse(lastValues);
            if (values.niche) document.getElementById('searchNiche').value = values.niche;
            if (values.country) document.getElementById('searchCountry').value = values.country;
            if (values.emailDomain) document.getElementById('searchEmailDomain').value = values.emailDomain;
            if (values.platforms) document.getElementById('searchPlatforms').value = values.platforms;
            return;
        } catch (e) {
            console.error('Error loading last form values:', e);
        }
    }

    // If no localStorage, try to load from settings
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        // Pre-fill with first niche from settings if available
        if (settings.NICHES) {
            const firstNiche = settings.NICHES.split(',')[0]?.trim();
            if (firstNiche) document.getElementById('searchNiche').value = firstNiche;
        }

        // Pre-fill country from settings
        if (settings.SEARCH_COUNTRY) {
            document.getElementById('searchCountry').value = settings.SEARCH_COUNTRY;
        }

        // Pre-fill email domain from settings (remove @ if present)
        if (settings.EMAIL_DOMAINS) {
            let firstDomain = settings.EMAIL_DOMAINS.split(',')[0]?.trim();
            if (firstDomain) {
                firstDomain = firstDomain.replace('@', ''); // Remove @ symbol
                document.getElementById('searchEmailDomain').value = firstDomain;
            }
        }

        // Pre-fill platforms from settings
        if (settings.SOCIAL_PLATFORMS) {
            document.getElementById('searchPlatforms').value = settings.SOCIAL_PLATFORMS;
        }
    } catch (error) {
        console.error('Error pre-filling form from settings:', error);
    }
}

/**
 * Save automation form values to localStorage
 */
function saveAutomationFormValues() {
    const values = {
        niche: document.getElementById('searchNiche').value.trim(),
        country: document.getElementById('searchCountry').value.trim(),
        emailDomain: document.getElementById('searchEmailDomain').value.trim(),
        platforms: document.getElementById('searchPlatforms').value.trim()
    };

    localStorage.setItem('automationFormValues', JSON.stringify(values));
}

function updateProgressTracker(step) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((stepEl, index) => {
        if (index < step - 1) {
            stepEl.classList.add('completed');
            stepEl.classList.remove('active');
        } else if (index === step - 1) {
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
        } else {
            stepEl.classList.remove('active', 'completed');
        }
    });
}

async function runStep1() {
    const niche = document.getElementById('searchNiche').value.trim();
    const country = document.getElementById('searchCountry').value.trim();
    const emailDomain = document.getElementById('searchEmailDomain').value.trim();
    const platforms = document.getElementById('searchPlatforms').value.trim();

    // Validation
    if (!niche || !country || !emailDomain || !platforms) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    if (niche.includes(',')) {
        showNotification('Niche must be a single value (no commas)', 'error');
        return;
    }

    if (country.includes(',')) {
        showNotification('Country must be a single value (no commas)', 'error');
        return;
    }

    if (emailDomain.includes(',') || emailDomain.includes('@')) {
        showNotification('Email domain must be a single value without @ or commas (e.g., "gmail.com")', 'error');
        return;
    }

    try {
        // Save form values to localStorage for next time
        saveAutomationFormValues();

        updateProgressTracker(1);

        const response = await fetch('/api/automate/step1-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                niche,
                country,
                emailProvider: emailDomain,
                platforms
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`Step 1 complete! Found ${result.count} clients`, 'success');
            document.getElementById('step1Container').style.display = 'none';
            document.getElementById('step2Container').style.display = 'block';
            document.getElementById('step2Info').textContent = `Found ${result.count} clients. Ready to generate personalized emails.`;
            updateProgressTracker(2);
        } else {
            showNotification('Step 1 failed: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error in Step 1:', error);
        showNotification('Step 1 failed: ' + error.message, 'error');
    }
}

async function runStep2() {
    try {
        const response = await fetch('/api/automate/step2-generate', {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`Step 2 complete! Generated ${result.count} emails ✨`, 'success');
            document.getElementById('step2Container').style.display = 'none';
            document.getElementById('step3Container').style.display = 'block';
            document.getElementById('step3Info').textContent = `Generated ${result.count} personalized emails using Gemini AI.`;
            updateProgressTracker(3);
        } else {
            showNotification('Step 2 failed: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error in Step 2:', error);
        showNotification('Step 2 failed: ' + error.message, 'error');
    }
}

async function runStep3() {
    try {
        const response = await fetch('/api/automate/step3-confirm', {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Step 3 complete! All data confirmed ✅', 'success');
            document.getElementById('step3Container').style.display = 'none';
            document.getElementById('step4Container').style.display = 'block';
            updateProgressTracker(4);
        } else {
            showNotification('Step 3 failed', 'error');
        }
    } catch (error) {
        console.error('Error in Step 3:', error);
        showNotification('Step 3 failed: ' + error.message, 'error');
    }
}

async function runStep4() {
    const sendImmediate = document.getElementById('sendImmediate').checked;

    if (!sendImmediate) {
        showNotification('Please check "Send immediately" to proceed', 'warning');
        return;
    }

    if (!confirm('This will send emails to all clients. Are you sure?')) return;

    try {
        const response = await fetch('/api/automate/step4-send', {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`Step 4 complete! Sent: ${result.sent}, Failed: ${result.failed} 📧`, 'success');
            document.getElementById('step4Info').textContent = `Emails sent: ${result.sent}, Failed: ${result.failed}`;
        } else {
            showNotification('Step 4 failed: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error in Step 4:', error);
        showNotification('Step 4 failed: ' + error.message, 'error');
    }
}

async function resetAutomation() {
    if (!confirm('This will reset the automation workflow. Continue?')) return;

    try {
        await fetch('/api/automate/reset', { method: 'POST' });

        // Reset UI
        document.getElementById('step1Container').style.display = 'block';
        document.getElementById('step2Container').style.display = 'none';
        document.getElementById('step3Container').style.display = 'none';
        document.getElementById('step4Container').style.display = 'none';

        document.getElementById('step1Form').reset();
        updateProgressTracker(1);

        showNotification('Automation reset successfully', 'info');
    } catch (error) {
        console.error('Error resetting automation:', error);
        showNotification('Failed to reset automation', 'error');
    }
}

// ==========================================
// SERVER-SENT EVENTS (SSE)
// ==========================================

function initSSE() {
    if (eventSource) {
        eventSource.close();
    }

    eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'log') {
                addLogEntry(data.data);
            } else if (data.type === 'state') {
                updateAutomationState(data.data);
            }
        } catch (error) {
            console.error('Error parsing SSE data:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
            console.log('Reconnecting SSE...');
            initSSE();
        }, 5000);
    };
}

function addLogEntry(log) {
    const terminal = document.getElementById('logTerminal');
    const entry = document.createElement('div');
    entry.className = `log-entry ${log.type}`;

    entry.innerHTML = `
        <span class="log-time">[${log.time}]</span>
        <span class="log-message">${escapeHtml(log.message)}</span>
    `;

    terminal.appendChild(entry);

    // Auto-scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;

    // Limit log entries to prevent memory issues
    const entries = terminal.querySelectorAll('.log-entry');
    if (entries.length > 500) {
        entries[0].remove();
    }
}

function updateAutomationState(state) {
    if (state.currentStep) {
        updateProgressTracker(state.currentStep);
    }
}

function clearLogs() {
    const terminal = document.getElementById('logTerminal');
    terminal.innerHTML = `
        <div class="log-entry info">
            <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
            <span class="log-message">Logs cleared. Ready for new events...</span>
        </div>
    `;
}

// ==========================================
// SETTINGS FUNCTIONS
// ==========================================

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        // Populate basic text inputs
        Object.keys(settings).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = settings[key] === true || settings[key] === 'true';
                } else {
                    input.value = settings[key] || '';
                }
            }
        });

    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Failed to load settings', 'error');
    }
}

async function saveSettings(e) {
    if (e) e.preventDefault();

    try {
        const formData = new FormData(document.getElementById('settingsForm'));
        const settings = Object.fromEntries(formData.entries());

        // Handle unchecked checkboxes
        document.querySelectorAll('#settingsForm input[type="checkbox"]').forEach(cb => {
            settings[cb.name] = cb.checked;
        });

        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Settings saved successfully! ✅', 'success');
        } else {
            showNotification('Failed to save settings', 'error');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Failed to save settings', 'error');
    } finally {
        hideLoading();
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        if (currentTab === 'dashboard') loadDashboardStats();
        if (currentTab === 'clients') loadClients();
        showNotification('Data refreshed', 'info');
    });

    // Clients filters
    document.getElementById('applyFilters').addEventListener('click', loadClients);

    // Client modal
    document.getElementById('closeModal').addEventListener('click', closeClientModal);
    document.getElementById('modalClose').addEventListener('click', closeClientModal);
    document.getElementById('modalSave').addEventListener('click', saveClientEmail);
    document.getElementById('modalSend').addEventListener('click', sendClientEmail);
    document.getElementById('modalRegenerate').addEventListener('click', regenerateClientEmail);

    // Close modal on outside click
    document.getElementById('clientModal').addEventListener('click', (e) => {
        if (e.target.id === 'clientModal') closeClientModal();
    });

    // Bulk selection
    document.getElementById('selectAll').addEventListener('change', handleSelectAll);

    // Bulk actions
    document.getElementById('bulkGenerate').addEventListener('click', bulkGenerateEmails);
    document.getElementById('bulkSend').addEventListener('click', bulkSendEmails);
    document.getElementById('bulkDelete').addEventListener('click', bulkDeleteClients);

    // Automation steps
    document.getElementById('step1Form').addEventListener('submit', (e) => {
        e.preventDefault();
        runStep1();
    });
    document.getElementById('step2Btn').addEventListener('click', runStep2);
    document.getElementById('step3Btn').addEventListener('click', runStep3);
    document.getElementById('step4Btn').addEventListener('click', runStep4);
    document.getElementById('resetAutomation').addEventListener('click', resetAutomation);

    // Log terminal
    document.getElementById('clearLogs').addEventListener('click', clearLogs);

    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Email Automation Platform - Initializing...');

    initTabNavigation();
    initEventListeners();
    initSSE();
    loadDashboardStats();

    console.log('✅ Application ready!');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (eventSource) {
        eventSource.close();
    }
});
// ==========================================
// BULK OPERATIONS FUNCTIONALITY
// ==========================================

/**
 * Handle individual checkbox change
 */
function handleCheckboxChange(e) {
    const clientId = e.target.getAttribute('data-client-id');
    const row = e.target.closest('tr');

    if (e.target.checked) {
        selectedClients.add(clientId);
        row.classList.add('selected');
    } else {
        selectedClients.delete(clientId);
        row.classList.remove('selected');
    }

    updateBulkActionsBar();
    updateSelectAllCheckbox();
}

/**
 * Handle select all checkbox
 */
function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.client-checkbox');

    if (e.target.checked) {
        // Select all
        checkboxes.forEach(cb => {
            const clientId = cb.getAttribute('data-client-id');
            selectedClients.add(clientId);
            cb.checked = true;
            cb.closest('tr').classList.add('selected');
        });
    } else {
        // Deselect all
        selectedClients.clear();
        checkboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('tr').classList.remove('selected');
        });
    }

    updateBulkActionsBar();
}

/**
 * Update select all checkbox state
 */
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.client-checkbox');

    if (checkboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }

    const selectedCount = selectedClients.size;
    const totalCount = checkboxes.length;

    if (selectedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === totalCount) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

/**
 * Update bulk actions bar visibility and count
 */
function updateBulkActionsBar() {
    const bulkBar = document.getElementById('bulkActionsBar');
    const selectedCountEl = document.getElementById('selectedCount');

    if (selectedClients.size > 0) {
        bulkBar.style.display = 'flex';
        selectedCountEl.textContent = selectedClients.size;
    } else {
        bulkBar.style.display = 'none';
    }
}

/**
 * Bulk generate emails
 */
async function bulkGenerateEmails() {
    if (selectedClients.size === 0) {
        showNotification('No clients selected', 'warning');
        return;
    }

    if (!confirm(`Generate emails for ${selectedClients.size} selected client(s)?`)) return;

    try {
        let successCount = 0;
        let failCount = 0;

        for (const clientId of selectedClients) {
            try {
                const response = await fetch(`/api/clients/${clientId}/regenerate`, {
                    method: 'POST'
                });
                const result = await response.json();

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Error generating email for ${clientId}:`, error);
                failCount++;
            }
        }

        showNotification(`✨ Generated: ${successCount}, Failed: ${failCount}`, 'success');
        loadClients(); // Refresh list
        selectedClients.clear();
        updateBulkActionsBar();
    } catch (error) {
        console.error('Bulk generate error:', error);
        showNotification('Bulk generation failed', 'error');
    }
}

/**
 * Bulk send emails
 */
async function bulkSendEmails() {
    if (selectedClients.size === 0) {
        showNotification('No clients selected', 'warning');
        return;
    }

    if (!confirm(`Send emails to ${selectedClients.size} selected client(s)? This cannot be undone.`)) return;

    try {
        let successCount = 0;
        let failCount = 0;

        for (const clientId of selectedClients) {
            try {
                const response = await fetch(`/api/clients/${clientId}/send`, {
                    method: 'POST'
                });
                const result = await response.json();

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error sending email to ${clientId}:`, error);
                failCount++;
            }
        }

        showNotification(`📧 Sent: ${successCount}, Failed: ${failCount}`, 'success');
        loadClients(); // Refresh list
        selectedClients.clear();
        updateBulkActionsBar();
    } catch (error) {
        console.error('Bulk send error:', error);
        showNotification('Bulk send failed', 'error');
    }
}

/**
 * Bulk delete clients
 */
async function bulkDeleteClients() {
    if (selectedClients.size === 0) {
        showNotification('No clients selected', 'warning');
        return;
    }

    if (!confirm(`⚠️ Delete ${selectedClients.size} selected client(s)? This cannot be undone!`)) return;

    try {
        let successCount = 0;
        let failCount = 0;

        for (const clientId of selectedClients) {
            try {
                const response = await fetch(`/api/clients/${clientId}`, {
                    method: 'DELETE'
                });
                const result = await response.json();

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Error deleting client ${clientId}:`, error);
                failCount++;
            }
        }

        showNotification(`🗑️ Deleted: ${successCount}, Failed: ${failCount}`, 'success');
        loadClients(); // Refresh list
        selectedClients.clear();
        updateBulkActionsBar();
    } catch (error) {
        console.error('Bulk delete error:', error);
        showNotification('Bulk delete failed', 'error');
    }
}
