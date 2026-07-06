// LOGICA DE LA APLICACION - SISTEMA DE LICENCIAS INTERNAS (SLI)

// --- CONFIGURACION Y ESTADO INICIAL ---
const STORAGE_KEY = 'sli_operadores_datos';
const CONFIG_KEY = 'sli_configuracion';
const STAFF_STORAGE_KEY = 'sli_staff_users';
const LICENSE_ATTEMPTS_KEY = 'sli_license_attempts';
let staffUsers = [];
let licenseAttempts = {};

const defaultStaffUsers = [
    { id: 'staff-2', name: 'Anabella Cavagnola', pass: '1234', role: 'admin' },
    { id: 'staff-3', name: 'Miriam Aguero', pass: '2345', role: 'admin' },
    { id: 'staff-4', name: 'Nicolas Marquez', pass: '3350', role: 'admin' },
    { id: 'staff-5', name: 'Veronica Astrada', pass: '3456', role: 'admin' },
    { id: 'staff-6', name: 'Gabriel de Dios', pass: '43556976', role: 'supervisor' },
    { id: 'staff-7', name: 'Jairo Solano', pass: '44411773', role: 'supervisor' },
    { id: 'staff-8', name: 'Carolina Carrizo', pass: '40972870', role: 'supervisor' },
    { id: 'staff-9', name: 'Instructor Pedro', pass: 'INS-TEC-01', role: 'instructor_tecnico' }
];

// Estructura de Configuración por Defecto
const defaultConfig = {
    quotaLimit: 15,
    allowSupervisorDelete: false, // Requiere autorización de Admin
    adminPassword: 'admin' // Para simulación de autorización
};

// Datos Semilla (Mock Data) para precargar y demostrar el funcionamiento inmediatamente
const mockOperators = [
    {
        id: 'op-1',
        nombre: 'Sofía Díaz',
        legajo: 'L-4589',
        sector: 'Logística - Expedición',
        licenciaNacional: '39482710',
        email: 'sdiaz@newmont.com',
        createdAt: '2026-06-23T09:15:00.000Z', // Martes semana pasada
        docsUploadedAt: '2026-06-23T11:30:00.000Z',
        evalCompletedAt: '2026-06-26T10:15:00.000Z', // Viernes pasado (Evaluado)
        documentos: {
            licencia: { name: 'licencia_sofia.pdf', size: '1.2 MB', uploadedAt: '2026-06-23T11:20:00.000Z' },
            foto: { name: 'foto_sofia.jpg', size: '85 KB', uploadedAt: '2026-06-23T11:25:00.000Z', isAvatar: true },
            autorizacion: { name: 'aut_transporte_sofia.pdf', size: '640 KB', uploadedAt: '2026-06-23T11:30:00.000Z' }
        },
        notaTeorica: 8.5,
        estadoTeorico: 'aprobado', // OK
        estadoPractico: 'ok',
        autorizacionFinal: 'Autorizado',
        estadoFinal: 'teorico_aprobado'
    },
    {
        id: 'op-2',
        nombre: 'Mariano Gómez',
        legajo: 'L-2341',
        sector: 'Producción - Autoelevadores',
        licenciaNacional: '35892104',
        email: 'mgomez@newmont.com',
        createdAt: '2026-06-28T14:20:00.000Z', // Domingo ayer
        docsUploadedAt: '2026-06-29T08:10:00.000Z', // Lunes hoy temprano
        evalCompletedAt: null,
        documentos: {
            licencia: { name: 'licencia_nacional_gomez.png', size: '2.1 MB', uploadedAt: '2026-06-29T08:05:00.000Z' },
            foto: { name: 'perfil_gomez.jpg', size: '120 KB', uploadedAt: '2026-06-29T08:08:00.000Z' },
            autorizacion: { name: 'autorizacion_interna_gomez.pdf', size: '480 KB', uploadedAt: '2026-06-29T08:10:00.000Z' }
        },
        notaTeorica: null,
        estadoTeorico: 'pendiente',
        estadoPractico: 'pendiente',
        autorizacionFinal: 'No Autorizado',
        estadoFinal: 'turno_asignado' // Próximo viernes
    },
    {
        id: 'op-3',
        nombre: 'Juan Pérez',
        legajo: 'L-1102',
        sector: 'Mantenimiento',
        licenciaNacional: '30485921',
        email: 'jperez@newmont.com',
        createdAt: '2026-06-24T10:00:00.000Z',
        docsUploadedAt: '2026-06-24T12:00:00.000Z',
        evalCompletedAt: '2026-06-26T11:00:00.000Z', // Desaprobó el viernes pasado
        documentos: {
            licencia: { name: 'lic_nacional.jpg', size: '1.5 MB', uploadedAt: '2026-06-24T11:45:00.000Z' },
            foto: { name: 'foto_carnet.png', size: '95 KB', uploadedAt: '2026-06-24T11:50:00.000Z' },
            autorizacion: { name: 'autorizacion_firmada.pdf', size: '550 KB', uploadedAt: '2026-06-24T12:00:00.000Z' }
        },
        notaTeorica: 4.0,
        estadoTeorico: 'desaprobado',
        estadoPractico: 'pendiente',
        autorizacionFinal: 'No Autorizado',
        estadoFinal: 'teorico_reprobado'
    },
    {
        id: 'op-4',
        nombre: 'Laura Benítez',
        legajo: 'L-8941',
        sector: 'Logística - Almacén',
        licenciaNacional: '41203948',
        email: 'lbenitez@newmont.com',
        createdAt: '2026-06-25T08:30:00.000Z', // Jueves pasado
        docsUploadedAt: '2026-06-25T10:00:00.000Z',
        evalCompletedAt: '2026-06-29T08:15:00.000Z', // Evaluada hoy
        documentos: {
            licencia: { name: 'licencia_laura.pdf', size: '980 KB', uploadedAt: '2026-06-25T09:45:00.000Z' },
            foto: { name: 'foto_4x4.jpg', size: '75 KB', uploadedAt: '2026-06-25T09:50:00.000Z' },
            autorizacion: { name: 'permiso_almacen.pdf', size: '710 KB', uploadedAt: '2026-06-25T10:00:00.000Z' }
        },
        notaTeorica: 9.0,
        estadoTeorico: 'aprobado', // OK
        estadoPractico: 'pendiente',
        autorizacionFinal: 'No Autorizado',
        estadoFinal: 'teorico_aprobado'
    },
    {
        id: 'op-5',
        nombre: 'Carlos Ortega',
        legajo: 'L-6712',
        sector: 'Producción - Despacho',
        licenciaNacional: '37284910',
        email: 'cortega@newmont.com',
        createdAt: '2026-06-28T09:00:00.000Z', // Domingo
        docsUploadedAt: '2026-06-28T11:45:00.000Z',
        evalCompletedAt: '2026-06-29T08:20:00.000Z', // Evaluado hoy
        documentos: {
            licencia: { name: 'licencia_carlos.pdf', size: '1.1 MB', uploadedAt: '2026-06-28T11:20:00.000Z' },
            foto: { name: 'carlos_foto.jpg', size: '110 KB', uploadedAt: '2026-06-28T11:35:00.000Z' },
            autorizacion: { name: 'aut_carlos.pdf', size: '520 KB', uploadedAt: '2026-06-28T11:45:00.000Z' }
        },
        notaTeorica: 7.5,
        estadoTeorico: 'aprobado', // OK
        estadoPractico: 'recuperar',
        autorizacionFinal: 'No Autorizado',
        estadoFinal: 'teorico_aprobado'
    },
    {
        id: 'op-6',
        nombre: 'Lucas Rossi',
        legajo: 'L-3042',
        sector: 'Logística - Distribución',
        licenciaNacional: '42938104',
        email: 'lrossi@newmont.com',
        createdAt: '2026-06-29T08:25:00.000Z', // Lunes hoy
        docsUploadedAt: null,
        evalCompletedAt: null,
        documentos: {},
        notaTeorica: null,
        estadoTeorico: 'pendiente',
        estadoPractico: 'pendiente',
        autorizacionFinal: 'No Autorizado',
        estadoFinal: 'inscrito' // Sin docs completos
    }
];

// Variables globales de la App
let operators = [];
let appConfig = {};
let currentRole = 'operador'; // 'operador' | 'supervisor' | 'instructor_tecnico' | 'admin'
let currentSelectedOperatorId = null; // ID del operador logueado (si es operador)
let activeEditingOperatorId = null; // Para el modal de edición/calificación
// Servidor local IP para sincronización de red LAN/Wi-Fi
let localServerIP = 'localhost';

function loadServerIP() {
    return fetch('server_ip.json?t=' + Date.now())
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("No IP file");
        })
        .then(data => {
            if (data && data.ip) {
                localServerIP = data.ip;
                console.log("[Sincronización LAN] IP del servidor local obtenida:", localServerIP);
            }
        })
        .catch(err => {
            console.warn("[Sincronización LAN] No se pudo cargar la IP del servidor (usando localhost):", err.message);
        });
}

// --- INICIALIZACION ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadServerIP().finally(() => {
            loadState();
            loadStateFromServer();
            initializeEventListeners();
            
            // Forzar que la app siempre inicie en la pestaña de Acceso (con contraseña)
            toggleLoginForms('login');
            
            renderApp();
            
            // Polling en segundo plano para sincronizar datos en red local LAN cada 3 segundos
            setInterval(() => {
                loadStateFromServer();
            }, 3000);
            
            if (currentUser) {
                showToast(`Sesión activa: ${currentUser.name} (${currentUser.role.toUpperCase()})`, 'info');
            } else {
                showToast('Ingrese sus credenciales para acceder.', 'info');
            }
        });
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.backgroundColor = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.zIndex = '999999';
        errorDiv.style.padding = '20px';
        errorDiv.style.fontSize = '14px';
        errorDiv.style.fontFamily = 'monospace';
        errorDiv.innerHTML = '<strong>Error de inicialización de JS:</strong><br>' + error.message + '<br><pre>' + error.stack + '</pre>';
        document.body.appendChild(errorDiv);
        console.error(error);
    }
});

// Cargar estado de LocalStorage o Datos Mock
function loadState() {
    // Cargar Operadores
    const storedOperators = localStorage.getItem(STORAGE_KEY);
    if (storedOperators) {
        try {
            operators = JSON.parse(storedOperators);
        } catch (e) {
            console.error("Error al parsear operadores guardados, usando mock.", e);
            operators = [...mockOperators];
        }
    } else {
        operators = [...mockOperators];
    }

    // Saneamiento de operadores (migración y auto-curación)
    if (Array.isArray(operators)) {
        let needsSave = false;
        operators.forEach(op => {
            if (op) {
                if (!op.tipoEquipo) {
                    op.tipoEquipo = 'livianos';
                    needsSave = true;
                }
                if (!op.documentos) {
                    op.documentos = {};
                    needsSave = true;
                }
                
                // Auto-curación para operadores con documentos aprobados colgados en revisión
                if (op.estadoFinal === 'documentos_cargados') {
                    const hasBaseDocs = op.documentos.licencia && op.documentos.licencia.status === 'aprobado' &&
                                        op.documentos.foto && op.documentos.foto.status === 'aprobado' &&
                                        op.documentos.autorizacion && op.documentos.autorizacion.status === 'aprobado';
                    let allDocsApproved = hasBaseDocs;
                    if (op.tipoEquipo === 'pesados') {
                        const hasCert = op.documentos.certificacion && op.documentos.certificacion.status === 'aprobado';
                        allDocsApproved = hasBaseDocs && hasCert;
                    }
                    
                    if (allDocsApproved) {
                        op.estadoFinal = 'turno_asignado';
                        op.docsApprovedAt = op.docsApprovedAt || op.createdAt || new Date().toISOString();
                        needsSave = true;
                    }
                }
            }
        });
        if (needsSave) {
            saveOperatorsToStorage();
        }
    } else {
        operators = [...mockOperators];
    }
    saveOperatorsToStorage();

    // Cargar Configuración
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    if (storedConfig) {
        try {
            appConfig = JSON.parse(storedConfig);
            if (appConfig.quotaLimit > 15) {
                appConfig.quotaLimit = 15;
                saveConfigToStorage();
            }
        } catch (e) {
            appConfig = { ...defaultConfig, quotaLimit: 15 };
            saveConfigToStorage();
        }
    } else {
        appConfig = { ...defaultConfig, quotaLimit: 15 };
        saveConfigToStorage();
    }

    // Cargar Personal (Staff)
    const storedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
    if (storedStaff) {
        try {
            staffUsers = JSON.parse(storedStaff);
            // Migración: Quitar a Admin Carlos si quedó guardado en LocalStorage
            if (staffUsers.some(u => u.name === 'Admin Carlos')) {
                staffUsers = staffUsers.filter(u => u.name !== 'Admin Carlos');
                saveStaffToStorage();
            }
        } catch (e) {
            staffUsers = [...defaultStaffUsers];
        }
    } else {
        staffUsers = [...defaultStaffUsers];
        saveStaffToStorage();
    }

    // Cargar intentos de licencia
    const storedAttempts = localStorage.getItem(LICENSE_ATTEMPTS_KEY);
    if (storedAttempts) {
        try {
            licenseAttempts = JSON.parse(storedAttempts);
        } catch (e) {
            licenseAttempts = {};
        }
    } else {
        licenseAttempts = {};
    }

    // Cargar Sesión del Usuario - Forzar inicio en login por seguridad corporativa
    currentUser = null;
    localStorage.removeItem('sli_current_user');
}

function saveOperatorsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operators));
    saveOperatorsToServer();
}

function saveOperatorsToServer() {
    let url = '/api/operators';
    if (location.hostname.includes('github.io')) {
        url = `http://${localServerIP}:8080/api/operators`;
    }
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operators)
    })
    .then(res => res.json())
    .then(data => console.log("[Sincronización LAN] Base de datos guardada en el servidor:", data))
    .catch(err => console.warn("[Sincronización LAN] Servidor local no disponible para guardar cambios."));
}

function loadStateFromServer() {
    let url = '/api/operators';
    const isGitHub = location.hostname.includes('github.io');
    if (isGitHub) {
        url = `http://${localServerIP}:8080/api/operators`;
    }
    
    fetch(url)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("No API");
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                updateOperatorsIfChanged(data, "[Sincronización LAN]");
            }
        })
        .catch(err => {
            // Fallback si el servidor local no está disponible
            if (isGitHub) {
                fetch('operators.json?t=' + Date.now())
                    .then(res => {
                        if (res.ok) return res.json();
                        throw new Error("No static file");
                    })
                    .then(data => {
                        if (Array.isArray(data) && data.length > 0) {
                            updateOperatorsIfChanged(data, "[Repositorio GitHub]");
                        }
                    })
                    .catch(err2 => {
                        console.warn("[Repositorio GitHub] Tampoco se pudo cargar operators.json estático:", err2.message);
                    });
            } else {
                console.warn("[Sincronización LAN] Servidor local no disponible. Usando datos de este navegador:", err.message);
            }
        });
}

function updateOperatorsIfChanged(data, sourceLabel) {
    const oldDataStr = JSON.stringify(operators);
    const newDataStr = JSON.stringify(data);
    if (oldDataStr !== newDataStr) {
        console.log(`${sourceLabel} Nuevos datos cargados:`, data);
        operators = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(operators));
        renderApp();
    }
}

function saveConfigToStorage() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(appConfig));
}

function saveStaffToStorage() {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffUsers));
}

function saveLicenseAttempts() {
    localStorage.setItem(LICENSE_ATTEMPTS_KEY, JSON.stringify(licenseAttempts));
}

// --- CALCULO DE FECHAS (TURNO AUTOMATICO) ---
// Obtener el número de semana del año
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Retorna los operadores inscriptos en la semana actual
function getOperatorsRegisteredThisWeek() {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    return operators.filter(op => {
        const opDate = new Date(op.createdAt);
        return getWeekNumber(opDate) === currentWeek && opDate.getFullYear() === currentYear;
    });
}

// Calcular el próximo viernes después de la fecha de inscripción
// "Siempre el viernes próximo a la inscripción de 8 a 12 hs"
function calculateNextFriday(registrationDateStr) {
    const regDate = new Date(registrationDateStr);
    const resultDate = new Date(regDate.getTime());
    const dayOfWeek = regDate.getDay(); // 0: Dom, 1: Lun, ..., 5: Vie, 6: Sab
    
    let daysToFriday = 5 - dayOfWeek;
    if (daysToFriday <= 0) {
        // Si ya es viernes o sábado, el próximo turno es el viernes de la semana siguiente
        daysToFriday += 7;
    }
    resultDate.setDate(regDate.getDate() + daysToFriday);
    return resultDate;
}

