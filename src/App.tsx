import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, Users, BarChart3, Plus, Edit, Trash2, Download, Upload, Copy, Printer, 
  Phone, Mail, Clock, Euro, AlertTriangle, LogOut, User, Lock, Shield, Building2, 
  Eye, EyeOff, Loader2, UserPlus, Settings, Search, Filter, Save, X, Check,
  FileText, DollarSign, TrendingUp, Award, Target, Home, Database, Zap,
  Bell, HelpCircle, Star, MapPin, Calendar as CalendarIcon, ChevronDown,
  RefreshCw, Archive, MoreVertical, PieChart, Activity, Briefcase
} from 'lucide-react';

const ShiftProApp = () => {
  // 🎯 CORE STATE MANAGEMENT
  const [appState, setAppState] = useState({
    // Auth & Setup
    isAuthenticated: false,
    currentUser: null,
    isLoading: true,
    isFirstSetup: false,
    
    // UI State
    activeTab: 'dashboard',
    showMobileMenu: false,
    theme: 'light',
    
    // Modal States
    modals: {
      addShift: false,
      addEmployee: false,
      editEmployee: false,
      addUser: false,
      settings: false,
      import: false,
      export: false
    },
    
    // Loading States
    loading: {
      login: false,
      setup: false,
      save: false,
      export: false,
      import: false
    },
    
    // Error States
    errors: {
      login: '',
      setup: '',
      general: ''
    }
  });

  // 🏢 BUSINESS DATA
  const [businessData, setBusinessData] = useState({
    company: {
      id: null,
      name: '',
      industry: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      timezone: 'Europe/Rome',
      currency: 'EUR',
      setupDate: null,
      settings: {
        workWeekStart: 1, // Monday
        overtimeThreshold: 40,
        defaultShiftLength: 8,
        breakDuration: 30,
        allowOverlapping: false,
        requireNotes: false
      }
    },
    users: [],
    employees: [],
    shifts: [],
    positions: [
      'Sala', 'Cucina', 'Bar', 'Cassa', 'Pulizie', 'Gestione', 
      'Reception', 'Magazzino', 'Sicurezza', 'Manutenzione'
    ],
    shiftTypes: [
      'Mattina', 'Pomeriggio', 'Sera', 'Notte', 'Doppio', 'Part-time'
    ]
  });

  // 📝 FORM DATA
  const [formData, setFormData] = useState({
    // Setup Form
    setup: {
      companyName: '',
      industry: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      acceptTerms: false
    },
    
    // Login Form
    login: {
      email: '',
      password: '',
      remember: false
    },
    
    // Employee Form
    employee: {
      id: null,
      name: '',
      surname: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      hourlyRate: '',
      contractType: 'full-time',
      startDate: '',
      notes: '',
      avatar: '👤',
      isActive: true
    },
    
    // Shift Form
    shift: {
      id: null,
      employeeId: '',
      date: '',
      day: '',
      startTime: '',
      endTime: '',
      position: '',
      shiftType: '',
      breakMinutes: 30,
      notes: '',
      status: 'scheduled'
    },
    
    // User Form
    user: {
      name: '',
      email: '',
      role: 'staff',
      permissions: [],
      department: ''
    }
  });

  // 🎛️ UI STATE
  const [uiState, setUiState] = useState({
    // Filters & Search
    filters: {
      employees: {
        search: '',
        department: '',
        role: '',
        status: 'all'
      },
      shifts: {
        search: '',
        date: '',
        position: '',
        employee: '',
        status: 'all'
      }
    },
    
    // View Options
    view: {
      employeeCard: 'grid',
      shiftCalendar: 'week',
      analyticsRange: '7days'
    },
    
    // Sorting
    sort: {
      employees: { field: 'name', direction: 'asc' },
      shifts: { field: 'date', direction: 'desc' }
    },
    
    // Editing
    editing: {
      employee: null,
      shift: null
    },
    
    // Selections
    selected: {
      employees: [],
      shifts: []
    }
  });

  // 📊 CONSTANTS & CONFIG
  const DAYS_OF_WEEK = [
    'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 
    'Venerdì', 'Sabato', 'Domenica'
  ];

  const USER_ROLES = {
    admin: {
      name: 'Amministratore',
      permissions: ['all'],
      color: 'red'
    },
    manager: {
      name: 'Manager',
      permissions: ['manage_shifts', 'manage_employees', 'view_analytics', 'export_data'],
      color: 'blue'
    },
    supervisor: {
      name: 'Supervisore',
      permissions: ['manage_shifts', 'view_analytics'],
      color: 'green'
    },
    staff: {
      name: 'Dipendente',
      permissions: ['view_shifts'],
      color: 'gray'
    }
  };

  const INDUSTRIES = [
    'Ristorazione', 'Retail', 'Sanità', 'Hospitality', 'Produzione',
    'Servizi', 'Logistica', 'Pulizie', 'Sicurezza', 'Altro'
  ];

  // 🔐 AUTHENTICATION & STORAGE
  const storageKeys = {
    company: 'shiftpro_company',
    users: 'shiftpro_users',
    employees: 'shiftpro_employees',
    shifts: 'shiftpro_shifts',
    currentUser: 'shiftpro_current_user',
    settings: 'shiftpro_settings'
  };

  // Safe Storage Operations
  const storage = {
    get: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        }
      } catch (error) {
        console.warn(`Storage get error for ${key}:`, error);
      }
      return null;
    },
    
    set: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        }
      } catch (error) {
        console.warn(`Storage set error for ${key}:`, error);
      }
      return false;
    },
    
    remove: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
          return true;
        }
      } catch (error) {
        console.warn(`Storage remove error for ${key}:`, error);
      }
      return false;
    }
  };

  // 🏗️ INITIALIZATION & SETUP
  const initializeApp = useCallback(async () => {
    setAppState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Load company data
      const company = storage.get(storageKeys.company);
      if (!company) {
        setAppState(prev => ({ 
          ...prev, 
          isFirstSetup: true, 
          isLoading: false 
        }));
        return;
      }

      // Load all business data
      const users = storage.get(storageKeys.users) || [];
      const employees = storage.get(storageKeys.employees) || [];
      const shifts = storage.get(storageKeys.shifts) || [];
      const settings = storage.get(storageKeys.settings) || {};

      setBusinessData(prev => ({
        ...prev,
        company: { ...prev.company, ...company, ...settings },
        users,
        employees,
        shifts
      }));

      // Check for saved session
      const currentUser = storage.get(storageKeys.currentUser);
      if (currentUser) {
        const validUser = users.find(u => u.id === currentUser.id);
        if (validUser) {
          setAppState(prev => ({
            ...prev,
            currentUser: validUser,
            isAuthenticated: true
          }));
        } else {
          storage.remove(storageKeys.currentUser);
        }
      }

    } catch (error) {
      console.error('App initialization failed:', error);
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Errore di caricamento' }
      }));
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 🔧 BUSINESS LOGIC FUNCTIONS
  
  // Auth Functions
  const handleSetup = useCallback(async () => {
    const { companyName, industry, adminName, adminEmail, adminPassword, confirmPassword, acceptTerms } = formData.setup;
    
    // Validation
    if (!companyName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, setup: 'Compila tutti i campi obbligatori' }
      }));
      return;
    }

    if (adminPassword !== confirmPassword) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, setup: 'Le password non coincidono' }
      }));
      return;
    }

    if (adminPassword.length < 8) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, setup: 'La password deve essere di almeno 8 caratteri' }
      }));
      return;
    }

    if (!acceptTerms) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, setup: 'Devi accettare i termini di servizio' }
      }));
      return;
    }

    setAppState(prev => ({
      ...prev,
      loading: { ...prev.loading, setup: true },
      errors: { ...prev.errors, setup: '' }
    }));

    try {
      // Simulate setup delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const companyId = `company_${Date.now()}`;
      const adminId = `user_${Date.now()}`;

      const company = {
        id: companyId,
        name: companyName.trim(),
        industry: industry || 'Altro',
        setupDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const adminUser = {
        id: adminId,
        companyId,
        name: adminName.trim(),
        email: adminEmail.toLowerCase().trim(),
        password: adminPassword, // In production, this would be hashed
        role: 'admin',
        permissions: ['all'],
        avatar: '👨‍💼',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Save to storage
      storage.set(storageKeys.company, company);
      storage.set(storageKeys.users, [adminUser]);
      storage.set(storageKeys.employees, []);
      storage.set(storageKeys.shifts, []);

      // Update state
      setBusinessData(prev => ({
        ...prev,
        company: { ...prev.company, ...company },
        users: [adminUser]
      }));

      setAppState(prev => ({
        ...prev,
        currentUser: adminUser,
        isAuthenticated: true,
        isFirstSetup: false
      }));

    } catch (error) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, setup: 'Errore durante la configurazione' }
      }));
    } finally {
      setAppState(prev => ({
        ...prev,
        loading: { ...prev.loading, setup: false }
      }));
    }
  }, [formData.setup]);

  const handleLogin = useCallback(async () => {
    const { email, password, remember } = formData.login;
    
    if (!email || !password) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, login: 'Inserisci email e password' }
      }));
      return;
    }

    setAppState(prev => ({
      ...prev,
      loading: { ...prev.loading, login: true },
      errors: { ...prev.errors, login: '' }
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = businessData.users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.isActive
      );

      if (user) {
        setAppState(prev => ({
          ...prev,
          currentUser: user,
          isAuthenticated: true
        }));
        
        if (remember) {
          storage.set(storageKeys.currentUser, user);
        }
      } else {
        setAppState(prev => ({
          ...prev,
          errors: { ...prev.errors, login: 'Credenziali non valide' }
        }));
      }
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, login: 'Errore di connessione' }
      }));
    } finally {
      setAppState(prev => ({
        ...prev,
        loading: { ...prev.loading, login: false }
      }));
    }
  }, [formData.login, businessData.users]);

  const handleLogout = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null,
      activeTab: 'dashboard'
    }));
    storage.remove(storageKeys.currentUser);
    
    // Reset form data
    setFormData(prev => ({
      ...prev,
      login: { email: '', password: '', remember: false }
    }));
  }, []);

  // Permission System
  const hasPermission = useCallback((permission) => {
    if (!appState.currentUser) return false;
    if (appState.currentUser.permissions.includes('all')) return true;
    return appState.currentUser.permissions.includes(permission);
  }, [appState.currentUser]);

  // 🧮 CALCULATIONS & ANALYTICS
  const analytics = useMemo(() => {
    const employees = businessData.employees;
    const shifts = businessData.shifts;
    
    // Basic stats
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive).length;
    const totalShifts = shifts.length;
    
    // This week's data
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const thisWeekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });
    
    // Calculate hours and costs
    const calculateHours = (startTime, endTime) => {
      try {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        return Math.max(0, totalMinutes / 60);
      } catch {
        return 0;
      }
    };
    
    let totalHours = 0;
    let totalCost = 0;
    
    thisWeekShifts.forEach(shift => {
      const employee = employees.find(e => e.id === shift.employeeId);
      if (employee) {
        const hours = calculateHours(shift.startTime, shift.endTime);
        totalHours += hours;
        totalCost += hours * (employee.hourlyRate || 0);
      }
    });
    
    // Department breakdown
    const departmentStats = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Non specificato';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    // Overtime calculation
    const overtimeEmployees = employees.filter(emp => {
      const empShifts = thisWeekShifts.filter(s => s.employeeId === emp.id);
      const empHours = empShifts.reduce((sum, shift) => 
        sum + calculateHours(shift.startTime, shift.endTime), 0
      );
      return empHours > (businessData.company.settings?.overtimeThreshold || 40);
    }).length;
    
    return {
      totalEmployees,
      activeEmployees,
      totalShifts: thisWeekShifts.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalCost: Math.round(totalCost * 100) / 100,
      averageHoursPerEmployee: activeEmployees > 0 ? Math.round((totalHours / activeEmployees) * 10) / 10 : 0,
      departmentStats,
      overtimeEmployees,
      utilizationRate: activeEmployees > 0 ? Math.round((totalHours / (activeEmployees * 40)) * 100) : 0
    };
  }, [businessData.employees, businessData.shifts, businessData.company.settings]);

  // 📅 SHIFT MANAGEMENT
  const handleAddShift = useCallback(async () => {
    if (!hasPermission('manage_shifts')) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Non hai i permessi per gestire i turni' }
      }));
      return;
    }

    const { employeeId, date, startTime, endTime, position, shiftType, notes } = formData.shift;
    
    if (!employeeId || !date || !startTime || !endTime || !position) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Compila tutti i campi obbligatori' }
      }));
      return;
    }

    // Validate times
    if (startTime >= endTime) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'L\'ora di fine deve essere dopo l\'ora di inizio' }
      }));
      return;
    }

    setAppState(prev => ({
      ...prev,
      loading: { ...prev.loading, save: true }
    }));

    try {
      const shiftDate = new Date(date);
      const dayName = DAYS_OF_WEEK[shiftDate.getDay() === 0 ? 6 : shiftDate.getDay() - 1];

      const newShift = {
        id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId: businessData.company.id,
        employeeId,
        date,
        day: dayName,
        startTime,
        endTime,
        position,
        shiftType: shiftType || 'Normale',
        breakMinutes: formData.shift.breakMinutes || 30,
        notes: notes || '',
        status: 'scheduled',
        createdBy: appState.currentUser.id,
        createdAt: new Date().toISOString()
      };

      const updatedShifts = [...businessData.shifts, newShift];
      
      setBusinessData(prev => ({
        ...prev,
        shifts: updatedShifts
      }));
      
      storage.set(storageKeys.shifts, updatedShifts);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        shift: {
          id: null,
          employeeId: '',
          date: '',
          day: '',
          startTime: '',
          endTime: '',
          position: '',
          shiftType: '',
          breakMinutes: 30,
          notes: '',
          status: 'scheduled'
        }
      }));
      
      setAppState(prev => ({
        ...prev,
        modals: { ...prev.modals, addShift: false }
      }));

    } catch (error) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Errore nel salvataggio del turno' }
      }));
    } finally {
      setAppState(prev => ({
        ...prev,
        loading: { ...prev.loading, save: false }
      }));
    }
  }, [formData.shift, hasPermission, businessData, appState.currentUser]);

  // 👥 EMPLOYEE MANAGEMENT
  const handleAddEmployee = useCallback(async () => {
    if (!hasPermission('manage_employees')) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Non hai i permessi per gestire i dipendenti' }
      }));
      return;
    }

    const { name, surname, email, phone, role, department, hourlyRate, contractType, startDate } = formData.employee;
    
    if (!name.trim() || !surname.trim() || !role.trim() || !hourlyRate) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Compila tutti i campi obbligatori' }
      }));
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Paga oraria non valida' }
      }));
      return;
    }

    // Check email uniqueness
    if (email && businessData.employees.some(emp => 
      emp.email?.toLowerCase() === email.toLowerCase().trim() && emp.id !== formData.employee.id
    )) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Email già esistente' }
      }));
      return;
    }

    setAppState(prev => ({
      ...prev,
      loading: { ...prev.loading, save: true }
    }));

    try {
      const newEmployee = {
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId: businessData.company.id,
        name: name.trim(),
        surname: surname.trim(),
        fullName: `${name.trim()} ${surname.trim()}`,
        email: email?.trim().toLowerCase() || '',
        phone: phone?.trim() || '',
        role: role.trim(),
        department: department || 'Generale',
        hourlyRate: rate,
        contractType: contractType || 'full-time',
        startDate: startDate || new Date().toISOString().split('T')[0],
        notes: formData.employee.notes || '',
        avatar: formData.employee.avatar || '👤',
        isActive: true,
        createdBy: appState.currentUser.id,
        createdAt: new Date().toISOString()
      };

      const updatedEmployees = [...businessData.employees, newEmployee];
      
      setBusinessData(prev => ({
        ...prev,
        employees: updatedEmployees
      }));
      
      storage.set(storageKeys.employees, updatedEmployees);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        employee: {
          id: null,
          name: '',
          surname: '',
          email: '',
          phone: '',
          role: '',
          department: '',
          hourlyRate: '',
          contractType: 'full-time',
          startDate: '',
          notes: '',
          avatar: '👤',
          isActive: true
        }
      }));
      
      setAppState(prev => ({
        ...prev,
        modals: { ...prev.modals, addEmployee: false }
      }));

    } catch (error) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Errore nel salvataggio del dipendente' }
      }));
    } finally {
      setAppState(prev => ({
        ...prev,
        loading: { ...prev.loading, save: false }
      }));
    }
  }, [formData.employee, hasPermission, businessData, appState.currentUser]);

  // 🗂️ DATA MANAGEMENT
  const handleExport = useCallback(async () => {
    if (!hasPermission('export_data')) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Non hai i permessi per esportare i dati' }
      }));
      return;
    }

    setAppState(prev => ({
      ...prev,
      loading: { ...prev.loading, export: true }
    }));

    try {
      const exportData = {
        company: businessData.company,
        employees: businessData.employees,
        shifts: businessData.shifts,
        exportInfo: {
          exportedBy: appState.currentUser.name,
          exportedAt: new Date().toISOString(),
          version: '2.0',
          recordCount: {
            employees: businessData.employees.length,
            shifts: businessData.shifts.length
          }
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${businessData.company.name.replace(/\s+/g, '-')}-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      setAppState(prev => ({
        ...prev,
        errors: { ...prev.errors, general: 'Errore nell\'esportazione' }
      }));
    } finally {
      setAppState(prev => ({
        ...prev,
        loading: { ...prev.loading, export: false }
      }));
    }
  }, [hasPermission, businessData, appState.currentUser]);

  // 🎨 UI UPDATE FUNCTIONS
  const updateFormData = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const toggleModal = useCallback((modalName, isOpen = null) => {
    setAppState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalName]: isOpen !== null ? isOpen : !prev.modals[modalName]
      }
    }));
  }, []);

  const setActiveTab = useCallback((tab) => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // 🚀 INITIALIZATION
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Auto-save data changes
  useEffect(() => {
    if (businessData.employees.length > 0) {
      storage.set(storageKeys.employees, businessData.employees);
    }
  }, [businessData.employees]);

  useEffect(() => {
    if (businessData.shifts.length > 0) {
      storage.set(storageKeys.shifts, businessData.shifts);
    }
  }, [businessData.shifts]);

  // 📱 RESPONSIVE DESIGN HELPERS
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔄 LOADING SCREEN
  if (appState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-white rounded-full animate-spin mx-auto"></div>
            <Calendar className="absolute inset-0 m-auto w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">ShiftPro</h2>
            <p className="text-blue-100">Inizializzazione sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🏗️ SETUP SCREEN
  if (appState.isFirstSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white p-6 rounded-full inline-block shadow-2xl mb-6">
              <Settings className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">ShiftPro</h1>
            <p className="text-blue-100 text-xl">Configurazione Iniziale</p>
          </div>

          {/* Setup Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                <Building2 className="w-6 h-6" />
                Setup Azienda
              </h2>
              <p className="text-gray-600">Configura il tuo sistema di gestione turni</p>
            </div>

            {appState.errors.setup && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{appState.errors.setup}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Azienda *
                </label>
                <input
                  type="text"
                  required
                  disabled={appState.loading.setup}
                  value={formData.setup.companyName}
                  onChange={(e) => updateFormData('setup', 'companyName', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Es: Ristorante da Mario"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Settore
                </label>
                <select
                  disabled={appState.loading.setup}
                  value={formData.setup.industry}
                  onChange={(e) => updateFormData('setup', 'industry', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                >
                  <option value="">Seleziona settore</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Amministratore *
                </label>
                <input
                  type="text"
                  required
                  disabled={appState.loading.setup}
                  value={formData.setup.adminName}
                  onChange={(e) => updateFormData('setup', 'adminName', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Il tuo nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Amministratore *
                </label>
                <input
                  type="email"
                  required
                  disabled={appState.loading.setup}
                  value={formData.setup.adminEmail}
                  onChange={(e) => updateFormData('setup', 'adminEmail', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                  placeholder="admin@tuaazienda.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={appState.showPassword ? "text" : "password"}
                    required
                    disabled={appState.loading.setup}
                    value={formData.setup.adminPassword}
                    onChange={(e) => updateFormData('setup', 'adminPassword', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                    placeholder="Minimo 8 caratteri"
                  />
                  <button
                    type="button"
                    onClick={() => setAppState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {appState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Conferma Password *
                </label>
                <input
                  type="password"
                  required
                  disabled={appState.loading.setup}
                  value={formData.setup.confirmPassword}
                  onChange={(e) => updateFormData('setup', 'confirmPassword', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Ripeti la password"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  disabled={appState.loading.setup}
                  checked={formData.setup.acceptTerms}
                  onChange={(e) => updateFormData('setup', 'acceptTerms', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  Accetto i termini di servizio e la privacy policy. 
                  I dati saranno salvati localmente sul dispositivo.
                </label>
              </div>

              <button
                type="button"
                onClick={handleSetup}
                disabled={appState.loading.setup}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {appState.loading.setup ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Configurazione...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Configura ShiftPro</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Stai creando il primo account amministratore</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔐 LOGIN SCREEN
  if (!appState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white p-6 rounded-full inline-block shadow-2xl mb-6">
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">ShiftPro</h1>
            <p className="text-blue-100 text-lg">
              {businessData.company.name || 'Sistema Gestione Turni'}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
                <Lock className="w-6 h-6" />
                Accesso
              </h2>
            </div>

            {appState.errors.login && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{appState.errors.login}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={appState.loading.login}
                    value={formData.login.email}
                    onChange={(e) => updateFormData('login', 'email', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !appState.loading.login && handleLogin()}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pl-12 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                    placeholder="la-tua-email@azienda.com"
                  />
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={appState.showPassword ? "text" : "password"}
                    required
                    disabled={appState.loading.login}
                    value={formData.login.password}
                    onChange={(e) => updateFormData('login', 'password', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !appState.loading.login && handleLogin()}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pl-12 pr-12 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                    placeholder="La tua password"
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setAppState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    disabled={appState.loading.login}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {appState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  disabled={appState.loading.login}
                  checked={formData.login.remember}
                  onChange={(e) => updateFormData('login', 'remember', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Ricordami su questo dispositivo
                </label>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={appState.loading.login || !formData.login.email || !formData.login.password}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {appState.loading.login ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Accesso...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Accedi</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-blue-100">
            <p className="text-sm">© 2024 ShiftPro - {businessData.company.name}</p>
          </div>
        </div>
      </div>
    );
  }

  // 🏠 MAIN APPLICATION
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Company */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ShiftPro</h1>
                <p className="text-sm text-gray-500">{businessData.company.name}</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Analytics Badge */}
              {hasPermission('view_analytics') && (
                <div className="hidden md:flex items-center space-x-4 bg-green-50 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      €{analytics.totalCost.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-green-200" />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      {analytics.totalHours}h
                    </span>
                  </div>
                </div>
              )}

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {appState.currentUser?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {USER_ROLES[appState.currentUser?.role]?.name}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">
                    {appState.currentUser?.avatar || '👤'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Esci</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: Home, permission: null },
                { id: 'schedule', name: 'Pianificazione', icon: Calendar, permission: null },
                { id: 'employees', name: 'Dipendenti', icon: Users, permission: 'manage_employees' },
                { id: 'analytics', name: 'Analytics', icon: BarChart3, permission: 'view_analytics' },
              ].map(tab => {
                if (tab.permission && !hasPermission(tab.permission)) return null;
                
                const isActive = appState.activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {appState.activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-3xl font-bold mb-2">
                    Benvenuto, {appState.currentUser?.name}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Ecco una panoramica della tua azienda
                  </p>
                </div>
                <div className="flex space-x-3">
                  {hasPermission('manage_shifts') && (
                    <button
                      onClick={() => toggleModal('addShift', true)}
                      className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Nuovo Turno</span>
                    </button>
                  )}
                  {hasPermission('manage_employees') && (
                    <button
                      onClick={() => toggleModal('addEmployee', true)}
                      className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center space-x-2 font-medium"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Nuovo Dipendente</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dipendenti</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.activeEmployees}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analytics.totalEmployees} totali
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Turni Settimana</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.totalShifts}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analytics.totalHours}h totali
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {hasPermission('view_analytics') && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Costo Settimana</p>
                        <p className="text-3xl font-bold text-gray-900">
                          €{analytics.totalCost.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          €{analytics.averageHoursPerEmployee > 0 ? (analytics.totalCost / analytics.activeEmployees).toFixed(0) : 0} per dipendente
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Euro className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Utilizzo</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {analytics.utilizationRate}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {analytics.overtimeEmployees} straordinari
                        </p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>Azioni Rapide</span>
                </h3>
                <div className="space-y-3">
                  {hasPermission('manage_shifts') && (
                    <button
                      onClick={() => toggleModal('addShift', true)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center space-x-3"
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Aggiungi Turno</p>
                        <p className="text-sm text-gray-500">Pianifica un nuovo turno di lavoro</p>
                      </div>
                    </button>
                  )}
                  
                  {hasPermission('manage_employees') && (
                    <button
                      onClick={() => toggleModal('addEmployee', true)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all flex items-center space-x-3"
                    >
                      <UserPlus className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Aggiungi Dipendente</p>
                        <p className="text-sm text-gray-500">Registra un nuovo membro del team</p>
                      </div>
                    </button>
                  )}
                  
                  {hasPermission('export_data') && (
                    <button
                      onClick={handleExport}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center space-x-3"
                    >
                      <Download className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Esporta Dati</p>
                        <p className="text-sm text-gray-500">Backup completo del sistema</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Departments Overview */}
              {hasPermission('view_analytics') && Object.keys(analytics.departmentStats).length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    <span>Dipendenti per Reparto</span>
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.departmentStats).map(([dept, count]) => {
                      const percentage = (count / analytics.totalEmployees) * 100;
                      return (
                        <div key={dept} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900">{dept}</span>
                            <span className="text-gray-600">{count} dipendenti</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {appState.activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pianificazione Turni</h2>
                <p className="text-gray-600 mt-1">Gestisci i turni della settimana</p>
              </div>
              {hasPermission('manage_shifts') && (
                <div className="flex space-x-3">
                  {businessData.shifts.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Vuoi duplicare tutti i turni della settimana corrente?')) {
                          const newShifts = businessData.shifts.map(shift => ({
                            ...shift,
                            id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            createdAt: new Date().toISOString()
                          }));
                          setBusinessData(prev => ({
                            ...prev,
                            shifts: [...prev.shifts, ...newShifts]
                          }));
                        }
                      }}
                      className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-all flex items-center space-x-2"
                    >
                      <Copy className="w-5 h-5" />
                      <span>Duplica Settimana</span>
                    </button>
                  )}
                  <button
                    onClick={() => toggleModal('addShift', true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nuovo Turno</span>
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Calendar View */}
            {businessData.employees.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="text-6xl mb-6">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nessun dipendente</h3>
                <p className="text-gray-600 mb-8">
                  Aggiungi prima alcuni dipendenti per iniziare a pianificare i turni
                </p>
                {hasPermission('manage_employees') && (
                  <button
                    onClick={() => setActiveTab('employees')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all"
                  >
                    Gestisci Dipendenti
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-7 gap-0">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="border-r border-gray-200 last:border-r-0">
                      <div className="bg-gray-50 p-4 font-semibold text-center border-b border-gray-200">
                        {day}
                      </div>
                      <div className="p-3 min-h-[400px] space-y-2">
                        {businessData.shifts
                          .filter(shift => shift.day === day)
                          .map(shift => {
                            const employee = businessData.employees.find(e => e.id === shift.employeeId);
                            if (!employee) return null;

                            return (
                              <div
                                key={shift.id}
                                className="bg-blue-500 text-white p-3 rounded-lg text-xs space-y-1 hover:bg-blue-600 transition-colors"
                              >
                                <div className="font-semibold">{employee.fullName || employee.name}</div>
                                <div className="opacity-90">
                                  🕐 {shift.startTime} - {shift.endTime}
                                </div>
                                <div className="opacity-90">
                                  📍 {shift.position}
                                </div>
                                {shift.notes && (
                                  <div className="opacity-90 italic">
                                    📝 {shift.notes}
                                  </div>
                                )}
                                {hasPermission('manage_shifts') && (
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Eliminare questo turno?')) {
                                          setBusinessData(prev => ({
                                            ...prev,
                                            shifts: prev.shifts.filter(s => s.id !== shift.id)
                                          }));
                                        }
                                      }}
                                      className="text-white hover:text-red-200 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {appState.activeTab === 'employees' && hasPermission('manage_employees') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestione Dipendenti</h2>
                <p className="text-gray-600 mt-1">Amministra il tuo team</p>
              </div>
              <button
                onClick={() => toggleModal('addEmployee', true)}
                className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuovo Dipendente</span>
              </button>
            </div>

            {businessData.employees.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="text-6xl mb-6">👨‍💼</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nessun dipendente</h3>
                <p className="text-gray-600 mb-8">
                  Inizia aggiungendo i membri del tuo team
                </p>
                <button
                  onClick={() => toggleModal('addEmployee', true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all"
                >
                  Aggiungi Primo Dipendente
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {businessData.employees.map(employee => {
                  const employeeShifts = businessData.shifts.filter(s => s.employeeId === employee.id);
                  const totalHours = employeeShifts.reduce((sum, shift) => {
                    const [startHour, startMin] = shift.startTime.split(':').map(Number);
                    const [endHour, endMin] = shift.endTime.split(':').map(Number);
                    const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                    return sum + Math.max(0, minutes / 60);
                  }, 0);

                  return (
                    <div key={employee.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">{employee.avatar}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {employee.fullName || `${employee.name} ${employee.surname || ''}`.trim()}
                            </h3>
                            <p className="text-blue-600 font-medium">{employee.role}</p>
                            {employee.department && (
                              <p className="text-sm text-gray-500">{employee.department}</p>
                            )}
                          </div>
                        </div>
                        {hasPermission('view_analytics') && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              €{employee.hourlyRate}/h
                            </p>
                          </div>
                        )}
                      </div>

                      {(employee.email || employee.phone) && (
                        <div className="mb-4 space-y-1">
                          {employee.email && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{employee.email}</span>
                            </div>
                          )}
                          {employee.phone && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{employee.phone}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-2 mb-4">
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, employee: employee }));
                            setUiState(prev => ({ ...prev, editing: { ...prev.editing, employee: employee } }));
                            toggleModal('editEmployee', true);
                          }}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-all text-sm font-medium flex items-center justify-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Modifica</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Eliminare ${employee.fullName || employee.name}? Verranno eliminati anche tutti i suoi turni.`)) {
                              setBusinessData(prev => ({
                                ...prev,
                                employees: prev.employees.filter(e => e.id !== employee.id),
                                shifts: prev.shifts.filter(s => s.employeeId !== employee.id)
                              }));
                            }
                          }}
                          className="bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{employeeShifts.length}</p>
                          <p className="text-xs text-gray-600">Turni</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
                          <p className="text-xs text-gray-600">Ore</p>
                        </div>
                        {hasPermission('view_analytics') && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                              €{(totalHours * employee.hourlyRate).toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-600">Costo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {appState.activeTab === 'analytics' && hasPermission('view_analytics') && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Report</h2>
              <p className="text-gray-600 mt-1">Analisi dettagliate di costi e performance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Dipendenti Attivi</p>
                    <p className="text-3xl font-bold">{analytics.activeEmployees}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Ore Settimanali</p>
                    <p className="text-3xl font-bold">{analytics.totalHours}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Costo Totale</p>
                    <p className="text-3xl font-bold">€{analytics.totalCost.toFixed(0)}</p>
                  </div>
                  <Euro className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Utilizzo</p>
                    <p className="text-3xl font-bold">{analytics.utilizationRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Department Distribution */}
              {Object.keys(analytics.departmentStats).length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Distribuzione per Reparto
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.departmentStats).map(([dept, count]) => {
                      const percentage = (count / analytics.totalEmployees) * 100;
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900">{dept}</span>
                            <span className="text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Employee Performance */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Performance Dipendenti
                </h3>
                <div className="space-y-4">
                  {businessData.employees.slice(0, 5).map(employee => {
                    const employeeShifts = businessData.shifts.filter(s => s.employeeId === employee.id);
                    const totalHours = employeeShifts.reduce((sum, shift) => {
                      const [startHour, startMin] = shift.startTime.split(':').map(Number);
                      const [endHour, endMin] = shift.endTime.split(':').map(Number);
                      const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                      return sum + Math.max(0, minutes / 60);
                    }, 0);
                    const maxHours = Math.max(...businessData.employees.map(emp => {
                      const empShifts = businessData.shifts.filter(s => s.employeeId === emp.id);
                      return empShifts.reduce((sum, shift) => {
                        const [startHour, startMin] = shift.startTime.split(':').map(Number);
                        const [endHour, endMin] = shift.endTime.split(':').map(Number);
                        const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                        return sum + Math.max(0, minutes / 60);
                      }, 0);
                    }));
                    const percentage = maxHours > 0 ? (totalHours / maxHours) * 100 : 0;

                    return (
                      <div key={employee.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900">
                            {employee.fullName || employee.name}
                          </span>
                          <span className="text-gray-600">{totalHours.toFixed(1)}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Strumenti di Esportazione
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleExport}
                  disabled={appState.loading.export}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {appState.loading.export ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span>Esporta Dati</span>
                </button>
                
                <button
                  onClick={() => {
                    // Print functionality would go here
                    window.print();
                  }}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all flex items-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span>Stampa Report</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Error Display */}
      {appState.errors.general && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center space-x-2 z-50">
          <AlertTriangle className="w-5 h-5" />
          <span>{appState.errors.general}</span>
          <button
            onClick={() => setAppState(prev => ({
              ...prev,
              errors: { ...prev.errors, general: '' }
            }))}
            className="ml-2 text-white hover:text-red-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Add Shift Modal */}
      {appState.modals.addShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Plus className="w-6 h-6" />
                <span>Nuovo Turno</span>
              </h3>
              <button
                onClick={() => toggleModal('addShift', false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dipendente *
                </label>
                <select
                  value={formData.shift.employeeId}
                  onChange={(e) => updateFormData('shift', 'employeeId', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Seleziona dipendente</option>
                  {businessData.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || emp.name} - {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.shift.date}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
                    updateFormData('shift', 'date', e.target.value);
                    updateFormData('shift', 'day', dayName);
                  }}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inizio *
                  </label>
                  <input
                    type="time"
                    value={formData.shift.startTime}
                    onChange={(e) => updateFormData('shift', 'startTime', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fine *
                  </label>
                  <input
                    type="time"
                    value={formData.shift.endTime}
                    onChange={(e) => updateFormData('shift', 'endTime', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Posizione *
                </label>
                <select
                  value={formData.shift.position}
                  onChange={(e) => updateFormData('shift', 'position', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Seleziona posizione</option>
                  {businessData.positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo Turno
                </label>
                <select
                  value={formData.shift.shiftType}
                  onChange={(e) => updateFormData('shift', 'shiftType', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Seleziona tipo</option>
                  {businessData.shiftTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={formData.shift.notes}
                  onChange={(e) => updateFormData('shift', 'notes', e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Note aggiuntive..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleAddShift}
                disabled={appState.loading.save}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                {appState.loading.save ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Aggiungi Turno</span>
                  </>
                )}
              </button>
              <button
                onClick={() => toggleModal('addShift', false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition-all font-semibold"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {appState.modals.addEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <UserPlus className="w-6 h-6" />
                <span>Nuovo Dipendente</span>
              </h3>
              <button
                onClick={() => toggleModal('addEmployee', false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.employee.name}
                    onChange={(e) => updateFormData('employee', 'name', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    value={formData.employee.surname}
                    onChange={(e) => updateFormData('employee', 'surname', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Cognome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.employee.email}
                    onChange={(e) => updateFormData('employee', 'email', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="email@esempio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.employee.phone}
                    onChange={(e) => updateFormData('employee', 'phone', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ruolo *
                  </label>
                  <input
                    type="text"
                    value={formData.employee.role}
                    onChange={(e) => updateFormData('employee', 'role', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Es: Cameriere, Cuoco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reparto
                  </label>
                  <input
                    type="text"
                    value={formData.employee.department}
                    onChange={(e) => updateFormData('employee', 'department', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Es: Sala, Cucina"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paga Oraria (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.employee.hourlyRate}
                    onChange={(e) => updateFormData('employee', 'hourlyRate', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Es: 10.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo Contratto
                  </label>
                  <select
                    value={formData.employee.contractType}
                    onChange={(e) => updateFormData('employee', 'contractType', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="seasonal">Stagionale</option>
                    <option value="temporary">Temporaneo</option>
                    <option value="internship">Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={formData.employee.startDate}
                  onChange={(e) => updateFormData('employee', 'startDate', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={formData.employee.notes}
                  onChange={(e) => updateFormData('employee', 'notes', e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Note aggiuntive..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleAddEmployee}
                disabled={appState.loading.save}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                {appState.loading.save ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Aggiungi Dipendente</span>
                  </>
                )}
              </button>
              <button
                onClick={() => toggleModal('addEmployee', false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition-all font-semibold"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {appState.modals.editEmployee && uiState.editing.employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Edit className="w-6 h-6" />
                <span>Modifica Dipendente</span>
              </h3>
              <button
                onClick={() => toggleModal('editEmployee', false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.employee.name}
                    onChange={(e) => updateFormData('employee', 'name', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    value={formData.employee.surname}
                    onChange={(e) => updateFormData('employee', 'surname', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Cognome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.employee.email}
                    onChange={(e) => updateFormData('employee', 'email', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="email@esempio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.employee.phone}
                    onChange={(e) => updateFormData('employee', 'phone', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ruolo *
                  </label>
                  <input
                    type="text"
                    value={formData.employee.role}
                    onChange={(e) => updateFormData('employee', 'role', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Es: Cameriere, Cuoco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reparto
                  </label>
                  <input
                    type="text"
                    value={formData.employee.department}
                    onChange={(e) => updateFormData('employee', 'department', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Es: Sala, Cucina"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paga Oraria (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.employee.hourlyRate}
                    onChange={(e) => updateFormData('employee', 'hourlyRate', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Es: 10.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo Contratto
                  </label>
                  <select
                    value={formData.employee.contractType}
                    onChange={(e) => updateFormData('employee', 'contractType', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="seasonal">Stagionale</option>
                    <option value="temporary">Temporaneo</option>
                    <option value="internship">Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={formData.employee.startDate}
                  onChange={(e) => updateFormData('employee', 'startDate', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={formData.employee.notes}
                  onChange={(e) => updateFormData('employee', 'notes', e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Note aggiuntive..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.employee.isActive}
                  onChange={(e) => updateFormData('employee', 'isActive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Dipendente attivo
                </label>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  const { id, name, surname, email, phone, role, department, hourlyRate, contractType, startDate, notes, avatar, isActive } = formData.employee;
                  
                  if (!name.trim() || !surname.trim() || !role.trim() || !hourlyRate) {
                    setAppState(prev => ({
                      ...prev,
                      errors: { ...prev.errors, general: 'Compila tutti i campi obbligatori' }
                    }));
                    return;
                  }

                  const rate = parseFloat(hourlyRate);
                  if (isNaN(rate) || rate < 0) {
                    setAppState(prev => ({
                      ...prev,
                      errors: { ...prev.errors, general: 'Paga oraria non valida' }
                    }));
                    return;
                  }

                  // Check email uniqueness
                  if (email && businessData.employees.some(emp => 
                    emp.email?.toLowerCase() === email.toLowerCase().trim() && emp.id !== id
                  )) {
                    setAppState(prev => ({
                      ...prev,
                      errors: { ...prev.errors, general: 'Email già esistente' }
                    }));
                    return;
                  }

                  const updatedEmployee = {
                    id,
                    companyId: businessData.company.id,
                    name: name.trim(),
                    surname: surname.trim(),
                    fullName: `${name.trim()} ${surname.trim()}`,
                    email: email?.trim().toLowerCase() || '',
                    phone: phone?.trim() || '',
                    role: role.trim(),
                    department: department || 'Generale',
                    hourlyRate: rate,
                    contractType: contractType || 'full-time',
                    startDate: startDate || new Date().toISOString().split('T')[0],
                    notes: notes || '',
                    avatar: avatar || '👤',
                    isActive: isActive,
                    updatedAt: new Date().toISOString()
                  };

                  const updatedEmployees = businessData.employees.map(emp => 
                    emp.id === id ? updatedEmployee : emp
                  );
                  
                  setBusinessData(prev => ({
                    ...prev,
                    employees: updatedEmployees
                  }));
                  
                  storage.set(storageKeys.employees, updatedEmployees);
                  
                  setAppState(prev => ({
                    ...prev,
                    modals: { ...prev.modals, editEmployee: false }
                  }));
                }}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Salva Modifiche</span>
              </button>
              <button
                onClick={() => toggleModal('editEmployee', false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition-all font-semibold"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftProApp;