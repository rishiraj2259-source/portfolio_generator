// ========================================
// Portfolio Builder - Main Application
// ========================================

// State Management
const state = {
    profile: {
        name: '',
        title: '',
        bio: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        customSocial: '',
        photo: null
    },
    projects: [],
    skills: [],
    experience: [],
    education: [],
    customize: {
        template: 'modern',
        colorScheme: 'default',
        customColor: '#3b82f6',
        fontHeading: 'Inter',
        fontBody: 'Inter',
        darkMode: false,
        compactMode: false,
        showBorders: true,
        animateElements: true,
        sectionSpacing: 1.5,
        borderRadius: 8
    },
    previewDevice: 'desktop',
    isDirty: false,
    autoSaveTimer: null,
    editingId: null
};

// DOM Elements Cache
const elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    cacheElements();
    loadDraft();
    setupEventListeners();
    renderAll();
    updatePreview();
    startAutoSave();
    updateWordCount();
});

// Cache DOM Elements
function cacheElements() {
    elements.sidebar = document.getElementById('sidebar');
    elements.sidebarOverlay = document.getElementById('sidebar-overlay');
    elements.sidebarToggle = document.getElementById('sidebar-toggle');
    elements.previewFrame = document.getElementById('preview-frame');
    elements.previewWrapper = document.getElementById('preview-frame-wrapper');
    elements.projectsList = document.getElementById('projects-list');
    elements.skillsContainer = document.getElementById('skills-container');
    elements.experienceList = document.getElementById('experience-list');
    elements.educationList = document.getElementById('education-list');
    elements.photoPreview = document.getElementById('photo-preview');
    elements.photoInput = document.getElementById('photo-input');
    elements.saveStatus = document.getElementById('save-status');
    elements.statusText = document.getElementById('status-text');
    elements.lastSaved = document.getElementById('last-saved');
    elements.wordCount = document.getElementById('word-count');
    elements.toastContainer = document.getElementById('toast-container');
    
    // Form inputs
    elements.fullName = document.getElementById('full-name');
    elements.title = document.getElementById('title');
    elements.bio = document.getElementById('bio');
    elements.email = document.getElementById('email');
    elements.phone = document.getElementById('phone');
    elements.location = document.getElementById('location');
    elements.website = document.getElementById('website');
    elements.linkedin = document.getElementById('linkedin');
    elements.github = document.getElementById('github');
    elements.twitter = document.getElementById('twitter');
    elements.customSocial = document.getElementById('custom-social');
    
    // Customize elements
    elements.fontHeading = document.getElementById('font-heading');
    elements.fontBody = document.getElementById('font-body');
    elements.darkMode = document.getElementById('dark-mode');
    elements.compactMode = document.getElementById('compact-mode');
    elements.showBorders = document.getElementById('show-borders');
    elements.animateElements = document.getElementById('animate-elements');
    elements.sectionSpacing = document.getElementById('section-spacing');
    elements.borderRadius = document.getElementById('border-radius');
    elements.spacingValue = document.getElementById('spacing-value');
    elements.radiusValue = document.getElementById('radius-value');
}

// Setup Event Listeners
function setupEventListeners() {
    // Profile inputs - map HTML IDs to state keys
    const profileInputMap = {
        fullName: 'name',
        title: 'title',
        bio: 'bio',
        email: 'email',
        phone: 'phone',
        location: 'location',
        website: 'website',
        linkedin: 'linkedin',
        github: 'github',
        twitter: 'twitter',
        customSocial: 'customSocial'
    };
    
    Object.entries(profileInputMap).forEach(([elementId, stateKey]) => {
        if (elements[elementId]) {
            elements[elementId].addEventListener('input', () => {
                state.profile[stateKey] = elements[elementId].value;
                markDirty();
                updatePreview();
                updateWordCount();
            });
        }
    });
    
    // Template selector
    document.getElementById('template-select').addEventListener('change', (e) => {
        state.customize.template = e.target.value;
        markDirty();
        updatePreview();
    });
    
    // Customize inputs
    elements.fontHeading.addEventListener('change', () => {
        state.customize.fontHeading = elements.fontHeading.value;
        markDirty();
        updatePreview();
    });
    
    elements.fontBody.addEventListener('change', () => {
        state.customize.fontBody = elements.fontBody.value;
        markDirty();
        updatePreview();
    });
    
    elements.darkMode.addEventListener('change', () => {
        state.customize.darkMode = elements.darkMode.checked;
        setWebsiteTheme(elements.darkMode.checked ? 'dark' : 'light', false);
        markDirty();
        updatePreview();
    });
    
    elements.compactMode.addEventListener('change', () => {
        state.customize.compactMode = elements.compactMode.checked;
        markDirty();
        updatePreview();
    });
    
    elements.showBorders.addEventListener('change', () => {
        state.customize.showBorders = elements.showBorders.checked;
        markDirty();
        updatePreview();
    });
    
    elements.animateElements.addEventListener('change', () => {
        state.customize.animateElements = elements.animateElements.checked;
        markDirty();
        updatePreview();
    });
    
    elements.sectionSpacing.addEventListener('input', () => {
        state.customize.sectionSpacing = parseFloat(elements.sectionSpacing.value);
        elements.spacingValue.textContent = state.customize.sectionSpacing + 'rem';
        markDirty();
        updatePreview();
    });
    
    elements.borderRadius.addEventListener('input', () => {
        state.customize.borderRadius = parseInt(elements.borderRadius.value);
        elements.radiusValue.textContent = state.customize.borderRadius + 'px';
        markDirty();
        updatePreview();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveDraft();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportPortfolio();
        }
        if (e.key === 'Escape') {
            closeAllModals();
            closeSidebar();
        }
    });
    
    // Sidebar toggle (mobile)
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking a nav item on mobile
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Window before unload
    window.addEventListener('beforeunload', (e) => {
        if (state.isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// ========================================
// Section Navigation
// ========================================
function showSection(sectionName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });
    
    // Update panels
    document.querySelectorAll('.section-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === 'section-' + sectionName);
    });
}

// ========================================
// Sidebar Toggle (Mobile)
// ========================================
function toggleSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.toggle('open');
    }
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.classList.toggle('active');
    }
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = elements.sidebar?.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.remove('open');
    }
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function handleResize() {
    // Close sidebar on desktop resize
    if (window.innerWidth > 1024) {
        closeSidebar();
    }
    
    // Update preview frame size
    updatePreview();
}

// ========================================
// Profile Photo Handling
// ========================================
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        state.profile.photo = e.target.result;
        renderPhotoPreview();
        markDirty();
        updatePreview();
        showToast('Profile photo updated');
    };
    reader.readAsDataURL(file);
}

function renderPhotoPreview() {
    if (state.profile.photo) {
        elements.photoPreview.innerHTML = `<img src="${state.profile.photo}" alt="Profile">`;
    } else {
        elements.photoPreview.innerHTML = `
            <svg class="photo-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M12 14c-5 0-8 3-8 6v2h16v-2c0-3-3-6-8-6z"/>
            </svg>
        `;
    }
}

function removePhoto() {
    state.profile.photo = null;
    elements.photoInput.value = '';
    renderPhotoPreview();
    markDirty();
    updatePreview();
    showToast('Profile photo removed');
}

// ========================================
// Project Management
// ========================================
function addProject() {
    state.editingId = null;
    document.getElementById('project-modal-title').textContent = 'Add Project';
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    openModal('project-modal');
}