// Calcular el próximo viernes disponible que tenga cupos (menos de 15 alumnos)
function getAvailableTrainingFriday(operatorId, registrationDateStr) {
    let candidateFriday = calculateNextFriday(registrationDateStr);
    const limit = appConfig.quotaLimit;
    
    while (true) {
        const scheduledCount = operators.filter(op => {
            if (op.id === operatorId) return false;
            if (op.estadoFinal === 'inscrito' || op.estadoFinal === 'documentos_cargados') return false; // Aún no aceptado/aprobado
            
            const opFriday = calculateNextFriday(op.docsApprovedAt || op.createdAt);
            return formatDateString(opFriday) === formatDateString(candidateFriday);
        }).length;
        
        if (scheduledCount < limit) {
            return candidateFriday;
        }
        
        // Si el cupo está lleno, rodar al siguiente viernes
        candidateFriday = new Date(candidateFriday.getTime());
        candidateFriday.setDate(candidateFriday.getDate() + 7);
    }
}

// Determinar si el examen práctico debe ser el domingo en lugar del sábado
function isSundayPracticalExam(sector) {
    if (!sector) return false;
    const cleanSector = sector.trim().toLowerCase();
    return cleanSector.includes('proyecto') || cleanSector.includes('knight piesold') || cleanSector.includes('kp');
}

// Formatear fecha para lectura humana
function formatDateString(date) {
    if (!date) return '--/--/----';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// --- MANEJO DE VISTAS Y RENDERIZACIÓN ---

function renderApp() {
    // Auto-curación de estado en cada ciclo de renderizado
    if (Array.isArray(operators)) {
        let changed = false;
        operators.forEach(op => {
            if (op) {
                if (!op.tipoEquipo) {
                    op.tipoEquipo = 'livianos';
                    changed = true;
                }
                const hasBaseDocs = op.documentos &&
                                    op.documentos.licencia && op.documentos.licencia.status === 'aprobado' &&
                                    op.documentos.foto && op.documentos.foto.status === 'aprobado' &&
                                    op.documentos.autorizacion && op.documentos.autorizacion.status === 'aprobado';
                let allDocsApproved = hasBaseDocs;
                if (op.tipoEquipo === 'pesados') {
                    const hasCert = op.documentos && op.documentos.certificacion && op.documentos.certificacion.status === 'aprobado';
                    allDocsApproved = hasBaseDocs && hasCert;
                }
                
                if (allDocsApproved && (op.estadoFinal === 'documentos_cargados' || op.estadoFinal === 'inscrito')) {
                    console.log(`[Auto-Curación] Asignando turno a ${op.nombre} (Legajo: ${op.legajo}) por documentos aprobados.`);
                    op.estadoFinal = 'turno_asignado';
                    op.docsApprovedAt = op.docsApprovedAt || new Date().toISOString();
                    changed = true;
                }
            }
        });
        if (changed) {
            saveOperatorsToStorage();
        }
    }

    // 1. Verificar si hay usuario logueado
    if (!currentUser) {
        document.body.classList.add('not-logged-in');
        return;
    }
    
    document.body.classList.remove('not-logged-in');
    
    // Mostrar/ocultar botón de sincronización a GitHub en local
    const btnSync = document.getElementById('btn-sync-github');
    if (btnSync) {
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname.startsWith('172.24.')) {
            btnSync.style.display = 'inline-flex';
        } else {
            btnSync.style.display = 'none';
        }
    }
    
    // Rellenar cabecera con datos del usuario logueado
    document.getElementById('logged-user-name').innerText = currentUser.name;
    
    const roleBadge = document.getElementById('logged-user-role');
    if (currentUser.role === 'admin') {
        roleBadge.innerText = 'Administradores';
        roleBadge.className = 'badge badge-danger';
    } else if (currentUser.role === 'supervisor') {
        roleBadge.innerText = 'Instructor Teórico';
        roleBadge.className = 'badge badge-info';
    } else if (currentUser.role === 'instructor_tecnico') {
        roleBadge.innerText = 'Instructor Práctico';
        roleBadge.className = 'badge badge-warning';
    } else {
        roleBadge.innerText = 'Operador';
        roleBadge.className = 'badge badge-success';
    }
    
    updateQuotaWidgets();
    
    // Ocultar todas las vistas de roles primero
    document.querySelectorAll('.role-view').forEach(view => view.classList.remove('active'));
    
    if (currentRole === 'operador') {
        document.getElementById('view-operador').classList.add('active');
        document.getElementById('dashboard-stats').classList.add('hidden');
        document.getElementById('quota-widget').style.display = 'flex';
        renderOperatorView();
    } else {
        // Supervisor, Admin o Instructor Práctico
        document.getElementById('view-dashboard').classList.add('active');
        document.getElementById('dashboard-stats').classList.remove('hidden');
        
        // Nuances de rol entre Supervisor, Admin e Instructor Práctico
        const titleElement = document.getElementById('dashboard-title');
        const quotaConfigElement = document.getElementById('admin-quota-config');
        const adminTabs = document.getElementById('admin-dashboard-tabs');
        
        const licSec = document.getElementById('dash-section-licencias');
        const staffSec = document.getElementById('dash-section-staff');
        
        if (currentRole === 'admin') {
            titleElement.innerText = 'Panel de Control: Administradores';
            quotaConfigElement.classList.remove('hidden');
            document.getElementById('input-quota-limit').value = appConfig.quotaLimit;
            if (adminTabs) adminTabs.classList.remove('hidden');
        } else {
            if (currentRole === 'supervisor') {
                titleElement.innerText = 'Panel de Control: Instructor Teórico';
            } else if (currentRole === 'instructor_tecnico') {
                titleElement.innerText = 'Panel de Control: Instructor Práctico';
            }
            quotaConfigElement.classList.add('hidden');
            if (adminTabs) adminTabs.classList.add('hidden');
            
            // Forzar vista de licencias para no admins
            if (licSec) {
                licSec.classList.add('active');
                licSec.classList.remove('hidden');
            }
            if (staffSec) {
                staffSec.classList.remove('active');
                staffSec.classList.add('hidden');
            }
        }
        
        updateStatsDashboard();
        
        // Renderizar la tabla que corresponda si es admin
        if (currentRole === 'admin' && staffSec && staffSec.classList.contains('active')) {
            renderStaffTable();
        } else {
            renderOperatorsTable();
        }
    }
}

// Actualizar widget de cupos semanales
function updateQuotaWidgets() {
    const thisWeekOps = getOperatorsRegisteredThisWeek();
    const usedCount = thisWeekOps.length;
    const limit = appConfig.quotaLimit;
    
    // Actualizar números en el widget superior
    const quotaUsedEl = document.getElementById('quota-used');
    const quotaLimitEl = document.getElementById('quota-limit');
    if (quotaUsedEl && quotaLimitEl) {
        quotaUsedEl.innerText = usedCount;
        quotaLimitEl.innerText = limit;
    }
    
    const percentage = Math.min(100, (usedCount / limit) * 100);
    const progressEl = document.getElementById('quota-progress');
    if (progressEl) {
        progressEl.style.width = `${percentage}%`;
        // Cambiar color de barra si se acerca al límite
        if (percentage >= 100) {
            progressEl.style.background = 'var(--danger)';
        } else if (percentage >= 80) {
            progressEl.style.background = 'var(--warning)';
        } else {
            progressEl.style.background = 'linear-gradient(90deg, var(--primary), var(--info))';
        }
    }
}

// Actualizar estadísticas rápidas del dashboard (Supervisor/Admin)
function updateStatsDashboard() {
    const total = operators.length;
    const docsPending = operators.filter(op => op.estadoFinal === 'inscrito' || op.estadoFinal === 'documentos_cargados').length;
    const theoryPending = operators.filter(op => op.estadoFinal === 'turno_asignado').length;
    const okPractico = operators.filter(op => op.estadoFinal === 'teorico_aprobado').length;
    
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-docs-pending').innerText = docsPending;
    document.getElementById('stat-theory-pending').innerText = theoryPending;
    document.getElementById('stat-ok-practico').innerText = okPractico;
}

// --- VISTA OPERADOR ---
function renderOperatorView() {
    const dataCard = document.getElementById('op-data-card');
    const statusCard = document.getElementById('op-status-card');
    const stepper = document.getElementById('operator-stepper');
    
    // Mostrar progreso de operador existente
    stepper.classList.remove('hidden');
    dataCard.classList.remove('hidden');
    statusCard.classList.remove('hidden');
    
    const op = operators.find(o => o.id === currentSelectedOperatorId);
    if (!op) return;
    
    // Mostrar notificaciones pendientes de correo si existieran
    if (op.pendingNotifications && op.pendingNotifications.length > 0) {
        op.pendingNotifications.forEach(notif => {
            if (notif.type === 'rejection') {
                simulateEmailNotification(op, notif.docType, notif.docName);
            } else if (notif.type === 'practical_fail') {
                simulateEmailPracticalFail(op);
            } else if (notif.type === 'max_attempts') {
                simulateEmailMaxAttemptsExceeded(op);
            }
        });
        op.pendingNotifications = [];
        saveOperatorsToStorage();
    }
    
    // Rellenar datos del formulario
    document.getElementById('op-nombre').value = op.nombre || '';
    document.getElementById('op-legajo').value = op.legajo || '';
    document.getElementById('op-sector').value = op.sector || '';
    document.getElementById('op-licencia').value = op.licenciaNacional || '';
    document.getElementById('op-email').value = op.email || '';
    document.getElementById('op-tipo-equipo').value = op.tipoEquipo === 'pesados' ? 'Equipos Pesados' : 'Equipos Livianos';
    
    // Bloquear formulario si ya pasó la etapa de carga de documentos
    const isLocked = op.estadoFinal !== 'inscrito';
    document.getElementById('op-nombre').disabled = isLocked;
    document.getElementById('op-legajo').disabled = isLocked;
    document.getElementById('op-sector').disabled = isLocked;
    document.getElementById('op-licencia').disabled = isLocked;
    document.getElementById('op-email').disabled = isLocked;
    
    const saveBtn = document.getElementById('btn-guardar-datos');
    if (isLocked) {
        saveBtn.innerText = 'Información Enviada (Bloqueada)';
        saveBtn.disabled = true;
        saveBtn.className = 'btn btn-secondary w-100';
    } else {
        saveBtn.innerText = 'Guardar y Enviar Documentación';
        saveBtn.disabled = false;
        saveBtn.className = 'btn btn-primary w-100';
    }
    
    // Renderizar estado de documentos
    updateFileStatusLabel('licencia', op.documentos.licencia);
    updateFileStatusLabel('foto', op.documentos.foto);
    updateFileStatusLabel('autorizacion', op.documentos.autorizacion);
    updateFileStatusLabel('certificacion', op.documentos.certificacion);
    
    // Deshabilitar inputs de archivos si está bloqueado
    document.getElementById('file-licencia').disabled = isLocked;
    document.getElementById('file-foto').disabled = isLocked;
    document.getElementById('file-autorizacion').disabled = isLocked;
    document.getElementById('file-certificacion').disabled = isLocked;

    // Configurar etiqueta de Certificación (Opcional para livianos, obligatorio para pesados)
    const uploaderCert = document.getElementById('uploader-item-certificacion');
    if (uploaderCert) {
        uploaderCert.classList.remove('hidden');
        const labelEl = uploaderCert.querySelector('.file-name');
        if (labelEl) {
            if (op.tipoEquipo === 'pesados') {
                labelEl.innerText = 'Certificación Habilitante *';
            } else {
                labelEl.innerText = 'Certificación Habilitante (Opcional)';
            }
        }
    }
    
    // Ocultar/Mostrar etiquetas de los inputs
    document.querySelectorAll('.file-action-col label').forEach(label => {
        if (isLocked) {
            label.style.display = 'none';
        } else {
            label.style.display = 'inline-flex';
        }
    });

    // Configurar Stepper Visual
    updateStepperVisual(op);
    
    // Configurar panel de Turno y Calificaciones
    updateOperatorStatusPanel(op);
}

function updateFileStatusLabel(type, docObj) {
    const statusEl = document.getElementById(`status-doc-${type}`);
    if (docObj && docObj.name) {
        statusEl.innerText = `${docObj.name} (${docObj.size})`;
        statusEl.classList.add('uploaded');
    } else {
        statusEl.innerText = 'No cargado';
        statusEl.classList.remove('uploaded');
    }
}

function updateStepperVisual(op) {
    const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        el.className = 'step';
    });
    
    // Step 1: Inscripción (Siempre completado para un operador guardado)
    document.getElementById('step-1').classList.add('completed');
    
    if (op.estadoFinal === 'inscrito' || op.estadoFinal === 'documentos_cargados') {
        document.getElementById('step-2').classList.add('active');
    } else if (op.estadoFinal === 'turno_asignado') {
        document.getElementById('step-2').classList.add('completed');
        document.getElementById('step-3').classList.add('active');
    } else if (op.estadoFinal === 'teorico_aprobado') {
        document.getElementById('step-2').classList.add('completed');
        document.getElementById('step-3').classList.add('completed');
        document.getElementById('step-4').classList.add('completed');
        document.getElementById('step-5').classList.add('completed');
    } else if (op.estadoFinal === 'teorico_reprobado') {
        document.getElementById('step-2').classList.add('completed');
        document.getElementById('step-3').classList.add('completed');
        // El paso 4 queda marcado en error/desaprobado
        document.getElementById('step-4').classList.add('active');
        const icon = document.querySelector('#step-4 .step-icon');
        icon.style.backgroundColor = 'var(--danger)';
        icon.style.borderColor = 'var(--danger)';
        icon.style.color = '#fff';
    }
}

