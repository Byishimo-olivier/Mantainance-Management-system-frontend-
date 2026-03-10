import React, { createContext, useContext, useMemo, useState } from "react";

const translations = {
  en: {
    language: {
      label: "Language",
      english: "English",
      french: "French",
      kinyarwanda: "Kinyarwanda",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      exportPdf: "Export PDF",
      importCsv: "Import CSV",
      logout: "Logout",
      loading: "Loading...",
      error: "Error",
      resultsReturned: "Results Returned",
      sort: "Sort",
      columns: "Columns",
      menu: "Menu",
      procurement: "Procurement",
    },
    header: {
      notifications: "Notifications",
      markAllRead: "Mark all as read",
      noNotifications: "No notifications yet",
      endOfAlerts: "End of alerts",
    },
    manager: {
      sidebar: {
        dashboard: "Dashboard",
        intelligence: "Intelligence",
        studio: "Studio",
        core: "Core",
        workOrders: "Work Orders",
        preventiveMaintenance: "Preventive Maintenance",
        scheduler: "Scheduler",
        requests: "Requests",
        materialRequests: "Material Requests",
        subscriptions: "Subscriptions",
        dataAnalytics: "Data & Analytics",
        analytics: "Analytics",
        meters: "Meters",
        edge: "Edge",
        resources: "Resources",
        assets: "Assets",
        locations: "Locations",
        peopleTeams: "People & Teams",
        checklists: "Checklists",
        files: "Files",
        procurement: "Procurement",
        partsInventory: "Parts & Inventory",
        purchaseOrders: "Purchase Orders",
        vendorsCustomers: "Vendors & Customers",
        settings: "Settings",
      },
    },
    technician: {
      title: "Technician Dashboard",
      subtitle: "Welcome back, {name}",
      requestMaterials: "Request Materials",
      logout: "Logout",
      modal: {
        title: "Request Materials",
        subtitle: "Let purchasing know what you need.",
        materialTitle: "Material Title",
        description: "Description",
        quantity: "Quantity",
        urgency: "Urgency",
        submit: "Submit Request",
      },
      stats: {
        assigned: "Assigned",
        inProgress: "In Progress",
        completed: "Completed",
        materials: "Materials",
        finishedJobs: "Finished jobs",
        requestsSubmitted: "Requests submitted",
      },
      activeWork: "Active Work",
      myQueue: "My Queue",
      materialRequests: "Material Requests",
      recentWorkHistory: "Recent Work History",
      noPending: "No pending tasks in your queue",
      noMaterials: "No material requests yet",
      noCompleted: "No completed jobs yet",
      viewActions: "View Actions",
      completeTask: "Complete Task & Notify",
      viewDetails: "View Details",
      newRequest: "New Request",
      alerts: {
        dismissAll: "Dismiss All Maint.",
        snoozeAll: "Snooze All Maint.",
      },
      issue: {
        title: "Issue Details",
        subtitle: "Review the task and submit evidence.",
        fieldTitle: "Title",
        fieldDescription: "Description",
        fieldLocation: "Location",
        fieldStatus: "Status",
        fieldPriority: "Priority",
        evidence: "Evidence",
        beforePhoto: "Before (Client Photo)",
        afterPhoto: "After",
        completionDetails: "Completion Details",
        notifyStart: "Notify Start Work",
        completeAfter: "Complete Task & Submit After evidence",
      },
    },
    client: {
      portalTitle: "Client Portal",
      portalSubtitle: "Property Management",
      nav: {
        overview: "Overview",
        requests: "Requests",
        locations: "Locations",
        assets: "Assets",
        staff: "Staff",
        maintenance: "Maintenance",
        subscriptions: "Subscriptions",
        partsInventory: "Parts & Inventory",
        purchaseOrders: "Purchase Orders",
        analytics: "Analytics",
        meters: "Meters",
        edge: "Edge",
        materialRequests: "Material Requests",
      },
      sections: {
        recentIssues: "Recent Issues",
        allRequests: "All Requests",
        locations: "Locations",
        assets: "Assets",
        internalTechnicians: "Internal Technicians",
        maintenance: "Maintenance",
        scheduledMaintenance: "Scheduled Maintenance",
      },
      actions: {
        exportPdf: "Export PDF",
        importCsv: "Import CSV",
        logout: "Logout",
        addLocations: "Add Locations",
        editLocation: "Edit Location",
        newLocation: "New Location",
      },
    },
    admin: {
      title: "Admin Dashboard",
      activeJobs: "Active Jobs",
      technicianPerformance: "Technician Performance",
      inventoryStatus: "Inventory Status",
      viewAllJobs: "View All Jobs",
      viewTechnicians: "View Technicians",
      viewInventory: "View Inventory",
    },
  },
  fr: {
    language: {
      label: "Langue",
      english: "Anglais",
      french: "Français",
      kinyarwanda: "Kinyarwanda",
    },
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      add: "Ajouter",
      edit: "Modifier",
      delete: "Supprimer",
      view: "Voir",
      exportPdf: "Exporter PDF",
      importCsv: "Importer CSV",
      logout: "Déconnexion",
      loading: "Chargement...",
      error: "Erreur",
      resultsReturned: "Résultats",
      sort: "Trier",
      columns: "Colonnes",
      menu: "Menu",
      procurement: "Approvisionnement",
    },
    header: {
      notifications: "Notifications",
      markAllRead: "Tout marquer comme lu",
      noNotifications: "Aucune notification",
      endOfAlerts: "Fin des alertes",
    },
    manager: {
      sidebar: {
        dashboard: "Tableau de bord",
        intelligence: "Intelligence",
        studio: "Studio",
        core: "Cœur",
        workOrders: "Ordres de travail",
        preventiveMaintenance: "Maintenance préventive",
        scheduler: "Planificateur",
        requests: "Demandes",
        materialRequests: "Demandes de matériel",
        subscriptions: "Abonnements",
        dataAnalytics: "Données & analyses",
        analytics: "Analytique",
        meters: "Compteurs",
        edge: "Edge",
        resources: "Ressources",
        assets: "Actifs",
        locations: "Sites",
        peopleTeams: "Personnes & équipes",
        checklists: "Checklists",
        files: "Fichiers",
        procurement: "Approvisionnement",
        partsInventory: "Pièces & inventaire",
        purchaseOrders: "Bons de commande",
        vendorsCustomers: "Fournisseurs & clients",
        settings: "Paramètres",
      },
    },
    technician: {
      title: "Tableau technicien",
      subtitle: "Bon retour, {name}",
      requestMaterials: "Demander du matériel",
      logout: "Déconnexion",
      modal: {
        title: "Demande de matériel",
        subtitle: "Informez l'achat de vos besoins.",
        materialTitle: "Titre du matériel",
        description: "Description",
        quantity: "Quantité",
        urgency: "Urgence",
        submit: "Envoyer la demande",
      },
      stats: {
        assigned: "Attribué",
        inProgress: "En cours",
        completed: "Terminé",
        materials: "Matériels",
        finishedJobs: "Travaux terminés",
        requestsSubmitted: "Demandes envoyées",
      },
      activeWork: "Travail actif",
      myQueue: "Ma file",
      materialRequests: "Demandes de matériel",
      recentWorkHistory: "Historique récent",
      noPending: "Aucune tâche en attente",
      noMaterials: "Aucune demande de matériel",
      noCompleted: "Aucune tâche terminée",
      viewActions: "Voir actions",
      completeTask: "Terminer & notifier",
      viewDetails: "Voir détails",
      newRequest: "Nouvelle demande",
      alerts: {
        dismissAll: "Tout ignorer",
        snoozeAll: "Tout reporter",
      },
      issue: {
        title: "Détails de l'incident",
        subtitle: "Vérifiez la tâche et ajoutez des preuves.",
        fieldTitle: "Titre",
        fieldDescription: "Description",
        fieldLocation: "Site",
        fieldStatus: "Statut",
        fieldPriority: "Priorité",
        evidence: "Preuves",
        beforePhoto: "Avant (photo client)",
        afterPhoto: "Après",
        completionDetails: "Détails de clôture",
        notifyStart: "Notifier le début",
        completeAfter: "Terminer & ajouter preuve",
      },
    },
    client: {
      portalTitle: "Portail client",
      portalSubtitle: "Gestion immobilière",
      nav: {
        overview: "Aperçu",
        requests: "Demandes",
        locations: "Sites",
        assets: "Actifs",
        staff: "Personnel",
        maintenance: "Maintenance",
        subscriptions: "Abonnements",
        partsInventory: "Pièces & inventaire",
        purchaseOrders: "Bons de commande",
        analytics: "Analytique",
        meters: "Compteurs",
        edge: "Edge",
        materialRequests: "Demandes de matériel",
      },
      sections: {
        recentIssues: "Incidents récents",
        allRequests: "Toutes les demandes",
        locations: "Sites",
        assets: "Actifs",
        internalTechnicians: "Techniciens internes",
        maintenance: "Maintenance",
        scheduledMaintenance: "Maintenance planifiée",
      },
      actions: {
        exportPdf: "Exporter PDF",
        importCsv: "Importer CSV",
        logout: "Déconnexion",
        addLocations: "Ajouter des sites",
        editLocation: "Modifier le site",
        newLocation: "Nouveau site",
      },
    },
    admin: {
      title: "Tableau admin",
      activeJobs: "Travaux actifs",
      technicianPerformance: "Performance techniciens",
      inventoryStatus: "État des stocks",
      viewAllJobs: "Voir tous les travaux",
      viewTechnicians: "Voir techniciens",
      viewInventory: "Voir inventaire",
    },
  },
  rw: {
    language: {
      label: "Ururimi",
      english: "Icyongereza",
      french: "Igifaransa",
      kinyarwanda: "Kinyarwanda",
    },
    common: {
      save: "Bika",
      cancel: "Hagarika",
      close: "Funga",
      add: "Ongeraho",
      edit: "Hindura",
      delete: "Siba",
      view: "Reba",
      exportPdf: "Kuramo PDF",
      importCsv: "Kwinjiza CSV",
      logout: "Sohoka",
      loading: "Birimo gukorwa...",
      error: "Ikosa",
      resultsReturned: "Ibyabonetse",
      sort: "Tondeka",
      columns: "Inkingi",
      menu: "Menu",
      procurement: "Kugura",
    },
    header: {
      notifications: "Ibyibutsa",
      markAllRead: "Shyira byose nk’byasomwe",
      noNotifications: "Nta byibutsa",
      endOfAlerts: "Iherezo ry'ibyibutsa",
    },
    manager: {
      sidebar: {
        dashboard: "Imbonerahamwe",
        intelligence: "Ubusesenguzi",
        studio: "Studio",
        core: "Ibikorwa",
        workOrders: "Amategeko y'akazi",
        preventiveMaintenance: "Kwitaho gukumira",
        scheduler: "Gahunda",
        requests: "Ibisabwa",
        materialRequests: "Gusaba ibikoresho",
        subscriptions: "Abiyandikisha",
        dataAnalytics: "Imibare & isesengura",
        analytics: "Isesengura",
        meters: "Miteri",
        edge: "Edge",
        resources: "Ibikoresho",
        assets: "Ibikoresho",
        locations: "Ahantu",
        peopleTeams: "Abantu & amatsinda",
        checklists: "Urutonde",
        files: "Amadosiye",
        procurement: "Kugura",
        partsInventory: "Ibice & ububiko",
        purchaseOrders: "Impapuro zo kugura",
        vendorsCustomers: "Abatanga & abakiriya",
        settings: "Igenamiterere",
      },
    },
    technician: {
      title: "Imbonerahamwe y’umutekinisiye",
      subtitle: "Ikaze, {name}",
      requestMaterials: "Saba ibikoresho",
      logout: "Sohoka",
      modal: {
        title: "Saba ibikoresho",
        subtitle: "Menyesha abaguzi ibyo ukeneye.",
        materialTitle: "Izina ry'igikoresho",
        description: "Ibisobanuro",
        quantity: "Umubare",
        urgency: "Byihutirwa",
        submit: "Ohereza",
      },
      stats: {
        assigned: "Byahawe",
        inProgress: "Birimo gukorwa",
        completed: "Byarangiye",
        materials: "Ibikoresho",
        finishedJobs: "Imirimo yarangiye",
        requestsSubmitted: "Ibisabwa byoherejwe",
      },
      activeWork: "Akazi kari gukora",
      myQueue: "Urutonde rwanjye",
      materialRequests: "Ibisabwa by'ibikoresho",
      recentWorkHistory: "Amateka ya vuba",
      noPending: "Nta kazi kari ku rutonde",
      noMaterials: "Nta bisabwa by'ibikoresho",
      noCompleted: "Nta mirimo yarangiye",
      viewActions: "Reba ibikorwa",
      completeTask: "Rangiza & menyesha",
      viewDetails: "Reba ibisobanuro",
      newRequest: "Gusaba gishya",
      alerts: {
        dismissAll: "Kuraho byose",
        snoozeAll: "Sunika byose",
      },
      issue: {
        title: "Ibisobanuro by'ikibazo",
        subtitle: "Reba akazi kandi wohereze ibimenyetso.",
        fieldTitle: "Umutwe",
        fieldDescription: "Ibisobanuro",
        fieldLocation: "Aho",
        fieldStatus: "Imiterere",
        fieldPriority: "Uruhare",
        evidence: "Ibimenyetso",
        beforePhoto: "Mbere (ifoto y'umukiriya)",
        afterPhoto: "Nyuma",
        completionDetails: "Ibisobanuro by'irangiza",
        notifyStart: "Menyesha gutangira",
        completeAfter: "Rangiza & wohereze ibimenyetso",
      },
    },
    client: {
      portalTitle: "Urubuga rw'umukiriya",
      portalSubtitle: "Gucunga inyubako",
      nav: {
        overview: "Incamake",
        requests: "Ibisabwa",
        locations: "Ahantu",
        assets: "Ibikoresho",
        staff: "Abakozi",
        maintenance: "Kubungabunga",
        subscriptions: "Abiyandikisha",
        partsInventory: "Ibice & ububiko",
        purchaseOrders: "Impapuro zo kugura",
        analytics: "Isesengura",
        meters: "Miteri",
        edge: "Edge",
        materialRequests: "Ibisabwa by'ibikoresho",
      },
      sections: {
        recentIssues: "Ibibazo biheruka",
        allRequests: "Ibisabwa byose",
        locations: "Ahantu",
        assets: "Ibikoresho",
        internalTechnicians: "Abatekinisiye b'imbere",
        maintenance: "Kubungabunga",
        scheduledMaintenance: "Kubungabunga kwateguwe",
      },
      actions: {
        exportPdf: "Kuramo PDF",
        importCsv: "Kwinjiza CSV",
        logout: "Sohoka",
        addLocations: "Ongeraho ahantu",
        editLocation: "Hindura ahantu",
        newLocation: "Ahantu hashya",
      },
    },
    admin: {
      title: "Imbonerahamwe y'umuyobozi",
      activeJobs: "Imirimo ikora",
      technicianPerformance: "Imikorere y'abatekinisiye",
      inventoryStatus: "Imiterere y'ububiko",
      viewAllJobs: "Reba imirimo yose",
      viewTechnicians: "Reba abatekinisiye",
      viewInventory: "Reba ububiko",
    },
  },
};