function editProject(id) {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    
    state.editingId = id;
    document.getElementById('project-modal-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = id;
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-tech').value = project.technologies.join(', ');
    document.getElementById('project-url').value = project.url || '';
    document.getElementById('project-github').value = project.github || '';
    document.getElementById('project-image').value = project.image || '';
    document.getElementById('project-featured').value = project.featured ? 'true' : 'false';
    openModal('project-modal');
}

function saveProject(event) {
    event.preventDefault();
    
    const projectData = {
        id: state.editingId || generateId(),
        name: document.getElementById('project-name').value.trim(),
        description: document.getElementById('project-description').value.trim(),
        technologies: document.getElementById('project-tech').value.split(',').map(t => t.trim()).filter(t => t),
        url: document.getElementById('project-url').value.trim(),
        github: document.getElementById('project-github').value.trim(),
        image: document.getElementById('project-image').value.trim(),
        featured: document.getElementById('project-featured').value === 'true'
    };
    
    if (!projectData.name) {
        showToast('Project name is required', 'error');
        return;
    }
    
    if (state.editingId) {
        const index = state.projects.findIndex(p => p.id === state.editingId);
        if (index !== -1) state.projects[index] = projectData;
        showToast('Project updated');
    } else {
        state.projects.unshift(projectData);
        showToast('Project added');
    }
    
    closeModal(null, 'project-modal');
    renderProjects();
    markDirty();
    updatePreview();
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        state.projects = state.projects.filter(p => p.id !== id);
        renderProjects();
        markDirty();
        updatePreview();
        showToast('Project deleted');
    }
}

function renderProjects() {
    if (state.projects.length === 0) {
        elements.projectsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <p>No projects yet</p>
                <button class="btn btn-primary btn-sm" onclick="addProject()">Add Your First Project</button>
            </div>
        `;
        return;
    }
    
    elements.projectsList.innerHTML = state.projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(project.name)}</div>
                    ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                </div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="editProject('${project.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="deleteProject('${project.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            ${project.description ? `<div class="card-field">${escapeHtml(project.description)}</div>` : ''}
            ${project.technologies.length > 0 ? `
                <div class="card-tags">
                    ${project.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="card-field">
                <strong>Links:</strong> 
                ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener">Live Demo</a>` : ''}
                ${project.github ? ` | <a href="${project.github}" target="_blank" rel="noopener">GitHub</a>` : ''}
            </div>
        </div>
    `).join('');
}

// ========================================
// Skills Management
// ========================================
function addSkillCategory() {
    state.editingId = null;
    document.getElementById('skill-modal-title').textContent = 'Add Skill Category';
    document.getElementById('skill-form').reset();
    document.getElementById('skill-category-id').value = '';
    openModal('skill-modal');
}

function editSkillCategory(id) {
    const category = state.skills.find(s => s.id === id);
    if (!category) return;
    
    state.editingId = id;
    document.getElementById('skill-modal-title').textContent = 'Edit Skill Category';
    document.getElementById('skill-category-id').value = id;
    document.getElementById('skill-category-name').value = category.name;
    document.getElementById('skill-items').value = category.items.join(', ');
    openModal('skill-modal');
}

function saveSkillCategory(event) {
    event.preventDefault();
    
    const categoryData = {
        id: state.editingId || generateId(),
        name: document.getElementById('skill-category-name').value.trim(),
        items: document.getElementById('skill-items').value.split(',').map(t => t.trim()).filter(t => t)
    };
    
    if (!categoryData.name) {
        showToast('Category name is required', 'error');
        return;
    }
    
    if (state.editingId) {
        const index = state.skills.findIndex(s => s.id === state.editingId);
        if (index !== -1) state.skills[index] = categoryData;
        showToast('Skill category updated');
    } else {
        state.skills.push(categoryData);
        showToast('Skill category added');
    }
    
    closeModal(null, 'skill-modal');
    renderSkills();
    markDirty();
    updatePreview();
}

function deleteSkillCategory(id) {
    if (confirm('Are you sure you want to delete this skill category?')) {
        state.skills = state.skills.filter(s => s.id !== id);
        renderSkills();
        markDirty();
        updatePreview();
        showToast('Skill category deleted');
    }
}

function renderSkills() {
    if (state.skills.length === 0) {
        elements.skillsContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p>No skills added yet</p>
                <button class="btn btn-primary btn-sm" onclick="addSkillCategory()">Add Skill Category</button>
            </div>
        `;
        return;
    }
    
    elements.skillsContainer.innerHTML = state.skills.map(category => `
        <div class="skill-category" data-id="${category.id}">
            <div class="skill-category-header">
                <div class="skill-category-name">${escapeHtml(category.name)}</div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="editSkillCategory('${category.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="deleteSkillCategory('${category.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="skill-items">
                ${category.items.map(item => `<span class="skill-tag">${escapeHtml(item)}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// ========================================
// Experience Management
// ========================================
function addExperience() {
    state.editingId = null;
    document.getElementById('experience-modal-title').textContent = 'Add Experience';
    document.getElementById('experience-form').reset();
    document.getElementById('experience-id').value = '';
    document.getElementById('exp-current').checked = false;
    document.getElementById('exp-end').disabled = false;
    openModal('experience-modal');
}

function editExperience(id) {
    const exp = state.experience.find(e => e.id === id);
    if (!exp) return;
    
    state.editingId = id;
    document.getElementById('experience-modal-title').textContent = 'Edit Experience';
    document.getElementById('experience-id').value = id;
    document.getElementById('exp-company').value = exp.company;
    document.getElementById('exp-role').value = exp.role;
    document.getElementById('exp-start').value = exp.startDate || '';
    document.getElementById('exp-end').value = exp.endDate || '';
    document.getElementById('exp-current').checked = exp.current;
    document.getElementById('exp-end').disabled = exp.current;
    document.getElementById('exp-description').value = exp.description;
    document.getElementById('exp-technologies').value = exp.technologies.join(', ');
    openModal('experience-modal');
}

function saveExperience(event) {
    event.preventDefault();
    
    const expData = {
        id: state.editingId || generateId(),
        company: document.getElementById('exp-company').value.trim(),
        role: document.getElementById('exp-role').value.trim(),
        startDate: document.getElementById('exp-start').value,
        endDate: document.getElementById('exp-end').value,
        current: document.getElementById('exp-current').checked,
        description: document.getElementById('exp-description').value.trim(),
        technologies: document.getElementById('exp-technologies').value.split(',').map(t => t.trim()).filter(t => t)
    };
    
    if (!expData.company || !expData.role) {
        showToast('Company and role are required', 'error');
        return;
    }
    
    if (state.editingId) {
        const index = state.experience.findIndex(e => e.id === state.editingId);
        if (index !== -1) state.experience[index] = expData;
        showToast('Experience updated');
    } else {
        state.experience.unshift(expData);
        showToast('Experience added');
    }
    
    closeModal(null, 'experience-modal');
    renderExperience();
    markDirty();
    updatePreview();
}

function deleteExperience(id) {
    if (confirm('Are you sure you want to delete this experience?')) {
        state.experience = state.experience.filter(e => e.id !== id);
        renderExperience();
        markDirty();
        updatePreview();
        showToast('Experience deleted');
    }
}

function toggleCurrentJob(checked) {
    document.getElementById('exp-end').disabled = checked;
    if (checked) document.getElementById('exp-end').value = '';
}

function renderExperience() {
    if (state.experience.length === 0) {
        elements.experienceList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <p>No work experience added</p>
                <button class="btn btn-primary btn-sm" onclick="addExperience()">Add Experience</button>
            </div>
        `;
        return;
    }
    
    // Sort by start date descending
    const sorted = [...state.experience].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
        const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
        return dateB - dateA;
    });
    
    elements.experienceList.innerHTML = sorted.map(exp => `
        <div class="experience-card" data-id="${exp.id}">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(exp.role)}</div>
                    <div class="card-field"><strong>${escapeHtml(exp.company)}</strong></div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="editExperience('${exp.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="deleteExperience('${exp.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="card-meta">
                ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
            </div>
            ${exp.description ? `<div class="card-field" style="margin-top: 8px;">${escapeHtml(exp.description)}</div>` : ''}
            ${exp.technologies.length > 0 ? `
                <div class="card-tags" style="margin-top: 8px;">
                    ${exp.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ========================================
// Education Management
// ========================================
function addEducation() {
    state.editingId = null;
    document.getElementById('education-modal-title').textContent = 'Add Education';
    document.getElementById('education-form').reset();
    document.getElementById('education-id').value = '';
    openModal('education-modal');
}

function editEducation(id) {
    const edu = state.education.find(e => e.id === id);
    if (!edu) return;
    
    state.editingId = id;
    document.getElementById('education-modal-title').textContent = 'Edit Education';
    document.getElementById('education-id').value = id;
    document.getElementById('edu-institution').value = edu.institution;
    document.getElementById('edu-degree').value = edu.degree;
    document.getElementById('edu-start').value = edu.startYear || '';
    document.getElementById('edu-end').value = edu.endYear || '';
    document.getElementById('edu-description').value = edu.description || '';
    openModal('education-modal');
}

function saveEducation(event) {
    event.preventDefault();
    
    const eduData = {
        id: state.editingId || generateId(),
        institution: document.getElementById('edu-institution').value.trim(),
        degree: document.getElementById('edu-degree').value.trim(),
        startYear: parseInt(document.getElementById('edu-start').value) || null,
        endYear: parseInt(document.getElementById('edu-end').value) || null,
        description: document.getElementById('edu-description').value.trim()
    };
    
    if (!eduData.institution || !eduData.degree) {
        showToast('Institution and degree are required', 'error');
        return;
    }
    
    if (state.editingId) {
        const index = state.education.findIndex(e => e.id === state.editingId);
        if (index !== -1) state.education[index] = eduData;
        showToast('Education updated');
    } else {
        state.education.unshift(eduData);
        showToast('Education added');
    }
    
    closeModal(null, 'education-modal');
    renderEducation();
    markDirty();
    updatePreview();
}

function deleteEducation(id) {
    if (confirm('Are you sure you want to delete this education entry?')) {
        state.education = state.education.filter(e => e.id !== id);
        renderEducation();
        markDirty();
        updatePreview();
        showToast('Education deleted');
    }
}

function renderEducation() {
    if (state.education.length === 0) {
        elements.educationList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
                <p>No education added yet</p>
                <button class="btn btn-primary btn-sm" onclick="addEducation()">Add Education</button>
            </div>
        `;
        return;
    }
    
    // Sort by end year descending
    const sorted = [...state.education].sort((a, b) => (b.endYear || 0) - (a.endYear || 0));
    
    elements.educationList.innerHTML = sorted.map(edu => `
        <div class="education-card" data-id="${edu.id}">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(edu.degree)}</div>
                    <div class="card-field"><strong>${escapeHtml(edu.institution)}</strong></div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="editEducation('${edu.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="deleteEducation('${edu.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="card-meta">
                ${edu.startYear || ''} - ${edu.endYear || 'Present'}
            </div>
            ${edu.description ? `<div class="card-field" style="margin-top: 8px;">${escapeHtml(edu.description)}</div>` : ''}
        </div>
    `).join('');
}

// ========================================
// Customization
// ========================================
function setColorScheme(scheme) {
    state.customize.colorScheme = scheme;
    
    const colorMap = {
        default: '#3b82f6',
        blue: '#0ea5e9',
        green: '#10b981',
        purple: '#8b5cf6',
        orange: '#f97316',
        red: '#ef4444'
    };
    
    if (colorMap[scheme]) {
        state.customize.customColor = colorMap[scheme];
    }
    
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.scheme === scheme);
    });
    
    markDirty();
    updatePreview();
}

function openColorPicker() {
    document.getElementById('custom-color-picker').click();
}

function setCustomColor(color) {
    state.customize.colorScheme = 'custom';
    state.customize.customColor = color;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    markDirty();
    updatePreview();
}

function setFont(type, font) {
    state.customize[`font${type.charAt(0).toUpperCase() + type.slice(1)}`] = font;
    markDirty();
    updatePreview();
}

function setWebsiteTheme(theme, syncCustomize = true) {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('website-theme', theme);
    } catch (e) {}

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        const icon = document.getElementById('theme-toggle-icon');
        const text = document.getElementById('theme-toggle-text');
        if (icon) icon.textContent = isDark ? '🌙' : '☀️';
        if (text) text.textContent = isDark ? 'Dark' : 'Light';
        toggleBtn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    if (syncCustomize) {
        state.customize.darkMode = isDark;
        if (elements.darkMode) {
            elements.darkMode.checked = isDark;
        }
        markDirty();
        updatePreview();
    }
}

function toggleWebsiteTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setWebsiteTheme(nextTheme, true);
    showToast(`Switched to ${nextTheme} theme`, 'info');
}

function toggleDarkMode(enabled) {
    state.customize.darkMode = enabled;
    setWebsiteTheme(enabled ? 'dark' : 'light', false);
    markDirty();
    updatePreview();
}

function applyDarkMode() {
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('website-theme');
    } catch (e) {}
    const theme = savedTheme || (state.customize.darkMode ? 'dark' : 'dark');
    setWebsiteTheme(theme, false);
}

function toggleCompactMode(enabled) {
    state.customize.compactMode = enabled;
    markDirty();
    updatePreview();
}

function toggleBorders(enabled) {
    state.customize.showBorders = enabled;
    markDirty();
    updatePreview();
}

function toggleAnimations(enabled) {
    state.customize.animateElements = enabled;
    markDirty();
    updatePreview();
}

function updateSpacing(value) {
    state.customize.sectionSpacing = parseFloat(value);
    elements.spacingValue.textContent = value + 'rem';
    markDirty();
    updatePreview();
}

function updateRadius(value) {
    state.customize.borderRadius = parseInt(value);
    elements.radiusValue.textContent = value + 'px';
    markDirty();
    updatePreview();
}

// ========================================
// Preview
// ========================================
function updatePreview() {
    const html = generatePortfolioHTML();
    elements.previewFrame.srcdoc = html;
}

function generatePortfolioHTML() {
    const { profile, projects, skills, experience, education, customize } = state;
    const primaryColor = customize.customColor;
    const isDark = customize.darkMode;
    
    // Template-specific styles
    const templateStyles = getTemplateStyles(customize.template);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(profile.name)} | ${escapeHtml(profile.title)}</title>
    <meta name="description" content="${escapeHtml(profile.bio || 'Professional portfolio')}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        ${getBaseStyles(primaryColor, customize, isDark)}
        ${templateStyles}
        ${getEnhanceCSS(primaryColor, isDark)}
    </style>
</head>
<body class="${isDark ? 'dark' : ''} ${customize.compactMode ? 'compact' : ''} ${customize.animateElements ? 'animate' : ''}">
    <div class="portfolio-container">
        ${generateHeader(profile, primaryColor, customize)}
        <main class="portfolio-main">
            ${profile.bio ? generateAbout(profile, primaryColor, customize) : ''}
            ${projects.length > 0 ? generateProjects(projects, primaryColor, customize) : ''}
            ${skills.length > 0 ? generateSkills(skills, primaryColor, customize) : ''}
            ${experience.length > 0 ? generateExperience(experience, primaryColor, customize) : ''}
            ${education.length > 0 ? generateEducation(education, primaryColor, customize) : ''}
        </main>
        ${generateFooter(profile, primaryColor, customize)}
    </div>
    <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
            });
        });
        ${ENHANCE_JS}
    </script>