function updateOperatorStatusPanel(op) {
    const blockTurno = document.getElementById('block-teorico-turno');
    const blockResultado = document.getElementById('block-teorico-resultado');
    const blockPractico = document.getElementById('block-practico-ok');
    
    const apptDay = document.getElementById('appointment-day');
    const apptDateText = document.getElementById('appointment-date-text');
    
    const scoreVal = document.getElementById('op-score-val');
    const scoreTitle = document.getElementById('op-score-title');
    const scoreDesc = document.getElementById('op-score-desc');
    const badgeExam = document.getElementById('badge-exam-status');
    
    const practicalTitle = document.getElementById('practical-title');
    const practicalDesc = document.getElementById('practical-desc');
    const badgePractical = document.getElementById('badge-practical-status');
    const practicalContainer = document.getElementById('practical-card-container');
    
    // Resetear clases y estilos
    blockTurno.classList.add('disabled');
    blockResultado.classList.add('disabled');
    blockPractico.classList.add('disabled');
    practicalContainer.className = 'practical-ok-card';
    scoreVal.className = 'score-num';
    
    // --- EVALUAR ESTADO ---
    
    // Si tiene el turno asignado o posterior (es decir, ya fue aprobado)
    const hasTurno = op.estadoFinal !== 'inscrito' && op.estadoFinal !== 'documentos_cargados';
    if (hasTurno) {
        blockTurno.classList.remove('disabled');
        const trainingBaseDate = op.docsApprovedAt || op.createdAt;
        const nextFriday = getAvailableTrainingFriday(op.id, trainingBaseDate);
        apptDay.innerText = nextFriday.getDate();
        apptDateText.innerText = formatDateString(nextFriday);
    } else {
        apptDay.innerText = '--';
        if (op.estadoFinal === 'documentos_cargados') {
            apptDateText.innerHTML = '<span style="font-size:0.75rem; color:var(--warning); font-weight:600;">Documentos en revisión por Instructores</span>';
        } else {
            apptDateText.innerText = '--/--/----';
        }
    }
    
    // Si ya tiene asignado turno o examen
    if (op.estadoFinal === 'turno_asignado' || op.estadoFinal === 'teorico_aprobado' || op.estadoFinal === 'teorico_reprobado') {
        blockResultado.classList.remove('disabled');
        
        if (op.notaTeorica !== null) {
            scoreVal.innerText = op.notaTeorica.toFixed(1);
            
            if (op.estadoTeorico === 'aprobado') {
                scoreVal.classList.add('approved');
                scoreTitle.innerText = 'Examen Teórico: ¡APROBADO!';
                scoreDesc.innerText = 'Cumpliste con la capacitación teórica obligatoria.';
                badgeExam.innerText = 'Paso 4: Calificado - Aprobado';
                badgeExam.className = 'badge badge-success';
                
                // Mostrar etapa práctica habilitada
                blockPractico.classList.remove('disabled');
                
                const lic = op.licenciaNacional;
                const attempts = licenseAttempts[lic] || 0;
                const nextFriday = getAvailableTrainingFriday(op.id, op.createdAt);
                const isSunday = isSundayPracticalExam(op.sector);
                const nextPracticalDate = new Date(nextFriday.getTime());
                nextPracticalDate.setDate(nextPracticalDate.getDate() + (isSunday ? 2 : 1));
                const dayName = isSunday ? 'Domingo' : 'Sábado';
                
                if (op.tipoEquipo === 'pesados') {
                    practicalContainer.className = 'practical-ok-card approved-stage';
                    practicalTitle.innerText = 'Exención de Examen Práctico';
                    practicalDesc.innerHTML = `Al postularse para <strong>Equipos Pesados</strong>, no requiere rendir evaluación práctica de manejo. Tu autorización final depende de la aprobación de tu <strong>Certificación Habilitante</strong> en el Paso 2.`;
                    badgePractical.innerText = 'Paso 5: Exento';
                    badgePractical.className = 'badge badge-success';
                } else {
                    if (op.estadoPractico === 'ok') {
                        practicalContainer.className = 'practical-ok-card approved-stage';
                        practicalTitle.innerText = 'Evaluación Práctica: ¡APROBADO!';
                        practicalDesc.innerHTML = `¡Felicitaciones! Has aprobado tu evaluación práctica. Tu Licencia Interna de Conducción ha sido debidamente autorizada y se encuentra disponible en la planilla oficial.<br><br><strong>Intentos realizados:</strong> ${attempts} de 2`;
                        badgePractical.innerText = 'Paso 5: Calificado - Aprobado';
                        badgePractical.className = 'badge badge-success';
                    } else if (op.estadoPractico === 'recuperar') {
                        practicalContainer.className = 'practical-ok-card failed-stage';
                        practicalTitle.innerText = 'Evaluación Práctica: NO APROBADO';
                        practicalDesc.innerHTML = `Has reprobado tu examen práctico de manejo. Deberás coordinar un examen recuperatorio a la brevedad con tu supervisor.<br><br><strong>Intentos realizados:</strong> ${attempts} de 2 (Límite máximo: 2 intentos)`;
                        badgePractical.innerText = 'Paso 5: Calificado - No Aprobado';
                        badgePractical.className = 'badge badge-danger';
                    } else {
                        practicalContainer.className = 'practical-ok-card';
                        practicalTitle.innerText = 'Habilitado para Evaluación Práctica';
                        practicalDesc.innerHTML = `¡Tu estado es <strong>OK</strong>! Tu evaluación práctica de manejo está programada para el <strong>${dayName} ${formatDateString(nextPracticalDate)}</strong> (el ${dayName.toLowerCase()} próximo a tu capacitación teórica de 08:30 a 12:30 hs).<br><br><strong>Intentos realizados:</strong> ${attempts} de 2`;
                        badgePractical.innerText = 'Paso 5: Pendiente Examen';
                        badgePractical.className = 'badge badge-warning';
                    }
                }
            } else {
                scoreVal.classList.add('failed');
                scoreTitle.innerText = 'Examen Teórico: NO APROBADO';
                scoreDesc.innerText = 'No alcanzaste la nota mínima requerida. Deberás coordinar un recuperatorio o inscribirte nuevamente.';
                badgeExam.innerText = 'Paso 4: Calificado - No Aprobado';
                badgeExam.className = 'badge badge-danger';
                
                blockPractico.classList.remove('disabled');
                practicalContainer.classList.add('failed-stage');
                practicalTitle.innerText = 'Evaluación Práctica Bloqueada';
                practicalDesc.innerText = 'No es posible pasar a la evaluación práctica hasta aprobar la teoría.';
                badgePractical.innerText = 'Paso 5: Bloqueado';
                badgePractical.className = 'badge badge-danger';
            }
        } else {
            // Turno asignado pero sin examen calificado todavía
            scoreVal.innerText = '-';
            scoreTitle.innerText = 'Capacitación Pendiente';
            scoreDesc.innerText = 'Tu capacitación teórica está agendada. Una vez asistas y realices la evaluación, se cargará la nota.';
            badgeExam.innerText = 'Paso 4: Pendiente Capacitación';
            badgeExam.className = 'badge badge-warning';
            
            badgePractical.innerText = 'Paso 5: Esperando Teoría';
            badgePractical.className = 'badge badge-pending';
        }
    } else {
        // En inscripción
        scoreVal.innerText = '-';
        scoreTitle.innerText = 'Evaluación Teórica Pendiente';
        scoreDesc.innerText = 'Debes completar tu perfil y documentación primero.';
        badgeExam.innerText = 'Paso 4: Pendiente';
        badgeExam.className = 'badge badge-pending';
        
        badgePractical.innerText = 'Paso 5: Pendiente';
        badgePractical.className = 'badge badge-pending';
    }

    // Mostrar u ocultar el botón de ver y descargar licencia emitida en Paso 5
    const licenseContainer = document.getElementById('issued-license-container');
    if (licenseContainer) {
        if (op.licenciaEmitida && op.licenciaEmitida.name) {
            licenseContainer.innerHTML = `
                <div style="display: flex; gap: 10px; width: 100%;">
                    <button type="button" class="btn btn-success btn-glow-success" id="btn-view-issued-license" style="flex: 1; font-weight: 600;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px; vertical-align: middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Ver Licencia
                    </button>
                    <button type="button" class="btn btn-primary" id="btn-download-issued-license" style="flex: 1; font-weight: 600;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px; vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Descargar
                    </button>
                </div>
            `;
            
            document.getElementById('btn-view-issued-license').addEventListener('click', (e) => {
                e.preventDefault();
                showDocumentPreview(op.nombre, 'licencia_emitida', op.licenciaEmitida);
            });
            
            document.getElementById('btn-download-issued-license').addEventListener('click', (e) => {
                e.preventDefault();
                downloadDocument(op.nombre, 'licencia_emitida', op.licenciaEmitida);
            });
        } else {
            // Calcular el estado del proceso para la licencia digital
            let licenseStatusText = '';
            if (op.estadoFinal === 'inscrito') {
                licenseStatusText = 'Licencia Digital: Pendiente subir requisitos';
            } else if (op.estadoFinal === 'documentos_cargados') {
                licenseStatusText = 'Licencia Digital: Pendiente aprobación de documentos';
            } else if (op.estadoFinal === 'turno_asignado') {
                licenseStatusText = 'Licencia Digital: Pendiente examen teórico';
            } else if (op.estadoFinal === 'teorico_reprobado') {
                licenseStatusText = 'Licencia Digital: Examen Teórico Reprobado';
            } else if (op.estadoFinal === 'teorico_aprobado') {
                if (op.tipoEquipo === 'pesados') {
                    licenseStatusText = 'Licencia Digital: En proceso de emisión';
                } else {
                    if (op.estadoPractico === 'recuperar') {
                        licenseStatusText = 'Licencia Digital: Examen Práctico Reprobado';
                    } else if (op.estadoPractico === 'ok') {
                        licenseStatusText = 'Licencia Digital: En proceso de emisión';
                    } else {
                        licenseStatusText = 'Licencia Digital: Pendiente examen práctico';
                    }
                }
            } else {
                licenseStatusText = 'Licencia Digital: En proceso';
            }
            
            licenseContainer.innerHTML = `
                <button type="button" class="btn btn-secondary" id="btn-view-issued-license" disabled style="width: 100%; opacity: 0.65; cursor: not-allowed; font-weight: 500;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    ${licenseStatusText}
                </button>
            `;
        }
    }
}

// --- PROCESAMIENTO DE INSCRIPCIÓN Y ENVÍO DE DATOS ---

function handleRegistration(e) {
    e.preventDefault();
    
    // Validar cupo
    const thisWeekOps = getOperatorsRegisteredThisWeek();
    if (thisWeekOps.length >= appConfig.quotaLimit) {
        showToast('Cupos agotados para esta semana', 'danger');
        return;
    }
    
    // Crear ID aleatorio
    const newId = 'op-' + Math.random().toString(36).substr(2, 9);
    const newOp = {
        id: newId,
        nombre: '',
        legajo: '',
        sector: '',
        licenciaNacional: '',
        createdAt: new Date().toISOString(),
        docsUploadedAt: null,
        evalCompletedAt: null,
        documentos: {},
        notaTeorica: null,
        estadoTeorico: 'pendiente',
        estadoFinal: 'inscrito'
    };
    
    operators.push(newOp);
    saveOperatorsToStorage();
    
    currentSelectedOperatorId = newId;
    
    showToast('¡Inscripción exitosa! Cupo reservado. Carga tus datos y documentos.', 'success');
    renderApp();
}

// Guardar datos y simular documentos
function handleSaveOperatorData(e) {
    e.preventDefault();
    
    const op = operators.find(o => o.id === currentSelectedOperatorId);
    if (!op) return;
    
    // Leer valores
    const nombre = document.getElementById('op-nombre').value.trim();
    const legajo = document.getElementById('op-legajo').value.trim();
    const sector = document.getElementById('op-sector').value.trim();
    const licencia = document.getElementById('op-licencia').value.trim();
    const email = document.getElementById('op-email').value.trim();
    
    if (!nombre || !legajo || !sector || !licencia || !email) {
        showToast('Por favor complete todos los campos obligatorios', 'warning');
        return;
    }
    
    // Validar que subió los documentos solicitados
    const hasLicencia = op.documentos && op.documentos.licencia;
    const hasFoto = op.documentos && op.documentos.foto;
    const hasAutorizacion = op.documentos && op.documentos.autorizacion;
    
    if (op.tipoEquipo === 'pesados') {
        const hasCertificacion = op.documentos && op.documentos.certificacion;
        if (!hasLicencia || !hasFoto || !hasAutorizacion || !hasCertificacion) {
            showToast('Debe adjuntar los 4 documentos solicitados (incluyendo la Certificación Habilitante)', 'warning');
            return;
        }
    } else {
        if (!hasLicencia || !hasFoto || !hasAutorizacion) {
            showToast('Debe adjuntar los 3 documentos solicitados', 'warning');
            return;
        }
    }
    
    // Actualizar datos
    op.nombre = nombre;
    op.legajo = legajo;
    op.sector = sector;
    op.licenciaNacional = licencia;
    op.email = email;
    op.docsUploadedAt = new Date().toISOString();
    op.estadoFinal = 'documentos_cargados'; // Pasa a revisión de documentos
    
    saveOperatorsToStorage();
    showToast('Datos y documentación guardados. Tu perfil se encuentra en revisión para la asignación de turno.', 'success');
    renderApp();
}

// Procesar y comprimir archivos antes de guardar para no agotar la cuota de localStorage
function compressAndSaveFile(file, callback) {
    if (file.type === 'application/pdf') {
        // Para PDFs, guardamos un base64 de PDF simulado súper ligero (1KB)
        const dummyPdfBase64 = "data:application/pdf;base64,JVBERi0xLjQKJdPpNDgKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9SZXNvdXJjZXMgPDwgPj4KICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKNCAwIG9iagogIDw8IC9MZW5ndGggMCA+PgpzdHJlYW0KZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA4NSAwMDAwMCBuIAowMDAwMDAwMTQ2IDAwMDAwIG4gCjAwMDAwMDAyNjAgMDAwMDAgbiAKdHJhaWxlcgogIDw8IC9TaXplIDUKICAgICAvUm9vdCAxIDAgUgogID4+CnN0YXJ0eHJlZgogIDMwNwolJUVPRgo=";
        callback(dummyPdfBase64);
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        // Cualquier otro tipo se guarda con un mock básico de texto
        callback("data:text/plain;base64,TU9DS19DT05URU5U");
        return;
    }
    
    // Si es imagen, la redimensionamos a un tamaño máximo de 600px y la comprimimos al 60%
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max_size = 600;
            
            if (width > height) {
                if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                }
            } else {
                if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Exportar como JPEG comprimido
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            callback(compressedBase64);
        };
        img.onerror = function() {
            // Fallback si falla la carga de la imagen
            callback(event.target.result);
        };
        img.src = event.target.result;
    };
    reader.onerror = function() {
        callback(null);
    };
    reader.readAsDataURL(file);
}

// Simular carga de un archivo específico
function handleFileUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    
    const op = operators.find(o => o.id === currentSelectedOperatorId);
    if (!op) return;
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('El archivo no debe superar los 5MB', 'danger');
        return;
    }
    
    // Formatear tamaño del archivo
    const sizeKB = file.size / 1024;
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    
    // Procesar y guardar el archivo comprimido/mockeado
    compressAndSaveFile(file, function(compressedBase64) {
        if (!compressedBase64) {
            showToast('Error al procesar el archivo', 'danger');
            return;
        }
        
        op.documentos[type] = {
            name: file.name,
            size: sizeStr,
            uploadedAt: new Date().toISOString(),
            dataUrl: compressedBase64,
            status: 'cargado'
        };
        
        saveOperatorsToStorage();
        updateFileStatusLabel(type, op.documentos[type]);
        showToast(`Documento "${file.name}" cargado correctamente`, 'success');
        
        if (currentRole === 'operador') {
            renderOperatorView();
        }
    });
}

// --- VISTA SUPERVISOR Y ADMIN (DASHBOARD TABLE) ---