const LanguageContext = createContext(null);

const getUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?._id || parsed?.id || null;
  } catch {
    return null;
  }
};

const getStoredLanguage = () => {
  const userId = getUserId();
  const userLang = userId ? localStorage.getItem(`mms_lang_${userId}`) : null;
  return userLang || localStorage.getItem("mms_lang") || "en";
};

const resolveKey = (obj, path) =>
  path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const interpolate = (value, vars = {}) =>
  String(value).replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : ""));

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getStoredLanguage());

  const setLanguage = (next) => {
    setLanguageState(next);
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`mms_lang_${userId}`, next);
    } else {
      localStorage.setItem("mms_lang", next);
    }
  };

  const value = useMemo(() => {
    const t = (key, vars) => {
      const text = resolveKey(translations[language] || {}, key)
        ?? resolveKey(translations.en, key)
        ?? key;
      return interpolate(text, vars);
    };
    return {
      language,
      setLanguage,
      t,
      languages: [
        { code: "en", label: translations[language]?.language?.english || "English" },
        { code: "fr", label: translations[language]?.language?.french || "French" },
        { code: "rw", label: translations[language]?.language?.kinyarwanda || "Kinyarwanda" },
      ],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const useTranslation = () => {
  const ctx = useLanguage();
  return { t: ctx.t };
};