</body>
</html>`;
}

// ===== Interactive layer added to every exported portfolio =====
const ENHANCE_JS = String.raw`(function(){
var d=document,RM=matchMedia('(prefers-reduced-motion: reduce)').matches,FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
var AC=(getComputedStyle(d.documentElement).getPropertyValue('--accent')||'#8b5cf6').trim();
function mk(t,id){var e=d.createElement(t);e.id=id;d.body.appendChild(e);return e}
var pg=mk('div','pg'),dock=mk('nav','dock');
d.querySelectorAll('.section[id]').forEach(function(s){var t=s.querySelector('.section-title'),a=d.createElement('a');a.href='#'+s.id;a.textContent=t?t.textContent:s.id;dock.appendChild(a)});
var up=d.createElement('a');up.textContent='\u2191';up.setAttribute('role','button');up.onclick=function(){scrollTo({top:0,behavior:'smooth'})};dock.appendChild(up);
function onScroll(){var h=d.documentElement.scrollHeight-innerHeight;pg.style.width=(h>0?scrollY/h*100:0)+'%';dock.classList.toggle('show',scrollY>240)}
addEventListener('scroll',onScroll,{passive:true});onScroll();
var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)[].forEach.call(dock.children,function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
d.querySelectorAll('.section[id]').forEach(function(s){io2.observe(s)});
if(!RM){
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
 d.querySelectorAll('.portfolio-header .profile-photo,.portfolio-header h1,.portfolio-header .title,.portfolio-header .bio,.section-title,.card,.experience-item,.education-item').forEach(function(n,i){n.classList.add('rv');n.style.animationDelay=(i%4)*90+'ms';io.observe(n)});
 var ti=d.querySelector('.portfolio-header .title');
 if(ti&&!ti.children.length){var full=ti.textContent.trim(),k=0;ti.textContent='';ti.classList.add('tw');(function t(){ti.textContent=full.slice(0,++k);if(k<full.length)setTimeout(t,55)})()}
 var cv=mk('canvas','bg'),cx=cv.getContext('2d'),W,H,P=[],m={x:-999,y:-999};
 function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight;var n=Math.min(80,Math.floor(W*H/18000));P=[];for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4})}
 rs();addEventListener('resize',rs);addEventListener('mousemove',function(e){m.x=e.clientX;m.y=e.clientY});
 (function f(){cx.clearRect(0,0,W,H);cx.fillStyle=AC;cx.strokeStyle=AC;
  for(var i=0;i<P.length;i++){var p=P[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
   var dx=p.x-m.x,dy=p.y-m.y,dm=Math.sqrt(dx*dx+dy*dy)||1;if(dm<140){p.x+=dx/dm*1.2;p.y+=dy/dm*1.2}
   cx.globalAlpha=.6;cx.beginPath();cx.arc(p.x,p.y,1.6,0,6.283);cx.fill();
   for(var j=i+1;j<P.length;j++){var q=P[j],a=p.x-q.x,b=p.y-q.y,dd=a*a+b*b;if(dd<14400){cx.globalAlpha=(1-dd/14400)*.25;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}}}
  requestAnimationFrame(f)})();
 if(FINE){
  var sp=mk('div','spot');addEventListener('mousemove',function(e){sp.style.setProperty('--mx',e.clientX+'px');sp.style.setProperty('--my',e.clientY+'px')});
  d.querySelectorAll('.card').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty('--cx',x+'px');c.style.setProperty('--cy',y+'px');c.style.transform='perspective(800px) rotateX('+((y/r.height-.5)*-8)+'deg) rotateY('+((x/r.width-.5)*8)+'deg) translateY(-4px)'});c.addEventListener('mouseleave',function(){c.style.transform=''})});
  d.querySelectorAll('.btn').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)'});b.addEventListener('mouseleave',function(){b.style.transform=''})});
 }
}
})();
`;

function getEnhanceCSS(primaryColor, isDark) {
    const hi = isDark ? '#ffffff' : '#0f172a';
    return String.raw`:root{--accent:${primaryColor}}