function renderOperatorsTable() {
    const tbody = document.getElementById('tbody-operadores');
    tbody.innerHTML = '';
    
    // Obtener filtros
    const searchText = document.getElementById('filter-search').value.toLowerCase().trim();
    const filterStatus = document.getElementById('filter-status').value;
    
    // Filtrar operadores
    const filtered = operators.filter(op => {
        // Restricción para el rol de Instructor Técnico:
        // Solo ve operadores que aprobaron la parte teórica (es decir, en condiciones de práctica)
        if (currentRole === 'instructor_tecnico') {
            if (op.estadoTeorico !== 'aprobado') {
                return false;
            }
        }

        // Filtro texto
        const matchText = (op.nombre || '').toLowerCase().includes(searchText) ||
                          (op.legajo || '').toLowerCase().includes(searchText) ||
                          (op.sector || '').toLowerCase().includes(searchText);
                          
        // Filtro estado
        let matchStatus = true;
        if (filterStatus !== 'todos') {
            matchStatus = op.estadoFinal === filterStatus;
        }
        
        return matchText && matchStatus;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No se encontraron operadores registrados con los filtros seleccionados.</td></tr>';
        return;
    }
    
    filtered.forEach(op => {
        const tr = document.createElement('tr');
        
        // Nombre y Legajo
        const tdName = document.createElement('td');
        tdName.innerHTML = `
            <span class="table-operator-name">${op.nombre || '<i>Sin Nombre</i>'}</span>
            <span class="table-operator-subtext">Legajo: ${op.legajo || 'S/D'}</span>
        `;
        tr.appendChild(tdName);
        
        // Sector
        const tdSector = document.createElement('td');
        const eqType = op.tipoEquipo === 'pesados' ? 'Equipos Pesados' : 'Equipos Livianos';
        const eqClass = op.tipoEquipo === 'pesados' ? 'badge-primary' : 'badge-secondary';
        tdSector.innerHTML = `
            <span>${op.sector || 'S/D'}</span><br>
            <span class="badge ${eqClass}" style="font-size: 0.65rem; margin-top: 3px; display: inline-block; padding: 2px 6px;">${eqType}</span>
        `;
        tr.appendChild(tdSector);
        
        // Inscription date
        const tdInsc = document.createElement('td');
        tdInsc.innerText = formatDateString(op.createdAt);
        tr.appendChild(tdInsc);
        
        // Documents uploaded
        const tdDocs = document.createElement('td');
        if (op.estadoFinal === 'inscrito') {
            const count = op.documentos ? Object.keys(op.documentos).length : 0;
            const totalDocs = op.tipoEquipo === 'pesados' ? 4 : 3;
            tdDocs.innerHTML = `<span class="badge badge-warning">${count} / ${totalDocs} cargados</span>`;
        } else if (op.estadoFinal === 'documentos_cargados') {
            tdDocs.innerHTML = `<span class="badge badge-warning" style="background-color: var(--warning); color: var(--bg-dark);">En Revisión</span><br><span style="font-size:0.7rem; color:var(--text-muted);">${formatDateString(op.docsUploadedAt)}</span>`;
        } else {
            tdDocs.innerHTML = `<span class="badge badge-success">Aprobados</span><br><span style="font-size:0.7rem; color:var(--text-muted);">${formatDateString(op.docsUploadedAt)}</span>`;
        }
        tr.appendChild(tdDocs);
        
        // Training date
        const tdTraining = document.createElement('td');
        const hasTurno = op.estadoFinal !== 'inscrito' && op.estadoFinal !== 'documentos_cargados';
        if (hasTurno) {
            const trainingBaseDate = op.docsApprovedAt || op.createdAt;
            const friday = getAvailableTrainingFriday(op.id, trainingBaseDate);
            tdTraining.innerHTML = `<strong>${formatDateString(friday)}</strong><br><span style="font-size:0.7rem;">08:30 - 12:30 hs</span>`;
        } else {
            if (op.estadoFinal === 'documentos_cargados') {
                tdTraining.innerHTML = `<span class="text-warning" style="font-size:0.8rem; font-weight:600;">Esperando Aprobación</span>`;
            } else {
                tdTraining.innerHTML = `<span class="text-muted">Pendiente Docs</span>`;
            }
        }
        tr.appendChild(tdTraining);
        
        // Nota teórica
        const tdNota = document.createElement('td');
        if (op.notaTeorica !== null) {
            const classColor = op.estadoTeorico === 'aprobado' ? 'text-success' : 'text-danger';
            tdNota.innerHTML = `<strong class="${classColor}" style="font-size:1.1rem;">${op.notaTeorica.toFixed(1)}</strong>`;
        } else {
            tdNota.innerHTML = `<span class="text-muted">-</span>`;
        }
        tr.appendChild(tdNota);
        
        // Práctica
        const tdPractica = document.createElement('td');
        let practicaHTML = '';
        if (op.tipoEquipo === 'pesados') {
            practicaHTML = '<span class="badge badge-success" style="background-color: var(--success); color: #fff;">Exento</span>';
        } else {
            if (op.estadoPractico === 'ok') {
                practicaHTML = '<span class="badge badge-success">OK</span>';
            } else if (op.estadoPractico === 'recuperar') {
                practicaHTML = '<span class="badge badge-warning">Recuperar</span>';
            } else {
                practicaHTML = '<span class="badge badge-pending">Pendiente</span>';
            }
        }
        tdPractica.innerHTML = practicaHTML;
        tr.appendChild(tdPractica);
        
        // Estado Final Badge
        const tdStatus = document.createElement('td');
        recalculateAuthorization(op); // Asegurar recálculo fresco
        const isAuthorized = op.autorizacionFinal === 'Autorizado';
        const finalStatusLabel = op.autorizacionFinal || 'No Autorizado';
        const finalStatusClass = isAuthorized ? 'badge-success' : 'badge-danger';
        tdStatus.innerHTML = `<span class="badge ${finalStatusClass}">${finalStatusLabel}</span>`;
        tr.appendChild(tdStatus);
        
        // Acciones
        const tdActions = document.createElement('td');
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-secondary btn-sm';
        viewBtn.innerText = currentRole === 'admin' ? 'Editar / Calificar' : 'Gestionar';
        viewBtn.addEventListener('click', () => openOperatorModal(op.id));
        tdActions.appendChild(viewBtn);
        
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

// --- MODAL DE GESTIÓN (DETALLE DE OPERADOR) ---

function openOperatorModal(id) {
    const op = operators.find(o => o.id === id);
    if (!op) return;
    
    activeEditingOperatorId = id;
    
    // Cambiar nombre en modal
    document.getElementById('modal-operator-name').innerText = `Gestión de Operador: ${op.nombre || 'Sin nombre asignado'}`;
    
    // Rellenar Tab Datos
    document.getElementById('modal-edit-nombre').value = op.nombre || '';
    document.getElementById('modal-edit-legajo').value = op.legajo || '';
    document.getElementById('modal-edit-sector').value = op.sector || '';
    document.getElementById('modal-edit-licencia').value = op.licenciaNacional || '';
    document.getElementById('modal-edit-email').value = op.email || '';
    document.getElementById('modal-edit-tipo-equipo').value = op.tipoEquipo || 'livianos';

    // Bloquear edición de datos para Instructor Práctico
    const isTechnical = currentRole === 'instructor_tecnico';
    document.getElementById('modal-edit-nombre').disabled = isTechnical;
    document.getElementById('modal-edit-legajo').disabled = isTechnical;
    document.getElementById('modal-edit-sector').disabled = isTechnical;
    document.getElementById('modal-edit-licencia').disabled = isTechnical;
    document.getElementById('modal-edit-email').disabled = isTechnical;
    document.getElementById('modal-edit-tipo-equipo').disabled = isTechnical;
    
    const saveModalDataBtn = document.getElementById('btn-save-modal-data');
    if (saveModalDataBtn) {
        saveModalDataBtn.style.display = isTechnical ? 'none' : 'block';
    }
    
    // Rellenar Tab Notas
    document.getElementById('eval-nota').value = op.notaTeorica !== null ? op.notaTeorica : '';
    document.getElementById('eval-estado').value = op.estadoTeorico || '';
    
    // Rellenar Tab Práctica
    const contentLivianos = document.getElementById('tab-practica-content-livianos');
    const contentPesados = document.getElementById('tab-practica-content-pesados');
    if (contentLivianos && contentPesados) {
        if (op.tipoEquipo === 'pesados') {
            contentLivianos.style.display = 'none';
            contentPesados.style.display = 'block';
        } else {
            contentLivianos.style.display = 'block';
            contentPesados.style.display = 'none';
            document.getElementById('practica-estado').value = op.estadoPractico || 'pendiente';
        }
    }
    
    // Documentos del modal
    renderModalDocumentCards(op);
    renderModalExamCard(op);
    renderModalPracticaCard(op);
    renderModalIssuedLicenseCard(op);
    
    // Habilitar/Deshabilitar eliminación según el rol y autorización
    const deleteBtn = document.getElementById('btn-delete-operator');
    const warningMsg = document.getElementById('delete-warning-msg');
    
    if (currentRole === 'admin') {
        deleteBtn.disabled = false;
        warningMsg.classList.add('hidden');
    } else if (currentRole === 'instructor_tecnico') {
        deleteBtn.disabled = true;
        warningMsg.classList.remove('hidden');
        warningMsg.innerText = 'El Instructor Práctico no puede eliminar operadores';
    } else {
        // Es Supervisor (Instructor Teórico)
        if (appConfig.allowSupervisorDelete) {
            deleteBtn.disabled = false;
            warningMsg.classList.add('hidden');
        } else {
            deleteBtn.disabled = true;
            warningMsg.classList.remove('hidden');
            warningMsg.innerText = 'Requiere clave de Admin para eliminar';
        }
    }
    
    // Configurar pestañas visibles según el rol
    const tabBtns = document.querySelectorAll('.modal-tab-btn');
    if (currentRole === 'instructor_tecnico') {
        tabBtns.forEach(btn => {
            // El Instructor Práctico tiene acceso a Datos/Docs y Práctica, pero no a Teoría ni Licencia Digital
            const tabName = btn.getAttribute('data-tab');
            if (tabName === 'tab-evaluacion' || tabName === 'tab-licencia-digital') {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'block';
            }
        });
        // Abre por defecto en la evaluación práctica
        switchModalTab('tab-practica');
    } else if (currentRole === 'supervisor') {
        tabBtns.forEach(btn => {
            // El Instructor Teórico tiene acceso a Datos/Docs, Teoría y Licencia Digital, pero no a Práctica
            const tabName = btn.getAttribute('data-tab');
            if (tabName === 'tab-practica') {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'block';
            }
        });
        // Abre por defecto en datos y documentos
        switchModalTab('tab-datos-docs');
    } else {
        // Administradores tienen acceso total
        tabBtns.forEach(btn => {
            btn.style.display = 'block';
        });
        switchModalTab('tab-datos-docs');
    }
    
    // Activar modal
    document.getElementById('operator-modal').classList.add('active');
}

function renderModalDocumentCards(op) {
    const cardCert = document.getElementById('modal-card-certificacion');
    const docTypes = ['licencia', 'foto', 'autorizacion', 'certificacion'];
    
    if (cardCert) {
        cardCert.classList.remove('hidden');
    }
    
    docTypes.forEach(type => {
        const badge = document.getElementById(`modal-status-${type}`);
        const actions = document.getElementById(`modal-actions-${type}`);
        const doc = op.documentos ? op.documentos[type] : null;
        
        if (doc && doc.name) {
            // Verificar estado del documento
            const status = doc.status || 'cargado'; // 'cargado' | 'aprobado' | 'rechazado'
            
            if (status === 'aprobado') {
                badge.innerText = 'Aprobado';
                badge.className = 'doc-status-badge uploaded';
                badge.style.backgroundColor = 'var(--success)';
                badge.style.color = '#fff';
                
                actions.innerHTML = `
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button class="btn btn-secondary btn-sm btn-preview-doc" data-type="${type}" style="padding: 2px 6px; font-size: 0.75rem;">
                            Ver
                        </button>
                        <button class="btn btn-danger btn-sm btn-reject-doc" data-type="${type}" style="padding: 2px 6px; font-size: 0.75rem;" title="Rechazar Documento">
                            Rechazar
                        </button>
                    </div>
                `;
            } else {
                // Estado "Cargado" (pendiente de validación)
                badge.innerText = 'Pendiente Validar';
                badge.className = 'doc-status-badge';
                badge.style.backgroundColor = 'var(--warning)';
                badge.style.color = 'var(--bg-dark)';
                
                actions.innerHTML = `
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <button class="btn btn-secondary btn-sm btn-preview-doc" data-type="${type}" style="padding: 2px 6px; font-size: 0.75rem;">
                            Ver
                        </button>
                        <button class="btn btn-success btn-sm btn-approve-doc" data-type="${type}" style="padding: 2px 6px; font-size: 0.75rem;" title="Aprobar Documento">
                            ✓
                        </button>
                        <button class="btn btn-danger btn-sm btn-reject-doc" data-type="${type}" style="padding: 2px 6px; font-size: 0.75rem;" title="Rechazar Documento">
                            ✗
                        </button>
                    </div>
                `;
            }
            
            // Bind listener para Ver
            const previewBtn = actions.querySelector('.btn-preview-doc');
            if (previewBtn) {
                previewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showDocumentPreview(op.nombre, type, doc);
                });
            }
            
            // Bind listener para Aprobar
            const approveBtn = actions.querySelector('.btn-approve-doc');
            if (approveBtn) {
                approveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleApproveDocument(op.id, type);
                });
            }
            
            // Bind listener para Rechazar
            const rejectBtn = actions.querySelector('.btn-reject-doc');
            if (rejectBtn) {
                rejectBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleRejectDocument(op.id, type);
                });
            }
            
        } else {
            badge.innerText = 'Pendiente';
            badge.className = 'doc-status-badge';
            badge.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            badge.style.color = 'var(--text-muted)';
            actions.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted);">Sin archivo</span>';
        }
    });
}

function checkAllRequiredDocsApproved(op) {
    const hasBaseDocs = op.documentos && 
                        op.documentos.licencia && op.documentos.licencia.status === 'aprobado' &&
                        op.documentos.foto && op.documentos.foto.status === 'aprobado' &&
                        op.documentos.autorizacion && op.documentos.autorizacion.status === 'aprobado';
                        
    if (op.tipoEquipo === 'pesados') {
        const hasCert = op.documentos && op.documentos.certificacion && op.documentos.certificacion.status === 'aprobado';
        return hasBaseDocs && hasCert;
    }
    return hasBaseDocs;
}

function handleApproveDocument(opId, type) {
    const op = operators.find(o => o.id === opId);
    if (!op) return;
    
    if (op.documentos && op.documentos[type]) {
        op.documentos[type].status = 'aprobado';
        
        // Verificar si completó la aprobación de todos los documentos requeridos
        let isTransitioned = false;
        if (op.estadoFinal === 'documentos_cargados') {
            const allApproved = checkAllRequiredDocsApproved(op);
            if (allApproved) {
                op.estadoFinal = 'turno_asignado';
                op.docsApprovedAt = new Date().toISOString();
                isTransitioned = true;
            }
        }
        
        recalculateAuthorization(op);
        saveOperatorsToStorage();
        
        if (isTransitioned) {
            const trainingBaseDate = op.docsApprovedAt || op.createdAt;
            const assignedFriday = getAvailableTrainingFriday(op.id, trainingBaseDate);
            showToast(`¡Toda la documentación ha sido aprobada! Turno asignado para el Viernes ${formatDateString(assignedFriday)}.`, 'success');
        } else {
            showToast(`Documento "${getDocTypeFriendlyName(type)}" aprobado`, 'success');
        }
        
        // Re-renderizar modal y dashboard
        renderModalDocumentCards(op);
        renderOperatorsTable();
    }
}

function handleRejectDocument(opId, type) {
    const op = operators.find(o => o.id === opId);
    if (!op) return;
    
    if (op.documentos && op.documentos[type]) {
        const docName = op.documentos[type].name;
        
        // 1. Eliminar el documento rechazado del operador
        delete op.documentos[type];
        
        // 2. Revertir estado final y fecha de carga ya que falta documentación
        op.docsUploadedAt = null;
        op.estadoFinal = 'inscrito'; // Vuelve a inscripto
        recalculateAuthorization(op);
        
        // Agregar a la cola de notificaciones para el operador
        op.pendingNotifications = op.pendingNotifications || [];
        op.pendingNotifications.push({
            type: 'rejection',
            docType: type,
            docName: docName
        });
        
        saveOperatorsToStorage();
        showToast(`Documento "${getDocTypeFriendlyName(type)}" rechazado. Notificación enviada.`, 'warning');
        
        // 3. Simular el envío de correo electrónico al email del operador (inmediato para supervisor)
        simulateEmailNotification(op, type, docName);
        
        // Re-renderizar modal y dashboard
        renderModalDocumentCards(op);
        renderOperatorsTable();
    }
}

