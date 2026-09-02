export type Language = 'fr' | 'en';

const translations = {
  fr: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      myProjects: 'Mes Projets',
      projects: 'Projets',
      rental: 'Location',
      profile: 'Mon Profil',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      login: 'Connexion',
      signup: "S'inscrire",
      equipment: 'Matériel',
    },

    // Homepage
    home: {
      platformLabel: 'Plateforme Intercommunautaire 2026',
      subtitle: 'BDE × Organisateurs × Matériel',
      tagline: "La plateforme qui connecte les bureaux des étudiants et les organisateurs d'événements. Projets, matériel, réputation — tout au même endroit.",
      ctaPrimary: 'Commencer gratuitement →',
      ctaSecondary: 'Voir le catalogue',
      iAmBDE: 'Je suis un BDE',
      iAmOrga: 'Je suis Orga',
      whatWeDo: 'Ce qu\'on fait',
      everythingYouNeed: 'Tout ce dont vous\navez besoin.',
      features: '03 fonctionnalités',
      joinKlub: 'Rejoindre KLUB',
      nextEventStartsHere: 'Votre prochain\névénement\ncommence ici.',
      freeSignup: 'Inscription gratuite. Accès complet dès le premier jour.',
      stats: {
        bde: { val: '200+', label: 'BDE inscrits', sub: 'dans toute la France' },
        providers: { val: '1.2k', label: 'Prestataires', sub: 'vérifiés et notés' },
        rating: { val: '4.8', label: 'Note moyenne', sub: "sur l'ensemble des projets" },
      },
      features_list: [
        {
          num: '01',
          title: 'Marketplace Projets',
          desc: 'Les BDE publient leurs événements. Les orgas candidatent, négocient, et collaborent. Tout dans un seul espace structuré.',
          tag: 'Pour les BDE',
        },
        {
          num: '02',
          title: 'Rental Hub',
          desc: 'Son, image, lumière, logistique. Louez du matériel entre communautés, gérez les disponibilités, tracez chaque transaction.',
          tag: 'BDE & Orgas',
        },
        {
          num: '03',
          title: 'Réputation & Ranking',
          desc: 'Feedback obligatoire après chaque projet. Score global pondéré. Les meilleures orgas remontent, les mauvaises disparaissent.',
          tag: 'Système de confiance',
        },
      ],
      ticker: ['Événements Étudiants', 'Location Matériel', 'BDE & Orgas', 'Réputation Vérifiée', 'Son · Image · Lumière', 'Gala · Festival · Soirée', 'Communauté', 'Feedback Obligatoire'],
    },

    // Auth
    auth: {
      login: {
        title: 'Connexion',
        subtitle: 'Accédez à votre espace KLUB',
        email: 'Email',
        password: 'Mot de passe',
        emailPlaceholder: 'votre@email.fr',
        passwordPlaceholder: '••••••••',
        submit: 'Se connecter →',
        submitting: 'Connexion...',
        noAccount: 'Pas encore de compte ?',
        signup: "S'inscrire",
        leftTag: 'Plateforme BDE & Orgas',
        leftSub: '— Événementiel Étudiant',
        leftDesc: "La plateforme intercommunautaire pour connecter les BDE et les organisateurs d'événements.",
        stats: [
          { val: '200+', label: 'BDE' },
          { val: '1.2k', label: 'Prestataires' },
          { val: '4.8★', label: 'Note moyenne' },
        ],
      },
      signup: {
        title: 'Créer un compte',
        subtitle: 'Rejoignez la communauté KLUB',
        accountType: 'Type de compte',
        fullName: 'Nom complet',
        organization: 'Organisation',
        location: 'Localisation',
        locationPlaceholder: 'Paris, France',
        email: 'Email',
        emailPlaceholder: 'votre@email.fr',
        password: 'Mot de passe',
        passwordHint: 'Minimum 12 caractères, avec chiffres et symboles',
        submit: 'Rejoindre en tant que {role} →',
        submitting: 'Création...',
        alreadyAccount: 'Déjà un compte ?',
        login: 'Se connecter',
        joinAs: '— Vous rejoignez en tant que',
        step: 'Étape 1 sur 1',
        roleInfo: {
          BDE: {
            label: 'BDE',
            sub: 'Bureau des Étudiants',
            desc: 'Postez vos événements, recrutez des prestataires, gérez vos locations de matériel.',
            perks: ['Poster des projets', 'Louer du matériel', 'Noter les prestataires'],
          },
          ORGA: {
            label: 'ORGA',
            sub: 'Organisateur',
            desc: 'Proposez vos services aux BDE, louez votre matériel, développez votre réputation.',
            perks: ['Répondre aux projets', 'Louer votre matériel', 'Score de réputation'],
          },
        },
      },
    },

    // BDE Dashboard
    bde: {
      dashboard: {
        title: 'Dashboard BDE',
        subtitle: 'Gérez vos projets et locations',
        stats: {
          created: 'Projets créés',
          active: 'En cours',
          completed: 'Terminés',
        },
        quickActions: 'Actions rapides',
        actions: {
          createProject: { num: '01', title: 'Créer un projet', desc: 'Postez un événement et trouvez des prestataires', blocked: 'Feedback requis' },
          manageRentals: { num: '02', title: 'Gérer les locations', desc: 'Approuvez ou refusez les demandes de location' },
          browseEquipment: { num: '03', title: 'Louer du matériel', desc: 'Parcourez le catalogue disponible' },
        },
        recentProjects: 'Projets récents',
        viewAll: 'Voir tout →',
        noProjects: 'Aucun projet',
        noProjectsDesc: 'Créez votre premier projet pour collaborer avec des prestataires',
        createProject: 'Créer un projet',
        feedbackRequired: 'Feedback requis',
      },
    },

    // ORGA Dashboard
    orga: {
      dashboard: {
        title: 'Dashboard ORGA',
        subtitle: 'Gérez vos candidatures et suivez votre réputation',
        topProvider: '⭐ TOP PRESTATAIRE',
        stats: {
          avgRating: 'Note moyenne',
          reviews: 'Avis reçus',
          applications: 'Candidatures en cours',
          completed: 'Projets terminés',
        },
        quickActions: {
          viewProjects: { title: '📋 Voir les Projets', desc: 'Consultez les événements disponibles et postulez' },
          rentEquipment: { title: '🎬 Louer du Matériel', desc: 'Parcourez le catalogue de matériel disponible' },
          manageRentals: { title: '📋 Gérer Locations', desc: 'Gérez vos demandes et équipements loués' },
        },
        recentReviews: 'Derniers Avis Reçus',
        noReviews: 'Aucun avis pour le moment. Complétez vos premiers projets pour recevoir des feedbacks !',
      },
    },

    // Projects
    projects: {
      title: 'Projets disponibles',
      subtitle: 'Trouvez des événements et proposez vos services',
      createProject: 'Créer un projet',
      myProjects: 'Mes Projets',
      noProjects: 'Aucun projet disponible',
      noProjectsDesc: 'Aucun projet ne correspond à vos critères de recherche.',
      search: 'Rechercher...',
      filters: {
        all: 'Tous les types',
        allStatus: 'Tous les statuts',
      },
      detail: {
        apply: 'Postuler',
        applications: 'Candidatures',
        budget: 'Budget',
        capacity: 'Capacité',
        location: 'Lieu',
        dates: 'Dates',
        description: 'Description',
        type: 'Type',
        status: 'Statut',
        back: '← Retour',
      },
      create: {
        title: 'Créer un Projet',
        subtitle: 'Postez votre événement et trouvez les meilleurs prestataires',
        fields: {
          title: 'Titre du projet',
          type: "Type d'événement",
          budget: 'Budget estimé (€)',
          capacity: 'Capacité attendue',
          location: 'Lieu',
          startDate: 'Date de début',
          endDate: 'Date de fin',
          description: 'Description',
        },
        submit: 'Publier le projet',
        cancel: 'Annuler',
        publishing: 'Publication...',
      },
      status: {
        draft: 'Brouillon',
        published: 'Publié',
        in_progress: 'En cours',
        completed: 'Terminé',
        cancelled: 'Annulé',
      },
    },

    // Rental
    rental: {
      title: 'Catalogue de matériel',
      subtitle: 'Louez du matériel entre communautés',
      addEquipment: 'Ajouter du matériel',
      manageRentals: 'Gérer mes locations',
      noItems: 'Aucun équipement disponible',
      noItemsDesc: 'Aucun équipement ne correspond à vos critères.',
      search: 'Rechercher du matériel...',
      perDay: '/ jour',
      available: 'Disponible',
      unavailable: 'Indisponible',
      filters: {
        all: 'Toutes les catégories',
        available: 'Disponibles seulement',
      },
      detail: {
        rent: 'Louer ce matériel',
        back: '← Retour',
        owner: 'Propriétaire',
        specifications: 'Spécifications',
        price: 'Prix',
        quantity: 'Quantité',
        location: 'Lieu',
        blockedDates: 'Dates bloquées',
      },
      manage: {
        title: 'Gestion des locations',
        incoming: 'Demandes reçues',
        outgoing: 'Mes demandes',
        approve: 'Approuver',
        refuse: 'Refuser',
        noRequests: 'Aucune demande',
      },
      create: {
        title: 'Ajouter du matériel',
        subtitle: 'Mettez votre matériel en location',
        submit: 'Publier',
        cancel: 'Annuler',
      },
      status: {
        pending: 'En attente',
        approved: 'Approuvé',
        ongoing: 'En cours',
        completed: 'Terminé',
        cancelled: 'Annulé',
      },
    },

    // Profile
    profile: {
      title: 'Mon Profil',
      edit: 'Modifier',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      fields: {
        name: 'Nom',
        organization: 'Organisation',
        email: 'Email',
        location: 'Localisation',
        phone: 'Téléphone',
        bio: 'Bio',
      },
    },

    // Settings
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      save: 'Sauvegarder',
    },

    // Feedback
    feedback: {
      title: 'Évaluer le prestataire',
      subtitle: 'Votre avis aide la communauté',
      submit: 'Soumettre l\'évaluation',
      ratings: {
        global: 'Note globale',
        punctuality: 'Ponctualité',
        quality: 'Qualité',
        communication: 'Communication',
        value: 'Rapport qualité/prix',
      },
      comment: 'Commentaire',
      banner: {
        title: 'Feedback en attente',
        desc: 'Vous avez des projets terminés sans feedback. Donnez votre avis avant de créer un nouveau projet.',
        action: 'Donner mon feedback',
      },
    },

    // Common
    common: {
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      back: 'Retour',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      close: 'Fermer',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
      or: 'ou',
      and: 'et',
      from: 'Du',
      to: 'au',
      by: 'par',
      of: 'de',
      in: 'en',
      status: 'Statut',
      date: 'Date',
      price: 'Prix',
      noResults: 'Aucun résultat',
      seeAll: 'Voir tout',
    },
  },

  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      myProjects: 'My Projects',
      projects: 'Projects',
      rental: 'Rentals',
      profile: 'My Profile',
      settings: 'Settings',
      logout: 'Sign Out',
      login: 'Sign In',
      signup: 'Sign Up',
      equipment: 'Equipment',
    },

    // Homepage
    home: {
      platformLabel: 'Intercommunity Platform 2026',
      subtitle: 'BDE × Event Organizers × Equipment',
      tagline: 'The platform connecting student unions and event organizers. Projects, equipment, reputation — all in one place.',
      ctaPrimary: 'Get started for free →',
      ctaSecondary: 'Browse catalog',
      iAmBDE: "I'm a BDE",
      iAmOrga: "I'm an Organizer",
      whatWeDo: 'What we do',
      everythingYouNeed: 'Everything you\nneed.',
      features: '03 features',
      joinKlub: 'Join KLUB',
      nextEventStartsHere: 'Your next\nevent\nstarts here.',
      freeSignup: 'Free sign-up. Full access from day one.',
      stats: {
        bde: { val: '200+', label: 'BDEs registered', sub: 'across France' },
        providers: { val: '1.2k', label: 'Service providers', sub: 'verified and rated' },
        rating: { val: '4.8', label: 'Average rating', sub: 'across all projects' },
      },
      features_list: [
        {
          num: '01',
          title: 'Project Marketplace',
          desc: 'BDEs post their events. Organizers apply, negotiate, and collaborate. All in one structured space.',
          tag: 'For BDEs',
        },
        {
          num: '02',
          title: 'Rental Hub',
          desc: 'Sound, image, lighting, logistics. Rent equipment between communities, manage availability, track every transaction.',
          tag: 'BDE & Organizers',
        },
        {
          num: '03',
          title: 'Reputation & Ranking',
          desc: 'Mandatory feedback after every project. Weighted global score. The best organizers rise, the bad ones disappear.',
          tag: 'Trust system',
        },
      ],
      ticker: ['Student Events', 'Equipment Rental', 'BDE & Organizers', 'Verified Reputation', 'Sound · Image · Light', 'Gala · Festival · Party', 'Community', 'Mandatory Feedback'],
    },

    // Auth
    auth: {
      login: {
        title: 'Sign In',
        subtitle: 'Access your KLUB space',
        email: 'Email',
        password: 'Password',
        emailPlaceholder: 'your@email.com',
        passwordPlaceholder: '••••••••',
        submit: 'Sign in →',
        submitting: 'Signing in...',
        noAccount: "Don't have an account?",
        signup: 'Sign up',
        leftTag: 'BDE & Organizer Platform',
        leftSub: '— Student Events',
        leftDesc: 'The intercommunity platform connecting student unions and event organizers.',
        stats: [
          { val: '200+', label: 'BDEs' },
          { val: '1.2k', label: 'Providers' },
          { val: '4.8★', label: 'Avg. rating' },
        ],
      },
      signup: {
        title: 'Create an account',
        subtitle: 'Join the KLUB community',
        accountType: 'Account type',
        fullName: 'Full name',
        organization: 'Organization',
        location: 'Location',
        locationPlaceholder: 'Paris, France',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordHint: 'At least 12 characters, including digits and symbols',
        submit: 'Join as {role} →',
        submitting: 'Creating...',
        alreadyAccount: 'Already have an account?',
        login: 'Sign in',
        joinAs: '— You are joining as',
        step: 'Step 1 of 1',
        roleInfo: {
          BDE: {
            label: 'BDE',
            sub: 'Student Union',
            desc: 'Post your events, recruit service providers, manage equipment rentals.',
            perks: ['Post projects', 'Rent equipment', 'Rate providers'],
          },
          ORGA: {
            label: 'ORGA',
            sub: 'Organizer',
            desc: 'Offer your services to BDEs, rent your equipment, build your reputation.',
            perks: ['Apply to projects', 'Rent your equipment', 'Reputation score'],
          },
        },
      },
    },

    // BDE Dashboard
    bde: {
      dashboard: {
        title: 'BDE Dashboard',
        subtitle: 'Manage your projects and rentals',
        stats: {
          created: 'Projects created',
          active: 'In progress',
          completed: 'Completed',
        },
        quickActions: 'Quick actions',
        actions: {
          createProject: { num: '01', title: 'Create a project', desc: 'Post an event and find service providers', blocked: 'Feedback required' },
          manageRentals: { num: '02', title: 'Manage rentals', desc: 'Approve or decline rental requests' },
          browseEquipment: { num: '03', title: 'Rent equipment', desc: 'Browse the available catalog' },
        },
        recentProjects: 'Recent projects',
        viewAll: 'View all →',
        noProjects: 'No projects',
        noProjectsDesc: 'Create your first project to collaborate with service providers',
        createProject: 'Create a project',
        feedbackRequired: 'Feedback required',
      },
    },

    // ORGA Dashboard
    orga: {
      dashboard: {
        title: 'ORGA Dashboard',
        subtitle: 'Manage your applications and track your reputation',
        topProvider: '⭐ TOP PROVIDER',
        stats: {
          avgRating: 'Average rating',
          reviews: 'Reviews received',
          applications: 'Active applications',
          completed: 'Completed projects',
        },
        quickActions: {
          viewProjects: { title: '📋 View Projects', desc: 'Browse available events and apply' },
          rentEquipment: { title: '🎬 Rent Equipment', desc: 'Browse the available equipment catalog' },
          manageRentals: { title: '📋 Manage Rentals', desc: 'Manage your requests and rented equipment' },
        },
        recentReviews: 'Recent Reviews',
        noReviews: 'No reviews yet. Complete your first projects to receive feedback!',
      },
    },

    // Projects
    projects: {
      title: 'Available projects',
      subtitle: 'Find events and offer your services',
      createProject: 'Create a project',
      myProjects: 'My Projects',
      noProjects: 'No projects available',
      noProjectsDesc: 'No projects match your search criteria.',
      search: 'Search...',
      filters: {
        all: 'All types',
        allStatus: 'All statuses',
      },
      detail: {
        apply: 'Apply',
        applications: 'Applications',
        budget: 'Budget',
        capacity: 'Capacity',
        location: 'Location',
        dates: 'Dates',
        description: 'Description',
        type: 'Type',
        status: 'Status',
        back: '← Back',
      },
      create: {
        title: 'Create a Project',
        subtitle: 'Post your event and find the best service providers',
        fields: {
          title: 'Project title',
          type: 'Event type',
          budget: 'Estimated budget (€)',
          capacity: 'Expected capacity',
          location: 'Location',
          startDate: 'Start date',
          endDate: 'End date',
          description: 'Description',
        },
        submit: 'Publish project',
        cancel: 'Cancel',
        publishing: 'Publishing...',
      },
      status: {
        draft: 'Draft',
        published: 'Published',
        in_progress: 'In progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },

    // Rental
    rental: {
      title: 'Equipment catalog',
      subtitle: 'Rent equipment between communities',
      addEquipment: 'Add equipment',
      manageRentals: 'Manage my rentals',
      noItems: 'No equipment available',
      noItemsDesc: 'No equipment matches your criteria.',
      search: 'Search equipment...',
      perDay: '/ day',
      available: 'Available',
      unavailable: 'Unavailable',
      filters: {
        all: 'All categories',
        available: 'Available only',
      },
      detail: {
        rent: 'Rent this equipment',
        back: '← Back',
        owner: 'Owner',
        specifications: 'Specifications',
        price: 'Price',
        quantity: 'Quantity',
        location: 'Location',
        blockedDates: 'Blocked dates',
      },
      manage: {
        title: 'Rental management',
        incoming: 'Incoming requests',
        outgoing: 'My requests',
        approve: 'Approve',
        refuse: 'Decline',
        noRequests: 'No requests',
      },
      create: {
        title: 'Add equipment',
        subtitle: 'List your equipment for rental',
        submit: 'Publish',
        cancel: 'Cancel',
      },
      status: {
        pending: 'Pending',
        approved: 'Approved',
        ongoing: 'Ongoing',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },

    // Profile
    profile: {
      title: 'My Profile',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      fields: {
        name: 'Name',
        organization: 'Organization',
        email: 'Email',
        location: 'Location',
        phone: 'Phone',
        bio: 'Bio',
      },
    },

    // Settings
    settings: {
      title: 'Settings',
      language: 'Language',
      save: 'Save',
    },

    // Feedback
    feedback: {
      title: 'Rate the provider',
      subtitle: 'Your review helps the community',
      submit: 'Submit review',
      ratings: {
        global: 'Overall rating',
        punctuality: 'Punctuality',
        quality: 'Quality',
        communication: 'Communication',
        value: 'Value for money',
      },
      comment: 'Comment',
      banner: {
        title: 'Feedback pending',
        desc: 'You have completed projects without feedback. Leave your review before creating a new project.',
        action: 'Give feedback',
      },
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      from: 'From',
      to: 'to',
      by: 'by',
      of: 'of',
      in: 'in',
      status: 'Status',
      date: 'Date',
      price: 'Price',
      noResults: 'No results',
      seeAll: 'See all',
    },
  },
} as const;

export type Translations = typeof translations.fr;
export default translations;