body{overflow-x:hidden}
body::before{content:'';position:fixed;inset:-20%;z-index:0;pointer-events:none;
 background:radial-gradient(40% 35% at 18% 12%,color-mix(in srgb,var(--accent) ${isDark ? 26 : 14}%,transparent),transparent),
 radial-gradient(35% 30% at 85% 75%,color-mix(in srgb,#ec4899 ${isDark ? 16 : 8}%,transparent),transparent);animation:drift 18s ease-in-out infinite alternate}
@keyframes drift{to{transform:translate3d(4%,3%,0) scale(1.08)}}
.portfolio-container,footer{position:relative;z-index:2}
#bg{position:fixed;inset:0;z-index:1;pointer-events:none}
#spot{position:fixed;inset:0;z-index:3;pointer-events:none;background:radial-gradient(500px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--accent) 13%,transparent),transparent 60%)}
#pg{position:fixed;top:0;left:0;height:3px;width:0;z-index:100;background:linear-gradient(90deg,#ec4899,var(--accent),#3b82f6);box-shadow:0 0 12px var(--accent)}
.portfolio-header h1{background:linear-gradient(90deg,${hi},var(--accent),${hi});background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 6s linear infinite}
@keyframes shine{to{background-position:200% center}}
.profile-photo{box-shadow:0 0 0 3px var(--accent),0 0 40px color-mix(in srgb,var(--accent) 55%,transparent);animation:glow 3.5s ease-in-out infinite}
@keyframes glow{50%{box-shadow:0 0 0 3px var(--accent),0 0 70px color-mix(in srgb,var(--accent) 75%,transparent)}}
.section-title::after{width:60px;animation:bar 2.4s ease-in-out infinite alternate}
@keyframes bar{to{width:120px}}
.rv{opacity:0}.rv.in{opacity:1;animation:rise .8s cubic-bezier(.2,.7,.2,1) backwards}
@keyframes rise{from{opacity:0;transform:translateY(36px) scale(.97)}}
.tw::after{content:'|';margin-left:2px;color:var(--accent);animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.card{position:relative;transition:transform .15s ease-out,border-color .3s,box-shadow .3s}
.card::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;background:radial-gradient(260px circle at var(--cx,50%) var(--cy,50%),color-mix(in srgb,var(--accent) 24%,transparent),transparent 65%)}
.card:hover{border-color:var(--accent)}.card:hover::after{opacity:1}
.tag{transition:transform .2s}.tag:hover{transform:translateY(-2px) scale(1.07)}
.btn{transition:transform .15s ease-out,background .2s,box-shadow .2s}.btn:hover{box-shadow:0 8px 28px color-mix(in srgb,var(--accent) 45%,transparent)}
#dock{position:fixed;left:50%;bottom:18px;transform:translate(-50%,120px);display:flex;gap:4px;padding:6px;border-radius:999px;max-width:94vw;overflow-x:auto;z-index:90;
 background:rgba(0,0,0,.72);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.14);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
#dock.show{transform:translate(-50%,0)}
#dock a{color:#d4d4d8;font-size:.8rem;padding:8px 14px;border-radius:999px;white-space:nowrap;cursor:pointer;transition:background .2s,color .2s}
#dock a:hover{background:rgba(255,255,255,.1)}#dock a.on{background:var(--accent);color:#fff}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;
}

function getBaseStyles(primaryColor, customize, isDark) {
    const bgPrimary = isDark ? '#000000' : '#ffffff';
    const bgSecondary = isDark ? '#0b0b0d' : '#f8fafc';
    const textPrimary = isDark ? '#fafafa' : '#1e293b';
    const textSecondary = isDark ? '#a1a1aa' : '#64748b';
    const borderColor = isDark ? '#222226' : '#e2e8f0';
    const shadowColor = isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)';
    
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
            font-family: '${customize.fontBody}', system-ui, sans-serif;
            background: ${bgPrimary};
            color: ${textPrimary};
            line-height: 1.7;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }
        h1, h2, h3, h4, h5, h6 { font-family: '${customize.fontHeading}', system-ui, sans-serif; font-weight: 600; line-height: 1.3; color: ${textPrimary}; }
        a { color: ${primaryColor}; text-decoration: none; transition: color 0.2s; }
        a:hover { color: ${adjustColor(primaryColor, -20)}; }
        img { max-width: 100%; height: auto; display: block; }
        .portfolio-container { max-width: 1000px; margin: 0 auto; padding: ${customize.compactMode ? '2rem 1.5rem' : '3rem 2rem'}; }
        .section { margin-bottom: ${customize.sectionSpacing}rem; }
        .section-title { font-size: 1.75rem; margin-bottom: 1.5rem; position: relative; display: inline-block; }
        .section-title::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 60px; height: 3px; background: ${primaryColor}; border-radius: 2px; }
        .card { background: ${bgSecondary}; border: ${customize.showBorders ? '1px solid ' + borderColor : 'none'}; border-radius: ${customize.borderRadius}px; padding: ${customize.compactMode ? '1rem' : '1.5rem'}; transition: all 0.3s ease; }
        .animate .card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px ${shadowColor}; }
        .tag { display: inline-block; padding: 0.25rem 0.75rem; background: ${primaryColor}15; color: ${primaryColor}; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; margin: 0.25rem; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: ${primaryColor}; color: white; border: none; border-radius: ${customize.borderRadius}px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn:hover { background: ${adjustColor(primaryColor, -20)}; transform: translateY(-1px); }
        .btn-secondary { background: ${bgSecondary}; color: ${textPrimary}; border: 1px solid ${borderColor}; }
        .btn-secondary:hover { background: ${bgPrimary}; }
        @media (max-width: 768px) {
            .portfolio-container { padding: 1.5rem 1rem; }
            .section-title { font-size: 1.5rem; }
        }
    `;
}

function getTemplateStyles(template) {
    const styles = {
        modern: `
            .portfolio-header { text-align: center; padding: 2rem 0; }
            .profile-photo { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 1.5rem; object-fit: cover; border: 4px solid var(--primary); }
            .portfolio-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
            .portfolio-header .title { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 1rem; }
            .social-links { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
            .social-links a { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-secondary); transition: all 0.2s; }
            .social-links a:hover { background: var(--primary); color: white; border-color: var(--primary); }
            .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
            .project-card { position: relative; overflow: hidden; }
            .project-card .project-image { width: 100%; height: 180px; object-fit: cover; margin: -1.5rem -1.5rem 1rem; }
            .project-card.featured { border: 2px solid var(--primary); }
        `,
        creative: `
            .portfolio-header { position: relative; padding: 4rem 0; overflow: hidden; }
            .portfolio-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, var(--primary)10, transparent); z-index: -1; }
            .header-content { display: grid; grid-template-columns: 1fr 2fr; gap: 3rem; align-items: start; }
            .profile-photo { width: 200px; height: 200px; border-radius: 20px; object-fit: cover; border: 4px solid var(--primary); }
            .portfolio-header h1 { font-size: 3rem; line-height: 1.1; }
            .portfolio-header .title { font-size: 1.5rem; font-weight: 400; color: var(--text-secondary); }
            .portfolio-header .bio { margin-top: 1.5rem; font-size: 1.1rem; color: var(--text-secondary); }
            .social-links { display: flex; gap: 1rem; margin-top: 2rem; }
            .section-title { font-size: 2rem; text-transform: uppercase; letter-spacing: 0.1em; }
            .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
            .project-card { border-radius: 16px; overflow: hidden; }
            .project-card .project-image { width: 100%; height: 200px; object-fit: cover; }
        `,
        professional: `
            .portfolio-header { border-bottom: 3px solid var(--primary); padding-bottom: 2rem; margin-bottom: 2rem; }
            .header-grid { display: grid; grid-template-columns: 150px 1fr; gap: 2rem; align-items: start; }
            .profile-photo { width: 150px; height: 150px; border-radius: 8px; object-fit: cover; }
            .portfolio-header h1 { font-size: 2rem; margin-bottom: 0.25rem; }
            .portfolio-header .title { font-size: 1.1rem; color: var(--text-secondary); font-weight: 500; }
            .contact-info { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary); }
            .contact-info a { color: var(--text-secondary); }
            .contact-info a:hover { color: var(--primary); }
            .section-title { font-size: 1.5rem; color: var(--primary); }
            .section-title::after { background: var(--primary); }
            .experience-item, .education-item { border-left: 3px solid var(--primary); padding-left: 1.5rem; margin-bottom: 2rem; position: relative; }
            .experience-item::before, .education-item::before { content: ''; position: absolute; left: -9px; top: 0; width: 12px; height: 12px; background: var(--primary); border-radius: 50%; border: 3px solid var(--bg-primary); }
        `,
        dark: `
            :root { --bg-primary: #000000; --bg-secondary: #141414; --bg-tertiary: #1e1e1e; --text-primary: #fafafa; --text-secondary: #a3a3a3; --border: #2a2a2a; }
            body { background: var(--bg-primary); color: var(--text-primary); }
            .portfolio-header { padding: 3rem 0; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
            .header-content { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem; }
            .profile-photo { width: 100px; height: 100px; border-radius: 4px; object-fit: cover; border: 2px solid var(--primary); }
            .portfolio-header h1 { font-size: 2.5rem; background: linear-gradient(90deg, var(--primary), var(--text-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .portfolio-header .title { font-size: 1.1rem; color: var(--text-secondary); }
            .social-links { display: flex; gap: 1rem; }
            .social-links a { color: var(--text-secondary); font-size: 1.5rem; transition: color 0.2s; }
            .social-links a:hover { color: var(--primary); }
            .section-title { font-size: 1.5rem; position: relative; }
            .section-title::after { background: var(--primary); }
            .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
            .project-card { background: var(--bg-secondary); border: 1px solid var(--border); }
            .project-card:hover { border-color: var(--primary); }
            .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
            .skill-category { background: var(--bg-secondary); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px; }
        `
    };
    
    return styles[template] || styles.modern;
}

function generateHeader(profile, primaryColor, customize) {
    const photoHtml = profile.photo 
        ? `<img src="${profile.photo}" alt="${escapeHtml(profile.name)}" class="profile-photo">`
        : `<div class="profile-photo-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: ${primaryColor}20; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: ${primaryColor}; font-size: 3rem;">${profile.name ? profile.name.charAt(0).toUpperCase() : '?'}</div>`;
    
    const socialLinks = [];
    if (profile.linkedin) socialLinks.push(`<a href="${profile.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">💼</a>`);
    if (profile.github) socialLinks.push(`<a href="${profile.github}" target="_blank" rel="noopener" aria-label="GitHub">🐙</a>`);
    if (profile.twitter) socialLinks.push(`<a href="${profile.twitter}" target="_blank" rel="noopener" aria-label="Twitter">🐦</a>`);
    if (profile.customSocial) socialLinks.push(`<a href="${profile.customSocial}" target="_blank" rel="noopener" aria-label="Website">🌐</a>`);
    
    const contactInfo = [];
    if (profile.email) contactInfo.push(`📧 <a href="mailto:${profile.email}">${profile.email}</a>`);
    if (profile.phone) contactInfo.push(`📞 ${profile.phone}`);
    if (profile.location) contactInfo.push(`📍 ${profile.location}`);
    if (profile.website) contactInfo.push(`🌐 <a href="${profile.website}" target="_blank" rel="noopener">${profile.website.replace(/^https?:\/\//, '')}</a>`);
    
    switch (customize.template) {
        case 'creative':
            return `
                <header class="portfolio-header">
                    <div class="header-content">
                        <div>${photoHtml}</div>
                        <div>
                            <h1>${escapeHtml(profile.name)}</h1>
                            <div class="title">${escapeHtml(profile.title)}</div>
                            ${profile.bio ? `<div class="bio">${escapeHtml(profile.bio)}</div>` : ''}
                            <div class="social-links">${socialLinks.join('')}</div>
                        </div>
                    </div>
                </header>
            `;
        case 'professional':
            return `
                <header class="portfolio-header">
                    <div class="header-grid">
                        <div>${photoHtml}</div>
                        <div>
                            <h1>${escapeHtml(profile.name)}</h1>
                            <div class="title">${escapeHtml(profile.title)}</div>
                            <div class="contact-info">${contactInfo.join('')}</div>
                            <div class="social-links" style="margin-top: 1rem;">${socialLinks.join('')}</div>
                        </div>
                    </div>
                </header>
            `;
        case 'dark':
            return `
                <header class="portfolio-header">
                    <div class="header-content">
                        <div>${photoHtml}</div>
                        <div style="flex: 1;">
                            <h1>${escapeHtml(profile.name)}</h1>
                            <div class="title">${escapeHtml(profile.title)}</div>
                            <div style="margin-top: 1rem; color: var(--text-secondary);">${contactInfo.join(' | ')}</div>
                        </div>
                        <div class="social-links">${socialLinks.join('')}</div>
                    </div>
                </header>
            `;
        default: // modern
            return `
                <header class="portfolio-header">
                    ${photoHtml}
                    <h1>${escapeHtml(profile.name)}</h1>
                    <div class="title">${escapeHtml(profile.title)}</div>
                    ${contactInfo.length > 0 ? `<div class="contact-info" style="display: flex; justify-content: center; flex-wrap: wrap; gap: 1.5rem; margin: 1.5rem 0; font-size: 0.9rem; color: var(--text-secondary);">${contactInfo.join('')}</div>` : ''}
                    ${socialLinks.length > 0 ? `<div class="social-links">${socialLinks.join('')}</div>` : ''}
                </header>
            `;
    }
}

function generateAbout(profile, primaryColor, customize) {
    return `
        <section class="section" id="about">
            <h2 class="section-title">About Me</h2>
            <div class="card" style="max-width: 800px;">
                <p style="font-size: 1.1rem; line-height: 1.8;">${escapeHtml(profile.bio).replace(/\n/g, '<br>')}</p>
            </div>
        </section>
    `;
}

function generateProjects(projects, primaryColor, customize) {
    const featuredProjects = projects.filter(p => p.featured);
    const regularProjects = projects.filter(p => !p.featured);
    const displayProjects = customize.template === 'creative' ? [...featuredProjects, ...regularProjects] : projects;
    
    const projectCards = displayProjects.map(project => {
        const imageHtml = project.image 
            ? `<img src="${project.image}" alt="${escapeHtml(project.name)}" class="project-image">`
            : '';
        const links = [];
        if (project.url) links.push(`<a href="${project.url}" target="_blank" rel="noopener" class="btn">Live Demo</a>`);
        if (project.github) links.push(`<a href="${project.github}" target="_blank" rel="noopener" class="btn btn-secondary">GitHub</a>`);
        
        return `
            <article class="project-card card ${project.featured ? 'featured' : ''}">
                ${imageHtml}
                <h3 style="margin-bottom: 0.5rem;">${escapeHtml(project.name)}</h3>
                ${project.description ? `<p style="color: var(--text-secondary); margin-bottom: 1rem;">${escapeHtml(project.description)}</p>` : ''}
                ${project.technologies.length > 0 ? `<div class="card-tags">${project.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">${links.join('')}</div>
            </article>
        `;
    }).join('');
    
    return `
        <section class="section" id="projects">
            <h2 class="section-title">Projects</h2>
            <div class="projects-grid">${projectCards}</div>
        </section>
    `;
}

function generateSkills(skills, primaryColor, customize) {
    if (customize.template === 'dark') {
        const skillCards = skills.map(category => `
            <div class="skill-category card">
                <h3 style="margin-bottom: 1rem; color: ${primaryColor};">${escapeHtml(category.name)}</h3>
                <div class="skill-items">${category.items.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div>
            </div>
        `).join('');
        
        return `
            <section class="section" id="skills">
                <h2 class="section-title">Skills</h2>
                <div class="skills-grid">${skillCards}</div>
            </section>
        `;
    }
    
    const skillCategories = skills.map(category => `
        <div class="card" style="margin-bottom: 1rem;">
            <h3 style="margin-bottom: 1rem; color: ${primaryColor};">${escapeHtml(category.name)}</h3>
            <div class="skill-items">${category.items.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div>
        </div>
    `).join('');
    
    return `
        <section class="section" id="skills">
            <h2 class="section-title">Skills</h2>
            <div>${skillCategories}</div>
        </section>
    `;
}

function generateExperience(experience, primaryColor, customize) {
    const sorted = [...experience].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
        const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
        return dateB - dateA;
    });
    
    if (customize.template === 'professional') {
        const items = sorted.map(exp => `
            <div class="experience-item">
                <div style="margin-bottom: 0.5rem;">
                    <strong>${escapeHtml(exp.role)}</strong> at <strong>${escapeHtml(exp.company)}</strong>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                    ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
                </div>
                ${exp.description ? `<p style="margin-bottom: 0.75rem;">${escapeHtml(exp.description)}</p>` : ''}
                ${exp.technologies.length > 0 ? `<div class="card-tags">${exp.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
        `).join('');
        
        return `
            <section class="section" id="experience">
                <h2 class="section-title">Experience</h2>
                <div>${items}</div>
            </section>
        `;
    }
    
    const items = sorted.map(exp => `
        <div class="card" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem;">
                <div>
                    <h3 style="margin-bottom: 0.25rem;">${escapeHtml(exp.role)}</h3>
                    <p style="color: ${primaryColor}; font-weight: 500;">${escapeHtml(exp.company)}</p>
                </div>
                <span style="color: var(--text-secondary); white-space: nowrap;">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</span>
            </div>
            ${exp.description ? `<p style="color: var(--text-secondary); margin-bottom: 0.75rem;">${escapeHtml(exp.description)}</p>` : ''}
            ${exp.technologies.length > 0 ? `<div class="card-tags">${exp.technologies.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
    `).join('');
    
    return `
        <section class="section" id="experience">
            <h2 class="section-title">Experience</h2>
            <div>${items}</div>
        </section>
    `;
}

function generateEducation(education, primaryColor, customize) {
    const sorted = [...education].sort((a, b) => (b.endYear || 0) - (a.endYear || 0));
    
    if (customize.template === 'professional') {
        const items = sorted.map(edu => `
            <div class="education-item">
                <div style="margin-bottom: 0.5rem;">
                    <strong>${escapeHtml(edu.degree)}</strong>
                </div>
                <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">${escapeHtml(edu.institution)}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">${edu.startYear || ''} - ${edu.endYear || 'Present'}</div>
                ${edu.description ? `<p style="margin-top: 0.5rem;">${escapeHtml(edu.description)}</p>` : ''}
            </div>
        `).join('');
        
        return `
            <section class="section" id="education">
                <h2 class="section-title">Education</h2>
                <div>${items}</div>
            </section>
        `;
    }
    
    const items = sorted.map(edu => `
        <div class="card" style="margin-bottom: 1rem;">
            <h3 style="margin-bottom: 0.25rem;">${escapeHtml(edu.degree)}</h3>
            <p style="color: ${primaryColor}; font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(edu.institution)}</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${edu.startYear || ''} - ${edu.endYear || 'Present'}</p>
            ${edu.description ? `<p style="margin-top: 0.5rem; color: var(--text-secondary);">${escapeHtml(edu.description)}</p>` : ''}
        </div>
    `).join('');
    
    return `
        <section class="section" id="education">
            <h2 class="section-title">Education</h2>
            <div>${items}</div>
        </section>
    `;
}

function generateFooter(profile, primaryColor, customize) {
    return `
        <footer style="text-align: center; padding: 2rem 0; border-top: 1px solid var(--border); margin-top: 2rem; color: var(--text-secondary); font-size: 0.9rem;">
            <p>© ${new Date().getFullYear()} ${escapeHtml(profile.name)}. Built with Portfolio Builder.</p>
        </footer>
    `;
}

// ========================================
// Modal Management
// ========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeModal(event, modalId) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    state.editingId = null;
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
    state.editingId = null;
}

// ========================================
// Draft Auto-Save
// ========================================
function markDirty() {
    state.isDirty = true;
    elements.saveStatus.classList.add('saving');
    elements.statusText.textContent = 'Unsaved changes';
    
    clearTimeout(state.autoSaveTimer);
    state.autoSaveTimer = setTimeout(saveDraft, 2000);
}

function saveDraft() {
    const draft = {
        profile: state.profile,
        projects: state.projects,
        skills: state.skills,
        experience: state.experience,
        education: state.education,
        customize: state.customize,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('portfolio-draft', JSON.stringify(draft));
        state.isDirty = false;
        elements.saveStatus.classList.remove('saving');
        elements.statusText.textContent = 'Draft saved';
        elements.lastSaved.textContent = 'Last saved: Just now';
        showToast('Draft saved automatically');
    } catch (e) {
        console.error('Failed to save draft:', e);
        showToast('Failed to save draft', 'error');
    }
}

// Older versions pre-filled sample entries; remove them from drafts saved by those versions.
function stripOldSampleData() {
    const sampleSkills = {
        'Frontend Development': 'React,Vue.js,TypeScript,Tailwind CSS,Next.js',
        'Backend Development': 'Node.js,Python,PostgreSQL,MongoDB,REST APIs',
        'DevOps & Tools': 'Docker,AWS,GitHub Actions,Vercel,Linux'
    };
    state.projects = state.projects.filter(p => !/\.example\.com/.test(p.url || ''));
    state.skills = state.skills.filter(s => sampleSkills[s.name] !== (s.items || []).join(','));
    state.experience = state.experience.filter(e => !['Tech Solutions Inc.', 'Digital Agency Co.'].includes(e.company));
    state.education = state.education.filter(e => e.institution !== 'University of Technology');
}

function loadDraft() {
    try {
        const draft = localStorage.getItem('portfolio-draft');
        if (draft) {
            const data = JSON.parse(draft);
            
            // Merge with defaults
            state.profile = { ...state.profile, ...data.profile };
            state.projects = data.projects || [];
            state.skills = data.skills || [];
            state.experience = data.experience || [];
            state.education = data.education || [];
            stripOldSampleData();
            state.customize = { ...state.customize, ...data.customize };
            
            // Update form inputs
            populateFormInputs();
            
            // Update customize UI
            document.getElementById('template-select').value = state.customize.template;
            elements.fontHeading.value = state.customize.fontHeading;
            elements.fontBody.value = state.customize.fontBody;
            elements.darkMode.checked = state.customize.darkMode;
            elements.compactMode.checked = state.customize.compactMode;
            elements.showBorders.checked = state.customize.showBorders;
            elements.animateElements.checked = state.customize.animateElements;
            elements.sectionSpacing.value = state.customize.sectionSpacing;
            elements.borderRadius.value = state.customize.borderRadius;
            elements.spacingValue.textContent = state.customize.sectionSpacing + 'rem';
            elements.radiusValue.textContent = state.customize.borderRadius + 'px';
            
            // Apply dark mode
            applyDarkMode();
            
            // Update color scheme selection
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.scheme === state.customize.colorScheme);
            });
            
            // Render all lists
            renderProjects();
            renderSkills();
            renderExperience();
            renderEducation();
            renderPhotoPreview();
            
            // Update timestamp
            if (data.timestamp) {
                const date = new Date(data.timestamp);
                elements.lastSaved.textContent = `Last saved: ${date.toLocaleTimeString()}`;
            }
            
            showToast('Draft loaded successfully');
        }
    } catch (e) {
        console.error('Failed to load draft:', e);
    }
}

function populateFormInputs() {
    const profile = state.profile;
    elements.fullName.value = profile.name || '';
    elements.title.value = profile.title || '';
    elements.bio.value = profile.bio || '';
    elements.email.value = profile.email || '';
    elements.phone.value = profile.phone || '';
    elements.location.value = profile.location || '';
    elements.website.value = profile.website || '';
    elements.linkedin.value = profile.linkedin || '';
    elements.github.value = profile.github || '';
    elements.twitter.value = profile.twitter || '';
    elements.customSocial.value = profile.customSocial || '';
}

function renderAll() {
    renderProjects();
    renderSkills();
    renderExperience();
    renderEducation();
    renderPhotoPreview();
}

function startAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        if (state.isDirty) saveDraft();
    }, 30000);
}

// ========================================
// Export as ZIP
// ========================================
async function exportPortfolio() {
    showToast('Preparing export...', 'info');
    
    try {
        const zip = new JSZip();
        
        // Generate portfolio HTML
        const html = generatePortfolioHTML();
        zip.file('index.html', html);
        
        // Generate standalone CSS
        const css = generateStandaloneCSS();
        zip.file('styles.css', css);
        
        // Copy profile photo if exists
        if (state.profile.photo) {
            // Convert data URL to blob
            const response = await fetch(state.profile.photo);
            const blob = await response.blob();
            const ext = getImageExtension(blob.type);
            zip.file(`assets/profile-photo.${ext}`, blob);
        }
        
        // Generate README
        const readme = generateReadme();
        zip.file('README.md', readme);
        
        // Generate and download ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        downloadBlob(content, `${state.profile.name || 'portfolio'}-portfolio.zip`);
        
        showToast('Portfolio exported successfully!', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showToast('Export failed: ' + error.message, 'error');
    }
}

function generateStandaloneCSS() {
    const { customize } = state;
    const primaryColor = customize.customColor;
    const isDark = customize.darkMode;
    
    const bgPrimary = isDark ? '#000000' : '#ffffff';
    const bgSecondary = isDark ? '#0b0b0d' : '#f8fafc';
    const textPrimary = isDark ? '#fafafa' : '#1e293b';
    const textSecondary = isDark ? '#a1a1aa' : '#64748b';
    const borderColor = isDark ? '#222226' : '#e2e8f0';
    const shadowColor = isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)';
    
    return `
/* ========================================
   ${state.profile.name || 'Portfolio'} - Generated Styles
   Template: ${customize.template}
   Primary Color: ${primaryColor}
   ======================================== */

:root {
    --primary: ${primaryColor};
    --primary-hover: ${adjustColor(primaryColor, -20)};
    --primary-light: ${primaryColor}20;
    --bg-primary: ${bgPrimary};
    --bg-secondary: ${bgSecondary};
    --bg-tertiary: ${isDark ? '#222226' : '#f1f5f9'};
    --text-primary: ${textPrimary};
    --text-secondary: ${textSecondary};
    --border: ${borderColor};
    --shadow: 0 4px 6px -1px ${shadowColor}, 0 2px 4px -2px ${shadowColor};
    --shadow-lg: 0 10px 15px -3px ${shadowColor}, 0 4px 6px -4px ${shadowColor};
    --radius: ${customize.borderRadius}px;
    --font-heading: '${customize.fontHeading}', system-ui, sans-serif;
    --font-body: '${customize.fontBody}', system-ui, sans-serif;
    --spacing: ${customize.sectionSpacing}rem;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
    font-family: var(--font-body);
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: 600; line-height: 1.3; color: var(--text-primary); }
a { color: var(--primary); text-decoration: none; transition: color 0.2s; }
a:hover { color: var(--primary-hover); }
img { max-width: 100%; height: auto; display: block; }

.portfolio-container { max-width: 1000px; margin: 0 auto; padding: ${customize.compactMode ? '2rem 1.5rem' : '3rem 2rem'}; }
.section { margin-bottom: var(--spacing); }
.section-title { font-size: 1.75rem; margin-bottom: 1.5rem; position: relative; display: inline-block; }
.section-title::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 60px; height: 3px; background: var(--primary); border-radius: 2px; }

.card { background: var(--bg-secondary); border: ${customize.showBorders ? '1px solid var(--border)' : 'none'}; border-radius: var(--radius); padding: ${customize.compactMode ? '1rem' : '1.5rem'}; transition: all 0.3s ease; }
${customize.animateElements ? `
.animate .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
` : ''}

.tag { display: inline-block; padding: 0.25rem 0.75rem; background: var(--primary-light); color: var(--primary); border-radius: 9999px; font-size: 0.8rem; font-weight: 500; margin: 0.25rem; }

.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; }
.btn:hover { background: var(--primary-hover); transform: translateY(-1px); }
.btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--bg-primary); }

/* Template-specific styles */
${getTemplateStyles(customize.template).replace(/var\(--primary\)/g, primaryColor).replace(/var\(--bg-primary\)/g, bgPrimary).replace(/var\(--bg-secondary\)/g, bgSecondary).replace(/var\(--text-primary\)/g, textPrimary).replace(/var\(--text-secondary\)/g, textSecondary).replace(/var\(--border\)/g, borderColor)}

/* Responsive */
@media (max-width: 768px) {
    .portfolio-container { padding: 1.5rem 1rem; }
    .section-title { font-size: 1.5rem; }
    .header-grid, .header-content { grid-template-columns: 1fr !important; text-align: center; }
    .profile-photo { margin: 0 auto 1.5rem !important; }
    .contact-info { justify-content: center !important; }
    .social-links { justify-content: center !important; }
    .projects-grid, .skills-grid { grid-template-columns: 1fr !important; }
}

@media print {
    .portfolio-container { padding: 0; max-width: none; }
    .section { break-inside: avoid; page-break-inside: avoid; }
    a { text-decoration: none; color: inherit; }
    a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #666; }
}

/* Focus styles for accessibility */
a:focus, button:focus, input:focus, textarea:focus, select:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
`;
}

function generateReadme() {
    return `# ${state.profile.name || 'Portfolio'} - Professional Portfolio

Generated with **Portfolio Builder** on ${new Date().toLocaleDateString()}.

## Contents

- \`index.html\` - Main portfolio page
- \`styles.css\` - All styles (self-contained, no external dependencies except Google Fonts)
- \`assets/\` - Profile photo and other assets
- \`README.md\` - This file

## Features

- **Template**: ${state.customize.template.charAt(0).toUpperCase() + state.customize.template.slice(1)}
- **Color Scheme**: ${state.customize.colorScheme} (${state.customize.customColor})
- **Fonts**: ${state.customize.fontHeading} (headings), ${state.customize.fontBody} (body)
- **Dark Mode**: ${state.customize.darkMode ? 'Enabled' : 'Disabled'}
- **Responsive**: Mobile-first design, works on all devices
- **Accessible**: Semantic HTML, focus states, reduced motion support

## Sections Included

${state.profile.name ? '- Profile with photo, bio, and contact info' : ''}
${state.projects.length > 0 ? `- Projects (${state.projects.length} ${state.projects.length === 1 ? 'project' : 'projects'})` : ''}
${state.skills.length > 0 ? `- Skills (${state.skills.length} categor${state.skills.length === 1 ? 'y' : 'ies'})` : ''}
${state.experience.length > 0 ? `- Experience (${state.experience.length} entr${state.experience.length === 1 ? 'y' : 'ies'})` : ''}
${state.education.length > 0 ? `- Education (${state.education.length} entr${state.education.length === 1 ? 'y' : 'ies'})` : ''}

## Deployment

Simply upload the contents of this folder to any static hosting service:

- **Netlify**: Drag and drop the folder
- **Vercel**: \`vercel deploy\`
- **GitHub Pages**: Push to a repository and enable Pages
- **Firebase Hosting**: \`firebase deploy\`
- **AWS S3 + CloudFront**: Upload as static website
- **Any web server**: Apache, Nginx, etc.

No build step required - it's pure HTML/CSS/JS!

## Customization

Edit \`styles.css\` to customize:
- Colors (search for \`--primary\`)
- Fonts (search for \`--font-heading\` and \`--font-body\`)
- Spacing (search for \`--spacing\`)
- Border radius (search for \`--radius\`)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Your portfolio, your rights. Do whatever you want with it!

---

*Generated with ❤️ by Portfolio Builder*
`;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getImageExtension(mimeType) {
    const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg'
    };
    return extensions[mimeType] || 'png';
}

// ========================================
// Preview Device Toggle
// ========================================
function setPreviewDevice(device) {
    state.previewDevice = device;
    elements.previewWrapper.dataset.device = device;
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.device === device);
    });
}

function togglePreview() {
    // Could expand to full screen preview
    showToast('Preview toggled - use device buttons to test responsiveness');
}

// ========================================
// Template Switching
// ========================================
function switchTemplate(template) {
    state.customize.template = template;
    document.getElementById('template-select').value = template;
    markDirty();
    updatePreview();
    showToast(`Switched to ${template.charAt(0).toUpperCase() + template.slice(1)} template`);
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function adjustColor(color, amount) {
    // Simple color adjustment for hover states
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function updateWordCount() {
    let count = 0;
    count += (state.profile.bio || '').split(/\s+/).filter(w => w).length;
    state.projects.forEach(p => count += (p.description || '').split(/\s+/).filter(w => w).length);
    state.experience.forEach(e => count += (e.description || '').split(/\s+/).filter(w => w).length);
    state.education.forEach(e => count += (e.description || '').split(/\s+/).filter(w => w).length);
    elements.wordCount.textContent = `${count} words`;
}

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);


// Expose functions globally for inline handlers
window.showSection = showSection;
window.addProject = addProject;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.addSkillCategory = addSkillCategory;
window.editSkillCategory = editSkillCategory;
window.deleteSkillCategory = deleteSkillCategory;
window.addExperience = addExperience;
window.editExperience = editExperience;
window.deleteExperience = deleteExperience;
window.toggleCurrentJob = toggleCurrentJob;
window.addEducation = addEducation;
window.editEducation = editEducation;
window.deleteEducation = deleteEducation;
window.setColorScheme = setColorScheme;
window.openColorPicker = openColorPicker;
window.setCustomColor = setCustomColor;
window.setFont = setFont;
window.toggleDarkMode = toggleDarkMode;
window.toggleCompactMode = toggleCompactMode;
window.toggleBorders = toggleBorders;
window.toggleAnimations = toggleAnimations;
window.updateSpacing = updateSpacing;
window.updateRadius = updateRadius;
window.handlePhotoUpload = handlePhotoUpload;
window.removePhoto = removePhoto;
window.saveDraft = saveDraft;
window.exportPortfolio = exportPortfolio;
window.togglePreview = togglePreview;
window.setPreviewDevice = setPreviewDevice;
window.switchTemplate = switchTemplate;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.toggleWebsiteTheme = toggleWebsiteTheme;
window.setWebsiteTheme = setWebsiteTheme;
// ===== Live preview: render at a real device width, then scale to fit the pane =====
(function initPreviewFit() {
    function setup() {
        const wrap = document.getElementById('preview-frame-wrapper');
        const frame = document.getElementById('preview-frame');
        if (!wrap || !frame) return;
        const stage = document.createElement('div');
        stage.className = 'preview-stage';
        frame.parentNode.insertBefore(stage, frame);
        stage.appendChild(frame);
        const SIZES = { desktop: [1100, null], tablet: [768, 1024], mobile: [375, 780] };
        function fit() {
            const cs = getComputedStyle(wrap);
            const aw = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            const ah = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
            if (!(aw > 50 && ah > 50)) return;               // preview hidden (e.g. on phones)
            const dev = wrap.dataset.device || 'desktop';
            let [w, h] = SIZES[dev] || SIZES.desktop;
            if (dev === 'desktop' && aw < 700) w = 800;      // narrow pane: use a smaller virtual page width
            let s = Math.min(1, aw / w);
            if (h) s = Math.min(s, ah / h); else h = ah / s; // desktop fills the pane height, others fit whole device
            frame.style.width = w + 'px';
            frame.style.height = h + 'px';
            frame.style.transform = 'scale(' + s + ')';
            stage.style.width = (w * s) + 'px';
            stage.style.height = (h * s) + 'px';
            const pt = document.querySelector('.preview-title');
            if (pt) pt.dataset.zoom = Math.round(s * 100) + '%';   // shows the current zoom level
        }
        new ResizeObserver(fit).observe(wrap);
        new MutationObserver(fit).observe(wrap, { attributes: true, attributeFilter: ['data-device'] });
        fit();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
})();