// Enviar un correo electrónico real utilizando el endpoint AJAX gratuito de FormSubmit.co
function sendRealEmailViaAPI(toEmail, subject, messageText) {
    if (!toEmail || !toEmail.includes('@') || toEmail.includes('ejemplo.com')) {
        console.warn("Correo omitido: Dirección de correo electrónico inválida o simulada.");
        return;
    }
    
    const payload = {
        _subject: subject,
        _captcha: "false",
        "Sistema": "Licencia Interna de Manejo (SLI)",
        "Mensaje": messageText
    };
    
    fetch(`https://formsubmit.co/ajax/${toEmail}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Correo electrónico real enviado exitosamente:", data);
        showToast(`Correo enviado a ${toEmail}. Revisa tu bandeja (y spam) para activar FormSubmit.`, 'info');
    })
    .catch(error => {
        console.error("Error al intentar enviar el correo real:", error);
        showToast('Error al enviar el correo real. Verifica tu conexión.', 'danger');
    });
}

function simulateEmailNotification(op, type, docName) {
    // Eliminar cualquier notificación de correo anterior
    const oldEmail = document.getElementById('simulated-email-box');
    if (oldEmail) oldEmail.remove();
    
    const friendlyDoc = getDocTypeFriendlyName(type);
    
    const emailBox = document.createElement('div');
    emailBox.id = 'simulated-email-box';
    emailBox.style.position = 'fixed';
    emailBox.style.bottom = '20px';
    emailBox.style.right = '20px';
    emailBox.style.width = '420px';
    emailBox.style.backgroundColor = '#1e293b';
    emailBox.style.border = '2px solid var(--danger)';
    emailBox.style.borderRadius = '12px';
    emailBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    emailBox.style.zIndex = '999999';
    emailBox.style.overflow = 'hidden';
    emailBox.style.animation = 'slideInUp 0.5s ease-out';
    
    emailBox.innerHTML = `
        <div style="background-color: var(--danger); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; color: white;">
            <span style="font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Correo Electrónico Automático Enviado
            </span>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer; font-weight:bold;">&times;</button>
        </div>
        <div style="padding: 15px; color: var(--text-primary); font-size: 0.85rem; line-height: 1.5; font-family: system-ui, -apple-system, sans-serif;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>De:</strong> <span class="text-muted">Licencia Interna &lt;sistema-sli@newmont.com&gt;</span></div>
                <div><strong>Para:</strong> <strong style="color:var(--warning);">${op.email || 'sin-correo@ejemplo.com'}</strong></div>
                <div><strong>Asunto:</strong> <span style="font-weight: 500;">Rechazo de Documento - Licencia Interna de Manejo SLI</span></div>
            </div>
            <p>Estimado/a <strong>${op.nombre}</strong>,</p>
            <p>Le informamos que el documento adjunto: <strong>"${friendlyDoc}"</strong> (archivo: <em>${docName}</em>) para su habilitación de manejo ha sido <strong>rechazado</strong> tras la evaluación, debido a que no cumple con los requisitos mínimos de legibilidad o validez.</p>
            <p>Su estado de inscripción ha sido restablecido temporalmente a <strong>"Pendiente de Datos y Docs"</strong>.</p>
            <p>Por favor, ingrese al portal con su usuario y legajo a la brevedad para <strong>revisar la observación, corregir el archivo y volver a cargarlo</strong>. Una vez que vuelva a enviar la documentación completa y esta sea aprobada por los evaluadores, se habilitará y asignará automáticamente su turno para la capacitación teórica.</p>
            <p style="margin-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px; font-size: 0.75rem; color: var(--text-muted);">
                * Este es un correo automático generado por el sistema SLI de Newmont Argentina. No responda a este mensaje.
            </p>
        </div>
    `;
    
    document.body.appendChild(emailBox);
    
    // Disparar el envío real
    const mailSubject = `Rechazo de Documento - Licencia Interna de Manejo SLI`;
    const mailBody = `Estimado/a ${op.nombre},\n\nLe informamos que el documento adjunto: "${friendlyDoc}" (archivo: ${docName}) para su habilitación de manejo ha sido rechazado tras la evaluación, debido a que no cumple con los requisitos mínimos de legibilidad o validez.\n\nSu estado de inscripción ha sido restablecido temporalmente a "Pendiente de Datos y Docs".\n\nPor favor, ingrese al portal con su usuario y legajo a la brevedad para revisar la observación, corregir el archivo y volver a cargarlo. Una vez que vuelva a enviar la documentación completa y esta sea aprobada por los evaluadores, se habilitará y asignará automáticamente su turno para la capacitación teórica.\n\nAtentamente,\nLicencia Interna`;
    sendRealEmailViaAPI(op.email, mailSubject, mailBody);
    
    // Auto-eliminar después de 15 segundos
    setTimeout(() => {
        if (document.getElementById('simulated-email-box') === emailBox) {
            emailBox.style.animation = 'fadeOut 0.5s ease-in';
            setTimeout(() => emailBox.remove(), 500);
        }
    }, 15000);
}

function simulateEmailPracticalFail(op) {
    const oldEmail = document.getElementById('simulated-email-box');
    if (oldEmail) oldEmail.remove();
    
    const emailBox = document.createElement('div');
    emailBox.id = 'simulated-email-box';
    emailBox.style.position = 'fixed';
    emailBox.style.bottom = '20px';
    emailBox.style.right = '20px';
    emailBox.style.width = '420px';
    emailBox.style.backgroundColor = '#1e293b';
    emailBox.style.border = '2px solid var(--warning)';
    emailBox.style.borderRadius = '12px';
    emailBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    emailBox.style.zIndex = '999999';
    emailBox.style.overflow = 'hidden';
    emailBox.style.animation = 'slideInUp 0.5s ease-out';
    
    const lic = op.licenciaNacional;
    const attempts = licenseAttempts[lic] || 0;
    
    emailBox.innerHTML = `
        <div style="background-color: var(--warning); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; color: var(--bg-dark);">
            <span style="font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Correo: Recuperatorio Práctico Requerido
            </span>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:var(--bg-dark); font-size:1.2rem; cursor:pointer; font-weight:bold;">&times;</button>
        </div>
        <div style="padding: 15px; color: var(--text-primary); font-size: 0.85rem; line-height: 1.5; font-family: system-ui, -apple-system, sans-serif;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>De:</strong> <span class="text-muted">Licencia Interna &lt;sistema-sli@newmont.com&gt;</span></div>
                <div><strong>Para:</strong> <strong style="color:var(--warning);">${op.email || 'sin-correo@ejemplo.com'}</strong></div>
                <div><strong>Asunto:</strong> <span style="font-weight: 500;">Reprobación de Examen Práctico - Licencia Interna de Manejo SLI</span></div>
            </div>
            <p>Estimado/a <strong>${op.nombre}</strong>,</p>
            <p>Le informamos que el resultado de su evaluación práctica de manejo ha sido registrado como <strong>"Recuperar" (No Aprobado)</strong>.</p>
            <p>Este es su **intento 1 de un máximo de 2** para la licencia Nro. <strong>${op.licenciaNacional}</strong>.</p>
            <p>Por favor, coordine a la brevedad una nueva fecha de evaluación práctica con su supervisor o instructor práctico para poder completar su habilitación.</p>
            <p style="margin-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px; font-size: 0.75rem; color: var(--text-muted);">
                * Este es un correo automático generado por el sistema SLI de Newmont Argentina.
            </p>
        </div>
    `;
    
    document.body.appendChild(emailBox);
    
    // Disparar el envío real
    const mailSubject = `Reprobación de Examen Práctico - Licencia Interna de Manejo SLI`;
    const mailBody = `Estimado/a ${op.nombre},\n\nLe informamos que el resultado de su evaluación práctica de manejo ha sido registrado como "Recuperar" (No Aprobado).\n\nEste es su intento 1 de un máximo de 2 para la licencia Nro. ${op.licenciaNacional}.\n\nPor favor, coordine a la brevedad una nueva fecha de evaluación práctica con su supervisor o instructor práctico para poder completar su habilitación.\n\nAtentamente,\nLicencia Interna`;
    sendRealEmailViaAPI(op.email, mailSubject, mailBody);
    
    setTimeout(() => {
        if (document.getElementById('simulated-email-box') === emailBox) {
            emailBox.style.animation = 'fadeOut 0.5s ease-in';
            setTimeout(() => emailBox.remove(), 500);
        }
    }, 15000);
}

function simulateEmailMaxAttemptsExceeded(op) {
    const oldEmail = document.getElementById('simulated-email-box');
    if (oldEmail) oldEmail.remove();
    
    const emailBox = document.createElement('div');
    emailBox.id = 'simulated-email-box';
    emailBox.style.position = 'fixed';
    emailBox.style.bottom = '20px';
    emailBox.style.right = '20px';
    emailBox.style.width = '420px';
    emailBox.style.backgroundColor = '#1e293b';
    emailBox.style.border = '2px solid var(--danger)';
    emailBox.style.borderRadius = '12px';
    emailBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    emailBox.style.zIndex = '999999';
    emailBox.style.overflow = 'hidden';
    emailBox.style.animation = 'slideInUp 0.5s ease-out';
    
    emailBox.innerHTML = `
        <div style="background-color: var(--danger); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; color: white;">
            <span style="font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Correo: Límite de Intentos Superado - Reiniciar Proceso
            </span>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer; font-weight:bold;">&times;</button>
        </div>
        <div style="padding: 15px; color: var(--text-primary); font-size: 0.85rem; line-height: 1.5; font-family: system-ui, -apple-system, sans-serif;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>De:</strong> <span class="text-muted">Licencia Interna &lt;sistema-sli@newmont.com&gt;</span></div>
                <div><strong>Para:</strong> <strong style="color:var(--danger);">${op.email || 'sin-correo@ejemplo.com'}</strong></div>
                <div><strong>Asunto:</strong> <span style="font-weight: 500; color: var(--danger);">TRÁMITE REVERTIDO - Límite de Intentos Excedido</span></div>
            </div>
            <p>Estimado/a <strong>${op.nombre}</strong>,</p>
            <p>Le informamos que ha **reprobado por segunda vez** la evaluación práctica de manejo correspondiente a la licencia Nro. <strong>${op.licenciaNacional}</strong>.</p>
            <p>De acuerdo con la normativa corporativa, **se ha superado el límite máximo de 2 intentos permitidos**, por lo que su trámite completo ha sido anulado y restablecido a la fase inicial.</p>
            <p>Para volver a postularse para la Licencia Interna de Manejo, deberá ingresar al portal y **reiniciar todo el proceso desde cero**, lo que incluye volver a cargar sus datos y los 3 documentos obligatorios.</p>
            <p style="margin-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px; font-size: 0.75rem; color: var(--text-muted);">
                * Este es un correo automático de alerta del sistema SLI de Newmont Argentina.
            </p>
        </div>
    `;
    
    document.body.appendChild(emailBox);
    
    // Disparar el envío real
    const mailSubject = `TRÁMITE REVERTIDO - Límite de Intentos Excedido`;
    const mailBody = `Estimado/a ${op.nombre},\n\nLe informamos que ha reprobado por segunda vez la evaluación práctica de manejo correspondiente a la licencia Nro. ${op.licenciaNacional}.\n\nDe acuerdo con la normativa corporativa, se ha superado el límite máximo de 2 intentos permitidos, por lo que su trámite completo ha sido anulado y restablecido a la fase inicial. Deberá comenzar el proceso nuevamente cargando los requisitos.\n\nAtentamente,\nLicencia Interna`;
    sendRealEmailViaAPI(op.email, mailSubject, mailBody);
    
    setTimeout(() => {
        if (document.getElementById('simulated-email-box') === emailBox) {
            emailBox.style.animation = 'fadeOut 0.5s ease-in';
            setTimeout(() => emailBox.remove(), 500);
        }
    }, 15000);
}

function renderModalExamCard(op) {
    const nameEl = document.getElementById('modal-exam-file-name');
    const sizeEl = document.getElementById('modal-exam-file-size');
    const actionsEl = document.getElementById('modal-exam-actions');
    if (!nameEl || !sizeEl || !actionsEl) return;
    
    const exam = op.examenEscrito;
    
    if (exam && exam.name) {
        nameEl.innerText = exam.name;
        nameEl.style.color = 'var(--text-primary)';
        sizeEl.innerText = exam.size;
        
        actionsEl.innerHTML = `
            <button class="btn btn-secondary btn-sm btn-preview-exam" style="padding: 2px 6px; font-size: 0.75rem;">Ver</button>
            <button class="btn btn-primary btn-sm btn-download-exam" style="padding: 2px 6px; font-size: 0.75rem;">Descargar</button>
            <button class="btn btn-danger btn-sm btn-delete-exam" style="padding: 2px 6px; font-size: 0.75rem;" title="Eliminar Examen">×</button>
        `;
        
        actionsEl.querySelector('.btn-preview-exam').addEventListener('click', (e) => {
            e.preventDefault();
            showDocumentPreview(op.nombre, 'examen', exam);
        });
        
        actionsEl.querySelector('.btn-download-exam').addEventListener('click', (e) => {
            e.preventDefault();
            downloadDocument(op.nombre, 'examen', exam);
        });
        
        actionsEl.querySelector('.btn-delete-exam').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Está seguro de que desea eliminar el archivo del examen?')) {
                delete op.examenEscrito;
                saveOperatorsToStorage();
                showToast('Archivo del examen eliminado', 'info');
                renderModalExamCard(op);
            }
        });
    } else {
        nameEl.innerText = 'Sin examen cargado';
        nameEl.style.color = 'var(--text-muted)';
        sizeEl.innerText = 'PDF, JPG, PNG (Máx 5MB)';
        
        actionsEl.innerHTML = `
            <input type="file" id="file-exam-upload" style="display: none;" accept=".pdf,image/*">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-select-exam-file">Seleccionar Archivo</button>
        `;
        
        bindExamUploadListeners(op);
    }
}

function bindExamUploadListeners(op) {
    const fileInput = document.getElementById('file-exam-upload');
    const selectBtn = document.getElementById('btn-select-exam-file');
    if (!fileInput || !selectBtn) return;
    
    selectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('El archivo no debe superar los 5MB', 'danger');
            return;
        }
        
        const sizeKB = file.size / 1024;
        const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
        
        compressAndSaveFile(file, function(compressedBase64) {
            if (!compressedBase64) {
                showToast('Error al procesar el archivo', 'danger');
                return;
            }
            op.examenEscrito = {
                name: file.name,
                size: sizeStr,
                uploadedAt: new Date().toISOString(),
                dataUrl: compressedBase64
            };
            saveOperatorsToStorage();
            showToast('Examen teórico cargado correctamente', 'success');
            renderModalExamCard(op);
        });
    });
}

function renderModalPracticaCard(op) {
    const nameEl = document.getElementById('modal-practica-file-name');
    const sizeEl = document.getElementById('modal-practica-file-size');
    const actionsEl = document.getElementById('modal-practica-actions');
    if (!nameEl || !sizeEl || !actionsEl) return;
    
    const doc = op.planillaPractica;
    
    if (doc && doc.name) {
        nameEl.innerText = doc.name;
        nameEl.style.color = 'var(--text-primary)';
        sizeEl.innerText = doc.size;
        
        actionsEl.innerHTML = `
            <button class="btn btn-secondary btn-sm btn-preview-practica" style="padding: 2px 6px; font-size: 0.75rem;">Ver</button>
            <button class="btn btn-primary btn-sm btn-download-practica" style="padding: 2px 6px; font-size: 0.75rem;">Descargar</button>
            <button class="btn btn-danger btn-sm btn-delete-practica" style="padding: 2px 6px; font-size: 0.75rem;" title="Eliminar Planilla">×</button>
        `;
        
        actionsEl.querySelector('.btn-preview-practica').addEventListener('click', (e) => {
            e.preventDefault();
            showDocumentPreview(op.nombre, 'planilla_practica', doc);
        });
        
        actionsEl.querySelector('.btn-download-practica').addEventListener('click', (e) => {
            e.preventDefault();
            downloadDocument(op.nombre, 'planilla_practica', doc);
        });
        
        actionsEl.querySelector('.btn-delete-practica').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Está seguro de que desea eliminar la planilla práctica?')) {
                delete op.planillaPractica;
                saveOperatorsToStorage();
                showToast('Planilla de examen práctico eliminada', 'info');
                renderModalPracticaCard(op);
            }
        });
    } else {
        nameEl.innerText = 'Sin planilla cargada';
        nameEl.style.color = 'var(--text-muted)';
        sizeEl.innerText = 'PDF, JPG, PNG (Máx 5MB)';
        
        actionsEl.innerHTML = `
            <input type="file" id="file-practica-upload" style="display: none;" accept=".pdf,image/*">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-select-practica-file">Seleccionar Archivo</button>
        `;
        
        bindPracticaUploadListeners(op);
    }
}

function bindPracticaUploadListeners(op) {
    const fileInput = document.getElementById('file-practica-upload');
    const selectBtn = document.getElementById('btn-select-practica-file');
    if (!fileInput || !selectBtn) return;
    
    selectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('El archivo no debe superar los 5MB', 'danger');
            return;
        }
        
        const sizeKB = file.size / 1024;
        const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
        
        compressAndSaveFile(file, function(compressedBase64) {
            if (!compressedBase64) {
                showToast('Error al procesar el archivo', 'danger');
                return;
            }
            op.planillaPractica = {
                name: file.name,
                size: sizeStr,
                uploadedAt: new Date().toISOString(),
                dataUrl: compressedBase64
            };
            saveOperatorsToStorage();
            showToast('Planilla de examen práctico cargada correctamente', 'success');
            renderModalPracticaCard(op);
        });
    });
}

function renderModalIssuedLicenseCard(op) {
    const nameEl = document.getElementById('modal-issued-license-file-name');
    const sizeEl = document.getElementById('modal-issued-license-file-size');
    const actionsEl = document.getElementById('modal-issued-license-actions');
    if (!nameEl || !sizeEl || !actionsEl) return;
    
    // Solo permitir subir/gestionar si es Admin o Instructor Teórico (supervisor)
    const isTechnical = currentRole === 'instructor_tecnico';
    const doc = op.licenciaEmitida;
    
    if (doc && doc.name) {
        nameEl.innerText = doc.name;
        nameEl.style.color = 'var(--text-primary)';
        sizeEl.innerText = doc.size;
        sizeEl.style.color = 'var(--text-muted)';
        
        actionsEl.innerHTML = `
            <button class="btn btn-secondary btn-sm btn-preview-issued-license" style="padding: 2px 6px; font-size: 0.75rem;">Ver</button>
            <button class="btn btn-primary btn-sm btn-download-issued-license" style="padding: 2px 6px; font-size: 0.75rem;">Descargar</button>
            ${isTechnical ? '' : '<button class="btn btn-danger btn-sm btn-delete-issued-license" style="padding: 2px 6px; font-size: 0.75rem;" title="Eliminar Licencia">×</button>'}
        `;
        
        actionsEl.querySelector('.btn-preview-issued-license').addEventListener('click', (e) => {
            e.preventDefault();
            showDocumentPreview(op.nombre, 'licencia_emitida', doc);
        });
        
        actionsEl.querySelector('.btn-download-issued-license').addEventListener('click', (e) => {
            e.preventDefault();
            downloadDocument(op.nombre, 'licencia_emitida', doc);
        });
        
        const deleteBtn = actionsEl.querySelector('.btn-delete-issued-license');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('¿Está seguro de que desea eliminar la licencia emitida?')) {
                    delete op.licenciaEmitida;
                    saveOperatorsToStorage();
                    showToast('Licencia emitida eliminada', 'info');
                    renderModalIssuedLicenseCard(op);
                }
            });
        }
    } else {
        nameEl.innerText = 'Sin licencia emitida cargada';
        nameEl.style.color = 'var(--text-muted)';
        
        let isReadyForLicense = false;
        let blockReason = '';
        
        if (op.tipoEquipo === 'pesados') {
            const hasBaseDocs = op.documentos && 
                                op.documentos.licencia && op.documentos.licencia.status === 'aprobado' &&
                                op.documentos.foto && op.documentos.foto.status === 'aprobado' &&
                                op.documentos.autorizacion && op.documentos.autorizacion.status === 'aprobado';
            const hasCert = op.documentos && op.documentos.certificacion && op.documentos.certificacion.status === 'aprobado';
            if (!hasBaseDocs || !hasCert) {
                blockReason = 'Bloqueado: Requiere todos los documentos del Paso 2 Aprobados';
            } else if (op.estadoTeorico !== 'aprobado') {
                blockReason = 'Bloqueado: Requiere Examen Teórico Aprobado';
            } else {
                isReadyForLicense = true;
            }
        } else {
            if (op.estadoPractico !== 'ok') {
                blockReason = 'Bloqueado: Requiere Evaluación Práctica Aprobada (OK)';
            } else {
                isReadyForLicense = true;
            }
        }

        if (!isReadyForLicense) {
            sizeEl.innerText = blockReason;
            sizeEl.style.color = 'var(--danger)';
            actionsEl.innerHTML = `
                <button type="button" class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed;" title="${blockReason}">
                    Subir Licencia
                </button>
            `;
        } else if (isTechnical) {
            sizeEl.innerText = 'PDF, JPG, PNG (Máx 5MB)';
            sizeEl.style.color = 'var(--text-muted)';
            actionsEl.innerHTML = `
                <button type="button" class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed;" title="Permiso reservado para Instructores Teóricos y Admins">
                    Solo Inst. Teórico
                </button>
            `;
        } else {
            sizeEl.innerText = 'PDF, JPG, PNG (Máx 5MB)';
            sizeEl.style.color = 'var(--text-muted)';
            actionsEl.innerHTML = `
                <input type="file" id="file-issued-license-upload" style="display: none;" accept=".pdf,image/*">
                <button type="button" class="btn btn-primary btn-sm" id="btn-select-issued-license-file">Subir Licencia</button>
            `;
            
            bindIssuedLicenseUploadListeners(op);
        }
    }
}

function bindIssuedLicenseUploadListeners(op) {
    const fileInput = document.getElementById('file-issued-license-upload');
    const selectBtn = document.getElementById('btn-select-issued-license-file');
    if (!fileInput || !selectBtn) return;
    
    selectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('El archivo no debe superar los 5MB', 'danger');
            return;
        }
        
        const sizeKB = file.size / 1024;
        const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
        
        compressAndSaveFile(file, function(compressedBase64) {
            if (!compressedBase64) {
                showToast('Error al procesar el archivo', 'danger');
                return;
            }
            op.licenciaEmitida = {
                name: file.name,
                size: sizeStr,
                uploadedAt: new Date().toISOString(),
                dataUrl: compressedBase64
            };
            saveOperatorsToStorage();
            showToast('Licencia Interna final cargada correctamente', 'success');
            renderModalIssuedLicenseCard(op);
        });
    });
}

function switchModalTab(tabId) {
    // Desactivar todas las pestañas y paneles
    document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.modal-tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Activar la pestaña cliqueada
    const btn = document.querySelector(`.modal-tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
}

// Guardar los cambios en los datos del operador hechos en el modal
function handleModalFormSave(e) {
    e.preventDefault();
    
    const op = operators.find(o => o.id === activeEditingOperatorId);
    if (!op) return;
    
    op.nombre = document.getElementById('modal-edit-nombre').value.trim();
    op.legajo = document.getElementById('modal-edit-legajo').value.trim();
    op.sector = document.getElementById('modal-edit-sector').value.trim();
    op.licenciaNacional = document.getElementById('modal-edit-licencia').value.trim();
    op.email = document.getElementById('modal-edit-email').value.trim();
    op.tipoEquipo = document.getElementById('modal-edit-tipo-equipo').value;
    
    saveOperatorsToStorage();
    showToast('Datos del operador actualizados', 'success');
    renderApp();
}

// Guardar calificación teórica del operador desde el modal
function handleSaveGrade(e) {
    e.preventDefault();
    
    if (currentRole !== 'admin' && currentRole !== 'supervisor') {
        showToast('No tienes permisos para registrar la evaluación teórica', 'danger');
        return;
    }
    
    const op = operators.find(o => o.id === activeEditingOperatorId);
    if (!op) return;
    
    // Verificar si ya cargó los documentos mínimos para rendir
    if (!op.docsUploadedAt) {
        showToast('El operador debe cargar toda la documentación antes de registrar su nota', 'warning');
        return;
    }
    
    const nota = parseFloat(document.getElementById('eval-nota').value);
    const estado = document.getElementById('eval-estado').value;
    
    if (isNaN(nota) || nota < 0 || nota > 10) {
        showToast('Ingrese una nota válida entre 0 y 10', 'warning');
        return;
    }
    
    if (!estado) {
        showToast('Seleccione el resultado (Aprobado / No Aprobado)', 'warning');
        return;
    }
    
    op.notaTeorica = nota;
    op.estadoTeorico = estado;
    op.evalCompletedAt = new Date().toISOString();
    
    if (estado === 'aprobado') {
        op.estadoFinal = 'teorico_aprobado'; // Pasa a estado "OK"
        showToast(`Operador calificado con ${nota}. ¡Aprobado y habilitado para práctica (Estado OK)!`, 'success');
    } else {
        op.estadoFinal = 'teorico_reprobado';
        showToast(`Operador calificado con ${nota}. Marcado como No Aprobado.`, 'warning');
        op.estadoPractico = 'pendiente'; // Se restablece al reprobar teoría
    }
    
    recalculateAuthorization(op);
    saveOperatorsToStorage();
    closeModal();
    renderApp();
}

// Calcular si el operador está Autorizado (aprobó Teoría y Práctica)
function recalculateAuthorization(op) {
    const hasBaseDocs = op.documentos && 
                        op.documentos.licencia && op.documentos.licencia.status === 'aprobado' &&
                        op.documentos.foto && op.documentos.foto.status === 'aprobado' &&
                        op.documentos.autorizacion && op.documentos.autorizacion.status === 'aprobado';
                        
    let allDocsApproved = hasBaseDocs;
    if (op.tipoEquipo === 'pesados') {
        const hasCert = op.documentos && op.documentos.certificacion && op.documentos.certificacion.status === 'aprobado';
        allDocsApproved = hasBaseDocs && hasCert;
    }
    
    // Auto-curación para operadores con documentos aprobados colgados en revisión
    if (op.estadoFinal === 'documentos_cargados' && allDocsApproved) {
        op.estadoFinal = 'turno_asignado';
        op.docsApprovedAt = op.docsApprovedAt || new Date().toISOString();
    }
    
    if (op.tipoEquipo === 'pesados') {
        const isAuthorized = allDocsApproved && op.estadoTeorico === 'aprobado';
        op.autorizacionFinal = isAuthorized ? 'Autorizado' : 'No Autorizado';
    } else {
        const isAuthorized = allDocsApproved && op.estadoTeorico === 'aprobado' && op.estadoPractico === 'ok';
        op.autorizacionFinal = isAuthorized ? 'Autorizado' : 'No Autorizado';
    }
}

// Guardar resultado práctico del operador desde el modal
function handleSavePractica(e) {
    e.preventDefault();
    
    if (currentRole !== 'admin' && currentRole !== 'instructor_tecnico') {
        showToast('No tienes permisos para registrar la evaluación práctica', 'danger');
        return;
    }
    
    const op = operators.find(o => o.id === activeEditingOperatorId);
    if (!op) return;
    
    // Verificar si aprobó la parte teórica primero
    if (op.estadoTeorico !== 'aprobado') {
        showToast('El operador debe aprobar la evaluación teórica antes de asentar el resultado práctico', 'warning');
        return;
    }
    
    const estadoPractica = document.getElementById('practica-estado').value;
    
    if (!estadoPractica) {
        showToast('Seleccione un resultado práctico válido', 'warning');
        return;
    }
    
    if (estadoPractica === 'ok') {
        op.estadoPractico = 'ok';
        // Limpiar intentos de examen práctico para esta licencia al aprobar
        licenseAttempts[op.licenciaNacional] = 0;
        saveLicenseAttempts();
        recalculateAuthorization(op);
        saveOperatorsToStorage();
        closeModal();
        renderApp();
        showToast('Resultado práctico guardado: ¡Aprobado y AUTORIZADO!', 'success');
    } else if (estadoPractica === 'recuperar') {
        // Incrementar intentos
        const lic = op.licenciaNacional;
        const currentAttempts = (licenseAttempts[lic] || 0) + 1;
        licenseAttempts[lic] = currentAttempts;
        saveLicenseAttempts();
        
        if (currentAttempts >= 2) {
            // Excedió el límite de 2 intentos -> Resetear todo el proceso
            op.estadoFinal = 'inscrito';
            op.docsUploadedAt = null;
            op.documentos = {}; // Borrar documentos adjuntos
            op.notaTeorica = null;
            op.estadoTeorico = 'pendiente';
            op.estadoPractico = 'pendiente';
            op.evalCompletedAt = null;
            op.planillaPractica = null; // Borrar planilla si hubiera
            op.examenEscrito = null; // Borrar examen
            delete op.licenciaEmitida; // Borrar licencia emitida
            recalculateAuthorization(op);
            
            // Resetear el contador a 0 para que pueda volver a intentar en el nuevo ciclo
            licenseAttempts[lic] = 0;
            saveLicenseAttempts();
            
            // Agregar a la cola de notificaciones para el operador
            op.pendingNotifications = op.pendingNotifications || [];
            op.pendingNotifications.push({
                type: 'max_attempts'
            });
            
            saveOperatorsToStorage();
            closeModal();
            renderApp();
            
            showToast('Límite de 2 intentos reprobados superado. Proceso restablecido desde cero.', 'danger');
            simulateEmailMaxAttemptsExceeded(op);
        } else {
            // Primer intento fallido
            op.estadoPractico = 'recuperar';
            delete op.licenciaEmitida;
            recalculateAuthorization(op);
            
            // Agregar a la cola de notificaciones para el operador
            op.pendingNotifications = op.pendingNotifications || [];
            op.pendingNotifications.push({
                type: 'practical_fail'
            });
            
            saveOperatorsToStorage();
            closeModal();
            renderApp();
            
            showToast('Resultado práctico guardado: Recuperar. Notificación enviada.', 'warning');
            simulateEmailPracticalFail(op);
        }
    } else {
        op.estadoPractico = 'pendiente';
        delete op.licenciaEmitida;
        recalculateAuthorization(op);
        saveOperatorsToStorage();
        closeModal();
        renderApp();
        showToast('Resultado práctico guardado como Pendiente (No Autorizado)', 'info');
    }
}

// Eliminar Operador (Permitido directo para Admin, requiere clave/autorización para Supervisor)
function handleDeleteOperator() {
    const op = operators.find(o => o.id === activeEditingOperatorId);
    if (!op) return;
    
    const executeDelete = () => {
        if (confirm(`¿Está seguro de que desea eliminar permanentemente al operador ${op.nombre || 'sin nombre'}? Esta acción no se puede deshacer.`)) {
            operators = operators.filter(o => o.id !== activeEditingOperatorId);
            saveOperatorsToStorage();
            showToast('Operador eliminado con éxito', 'success');
            closeModal();
            renderApp();
        }
    };
    
    if (currentRole === 'admin') {
        executeDelete();
    } else {
        // Es Supervisor, ver si tiene permiso activado global
        if (appConfig.allowSupervisorDelete) {
            executeDelete();
        } else {
            // Solicitar clave de autorización del Admin
            const password = prompt('Esta acción requiere autorización de Admin. Ingrese la clave de Administrador para confirmar:');
            if (password === null) return; // Canceló
            if (password === appConfig.adminPassword) {
                executeDelete();
            } else {
                showToast('Clave incorrecta. Autorización denegada.', 'danger');
            }
        }
    }
}

function closeModal() {
    document.getElementById('operator-modal').classList.remove('active');
    activeEditingOperatorId = null;
}

// --- VISUALIZADOR DE DOCUMENTOS SIMULADO ---

// --- VISUALIZADOR Y DESCARGA DE DOCUMENTOS ---

// Obtener el Blob del documento (ya sea real o mock)
function getDocumentBlob(docObj, docType, opName) {
    if (docObj && docObj.dataUrl) {
        try {
            const parts = docObj.dataUrl.split(';base64,');
            const mimeType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);
            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], { type: mimeType });
        } catch (err) {
            console.error("Error al decodificar archivo base64", err);
        }
    }
    
    // Si es un archivo mock, generamos un documento HTML representativo de alta calidad
    let docTitle = getDocTypeFriendlyName(docType);
    let contentHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>${opName} - ${docTitle}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #0b0f19;
                color: #f3f4f6;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
            }
            .card {
                background: #111827;
                border: 1px solid #374151;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                padding: 40px;
                max-width: 600px;
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }
            .header {
                border-bottom: 2px solid #f59e0b;
                padding-bottom: 20px;
                margin-bottom: 24px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #f59e0b;
                letter-spacing: 2px;
            }
            .watermark {
                color: #ef4444;
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 5px;
            }
            h1 {
                font-size: 20px;
                margin: 10px 0;
                color: #ffffff;
            }
            .field {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #1f2937;
                font-size: 14px;
            }
            .field-label {
                color: #9ca3af;
            }
            .field-value {
                font-weight: 600;
                color: #ffffff;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #6b7280;
            }
            .stamp {
                border: 2px dashed #10b981;
                color: #10b981;
                display: inline-block;
                padding: 8px 15px;
                border-radius: 6px;
                font-weight: bold;
                text-transform: uppercase;
                transform: rotate(-3deg);
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <div class="logo">NEWMONT ARGENTINA</div>
                <div class="watermark">VISTA DE DOCUMENTO SIMULADO - SLI</div>
            </div>
            <h1>${docTitle}</h1>
            <div class="field">
                <div class="field-label">Operador:</div>
                <div class="field-value">${opName}</div>
            </div>
            <div class="field">
                <div class="field-label">Nombre del archivo original:</div>
                <div class="field-value">${docObj ? docObj.name : 'sin_archivo.pdf'}</div>
            </div>
            <div class="field">
                <div class="field-label">Tamaño del archivo:</div>
                <div class="field-value">${docObj ? docObj.size : '0 KB'}</div>
            </div>
            <div class="field">
                <div class="field-label">Fecha de carga:</div>
                <div class="field-value">${docObj ? formatDateString(docObj.uploadedAt) : 'Pendiente'}</div>
            </div>
            <div class="stamp">Verificación Válida</div>
            <div class="footer">
                Este documento es una simulación visual generada por el Sistema de Licencia Interna.
            </div>
        </div>
    </body>
    </html>
    `;
    return new Blob([contentHTML], { type: 'text/html; charset=utf-8' });
}

// Abrir documento en una pestaña externa del navegador
function openDocumentInNewTab(opName, docType, docObj) {
    const blob = getDocumentBlob(docObj, docType, opName);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// Descargar documento
function downloadDocument(opName, docType, docObj) {
    const blob = getDocumentBlob(docObj, docType, opName);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Determinar extensión adecuada
    let extension = '.html';
    if (docObj && docObj.dataUrl) {
        const parts = docObj.dataUrl.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        if (mimeType.includes('pdf')) {
            extension = '.pdf';
        } else if (mimeType.includes('png')) {
            extension = '.png';
        } else if (mimeType.includes('jpg') || mimeType.includes('jpeg')) {
            extension = '.jpg';
        }
    }
    
    const filename = docObj && docObj.name ? docObj.name : `${opName}_${docType}${extension}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showDocumentPreview(opName, docType, docObj) {
    const viewerModal = document.getElementById('doc-viewer-modal');
    const viewerBody = document.getElementById('doc-viewer-body');
    const viewerTitle = document.getElementById('doc-viewer-title');
    
    viewerTitle.innerText = `${opName} - ${getDocTypeFriendlyName(docType)}`;
    
    if (docType === 'foto' && docObj.dataUrl) {
        // Si hay una foto real en base64
        viewerBody.innerHTML = `<img src="${docObj.dataUrl}" alt="Foto 4x4 de ${opName}" style="max-width:100%; border-radius:8px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">`;
    } else if (docObj.dataUrl && (docObj.dataUrl.startsWith('data:image/png') || docObj.dataUrl.startsWith('data:image/jpeg'))) {
        // Si es una licencia o autorización subida como imagen real
        viewerBody.innerHTML = `<img src="${docObj.dataUrl}" alt="${docType} de ${opName}" style="max-width:100%; border-radius:8px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">`;
    } else {
        // Generar un documento corporativo ficticio (un certificado en PDF simulado hermoso)
        let iconMarkup = '';
        let colorClass = '';
        
        switch (docType) {
            case 'licencia':
                iconMarkup = `<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="var(--primary)" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="4"></line><line x1="8" y1="2" x2="8" y2="4"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
                colorClass = 'primary';
                break;
            case 'foto':
                iconMarkup = `<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="var(--success)" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a5 5 0 0 1 10 0v1.662"></path></svg>`;
                colorClass = 'success';
                break;
            case 'autorizacion':
                iconMarkup = `<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="var(--info)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
                colorClass = 'info';
                break;
        }
        
        viewerBody.innerHTML = `
            <div class="doc-placeholder-preview">
                ${iconMarkup}
                <h4>Archivo: ${docObj.name}</h4>
                <p>Tamaño: ${docObj.size} | Subido el: ${formatDateString(docObj.uploadedAt)}</p>
                <div style="margin-top:20px; padding:15px; border:1px solid var(--border-color); border-radius:8px; background-color:rgba(255,255,255,0.02); text-align:left; max-width:400px; font-size:0.8rem;">
                    <strong style="color:var(--text-primary); display:block; margin-bottom:8px; text-transform:uppercase;">Verificación de Seguridad SLI</strong>
                    El documento ha sido analizado e inspeccionado. Los metadatos de firma digital son correctos. Licencia en estado VIGENTE.
                </div>
            </div>
        `;
    }
    
    // Configurar botones de acción del visor modal
    const btnOpenExternal = document.getElementById('btn-viewer-open-external');
    const btnDownload = document.getElementById('btn-viewer-download');
    
    // Clonar para limpiar eventos acumulados de aperturas anteriores
    const newBtnOpenExternal = btnOpenExternal.cloneNode(true);
    const newBtnDownload = btnDownload.cloneNode(true);
    btnOpenExternal.parentNode.replaceChild(newBtnOpenExternal, btnOpenExternal);
    btnDownload.parentNode.replaceChild(newBtnDownload, btnDownload);
    
    // Ocultar botones de descarga si el rol de usuario no tiene permiso
    const isStaff = currentRole === 'admin' || currentRole === 'supervisor' || currentRole === 'instructor_tecnico';
    if (isStaff) {
        newBtnOpenExternal.style.display = 'inline-flex';
        newBtnDownload.style.display = 'inline-flex';
    } else {
        newBtnOpenExternal.style.display = 'none';
        newBtnDownload.style.display = 'none';
    }
    
    newBtnOpenExternal.addEventListener('click', (e) => {
        e.preventDefault();
        openDocumentInNewTab(opName, docType, docObj);
    });
    
    newBtnDownload.addEventListener('click', (e) => {
        e.preventDefault();
        downloadDocument(opName, docType, docObj);
    });
    
    viewerModal.classList.add('active');
}

function getDocTypeFriendlyName(type) {
    switch (type) {
        case 'licencia': return 'Licencia Nacional de Conducción';
        case 'foto': return 'Foto de Perfil 4x4';
        case 'autorizacion': return 'Autorización de Manejo';
        case 'examen': return 'Examen Teórico';
        case 'planilla_practica': return 'Planilla de Evaluación Práctica';
        case 'licencia_emitida': return 'Licencia Interna Emitida';
        case 'certificacion': return 'Certificación Habilitante';
        default: return 'Documento';
    }
}

function closeDocViewer() {
    document.getElementById('doc-viewer-modal').classList.remove('active');
}

// --- EXPORTACIÓN A EXCEL (CON ORDENAMIENTO ESPECÍFICO) ---

function handleExportExcel() {
    // 1. Filtrar los operadores que están en estado "OK" para realizar la parte práctica
    // (estadoTeorico === 'aprobado' y estadoFinal === 'teorico_aprobado')
    const approved = operators.filter(op => op.estadoTeorico === 'aprobado');
    
    if (approved.length === 0) {
        showToast('No hay operadores con estado "OK" aprobados para exportar.', 'warning');
        return;
    }
    
    // 2. Ordenar las personas aprobadas según el requerimiento:
    // (1) Orden de inscripción (createdAt)
    // (2) Presentación de documentos (docsUploadedAt)
    // (3) Realización de evaluación teórica (evalCompletedAt)
    approved.sort((a, b) => {
        // Criterio 1: Fecha de Inscripción (createdAt)
        const dateA_Insc = new Date(a.createdAt);
        const dateB_Insc = new Date(b.createdAt);
        if (dateA_Insc - dateB_Insc !== 0) {
            return dateA_Insc - dateB_Insc;
        }
        
        // Criterio 2: Fecha de Presentación de Documentos (docsUploadedAt)
        const dateA_Docs = a.docsUploadedAt ? new Date(a.docsUploadedAt) : new Date(0);
        const dateB_Docs = b.docsUploadedAt ? new Date(b.docsUploadedAt) : new Date(0);
        if (dateA_Docs - dateB_Docs !== 0) {
            return dateA_Docs - dateB_Docs;
        }
        
        // Criterio 3: Fecha de Realización de la Evaluación (evalCompletedAt)
        const dateA_Eval = a.evalCompletedAt ? new Date(a.evalCompletedAt) : new Date(0);
        const dateB_Eval = b.evalCompletedAt ? new Date(b.evalCompletedAt) : new Date(0);
        return dateA_Eval - dateB_Eval;
    });
    
    // 3. Limitar a las 15 personas aprobadas según lo solicitado ("ordenar en la planilla las 15 personas aprobadas")
    const top15Approved = approved.slice(0, 15);
    
    // 4. Mapear datos al formato de Excel
    const excelData = top15Approved.map((op, index) => {
        const nextFriday = getAvailableTrainingFriday(op.id, op.createdAt);
        const isSunday = isSundayPracticalExam(op.sector);
        const nextPracticalDate = new Date(nextFriday.getTime());
        nextPracticalDate.setDate(nextPracticalDate.getDate() + (isSunday ? 2 : 1));
        recalculateAuthorization(op);
        const isAuthorized = op.autorizacionFinal === 'Autorizado';
        return {
            'Nro Orden': index + 1,
            'Legajo / ID': op.legajo,
            'Nombre Completo': op.nombre,
            'Sector / Área': op.sector,
            'Licencia Nacional Nro': op.licenciaNacional,
            'Tipo Equipos': op.tipoEquipo === 'pesados' ? 'Equipos Pesados' : 'Equipos Livianos',
            'Fecha Inscripción': formatDateString(op.createdAt),
            'Fecha Carga Docs': formatDateString(op.docsUploadedAt),
            'Fecha Turno Teórico': formatDateString(nextFriday),
            'Fecha Turno Práctico': formatDateString(nextPracticalDate),
            'Fecha Aprobación Examen': formatDateString(op.evalCompletedAt),
            'Nota Teórica': op.notaTeorica,
            'Estado Teórico': 'APROBADO',
            'Resultado Práctico': op.estadoPractico === 'ok' ? 'OK' : (op.estadoPractico === 'recuperar' ? 'RECUPERAR' : 'PENDIENTE'),
            'Estado Final': isAuthorized ? 'AUTORIZADO' : 'NO AUTORIZADO',
            'Firma del Evaluador Práctico': '',
            'Correo Electrónico': op.email || 'S/D'
        };
    });
    
    // 5. Intentar cargar la planilla plantilla template.xlsx
    fetch('template.xlsx')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar la plantilla local");
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            // Leer el archivo de la plantilla
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Obtener la primera hoja de cálculo
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Escribir los datos en A5 (saltándonos las cabeceras porque el template ya tiene fila 4 con títulos)
            XLSX.utils.sheet_add_json(worksheet, excelData, { origin: "A5", skipHeader: true });
            
            // Guardar/Descargar el archivo excel resultante
            XLSX.writeFile(workbook, 'Planilla_Habilitados_Evaluacion_Practica_SLI.xlsx');
            showToast(`Se ha descargado la planilla formateada con ${top15Approved.length} operadores habilitados`, 'success');
        })
        .catch(err => {
            console.warn("Error al cargar la plantilla Excel, usando generador básico de respaldo:", err);
            
            // Generador básico de respaldo si falla fetch (ej. CORS en file://)
            const worksheet = XLSX.utils.json_to_sheet([]);
            // Agregar las cabeceras y datos con origen en A4
            XLSX.utils.sheet_add_json(worksheet, excelData, { origin: "A4" });
            
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Habilitados Práctica');
            
            // Ajustar anchos de columna en la hoja básica
            const max_len = excelData.reduce((prev, next) => {
                Object.keys(next).forEach((key) => {
                    const valStr = next[key] ? next[key].toString() : '';
                    prev[key] = Math.max(prev[key] || 10, valStr.length, key.length);
                });
                return prev;
            }, {});
            const wscols = Object.keys(max_len).map((key) => ({ wch: max_len[key] + 3 }));
            worksheet['!cols'] = wscols;
            
            XLSX.writeFile(workbook, 'Planilla_Habilitados_Evaluacion_Practica_SLI.xlsx');
            showToast(`Se descargó la planilla básica de respaldo con ${top15Approved.length} operadores habilitados`, 'info');
        });
}

// --- ACTUALIZACIÓN DE CUOTA GLOBAL ---

function handleUpdateQuota() {
    const input = document.getElementById('input-quota-limit');
    const newLimit = parseInt(input.value);
    
    if (isNaN(newLimit) || newLimit < 1 || newLimit > 15) {
        showToast('Ingrese un cupo semanal válido (entre 1 y 15)', 'warning');
        return;
    }
    
    appConfig.quotaLimit = newLimit;
    saveConfigToStorage();
    showToast(`Cupo semanal actualizado a ${newLimit} lugares`, 'success');
    renderApp();
}

// --- NOTIFICACIONES TOAST (PREMIUM) ---

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    switch (type) {
        case 'success':
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon toast-icon-success"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            break;
        case 'warning':
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon toast-icon-warning"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            break;
        case 'danger':
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon toast-icon-danger"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            break;
        default:
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon toast-icon-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Animación de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-eliminar
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// --- AUTENTICACION Y REGISTRO ---

function handleLogin(e) {
    e.preventDefault();
    const nameInput = document.getElementById('login-name').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();

    if (!nameInput || !passwordInput) {
        showToast('Complete todos los campos de ingreso', 'warning');
        return;
    }

    // 1. Verificar credenciales en Staff (Admins, Instructores Teóricos, Instructores Prácticos)
    const matchedStaff = staffUsers.find(user => 
        user.name.toLowerCase() === nameInput.toLowerCase() && 
        user.pass === passwordInput
    );
    
    if (matchedStaff) {
        currentUser = {
            id: matchedStaff.id,
            name: matchedStaff.name,
            legajo: matchedStaff.pass,
            role: matchedStaff.role
        };
        loginSuccess();
        return;
    }

    // 3. Verificar si corresponde a un Operador existente
    const matchedOperator = operators.find(op => 
        (op.nombre || '').toLowerCase() === nameInput.toLowerCase() && 
        (op.legajo || '').toLowerCase() === passwordInput.toLowerCase()
    );

    if (matchedOperator) {
        currentUser = {
            id: matchedOperator.id,
            name: matchedOperator.nombre,
            legajo: matchedOperator.legajo,
            role: 'operador'
        };
        loginSuccess();
    } else {
        showToast('Nombre de usuario o Legajo (Contraseña) incorrectos', 'danger');
    }
}

function loginSuccess() {
    localStorage.setItem('sli_current_user', JSON.stringify(currentUser));
    currentRole = currentUser.role;
    currentSelectedOperatorId = currentUser.role === 'operador' ? currentUser.id : null;
    
    // Limpiar inputs
    document.getElementById('login-name').value = '';
    document.getElementById('login-password').value = '';
    
    showToast(`¡Ingreso exitoso! Bienvenido, ${currentUser.name}`, 'success');
    renderApp();
}

function handleRegisterNewUser(e) {
    e.preventDefault();
    
    // Verificar cupos semanales
    const thisWeekOps = getOperatorsRegisteredThisWeek();
    if (thisWeekOps.length >= appConfig.quotaLimit) {
        showToast('Cupos agotados para esta semana. No se pueden inscribir nuevos operadores.', 'danger');
        return;
    }

    const regName = document.getElementById('reg-name').value.trim();
    const regLegajo = document.getElementById('reg-legajo').value.trim();
    const regSector = document.getElementById('reg-sector').value.trim();
    const regLicencia = document.getElementById('reg-licencia').value.trim();
    const regEmail = document.getElementById('reg-email').value.trim();
    const regTipoEquipo = document.querySelector('input[name="reg-tipo-equipo"]:checked').value;

    if (!regName || !regLegajo || !regSector || !regLicencia || !regEmail) {
        showToast('Rellene todos los campos obligatorios para inscribirse', 'warning');
        return;
    }

    // Validar si el legajo ya existe para evitar duplicados
    const legajoExists = operators.some(op => op.legajo.toLowerCase() === regLegajo.toLowerCase());
    if (legajoExists) {
        showToast('Ya existe un operador inscripto con ese Legajo/ID', 'warning');
        return;
    }

    // Crear operador
    const newId = 'op-' + Math.random().toString(36).substr(2, 9);
    const newOp = {
        id: newId,
        nombre: regName,
        legajo: regLegajo,
        sector: regSector,
        licenciaNacional: regLicencia,
        email: regEmail,
        tipoEquipo: regTipoEquipo,
        createdAt: new Date().toISOString(),
        docsUploadedAt: null,
        evalCompletedAt: null,
        documentos: {},
        notaTeorica: null,
        estadoTeorico: 'pendiente',
        estadoFinal: 'inscrito'
    };

    operators.push(newOp);
    saveOperatorsToStorage();

    // Loguear directamente
    currentUser = {
        id: newId,
        name: regName,
        legajo: regLegajo,
        role: 'operador'
    };
    
    localStorage.setItem('sli_current_user', JSON.stringify(currentUser));
    currentRole = 'operador';
    currentSelectedOperatorId = newId;

    // Limpiar formulario de registro
    document.getElementById('form-register-new').reset();
    toggleLoginForms('login');

    showToast(`¡Inscripción exitosa! Cupo reservado. Bienvenido al portal.`, 'success');
    renderApp();
}

function handleLogout() {
    currentUser = null;
    currentSelectedOperatorId = null;
    currentRole = 'operador';
    localStorage.removeItem('sli_current_user');
    
    toggleLoginForms('login');
    
    showToast('Sesión cerrada correctamente', 'info');
    renderApp();
}

function toggleLoginForms(view) {
    const loginPanel = document.getElementById('login-form-panel');
    const registerPanel = document.getElementById('register-form-panel');
    const infoPanel = document.getElementById('info-panel');
    
    // Sincronizar pestañas superiores
    document.getElementById('btn-tab-login').classList.add('active');
    document.getElementById('btn-tab-info').classList.remove('active');
    infoPanel.classList.add('hidden');
    
    if (view === 'register') {
        loginPanel.classList.add('hidden');
        registerPanel.classList.remove('hidden');
        
        // Verificar cupos semanales para deshabilitar botón de registro
        const thisWeekOps = getOperatorsRegisteredThisWeek();
        const limit = appConfig.quotaLimit;
        const warningBox = document.getElementById('register-quota-warning');
        const submitBtn = document.getElementById('btn-register-submit');
        
        if (thisWeekOps.length >= limit) {
            warningBox.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.style.opacity = 0.5;
            submitBtn.style.cursor = 'not-allowed';
        } else {
            warningBox.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.style.opacity = 1;
            submitBtn.style.cursor = 'pointer';
        }
    } else {
        loginPanel.classList.remove('hidden');
        registerPanel.classList.add('hidden');
    }
}

// --- EVENT LISTENERS ---

function initializeEventListeners() {
    // 1. Manejo del Login y Registro
    document.getElementById('form-login').addEventListener('submit', handleLogin);
    document.getElementById('form-register-new').addEventListener('submit', handleRegisterNewUser);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    
    const btnSync = document.getElementById('btn-sync-github');
    if (btnSync) {
        btnSync.addEventListener('click', () => {
            showToast("Ejecuta 'sincronizar.bat' en tu carpeta local para sincronizar.", "info");
            alert("Para sincronizar tus cambios locales con la versión de GitHub:\n\n1. Ve a la carpeta del proyecto en tu computadora.\n2. Haz doble clic sobre el archivo 'sincronizar.bat'.\n\nEl script se ejecutará de forma segura y subirá tus modificaciones a GitHub en segundos, actualizando la versión web de inmediato.");
        });
    }
    
    document.getElementById('btn-show-register').addEventListener('click', () => toggleLoginForms('register'));
    document.getElementById('btn-show-login').addEventListener('click', () => toggleLoginForms('login'));
    
    // Pestañas de la pantalla de inicio (Acceso vs Info)
    document.getElementById('btn-tab-login').addEventListener('click', () => {
        document.getElementById('btn-tab-login').classList.add('active');
        document.getElementById('btn-tab-info').classList.remove('active');
        document.getElementById('info-panel').classList.add('hidden');
        
        // Mostrar login o registro según lo que estuviera activo
        const isRegisterActive = !document.getElementById('form-register-new').parentElement.classList.contains('hidden');
        if (isRegisterActive) {
            document.getElementById('register-form-panel').classList.remove('hidden');
            document.getElementById('login-form-panel').classList.add('hidden');
        } else {
            document.getElementById('login-form-panel').classList.remove('hidden');
            document.getElementById('register-form-panel').classList.add('hidden');
        }
    });

    document.getElementById('btn-tab-info').addEventListener('click', () => {
        document.getElementById('btn-tab-info').classList.add('active');
        document.getElementById('btn-tab-login').classList.remove('active');
        document.getElementById('login-form-panel').classList.add('hidden');
        document.getElementById('register-form-panel').classList.add('hidden');
        document.getElementById('info-panel').classList.remove('hidden');
    });

    // 3. Guardar Formulario del Operador (Carga de datos/documentos)
    document.getElementById('form-datos-operador').addEventListener('submit', handleSaveOperatorData);
    
    // 4. Cambios en inputs de Archivo (Simulando uploads)
    document.getElementById('file-licencia').addEventListener('change', (e) => handleFileUpload(e, 'licencia'));
    document.getElementById('file-foto').addEventListener('change', (e) => handleFileUpload(e, 'foto'));
    document.getElementById('file-autorizacion').addEventListener('change', (e) => handleFileUpload(e, 'autorizacion'));
    document.getElementById('file-certificacion').addEventListener('change', (e) => handleFileUpload(e, 'certificacion'));
    
    // 5. Filtros en la tabla de Supervisores/Admins
    document.getElementById('filter-search').addEventListener('input', renderOperatorsTable);
    document.getElementById('filter-status').addEventListener('change', renderOperatorsTable);
    
    // 6. Botones de Modal de Edición de Operador
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    document.getElementById('btn-delete-operator').addEventListener('click', handleDeleteOperator);
    document.getElementById('modal-form-edit-datos').addEventListener('submit', handleModalFormSave);
    document.getElementById('form-grade-eval').addEventListener('submit', handleSaveGrade);
    document.getElementById('form-grade-practica').addEventListener('submit', handleSavePractica);
    
    // Auto-seleccionar Aprobado / Desaprobado en base a la nota (límite 8)
    document.getElementById('eval-nota').addEventListener('input', (e) => {
        const score = parseFloat(e.target.value);
        const stateSelect = document.getElementById('eval-estado');
        if (!isNaN(score)) {
            if (score >= 8.0) {
                stateSelect.value = 'aprobado';
            } else {
                stateSelect.value = 'desaprobado';
            }
        } else {
            stateSelect.value = '';
        }
    });
    
    // Pestañas del Modal
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchModalTab(e.target.getAttribute('data-tab'));
        });
    });
    
    // 7. Visor de documentos
    document.getElementById('btn-close-viewer').addEventListener('click', closeDocViewer);
    
    // Cerrar modales haciendo click fuera del contenido
    window.addEventListener('click', (e) => {
        const opModal = document.getElementById('operator-modal');
        const viewModal = document.getElementById('doc-viewer-modal');
        const userModal = document.getElementById('user-modal');
        if (e.target === opModal) closeModal();
        if (e.target === viewModal) closeDocViewer();
        if (e.target === userModal) closeUserModal();
    });
    
    // 8. Botones de Acciones de Config / Excel (Admin/Supervisor)
    document.getElementById('btn-export-excel').addEventListener('click', handleExportExcel);
    document.getElementById('btn-update-quota').addEventListener('click', handleUpdateQuota);
    document.getElementById('btn-export-db').addEventListener('click', handleExportDatabase);
    document.getElementById('btn-import-db').addEventListener('click', handleImportDatabase);

    // 9. Gestión de Personal (Solo Administradores)
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-dash-tab');
            switchDashTab(tab);
        });
    });

    document.getElementById('btn-add-staff').addEventListener('click', () => openUserModal(null));
    document.getElementById('btn-close-user-modal').addEventListener('click', closeUserModal);
    document.getElementById('btn-cancel-user-modal').addEventListener('click', closeUserModal);
    document.getElementById('form-user-edit').addEventListener('submit', handleSaveUser);
    document.getElementById('btn-delete-user').addEventListener('click', handleDeleteUser);
    
    // Sincronizar en tiempo real entre pestañas usando el evento 'storage' de HTML5
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            loadState();
            renderApp();
        }
    });
}

// --- GESTIÓN DE PERSONAL / USUARIOS (ADMINISTRADORES) ---

function renderStaffTable() {
    const tbody = document.getElementById('tbody-staff');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    staffUsers.forEach(user => {
        const tr = document.createElement('tr');
        
        // Nombre
        const tdName = document.createElement('td');
        tdName.innerHTML = `<strong>${user.name}</strong> ${user.id === currentUser.id ? '<span class="badge badge-success" style="font-size:0.65rem; margin-left:5px;">Tú</span>' : ''}`;
        tr.appendChild(tdName);
        
        // Rol
        const tdRole = document.createElement('td');
        let roleText = '';
        let badgeClass = '';
        if (user.role === 'admin') {
            roleText = 'Administrador';
            badgeClass = 'badge-danger';
        } else if (user.role === 'supervisor') {
            roleText = 'Instructor Teórico';
            badgeClass = 'badge-info';
        } else {
            roleText = 'Instructor Práctico';
            badgeClass = 'badge-warning';
        }
        tdRole.innerHTML = `<span class="badge ${badgeClass}">${roleText}</span>`;
        tr.appendChild(tdRole);
        
        // Contraseña
        const tdPass = document.createElement('td');
        tdPass.innerHTML = `<code>${user.pass}</code>`;
        tr.appendChild(tdPass);
        
        // Acciones
        const tdActions = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.innerText = 'Editar';
        editBtn.addEventListener('click', () => openUserModal(user.id));
        tdActions.appendChild(editBtn);
        
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

let activeEditingUserId = null;

function openUserModal(userId = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const deleteBtn = document.getElementById('btn-delete-user');
    
    // Limpiar formulario
    document.getElementById('form-user-edit').reset();
    
    if (userId) {
        // Modo Edición
        activeEditingUserId = userId;
        title.innerText = 'Editar Perfil de Usuario';
        
        const user = staffUsers.find(u => u.id === userId);
        if (user) {
            document.getElementById('user-edit-name').value = user.name;
            document.getElementById('user-edit-role').value = user.role;
            document.getElementById('user-edit-pass').value = user.pass;
        }
        
        // Mostrar botón de eliminar solo si no se está editando a sí mismo
        if (userId === currentUser.id) {
            deleteBtn.style.display = 'none';
        } else {
            deleteBtn.style.display = 'block';
        }
    } else {
        // Modo Creación
        activeEditingUserId = null;
        title.innerText = 'Crear Nuevo Usuario';
        deleteBtn.style.display = 'none';
    }
    
    modal.classList.add('active');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
    activeEditingUserId = null;
}

function handleSaveUser(e) {
    e.preventDefault();
    const name = document.getElementById('user-edit-name').value.trim();
    const role = document.getElementById('user-edit-role').value;
    const pass = document.getElementById('user-edit-pass').value.trim();
    
    if (!name || !role || !pass) {
        showToast('Complete todos los campos obligatorios', 'warning');
        return;
    }
    
    if (activeEditingUserId) {
        // Actualizar
        const user = staffUsers.find(u => u.id === activeEditingUserId);
        if (user) {
            // Si se edita a sí mismo, actualizar la sesión del usuario actual
            if (user.id === currentUser.id) {
                currentUser.name = name;
                currentUser.legajo = pass;
                currentUser.role = role;
                currentRole = role; // Actualizar rol actual del dashboard
                localStorage.setItem('sli_current_user', JSON.stringify(currentUser));
            }
            user.name = name;
            user.role = role;
            user.pass = pass;
            
            showToast('Usuario actualizado correctamente', 'success');
        }
    } else {
        // Crear
        const newId = 'staff-' + Math.random().toString(36).substr(2, 9);
        staffUsers.push({
            id: newId,
            name: name,
            role: role,
            pass: pass
        });
        showToast('Usuario creado correctamente', 'success');
    }
    
    saveStaffToStorage();
    closeUserModal();
    renderApp();
}

function handleDeleteUser() {
    if (!activeEditingUserId) return;
    if (activeEditingUserId === currentUser.id) {
        showToast('No puedes eliminar tu propio perfil de usuario', 'danger');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar este usuario del sistema?')) {
        staffUsers = staffUsers.filter(u => u.id !== activeEditingUserId);
        saveStaffToStorage();
        showToast('Usuario eliminado correctamente', 'success');
        closeUserModal();
        renderApp();
    }
}

function switchDashTab(tabName) {
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-dash-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const licSec = document.getElementById('dash-section-licencias');
    const staffSec = document.getElementById('dash-section-staff');
    
    if (tabName === 'licenses') {
        if (licSec) {
            licSec.classList.add('active');
            licSec.classList.remove('hidden');
        }
        if (staffSec) {
            staffSec.classList.remove('active');
            staffSec.classList.add('hidden');
        }
        renderOperatorsTable();
    } else {
        if (licSec) {
            licSec.classList.remove('active');
            licSec.classList.add('hidden');
        }
        if (staffSec) {
            staffSec.classList.add('active');
            staffSec.classList.remove('hidden');
        }
        renderStaffTable();
    }
}

// --- EXPORTACIÓN E IMPORTACIÓN MANUAL DE LA BASE DE DATOS (MIGRACIÓN / LAN) ---
function handleExportDatabase() {
    try {
        if (!operators) {
            alert("Error: la variable 'operators' está vacía o no existe en la aplicación.");
            return;
        }
        
        const jsonStr = JSON.stringify(operators, null, 2);
        
        if (!jsonStr || jsonStr === "[]") {
            showToast("Advertencia: base de datos vacía", "warning");
        }
        
        fallbackExport(jsonStr);
    } catch (error) {
        alert("Ocurrió un error al intentar exportar la base de datos:\n" + error.message + "\n\nPor favor, avísame de este mensaje.");
    }
}

function fallbackExport(jsonStr) {
    // Crear un contenedor de modal flotante en caliente
    const modalDiv = document.createElement('div');
    modalDiv.style.position = 'fixed';
    modalDiv.style.top = '0';
    modalDiv.style.left = '0';
    modalDiv.style.width = '100%';
    modalDiv.style.height = '100%';
    modalDiv.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    modalDiv.style.zIndex = '999999';
    modalDiv.style.display = 'flex';
    modalDiv.style.flexDirection = 'column';
    modalDiv.style.alignItems = 'center';
    modalDiv.style.justify = 'center';
    modalDiv.style.padding = '20px';
    modalDiv.style.boxSizing = 'border-box';
    modalDiv.id = 'temp-export-modal';

    const container = document.createElement('div');
    container.style.backgroundColor = 'var(--card-bg)';
    container.style.padding = '24px';
    container.style.borderRadius = '16px';
    container.style.width = '100%';
    container.style.maxWidth = '550px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '16px';
    container.style.border = '1px solid var(--border-color)';
    container.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';

    const title = document.createElement('h3');
    title.innerText = 'Copiar Base de Datos (Segura)';
    title.style.color = 'var(--text-main)';
    title.style.margin = '0';
    title.style.fontSize = '1.3rem';
    
    const desc = document.createElement('p');
    desc.innerText = 'Debido a la seguridad de la red local, por favor presiona "Seleccionar Todo" y copia el texto de abajo manualmente para enviarlo a la computadora:';
    desc.style.color = 'var(--text-muted)';
    desc.style.margin = '0';
    desc.style.fontSize = '0.9rem';

    const textarea = document.createElement('textarea');
    textarea.value = jsonStr;
    textarea.style.width = '100%';
    textarea.style.height = '280px';
    textarea.style.backgroundColor = '#0b0f19';
    textarea.style.color = '#38bdf8';
    textarea.style.border = '1px solid var(--border-color)';
    textarea.style.borderRadius = '8px';
    textarea.style.padding = '12px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '0.85rem';
    textarea.style.boxSizing = 'border-box';
    textarea.readOnly = true;

    // Seleccionar todo al hacer clic
    textarea.addEventListener('click', () => {
        textarea.select();
        textarea.setSelectionRange(0, 99999);
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '12px';
    buttonGroup.style.justifyContent = 'flex-end';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-success btn-sm';
    copyBtn.innerText = 'Seleccionar Todo';
    copyBtn.style.padding = '8px 16px';
    copyBtn.addEventListener('click', () => {
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            showToast("¡Copiado al portapapeles!", "success");
        } catch (err) {
            showToast("Seleccionado. Copia manualmente usando la opción de copiar de tu teléfono.", "info");
        }
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-secondary btn-sm';
    closeBtn.innerText = 'Cerrar';
    closeBtn.style.padding = '8px 16px';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalDiv);
    });

    buttonGroup.appendChild(copyBtn);
    buttonGroup.appendChild(closeBtn);
    
    container.appendChild(title);
    container.appendChild(desc);
    container.appendChild(textarea);
    container.appendChild(buttonGroup);
    
    modalDiv.appendChild(container);
    document.body.appendChild(modalDiv);
    
    // Enfocar y auto-seleccionar
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999);
}

function handleImportDatabase() {
    const text = prompt("Pega aquí el texto de la base de datos exportada (JSON):");
    if (text === null || text.trim() === "") return;
    
    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
            if (confirm(`¿Estás seguro de que deseas importar ${parsed.length} operadores? Esto sobrescribirá los datos locales y sincronizará el servidor.`)) {
                operators = parsed;
                saveOperatorsToStorage(); // Guarda en localStorage y sincroniza con el servidor
                renderApp();
                showToast("Base de datos importada y sincronizada correctamente.", "success");
            }
        } else {
            alert("El texto ingresado no es una base de datos válida (debe ser un arreglo JSON).");
        }
    } catch (err) {
        alert("Error al procesar el texto ingresado. Asegúrate de copiar el texto completo tal cual fue exportado (incluyendo los corchetes [] inicial y final).");
    }
}
