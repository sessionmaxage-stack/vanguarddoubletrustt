(function (root, factory) {
  if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof module === "object" && module.exports) module.exports = factory();
  else root.VT = root.VT || Object.assign({}, factory());
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DICT = {
    en: {
      _name: "English",
      nav_dashboard: "Dashboard",
      nav_transferHistory: "Transfer History",
      nav_statement: "Statement",
      nav_stocks: "Invest / Stocks",
      nav_card: "Cards",
      nav_international: "Bank Transfer",
      nav_profile: "My Profile",
      nav_kyc: "KYC / Profile Setup",
      nav_pin: "Account PIN",
      nav_password: "Password",
      nav_logout: "Logout",
      top_search: "Search…",
      hero_welcome: "Welcome back",
      hero_accountNo: "Account No.",
      hero_status: "Status",
      hero_balance: "Available Balance",
      hero_viewDetails: "View Details",
      hero_viewStatement: "View Statement",
      actions_transfer: "Bank Transfer",
      actions_deposit: "Deposit",
      actions_withdraw: "Withdraw",
      actions_bills: "Pay Bills",
      actions_card: "Cards",
      actions_invest: "Invest",
      actions_loan: "Loans",
      actions_support: "Support",
      actions_more: "More",
      quick_balance: "Quick Balance",
      quick_today: "Today",
      quick_week: "This Week",
      quick_month: "This Month",
      quick_in: "Money In",
      quick_out: "Money Out",
      recent_title: "Recent Transactions",
      recent_viewAll: "View All",
      recent_empty: "No transactions yet.",
      recent_date: "Date",
      recent_type: "Type",
      recent_desc: "Description",
      recent_amount: "Amount",
      recent_status: "Status",
      cards_title: "My Cards",
      cards_addCard: "Add Card",
      stocks_title: "Markets & Investing",
      stocks_price: "Price",
      stocks_change: "Change",
      stocks_buy: "Buy",
      stocks_sell: "Sell",
      profile_title: "My Profile",
      profile_subtitle: "Review and update your personal information.",
      profile_save: "Save Changes",
      profile_updated: "Profile updated.",
      kyc_title: "Complete Your Profile / KYC",
      kyc_subtitle: "Please fill in your details and choose a language to unlock your dashboard.",
      kyc_required_warning: "All required fields must be completed before you can use your account.",
      kyc_firstname: "First Name",
      kyc_lastname: "Last Name",
      kyc_phone: "Phone Number",
      kyc_gender: "Gender",
      kyc_gender_male: "Male",
      kyc_gender_female: "Female",
      kyc_gender_other: "Other",
      kyc_gender_prefernotsay: "Prefer not to say",
      kyc_dob: "Date of Birth",
      kyc_nationality: "Nationality",
      kyc_occupation: "Occupation",
      kyc_country: "Country",
      kyc_address: "Street Address",
      kyc_city: "City",
      kyc_state: "State / Province",
      kyc_zip: "ZIP / Postal Code",
      kyc_language: "Preferred Language",
      kyc_submit: "Complete Setup",
      kyc_submitting: "Saving…",
      kyc_success: "Setup complete. Your dashboard has been translated to your preferred language.",
      kyc_required: "This field is required",
      kyc_genericError: "Unable to save. Please try again.",
      status_ACTIVE: "Active",
      status_PENDING: "Pending",
      status_SUSPENDED: "Suspended",
      status_COMPLETED: "Completed",
      status_PROCESSING: "Processing",
      status_FAILED: "Failed",
      th_title: "Transfer History",
      th_from_to: "From / To",
      th_ref: "Reference",
      th_filterAll: "All",
      th_filterSent: "Sent",
      th_filterReceived: "Received",
      th_filterPending: "Pending",
      th_exportCsv: "Export CSV",
      th_search: "Search transfers…",
      th_empty: "No transfers found.",
      st_title: "Account Statement",
      st_period: "Period",
      st_from: "From",
      st_to: "To",
      st_downloadPdf: "Download PDF",
      st_downloadCsv: "Download CSV",
      st_openingBalance: "Opening Balance",
      st_closingBalance: "Closing Balance",
      st_totalIn: "Total In",
      st_totalOut: "Total Out",
      intl_title: "Bank Transfer",
      intl_sendAmount: "You Send",
      intl_receiveAmount: "Recipient Gets",
      intl_fee: "Fee",
      intl_rate: "Exchange Rate",
      intl_eta: "Estimated Arrival",
      intl_recipientName: "Recipient Name",
      intl_recipientAccount: "Recipient Account / IBAN",
      intl_recipientBank: "Bank Name",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "Recipient Country",
      intl_reference: "Payment Reference",
      intl_submit: "Review & Send",
      pin_title: "Account PIN",
      pin_current: "Current PIN",
      pin_new: "New PIN",
      pin_confirm: "Confirm New PIN",
      pin_save: "Update PIN",
      pin_saved: "PIN updated successfully.",
      pw_title: "Change Password",
      pw_current: "Current Password",
      pw_new: "New Password",
      pw_confirm: "Confirm New Password",
      pw_save: "Update Password",
      pw_saved: "Password updated successfully.",
      card_title: "My Card",
      card_virtual: "Virtual Card",
      card_physical: "Physical Card",
      card_activate: "Activate",
      card_freeze: "Freeze",
      card_cvv: "CVV",
      card_exp: "Expires",
      card_limit: "Monthly Limit",
      mk_title: "Markets",
      mk_topMovers: "Top Movers",
      mk_watchlist: "Watchlist",
      mk_portfolio: "My Portfolio",
      mk_portfolioValue: "Portfolio Value",
      mk_todaysGain: "Today's Gain",
      mk_totalGain: "Total Gain",
      search: "Search…",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      copy: "Copy",
      copied: "Copied!",
      submit: "Submit",
      continue: "Continue",
      error_generic: "Something went wrong. Please try again.",
      error_unauthorized: "Your session ended. Please sign in again.",
      logout_confirm: "Are you sure you want to sign out?",
      footer_rights: "All rights reserved.",
      common_required: "Required",
      pic_title: "Add Your Profile Picture",
      pic_subtitle: "Upload a clear photo so we can recognize your account. This step is optional.",
      pic_upload_label: "Choose a Photo",
      pic_hint: "JPG, PNG, or WebP. Max 8 MB.",
      pic_skip: "Skip for now",
      pic_save: "Save Profile Picture",
      pic_uploading: "Uploading…",
      pic_saving: "Saving…",
      pic_success: "Profile picture saved!",
      pic_remove: "Remove picture",
      pic_removed: "Profile picture removed.",
      pic_error_size: "File too large. Max 8 MB.",
      pic_error_format: "Invalid format. Use JPG, PNG, or WebP.",
      pic_error_generic: "Unable to upload. Please try another picture.",
      pic_section_title: "Profile Picture",
      pic_upload_action: "Upload Photo",
      pic_change_action: "Change Photo"
    },
    es: {
      _name: "Español",
      nav_dashboard: "Panel",
      nav_transferHistory: "Historial de Transferencias",
      nav_statement: "Estado de Cuenta",
      nav_stocks: "Invertir / Acciones",
      nav_card: "Tarjetas",
      nav_international: "Transferencia Bancaria",
      nav_profile: "Mi Perfil",
      nav_kyc: "KYC / Configurar Perfil",
      nav_pin: "PIN de la Cuenta",
      nav_password: "Contraseña",
      nav_logout: "Cerrar Sesión",
      top_search: "Buscar…",
      hero_welcome: "Bienvenido de nuevo",
      hero_accountNo: "N.º de Cuenta",
      hero_status: "Estado",
      hero_balance: "Saldo Disponible",
      hero_viewDetails: "Ver Detalles",
      hero_viewStatement: "Ver Estado",
      actions_transfer: "Transferencia Bancaria",
      actions_deposit: "Depositar",
      actions_withdraw: "Retirar",
      actions_bills: "Pagar Facturas",
      actions_card: "Tarjetas",
      actions_invest: "Invertir",
      actions_loan: "Préstamos",
      actions_support: "Soporte",
      actions_more: "Más",
      quick_balance: "Saldo Rápido",
      quick_today: "Hoy",
      quick_week: "Esta Semana",
      quick_month: "Este Mes",
      quick_in: "Entradas",
      quick_out: "Salidas",
      recent_title: "Transacciones Recientes",
      recent_viewAll: "Ver Todas",
      recent_empty: "Aún no hay transacciones.",
      recent_date: "Fecha",
      recent_type: "Tipo",
      recent_desc: "Descripción",
      recent_amount: "Monto",
      recent_status: "Estado",
      cards_title: "Mis Tarjetas",
      cards_addCard: "Agregar Tarjeta",
      stocks_title: "Mercados e Inversiones",
      stocks_price: "Precio",
      stocks_change: "Cambio",
      stocks_buy: "Comprar",
      stocks_sell: "Vender",
      profile_title: "Mi Perfil",
      profile_subtitle: "Revisa y actualiza tu información personal.",
      profile_save: "Guardar Cambios",
      profile_updated: "Perfil actualizado.",
      kyc_title: "Completa tu Perfil / KYC",
      kyc_subtitle: "Por favor completa tus datos y elige un idioma para desbloquear tu panel.",
      kyc_required_warning: "Todos los campos obligatorios deben completarse antes de usar tu cuenta.",
      kyc_firstname: "Nombre",
      kyc_lastname: "Apellido",
      kyc_phone: "Número de Teléfono",
      kyc_gender: "Género",
      kyc_gender_male: "Masculino",
      kyc_gender_female: "Femenino",
      kyc_gender_other: "Otro",
      kyc_gender_prefernotsay: "Prefiero no decirlo",
      kyc_dob: "Fecha de Nacimiento",
      kyc_nationality: "Nacionalidad",
      kyc_occupation: "Ocupación",
      kyc_country: "País",
      kyc_address: "Dirección",
      kyc_city: "Ciudad",
      kyc_state: "Estado / Provincia",
      kyc_zip: "Código Postal",
      kyc_language: "Idioma Preferido",
      kyc_submit: "Completar Configuración",
      kyc_submitting: "Guardando…",
      kyc_success: "Configuración completa. Tu panel ha sido traducido a tu idioma preferido.",
      kyc_required: "Este campo es obligatorio",
      kyc_genericError: "No se pudo guardar. Inténtalo de nuevo.",
      status_ACTIVE: "Activo",
      status_PENDING: "Pendiente",
      status_SUSPENDED: "Suspendido",
      status_COMPLETED: "Completado",
      status_PROCESSING: "Procesando",
      status_FAILED: "Fallido",
      th_title: "Historial de Transferencias",
      th_from_to: "De / Para",
      th_ref: "Referencia",
      th_filterAll: "Todos",
      th_filterSent: "Enviados",
      th_filterReceived: "Recibidos",
      th_filterPending: "Pendientes",
      th_exportCsv: "Exportar CSV",
      th_search: "Buscar transferencias…",
      th_empty: "No se encontraron transferencias.",
      st_title: "Estado de Cuenta",
      st_period: "Periodo",
      st_from: "Desde",
      st_to: "Hasta",
      st_downloadPdf: "Descargar PDF",
      st_downloadCsv: "Descargar CSV",
      st_openingBalance: "Saldo Inicial",
      st_closingBalance: "Saldo Final",
      st_totalIn: "Total Entradas",
      st_totalOut: "Total Salidas",
      intl_title: "Transferencia Bancaria",
      intl_sendAmount: "Envías",
      intl_receiveAmount: "Recibe",
      intl_fee: "Comisión",
      intl_rate: "Tipo de Cambio",
      intl_eta: "Llegada Estimada",
      intl_recipientName: "Nombre del Beneficiario",
      intl_recipientAccount: "Cuenta / IBAN del Beneficiario",
      intl_recipientBank: "Banco",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "País del Beneficiario",
      intl_reference: "Referencia",
      intl_submit: "Revisar y Enviar",
      pin_title: "PIN de la Cuenta",
      pin_current: "PIN Actual",
      pin_new: "Nuevo PIN",
      pin_confirm: "Confirmar Nuevo PIN",
      pin_save: "Actualizar PIN",
      pin_saved: "PIN actualizado correctamente.",
      pw_title: "Cambiar Contraseña",
      pw_current: "Contraseña Actual",
      pw_new: "Nueva Contraseña",
      pw_confirm: "Confirmar Nueva Contraseña",
      pw_save: "Actualizar Contraseña",
      pw_saved: "Contraseña actualizada correctamente.",
      card_title: "Mi Tarjeta",
      card_virtual: "Tarjeta Virtual",
      card_physical: "Tarjeta Física",
      card_activate: "Activar",
      card_freeze: "Congelar",
      card_cvv: "CVV",
      card_exp: "Vence",
      card_limit: "Límite Mensual",
      mk_title: "Mercados",
      mk_topMovers: "Mayores Movimientos",
      mk_watchlist: "Lista de Seguimiento",
      mk_portfolio: "Mi Portafolio",
      mk_portfolioValue: "Valor del Portafolio",
      mk_todaysGain: "Ganancia del Día",
      mk_totalGain: "Ganancia Total",
      search: "Buscar…",
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      copy: "Copiar",
      copied: "¡Copiado!",
      submit: "Enviar",
      continue: "Continuar",
      error_generic: "Ocurrió un error. Inténtalo de nuevo.",
      error_unauthorized: "Tu sesión terminó. Por favor inicia sesión de nuevo.",
      logout_confirm: "¿Seguro que deseas cerrar sesión?",
      footer_rights: "Todos los derechos reservados.",
      common_required: "Obligatorio",
      pic_title: "Añade tu foto de perfil",
      pic_subtitle: "Sube una foto clara para reconocer tu cuenta. Este paso es opcional.",
      pic_upload_label: "Elegir una foto",
      pic_hint: "JPG, PNG o WebP. Máx. 8 MB.",
      pic_skip: "Omitir por ahora",
      pic_save: "Guardar foto",
      pic_uploading: "Subiendo…",
      pic_saving: "Guardando…",
      pic_success: "¡Foto de perfil guardada!",
      pic_remove: "Eliminar foto",
      pic_removed: "Foto de perfil eliminada.",
      pic_error_size: "Archivo muy grande. Máx. 8 MB.",
      pic_error_format: "Formato no válido. Usa JPG, PNG o WebP.",
      pic_error_generic: "No se pudo subir. Intenta con otra foto.",
      pic_section_title: "Foto de perfil",
      pic_upload_action: "Subir foto",
      pic_change_action: "Cambiar foto"
    },
    fr: {
      _name: "Français",
      nav_dashboard: "Tableau de bord",
      nav_transferHistory: "Historique des virements",
      nav_statement: "Relevé",
      nav_stocks: "Investir / Actions",
      nav_card: "Cartes",
      nav_international: "Virement bancaire",
      nav_profile: "Mon profil",
      nav_kyc: "KYC / Configurer le profil",
      nav_pin: "Code PIN",
      nav_password: "Mot de passe",
      nav_logout: "Déconnexion",
      top_search: "Rechercher…",
      hero_welcome: "Bon retour",
      hero_accountNo: "N° de compte",
      hero_status: "Statut",
      hero_balance: "Solde disponible",
      hero_viewDetails: "Voir les détails",
      hero_viewStatement: "Voir le relevé",
      actions_transfer: "Virement bancaire",
      actions_deposit: "Dépôt",
      actions_withdraw: "Retrait",
      actions_bills: "Payer les factures",
      actions_card: "Cartes",
      actions_invest: "Investir",
      actions_loan: "Prêts",
      actions_support: "Support",
      actions_more: "Plus",
      quick_balance: "Solde rapide",
      quick_today: "Aujourd'hui",
      quick_week: "Cette semaine",
      quick_month: "Ce mois",
      quick_in: "Entrées",
      quick_out: "Sorties",
      recent_title: "Transactions récentes",
      recent_viewAll: "Voir tout",
      recent_empty: "Aucune transaction pour le moment.",
      recent_date: "Date",
      recent_type: "Type",
      recent_desc: "Description",
      recent_amount: "Montant",
      recent_status: "Statut",
      cards_title: "Mes cartes",
      cards_addCard: "Ajouter une carte",
      stocks_title: "Marchés & Investissements",
      stocks_price: "Prix",
      stocks_change: "Variation",
      stocks_buy: "Acheter",
      stocks_sell: "Vendre",
      profile_title: "Mon profil",
      profile_subtitle: "Vérifiez et mettez à jour vos informations personnelles.",
      profile_save: "Enregistrer les modifications",
      profile_updated: "Profil mis à jour.",
      kyc_title: "Complétez votre profil / KYC",
      kyc_subtitle: "Remplissez vos informations et choisissez une langue pour débloquer votre tableau de bord.",
      kyc_required_warning: "Tous les champs obligatoires doivent être remplis avant d'utiliser votre compte.",
      kyc_firstname: "Prénom",
      kyc_lastname: "Nom",
      kyc_phone: "Téléphone",
      kyc_gender: "Genre",
      kyc_gender_male: "Homme",
      kyc_gender_female: "Femme",
      kyc_gender_other: "Autre",
      kyc_gender_prefernotsay: "Préfère ne pas dire",
      kyc_dob: "Date de naissance",
      kyc_nationality: "Nationalité",
      kyc_occupation: "Profession",
      kyc_country: "Pays",
      kyc_address: "Adresse",
      kyc_city: "Ville",
      kyc_state: "État / Province",
      kyc_zip: "Code postal",
      kyc_language: "Langue préférée",
      kyc_submit: "Terminer la configuration",
      kyc_submitting: "Enregistrement…",
      kyc_success: "Configuration terminée. Votre tableau de bord a été traduit dans votre langue préférée.",
      kyc_required: "Ce champ est obligatoire",
      kyc_genericError: "Impossible d'enregistrer. Veuillez réessayer.",
      status_ACTIVE: "Actif",
      status_PENDING: "En attente",
      status_SUSPENDED: "Suspendu",
      status_COMPLETED: "Terminé",
      status_PROCESSING: "En cours",
      status_FAILED: "Échoué",
      th_title: "Historique des virements",
      th_from_to: "De / À",
      th_ref: "Référence",
      th_filterAll: "Tous",
      th_filterSent: "Envoyés",
      th_filterReceived: "Reçus",
      th_filterPending: "En attente",
      th_exportCsv: "Exporter CSV",
      th_search: "Rechercher des virements…",
      th_empty: "Aucun virement trouvé.",
      st_title: "Relevé de compte",
      st_period: "Période",
      st_from: "Du",
      st_to: "Au",
      st_downloadPdf: "Télécharger PDF",
      st_downloadCsv: "Télécharger CSV",
      st_openingBalance: "Solde initial",
      st_closingBalance: "Solde final",
      st_totalIn: "Total entrées",
      st_totalOut: "Total sorties",
      intl_title: "Virement bancaire",
      intl_sendAmount: "Vous envoyez",
      intl_receiveAmount: "Le bénéficiaire reçoit",
      intl_fee: "Frais",
      intl_rate: "Taux de change",
      intl_eta: "Arrivée estimée",
      intl_recipientName: "Nom du bénéficiaire",
      intl_recipientAccount: "Compte / IBAN du bénéficiaire",
      intl_recipientBank: "Banque",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "Pays du bénéficiaire",
      intl_reference: "Référence",
      intl_submit: "Vérifier et envoyer",
      pin_title: "Code PIN du compte",
      pin_current: "PIN actuel",
      pin_new: "Nouveau PIN",
      pin_confirm: "Confirmer le nouveau PIN",
      pin_save: "Mettre à jour le PIN",
      pin_saved: "PIN mis à jour avec succès.",
      pw_title: "Changer le mot de passe",
      pw_current: "Mot de passe actuel",
      pw_new: "Nouveau mot de passe",
      pw_confirm: "Confirmer le nouveau mot de passe",
      pw_save: "Mettre à jour le mot de passe",
      pw_saved: "Mot de passe mis à jour avec succès.",
      card_title: "Ma carte",
      card_virtual: "Carte virtuelle",
      card_physical: "Carte physique",
      card_activate: "Activer",
      card_freeze: "Geler",
      card_cvv: "CVV",
      card_exp: "Expire",
      card_limit: "Plafond mensuel",
      mk_title: "Marchés",
      mk_topMovers: "Plus fortes variations",
      mk_watchlist: "Liste de suivi",
      mk_portfolio: "Mon portefeuille",
      mk_portfolioValue: "Valeur du portefeuille",
      mk_todaysGain: "Gain du jour",
      mk_totalGain: "Gain total",
      search: "Rechercher…",
      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      copy: "Copier",
      copied: "Copié !",
      submit: "Envoyer",
      continue: "Continuer",
      error_generic: "Une erreur est survenue. Veuillez réessayer.",
      error_unauthorized: "Votre session a expiré. Veuillez vous reconnecter.",
      logout_confirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
      footer_rights: "Tous droits réservés.",
      common_required: "Requis",
      pic_title: "Ajouter votre photo de profil",
      pic_subtitle: "Téléchargez une photo claire pour que nous puissions reconnaître votre compte. Cette étape est facultative.",
      pic_upload_label: "Choisir une photo",
      pic_hint: "JPG, PNG ou WebP. Max 8 Mo.",
      pic_skip: "Ignorer pour l'instant",
      pic_save: "Enregistrer la photo de profil",
      pic_uploading: "Téléversement en cours…",
      pic_saving: "Enregistrement…",
      pic_success: "Photo de profil enregistrée !",
      pic_remove: "Supprimer la photo",
      pic_removed: "Photo de profil supprimée.",
      pic_error_size: "Fichier trop volumineux. Max 8 Mo.",
      pic_error_format: "Format non valide. Utilisez JPG, PNG ou WebP.",
      pic_error_generic: "Impossible de téléverser. Veuillez essayer une autre photo.",
      pic_section_title: "Photo de profil",
      pic_upload_action: "Téléverser une photo",
      pic_change_action: "Changer la photo"
    },
    de: {
      _name: "Deutsch",
      nav_dashboard: "Dashboard",
      nav_transferHistory: "Überweisungsverlauf",
      nav_statement: "Kontoauszug",
      nav_stocks: "Investieren / Aktien",
      nav_card: "Karten",
      nav_international: "Banküberweisung",
      nav_profile: "Mein Profil",
      nav_kyc: "KYC / Profil einrichten",
      nav_pin: "Konto-PIN",
      nav_password: "Passwort",
      nav_logout: "Abmelden",
      top_search: "Suchen…",
      hero_welcome: "Willkommen zurück",
      hero_accountNo: "Kontonummer",
      hero_status: "Status",
      hero_balance: "Verfügbares Guthaben",
      hero_viewDetails: "Details anzeigen",
      hero_viewStatement: "Kontoauszug anzeigen",
      actions_transfer: "Banküberweisung",
      actions_deposit: "Einzahlen",
      actions_withdraw: "Abheben",
      actions_bills: "Rechnungen zahlen",
      actions_card: "Karten",
      actions_invest: "Investieren",
      actions_loan: "Kredite",
      actions_support: "Support",
      actions_more: "Mehr",
      quick_balance: "Schnellübersicht",
      quick_today: "Heute",
      quick_week: "Diese Woche",
      quick_month: "Dieser Monat",
      quick_in: "Eingänge",
      quick_out: "Ausgänge",
      recent_title: "Letzte Transaktionen",
      recent_viewAll: "Alle anzeigen",
      recent_empty: "Noch keine Transaktionen.",
      recent_date: "Datum",
      recent_type: "Typ",
      recent_desc: "Beschreibung",
      recent_amount: "Betrag",
      recent_status: "Status",
      cards_title: "Meine Karten",
      cards_addCard: "Karte hinzufügen",
      stocks_title: "Märkte & Investitionen",
      stocks_price: "Preis",
      stocks_change: "Veränderung",
      stocks_buy: "Kaufen",
      stocks_sell: "Verkaufen",
      profile_title: "Mein Profil",
      profile_subtitle: "Überprüfen und aktualisieren Sie Ihre persönlichen Daten.",
      profile_save: "Änderungen speichern",
      profile_updated: "Profil aktualisiert.",
      kyc_title: "Profil / KYC vervollständigen",
      kyc_subtitle: "Füllen Sie Ihre Daten aus und wählen Sie eine Sprache, um Ihr Dashboard freizuschalten.",
      kyc_required_warning: "Alle Pflichtfelder müssen ausgefüllt sein, bevor Sie Ihr Konto nutzen können.",
      kyc_firstname: "Vorname",
      kyc_lastname: "Nachname",
      kyc_phone: "Telefonnummer",
      kyc_gender: "Geschlecht",
      kyc_gender_male: "Männlich",
      kyc_gender_female: "Weiblich",
      kyc_gender_other: "Divers",
      kyc_gender_prefernotsay: "Keine Angabe",
      kyc_dob: "Geburtsdatum",
      kyc_nationality: "Staatsangehörigkeit",
      kyc_occupation: "Beruf",
      kyc_country: "Land",
      kyc_address: "Adresse",
      kyc_city: "Stadt",
      kyc_state: "Bundesland",
      kyc_zip: "Postleitzahl",
      kyc_language: "Bevorzugte Sprache",
      kyc_submit: "Einrichtung abschließen",
      kyc_submitting: "Speichern…",
      kyc_success: "Einrichtung abgeschlossen. Ihr Dashboard wurde in Ihre bevorzugte Sprache übersetzt.",
      kyc_required: "Dieses Feld ist erforderlich",
      kyc_genericError: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
      status_ACTIVE: "Aktiv",
      status_PENDING: "Ausstehend",
      status_SUSPENDED: "Gesperrt",
      status_COMPLETED: "Abgeschlossen",
      status_PROCESSING: "In Bearbeitung",
      status_FAILED: "Fehlgeschlagen",
      th_title: "Überweisungsverlauf",
      th_from_to: "Von / An",
      th_ref: "Referenz",
      th_filterAll: "Alle",
      th_filterSent: "Gesendet",
      th_filterReceived: "Empfangen",
      th_filterPending: "Ausstehend",
      th_exportCsv: "CSV exportieren",
      th_search: "Überweisungen suchen…",
      th_empty: "Keine Überweisungen gefunden.",
      st_title: "Kontoauszug",
      st_period: "Zeitraum",
      st_from: "Von",
      st_to: "Bis",
      st_downloadPdf: "PDF herunterladen",
      st_downloadCsv: "CSV herunterladen",
      st_openingBalance: "Anfangsguthaben",
      st_closingBalance: "Endguthaben",
      st_totalIn: "Eingänge gesamt",
      st_totalOut: "Ausgänge gesamt",
      intl_title: "Banküberweisung",
      intl_sendAmount: "Sie senden",
      intl_receiveAmount: "Empfänger erhält",
      intl_fee: "Gebühr",
      intl_rate: "Wechselkurs",
      intl_eta: "Voraussichtliche Ankunft",
      intl_recipientName: "Name des Empfängers",
      intl_recipientAccount: "Konto / IBAN des Empfängers",
      intl_recipientBank: "Bank",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "Land des Empfängers",
      intl_reference: "Verwendungszweck",
      intl_submit: "Prüfen & Senden",
      pin_title: "Konto-PIN",
      pin_current: "Aktuelle PIN",
      pin_new: "Neue PIN",
      pin_confirm: "Neue PIN bestätigen",
      pin_save: "PIN aktualisieren",
      pin_saved: "PIN erfolgreich aktualisiert.",
      pw_title: "Passwort ändern",
      pw_current: "Aktuelles Passwort",
      pw_new: "Neues Passwort",
      pw_confirm: "Neues Passwort bestätigen",
      pw_save: "Passwort aktualisieren",
      pw_saved: "Passwort erfolgreich aktualisiert.",
      card_title: "Meine Karte",
      card_virtual: "Virtuelle Karte",
      card_physical: "Physische Karte",
      card_activate: "Aktivieren",
      card_freeze: "Einfrieren",
      card_cvv: "CVV",
      card_exp: "Gültig bis",
      card_limit: "Monatliches Limit",
      mk_title: "Märkte",
      mk_topMovers: "Top-Bewegungen",
      mk_watchlist: "Beobachtungsliste",
      mk_portfolio: "Mein Portfolio",
      mk_portfolioValue: "Portfoliowert",
      mk_todaysGain: "Heutiger Gewinn",
      mk_totalGain: "Gesamtgewinn",
      search: "Suchen…",
      save: "Speichern",
      cancel: "Abbrechen",
      close: "Schließen",
      copy: "Kopieren",
      copied: "Kopiert!",
      submit: "Absenden",
      continue: "Weiter",
      error_generic: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
      error_unauthorized: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      logout_confirm: "Sind Sie sicher, dass Sie sich abmelden möchten?",
      footer_rights: "Alle Rechte vorbehalten.",
      common_required: "Pflichtfeld",
      pic_title: "Profilbild hinzufügen",
      pic_subtitle: "Laden Sie ein klares Foto hoch, damit wir Ihr Konto erkennen können. Dieser Schritt ist optional.",
      pic_upload_label: "Foto auswählen",
      pic_hint: "JPG, PNG oder WebP. Max. 8 MB.",
      pic_skip: "Vorerst überspringen",
      pic_save: "Profilbild speichern",
      pic_uploading: "Wird hochgeladen…",
      pic_saving: "Wird gespeichert…",
      pic_success: "Profilbild gespeichert!",
      pic_remove: "Bild entfernen",
      pic_removed: "Profilbild entfernt.",
      pic_error_size: "Datei zu groß. Max. 8 MB.",
      pic_error_format: "Ungültiges Format. JPG, PNG oder WebP verwenden.",
      pic_error_generic: "Hochladen fehlgeschlagen. Versuchen Sie es mit einem anderen Foto.",
      pic_section_title: "Profilbild",
      pic_upload_action: "Foto hochladen",
      pic_change_action: "Foto ändern"
    },
    pt: {
      _name: "Português",
      nav_dashboard: "Painel",
      nav_transferHistory: "Histórico de Transferências",
      nav_statement: "Extrato",
      nav_stocks: "Investir / Ações",
      nav_card: "Cartões",
      nav_international: "Transferência Bancária",
      nav_profile: "Meu Perfil",
      nav_kyc: "KYC / Configurar Perfil",
      nav_pin: "PIN da Conta",
      nav_password: "Senha",
      nav_logout: "Sair",
      top_search: "Buscar…",
      hero_welcome: "Bem-vindo de volta",
      hero_accountNo: "N.º da Conta",
      hero_status: "Status",
      hero_balance: "Saldo Disponível",
      hero_viewDetails: "Ver Detalhes",
      hero_viewStatement: "Ver Extrato",
      actions_transfer: "Transferência Bancária",
      actions_deposit: "Depositar",
      actions_withdraw: "Sacar",
      actions_bills: "Pagar Contas",
      actions_card: "Cartões",
      actions_invest: "Investir",
      actions_loan: "Empréstimos",
      actions_support: "Suporte",
      actions_more: "Mais",
      quick_balance: "Saldo Rápido",
      quick_today: "Hoje",
      quick_week: "Esta Semana",
      quick_month: "Este Mês",
      quick_in: "Entradas",
      quick_out: "Saídas",
      recent_title: "Transações Recentes",
      recent_viewAll: "Ver Todas",
      recent_empty: "Nenhuma transação ainda.",
      recent_date: "Data",
      recent_type: "Tipo",
      recent_desc: "Descrição",
      recent_amount: "Valor",
      recent_status: "Status",
      cards_title: "Meus Cartões",
      cards_addCard: "Adicionar Cartão",
      stocks_title: "Mercados & Investimentos",
      stocks_price: "Preço",
      stocks_change: "Variação",
      stocks_buy: "Comprar",
      stocks_sell: "Vender",
      profile_title: "Meu Perfil",
      profile_subtitle: "Revise e atualize suas informações pessoais.",
      profile_save: "Salvar Alterações",
      profile_updated: "Perfil atualizado.",
      kyc_title: "Complete Seu Perfil / KYC",
      kyc_subtitle: "Preencha seus dados e escolha um idioma para desbloquear seu painel.",
      kyc_required_warning: "Todos os campos obrigatórios devem ser preenchidos antes de usar a conta.",
      kyc_firstname: "Nome",
      kyc_lastname: "Sobrenome",
      kyc_phone: "Telefone",
      kyc_gender: "Gênero",
      kyc_gender_male: "Masculino",
      kyc_gender_female: "Feminino",
      kyc_gender_other: "Outro",
      kyc_gender_prefernotsay: "Prefiro não dizer",
      kyc_dob: "Data de Nascimento",
      kyc_nationality: "Nacionalidade",
      kyc_occupation: "Ocupação",
      kyc_country: "País",
      kyc_address: "Endereço",
      kyc_city: "Cidade",
      kyc_state: "Estado",
      kyc_zip: "CEP",
      kyc_language: "Idioma Preferido",
      kyc_submit: "Concluir Configuração",
      kyc_submitting: "Salvando…",
      kyc_success: "Configuração concluída. Seu painel foi traduzido para o seu idioma preferido.",
      kyc_required: "Este campo é obrigatório",
      kyc_genericError: "Não foi possível salvar. Tente novamente.",
      status_ACTIVE: "Ativo",
      status_PENDING: "Pendente",
      status_SUSPENDED: "Suspenso",
      status_COMPLETED: "Concluído",
      status_PROCESSING: "Processando",
      status_FAILED: "Falhou",
      th_title: "Histórico de Transferências",
      th_from_to: "De / Para",
      th_ref: "Referência",
      th_filterAll: "Todos",
      th_filterSent: "Enviados",
      th_filterReceived: "Recebidos",
      th_filterPending: "Pendentes",
      th_exportCsv: "Exportar CSV",
      th_search: "Buscar transferências…",
      th_empty: "Nenhuma transferência encontrada.",
      st_title: "Extrato Bancário",
      st_period: "Período",
      st_from: "De",
      st_to: "Até",
      st_downloadPdf: "Baixar PDF",
      st_downloadCsv: "Baixar CSV",
      st_openingBalance: "Saldo Inicial",
      st_closingBalance: "Saldo Final",
      st_totalIn: "Total de Entradas",
      st_totalOut: "Total de Saídas",
      intl_title: "Transferência Bancária",
      intl_sendAmount: "Você Envia",
      intl_receiveAmount: "Beneficiário Recebe",
      intl_fee: "Taxa",
      intl_rate: "Taxa de Câmbio",
      intl_eta: "Chegada Estimada",
      intl_recipientName: "Nome do Beneficiário",
      intl_recipientAccount: "Conta / IBAN do Beneficiário",
      intl_recipientBank: "Banco",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "País do Beneficiário",
      intl_reference: "Referência",
      intl_submit: "Revisar e Enviar",
      pin_title: "PIN da Conta",
      pin_current: "PIN Atual",
      pin_new: "Novo PIN",
      pin_confirm: "Confirmar Novo PIN",
      pin_save: "Atualizar PIN",
      pin_saved: "PIN atualizado com sucesso.",
      pw_title: "Alterar Senha",
      pw_current: "Senha Atual",
      pw_new: "Nova Senha",
      pw_confirm: "Confirmar Nova Senha",
      pw_save: "Atualizar Senha",
      pw_saved: "Senha atualizada com sucesso.",
      card_title: "Meu Cartão",
      card_virtual: "Cartão Virtual",
      card_physical: "Cartão Físico",
      card_activate: "Ativar",
      card_freeze: "Congelar",
      card_cvv: "CVV",
      card_exp: "Vence",
      card_limit: "Limite Mensal",
      mk_title: "Mercados",
      mk_topMovers: "Maiores Movimentações",
      mk_watchlist: "Lista de Observação",
      mk_portfolio: "Meu Portfólio",
      mk_portfolioValue: "Valor do Portfólio",
      mk_todaysGain: "Ganho de Hoje",
      mk_totalGain: "Ganho Total",
      search: "Buscar…",
      save: "Salvar",
      cancel: "Cancelar",
      close: "Fechar",
      copy: "Copiar",
      copied: "Copiado!",
      submit: "Enviar",
      continue: "Continuar",
      error_generic: "Ocorreu um erro. Tente novamente.",
      error_unauthorized: "Sua sessão expirou. Por favor, faça login novamente.",
      logout_confirm: "Tem certeza que deseja sair?",
      footer_rights: "Todos os direitos reservados.",
      common_required: "Obrigatório",
      pic_title: "Adicione sua foto de perfil",
      pic_subtitle: "Envie uma foto clara para que possamos reconhecer sua conta. Esta etapa é opcional.",
      pic_upload_label: "Escolher uma foto",
      pic_hint: "JPG, PNG ou WebP. Máx. 8 MB.",
      pic_skip: "Pular por enquanto",
      pic_save: "Salvar foto de perfil",
      pic_uploading: "Enviando…",
      pic_saving: "Salvando…",
      pic_success: "Foto de perfil salva!",
      pic_remove: "Remover foto",
      pic_removed: "Foto de perfil removida.",
      pic_error_size: "Arquivo muito grande. Máx. 8 MB.",
      pic_error_format: "Formato inválido. Use JPG, PNG ou WebP.",
      pic_error_generic: "Não foi possível enviar. Tente outra foto.",
      pic_section_title: "Foto de perfil",
      pic_upload_action: "Enviar foto",
      pic_change_action: "Alterar foto"
    },
    ru: {
      _name: "Русский",
      nav_dashboard: "Главная",
      nav_transferHistory: "История переводов",
      nav_statement: "Выписка",
      nav_stocks: "Инвестиции / Акции",
      nav_card: "Карты",
      nav_international: "Банковский перевод",
      nav_profile: "Мой профиль",
      nav_kyc: "KYC / Настройка профиля",
      nav_pin: "PIN-код",
      nav_password: "Пароль",
      nav_logout: "Выйти",
      top_search: "Поиск…",
      hero_welcome: "С возвращением",
      hero_accountNo: "Номер счёта",
      hero_status: "Статус",
      hero_balance: "Доступный остаток",
      hero_viewDetails: "Подробнее",
      hero_viewStatement: "Посмотреть выписку",
      actions_transfer: "Банковский перевод",
      actions_deposit: "Пополнить",
      actions_withdraw: "Снять",
      actions_bills: "Оплатить счета",
      actions_card: "Карты",
      actions_invest: "Инвестировать",
      actions_loan: "Кредиты",
      actions_support: "Поддержка",
      actions_more: "Ещё",
      quick_balance: "Быстрый баланс",
      quick_today: "Сегодня",
      quick_week: "За неделю",
      quick_month: "За месяц",
      quick_in: "Приход",
      quick_out: "Расход",
      recent_title: "Последние операции",
      recent_viewAll: "Все операции",
      recent_empty: "Операций пока нет.",
      recent_date: "Дата",
      recent_type: "Тип",
      recent_desc: "Описание",
      recent_amount: "Сумма",
      recent_status: "Статус",
      cards_title: "Мои карты",
      cards_addCard: "Добавить карту",
      stocks_title: "Рынки и инвестиции",
      stocks_price: "Цена",
      stocks_change: "Изменение",
      stocks_buy: "Купить",
      stocks_sell: "Продать",
      profile_title: "Мой профиль",
      profile_subtitle: "Проверьте и обновите свои персональные данные.",
      profile_save: "Сохранить изменения",
      profile_updated: "Профиль обновлён.",
      kyc_title: "Заполните профиль / KYC",
      kyc_subtitle: "Введите данные и выберите язык, чтобы разблокировать личный кабинет.",
      kyc_required_warning: "Все обязательные поля должны быть заполнены перед использованием счёта.",
      kyc_firstname: "Имя",
      kyc_lastname: "Фамилия",
      kyc_phone: "Телефон",
      kyc_gender: "Пол",
      kyc_gender_male: "Мужской",
      kyc_gender_female: "Женский",
      kyc_gender_other: "Другой",
      kyc_gender_prefernotsay: "Не указано",
      kyc_dob: "Дата рождения",
      kyc_nationality: "Гражданство",
      kyc_occupation: "Профессия",
      kyc_country: "Страна",
      kyc_address: "Адрес",
      kyc_city: "Город",
      kyc_state: "Область / Регион",
      kyc_zip: "Почтовый индекс",
      kyc_language: "Предпочитаемый язык",
      kyc_submit: "Завершить настройку",
      kyc_submitting: "Сохранение…",
      kyc_success: "Настройка завершена. Интерфейс переключён на выбранный язык.",
      kyc_required: "Это поле обязательно для заполнения",
      kyc_genericError: "Не удалось сохранить. Попробуйте ещё раз.",
      status_ACTIVE: "Активен",
      status_PENDING: "В ожидании",
      status_SUSPENDED: "Заблокирован",
      status_COMPLETED: "Завершён",
      status_PROCESSING: "Обработка",
      status_FAILED: "Ошибка",
      th_title: "История переводов",
      th_from_to: "От / Кому",
      th_ref: "Референс",
      th_filterAll: "Все",
      th_filterSent: "Отправленные",
      th_filterReceived: "Полученные",
      th_filterPending: "В ожидании",
      th_exportCsv: "Экспорт CSV",
      th_search: "Поиск переводов…",
      th_empty: "Переводов не найдено.",
      st_title: "Выписка по счёту",
      st_period: "Период",
      st_from: "С",
      st_to: "По",
      st_downloadPdf: "Скачать PDF",
      st_downloadCsv: "Скачать CSV",
      st_openingBalance: "Входящий остаток",
      st_closingBalance: "Исходящий остаток",
      st_totalIn: "Всего приход",
      st_totalOut: "Всего расход",
      intl_title: "Банковский перевод",
      intl_sendAmount: "Отправляете",
      intl_receiveAmount: "Получатель получит",
      intl_fee: "Комиссия",
      intl_rate: "Курс обмена",
      intl_eta: "Ориентировочное время",
      intl_recipientName: "Имя получателя",
      intl_recipientAccount: "Счёт / IBAN получателя",
      intl_recipientBank: "Банк",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "Страна получателя",
      intl_reference: "Назначение платежа",
      intl_submit: "Проверить и отправить",
      pin_title: "PIN-код счёта",
      pin_current: "Текущий PIN",
      pin_new: "Новый PIN",
      pin_confirm: "Повторите новый PIN",
      pin_save: "Обновить PIN",
      pin_saved: "PIN-код успешно обновлён.",
      pw_title: "Сменить пароль",
      pw_current: "Текущий пароль",
      pw_new: "Новый пароль",
      pw_confirm: "Повторите новый пароль",
      pw_save: "Обновить пароль",
      pw_saved: "Пароль успешно обновлён.",
      card_title: "Моя карта",
      card_virtual: "Виртуальная карта",
      card_physical: "Физическая карта",
      card_activate: "Активировать",
      card_freeze: "Заморозить",
      card_cvv: "CVV",
      card_exp: "Срок действия",
      card_limit: "Месячный лимит",
      mk_title: "Рынки",
      mk_topMovers: "Лидеры движения",
      mk_watchlist: "Избранное",
      mk_portfolio: "Мой портфель",
      mk_portfolioValue: "Стоимость портфеля",
      mk_todaysGain: "Дневной доход",
      mk_totalGain: "Общий доход",
      search: "Поиск…",
      save: "Сохранить",
      cancel: "Отмена",
      close: "Закрыть",
      copy: "Копировать",
      copied: "Скопировано!",
      submit: "Отправить",
      continue: "Продолжить",
      error_generic: "Что-то пошло не так. Попробуйте ещё раз.",
      error_unauthorized: "Сессия истекла. Пожалуйста, войдите снова.",
      logout_confirm: "Вы уверены, что хотите выйти?",
      footer_rights: "Все права защищены.",
      common_required: "Обязательно",
      pic_title: "Добавьте фото профиля",
      pic_subtitle: "Загрузите чёткое фото, чтобы мы могли распознать ваш счёт. Этот шаг необязателен.",
      pic_upload_label: "Выбрать фото",
      pic_hint: "JPG, PNG или WebP. Макс. 8 МБ.",
      pic_skip: "Пропустить сейчас",
      pic_save: "Сохранить фото профиля",
      pic_uploading: "Загрузка…",
      pic_saving: "Сохранение…",
      pic_success: "Фото профиля сохранено!",
      pic_remove: "Удалить фото",
      pic_removed: "Фото профиля удалено.",
      pic_error_size: "Файл слишком большой. Макс. 8 МБ.",
      pic_error_format: "Недопустимый формат. Используйте JPG, PNG или WebP.",
      pic_error_generic: "Не удалось загрузить. Попробуйте другое фото.",
      pic_section_title: "Фото профиля",
      pic_upload_action: "Загрузить фото",
      pic_change_action: "Изменить фото"
    },
    zh: {
      _name: "中文",
      nav_dashboard: "主页",
      nav_transferHistory: "转账记录",
      nav_statement: "账单",
      nav_stocks: "投资 / 股票",
      nav_card: "卡片",
      nav_international: "银行转账",
      nav_profile: "我的资料",
      nav_kyc: "实名认证 / 设置资料",
      nav_pin: "账户密码",
      nav_password: "登录密码",
      nav_logout: "退出",
      top_search: "搜索…",
      hero_welcome: "欢迎回来",
      hero_accountNo: "账号",
      hero_status: "状态",
      hero_balance: "可用余额",
      hero_viewDetails: "查看详情",
      hero_viewStatement: "查看账单",
      actions_transfer: "银行转账",
      actions_deposit: "存款",
      actions_withdraw: "取款",
      actions_bills: "缴费",
      actions_card: "卡片",
      actions_invest: "投资",
      actions_loan: "贷款",
      actions_support: "客服",
      actions_more: "更多",
      quick_balance: "快速余额",
      quick_today: "今日",
      quick_week: "本周",
      quick_month: "本月",
      quick_in: "收入",
      quick_out: "支出",
      recent_title: "最近交易",
      recent_viewAll: "查看全部",
      recent_empty: "暂无交易记录。",
      recent_date: "日期",
      recent_type: "类型",
      recent_desc: "说明",
      recent_amount: "金额",
      recent_status: "状态",
      cards_title: "我的卡片",
      cards_addCard: "添加卡片",
      stocks_title: "市场与投资",
      stocks_price: "价格",
      stocks_change: "涨跌",
      stocks_buy: "买入",
      stocks_sell: "卖出",
      profile_title: "我的资料",
      profile_subtitle: "查看并更新您的个人信息。",
      profile_save: "保存更改",
      profile_updated: "资料已更新。",
      kyc_title: "完善个人资料 / KYC",
      kyc_subtitle: "请填写您的信息并选择语言，以解锁您的仪表盘。",
      kyc_required_warning: "使用账户前必须完成所有必填字段。",
      kyc_firstname: "名",
      kyc_lastname: "姓",
      kyc_phone: "手机号",
      kyc_gender: "性别",
      kyc_gender_male: "男",
      kyc_gender_female: "女",
      kyc_gender_other: "其他",
      kyc_gender_prefernotsay: "不愿透露",
      kyc_dob: "出生日期",
      kyc_nationality: "国籍",
      kyc_occupation: "职业",
      kyc_country: "国家",
      kyc_address: "街道地址",
      kyc_city: "城市",
      kyc_state: "省 / 州",
      kyc_zip: "邮编",
      kyc_language: "首选语言",
      kyc_submit: "完成设置",
      kyc_submitting: "保存中…",
      kyc_success: "设置完成。您的仪表盘已切换到您选择的语言。",
      kyc_required: "此字段为必填项",
      kyc_genericError: "保存失败，请重试。",
      status_ACTIVE: "正常",
      status_PENDING: "待处理",
      status_SUSPENDED: "已冻结",
      status_COMPLETED: "已完成",
      status_PROCESSING: "处理中",
      status_FAILED: "失败",
      th_title: "转账记录",
      th_from_to: "转账方 / 收款方",
      th_ref: "参考号",
      th_filterAll: "全部",
      th_filterSent: "已转出",
      th_filterReceived: "已收到",
      th_filterPending: "待处理",
      th_exportCsv: "导出 CSV",
      th_search: "搜索转账…",
      th_empty: "未找到转账记录。",
      st_title: "账户账单",
      st_period: "周期",
      st_from: "起始",
      st_to: "结束",
      st_downloadPdf: "下载 PDF",
      st_downloadCsv: "下载 CSV",
      st_openingBalance: "期初余额",
      st_closingBalance: "期末余额",
      st_totalIn: "总收入",
      st_totalOut: "总支出",
      intl_title: "银行转账",
      intl_sendAmount: "转出金额",
      intl_receiveAmount: "收款金额",
      intl_fee: "手续费",
      intl_rate: "汇率",
      intl_eta: "预计到账",
      intl_recipientName: "收款人姓名",
      intl_recipientAccount: "收款账户 / IBAN",
      intl_recipientBank: "银行名称",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "收款人国家",
      intl_reference: "备注",
      intl_submit: "检查并发送",
      pin_title: "账户 PIN",
      pin_current: "当前 PIN",
      pin_new: "新 PIN",
      pin_confirm: "确认新 PIN",
      pin_save: "更新 PIN",
      pin_saved: "PIN 更新成功。",
      pw_title: "修改登录密码",
      pw_current: "当前密码",
      pw_new: "新密码",
      pw_confirm: "确认新密码",
      pw_save: "更新密码",
      pw_saved: "密码更新成功。",
      card_title: "我的卡片",
      card_virtual: "虚拟卡",
      card_physical: "实体卡",
      card_activate: "激活",
      card_freeze: "冻结",
      card_cvv: "CVV",
      card_exp: "有效期",
      card_limit: "每月限额",
      mk_title: "市场",
      mk_topMovers: "热门涨跌",
      mk_watchlist: "自选",
      mk_portfolio: "我的投资",
      mk_portfolioValue: "投资市值",
      mk_todaysGain: "今日盈亏",
      mk_totalGain: "总盈亏",
      search: "搜索…",
      save: "保存",
      cancel: "取消",
      close: "关闭",
      copy: "复制",
      copied: "已复制！",
      submit: "提交",
      continue: "继续",
      error_generic: "出错了，请重试。",
      error_unauthorized: "登录已过期，请重新登录。",
      logout_confirm: "确认退出登录？",
      footer_rights: "版权所有。",
      common_required: "必填",
      pic_title: "添加您的个人资料图片",
      pic_subtitle: "上传一张清晰的照片，以便我们识别您的账户。此步骤为可选。",
      pic_upload_label: "选择照片",
      pic_hint: "JPG、PNG 或 WebP 格式。最大 8 MB。",
      pic_skip: "稍后再说",
      pic_save: "保存个人资料图片",
      pic_uploading: "上传中…",
      pic_saving: "保存中…",
      pic_success: "个人资料图片已保存！",
      pic_remove: "移除图片",
      pic_removed: "个人资料图片已移除。",
      pic_error_size: "文件过大。最大 8 MB。",
      pic_error_format: "格式无效。请使用 JPG、PNG 或 WebP。",
      pic_error_generic: "无法上传。请尝试其他照片。",
      pic_section_title: "个人资料图片",
      pic_upload_action: "上传照片",
      pic_change_action: "更换照片"
    },
    ar: {
      _name: "العربية",
      nav_dashboard: "الصفحة الرئيسية",
      nav_transferHistory: "سجل التحويلات",
      nav_statement: "كشف الحساب",
      nav_stocks: "الاستثمار / الأسهم",
      nav_card: "البطاقات",
      nav_international: "تحويل بنكي",
      nav_profile: "ملفي الشخصي",
      nav_kyc: "بيانات التعرف على العملاء",
      nav_pin: "رقم الحساب السري",
      nav_password: "كلمة المرور",
      nav_logout: "تسجيل الخروج",
      top_search: "بحث…",
      hero_welcome: "أهلاً بعودتك",
      hero_accountNo: "رقم الحساب",
      hero_status: "الحالة",
      hero_balance: "الرصيد المتاح",
      hero_viewDetails: "عرض التفاصيل",
      hero_viewStatement: "عرض الكشف",
      actions_transfer: "تحويل بنكي",
      actions_deposit: "إيداع",
      actions_withdraw: "سحب",
      actions_bills: "دفع الفواتير",
      actions_card: "البطاقات",
      actions_invest: "استثمار",
      actions_loan: "قروض",
      actions_support: "الدعم",
      actions_more: "المزيد",
      quick_balance: "رصيد سريع",
      quick_today: "اليوم",
      quick_week: "هذا الأسبوع",
      quick_month: "هذا الشهر",
      quick_in: "وارد",
      quick_out: "صادر",
      recent_title: "آخر المعاملات",
      recent_viewAll: "عرض الكل",
      recent_empty: "لا توجد معاملات بعد.",
      recent_date: "التاريخ",
      recent_type: "النوع",
      recent_desc: "الوصف",
      recent_amount: "المبلغ",
      recent_status: "الحالة",
      cards_title: "بطاقاتي",
      cards_addCard: "إضافة بطاقة",
      stocks_title: "الأسواق والاستثمار",
      stocks_price: "السعر",
      stocks_change: "التغير",
      stocks_buy: "شراء",
      stocks_sell: "بيع",
      profile_title: "ملفي الشخصي",
      profile_subtitle: "راجع وقم بتحديث معلوماتك الشخصية.",
      profile_save: "حفظ التغييرات",
      profile_updated: "تم تحديث الملف الشخصي.",
      kyc_title: "أكمل ملفك الشخصي / KYC",
      kyc_subtitle: "الرجاء ملء بياناتك واختيار لغة لفتح لوحة التحكم الخاصة بك.",
      kyc_required_warning: "يجب إكمال جميع الحقول المطلوبة قبل استخدام حسابك.",
      kyc_firstname: "الاسم الأول",
      kyc_lastname: "اسم العائلة",
      kyc_phone: "رقم الهاتف",
      kyc_gender: "الجنس",
      kyc_gender_male: "ذكر",
      kyc_gender_female: "أنثى",
      kyc_gender_other: "آخر",
      kyc_gender_prefernotsay: "أفضل عدم الإشارة",
      kyc_dob: "تاريخ الميلاد",
      kyc_nationality: "الجنسية",
      kyc_occupation: "المهنة",
      kyc_country: "البلد",
      kyc_address: "العنوان",
      kyc_city: "المدينة",
      kyc_state: "المنطقة / المحافظة",
      kyc_zip: "الرمز البريدي",
      kyc_language: "اللغة المفضلة",
      kyc_submit: "إكمال الإعداد",
      kyc_submitting: "جارٍ الحفظ…",
      kyc_success: "اكتمل الإعداد. تمت ترجمة لوحة التحكم إلى لغتك المفضلة.",
      kyc_required: "هذا الحقل مطلوب",
      kyc_genericError: "تعذر الحفظ. يرجى المحاولة مرة أخرى.",
      status_ACTIVE: "نشط",
      status_PENDING: "قيد الانتظار",
      status_SUSPENDED: "موقوف",
      status_COMPLETED: "مكتمل",
      status_PROCESSING: "قيد المعالجة",
      status_FAILED: "فشل",
      th_title: "سجل التحويلات",
      th_from_to: "من / إلى",
      th_ref: "المرجع",
      th_filterAll: "الكل",
      th_filterSent: "مرسلة",
      th_filterReceived: "مستلمة",
      th_filterPending: "قيد الانتظار",
      th_exportCsv: "تصدير CSV",
      th_search: "البحث عن التحويلات…",
      th_empty: "لم يتم العثور على تحويلات.",
      st_title: "كشف حساب",
      st_period: "الفترة",
      st_from: "من",
      st_to: "إلى",
      st_downloadPdf: "تحميل PDF",
      st_downloadCsv: "تحميل CSV",
      st_openingBalance: "الرصيد الافتتاحي",
      st_closingBalance: "الرصيد الختامي",
      st_totalIn: "إجمالي الوارد",
      st_totalOut: "إجمالي الصادر",
      intl_title: "تحويل بنكي",
      intl_sendAmount: "المبلغ المرسل",
      intl_receiveAmount: "المبلغ المستلم",
      intl_fee: "الرسوم",
      intl_rate: "سعر الصرف",
      intl_eta: "موعد الوصول المتوقع",
      intl_recipientName: "اسم المستلم",
      intl_recipientAccount: "حساب المستلم / IBAN",
      intl_recipientBank: "اسم البنك",
      intl_recipientSwift: "SWIFT / BIC",
      intl_recipientCountry: "بلد المستلم",
      intl_reference: "مرجع الدفع",
      intl_submit: "مراجعة وإرسال",
      pin_title: "رقم الحساب السري",
      pin_current: "الرقم السري الحالي",
      pin_new: "الرقم السري الجديد",
      pin_confirm: "تأكيد الرقم الجديد",
      pin_save: "تحديث الرقم السري",
      pin_saved: "تم تحديث الرقم السري بنجاح.",
      pw_title: "تغيير كلمة المرور",
      pw_current: "كلمة المرور الحالية",
      pw_new: "كلمة المرور الجديدة",
      pw_confirm: "تأكيد كلمة المرور الجديدة",
      pw_save: "تحديث كلمة المرور",
      pw_saved: "تم تحديث كلمة المرور بنجاح.",
      card_title: "بطاقتي",
      card_virtual: "بطاقة افتراضية",
      card_physical: "بطاقة مادية",
      card_activate: "تفعيل",
      card_freeze: "تجميد",
      card_cvv: "CVV",
      card_exp: "تنتهي في",
      card_limit: "الحد الشهري",
      mk_title: "الأسواق",
      mk_topMovers: "أكثر الحركة",
      mk_watchlist: "المتابعة",
      mk_portfolio: "محفظتي",
      mk_portfolioValue: "قيمة المحفظة",
      mk_todaysGain: "ربح اليوم",
      mk_totalGain: "إجمالي الربح",
      search: "بحث…",
      save: "حفظ",
      cancel: "إلغاء",
      close: "إغلاق",
      copy: "نسخ",
      copied: "تم النسخ!",
      submit: "إرسال",
      continue: "متابعة",
      error_generic: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      error_unauthorized: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
      logout_confirm: "هل أنت متأكد من تسجيل الخروج؟",
      footer_rights: "جميع الحقوق محفوظة.",
      common_required: "مطلوب",
      pic_title: "أضف صورة ملفك الشخصي",
      pic_subtitle: "قم بتحميل صورة واضحة حتى نتمكن من التعرف على حسابك. هذه الخطوة اختيارية.",
      pic_upload_label: "اختر صورة",
      pic_hint: "JPG أو PNG أو WebP. الحد الأقصى 8 ميجابايت.",
      pic_skip: "تخطي الآن",
      pic_save: "حفظ صورة الملف الشخصي",
      pic_uploading: "جارٍ التحميل…",
      pic_saving: "جارٍ الحفظ…",
      pic_success: "تم حفظ صورة الملف الشخصي!",
      pic_remove: "إزالة الصورة",
      pic_removed: "تمت إزالة صورة الملف الشخصي.",
      pic_error_size: "الملف كبير جدًا. الحد الأقصى 8 ميجابايت.",
      pic_error_format: "تنسيق غير صالح. استخدم JPG أو PNG أو WebP.",
      pic_error_generic: "تعذر التحميل. يرجى تجربة صورة أخرى.",
      pic_section_title: "صورة الملف الشخصي",
      pic_upload_action: "تحميل صورة",
      pic_change_action: "تغيير الصورة"
    },
    it: {
      _name: "Italiano",
      nav_dashboard: "Cruscotto",
      nav_profile: "Dettagli account",
      nav_statement: "Riepilogo conto",
      nav_stocks: "Azioni e trading",
      actions_transfer: "Bonifico bancario",
      nav_international: "Bonifico bancario",
      nav_transferHistory: "Cronologia trasferimenti",
      nav_card: "Carta ATM",
      nav_pin: "PIN transazione",
      nav_password: "Password account",
      nav_logout: "Esci",
      nav_kyc: "KYC",
      hero_welcome: "Benvenuto",
      hero_balance: "Saldo disponibile",
      hero_accountNo: "N. conto",
      hero_status: "Stato",
      hero_viewDetails: "Vedi dettagli",
      hero_viewStatement: "Estratto conto",
      quick_today: "Oggi",
      quick_week: "Settimana",
      quick_month: "Mese",
      quick_in: "Entrate",
      quick_out: "Uscite",
      quick_balance: "Saldo",
      actions_more: "Azioni rapide",
      actions_deposit: "Deposito",
      actions_withdraw: "Prelievo",
      actions_bills: "Bollette",
      actions_card: "Carta",
      actions_loan: "Prestito",
      actions_invest: "Investi",
      actions_support: "Supporto",
      recent_title: "Transazioni recenti",
      recent_viewAll: "Vedi tutto",
      recent_empty: "Nessuna transazione disponibile",
      recent_date: "Data",
      recent_desc: "Descrizione",
      recent_type: "Tipo",
      recent_amount: "Importo",
      recent_status: "Stato",
      status_ACTIVE: "Attivo",
      status_PENDING: "In attesa",
      status_PROCESSING: "In elaborazione",
      status_COMPLETED: "Completato",
      status_FAILED: "Fallito",
      status_SUSPENDED: "Sospeso",
      th_title: "Cronologia trasferimenti",
      th_search: "Cerca transazioni…",
      th_filterAll: "Tutti",
      th_filterSent: "Inviati",
      th_filterReceived: "Ricevuti",
      th_filterPending: "In attesa",
      th_from_to: "Da / A",
      th_ref: "Riferimento",
      th_exportCsv: "Esporta CSV",
      th_empty: "Nessun trasferimento trovato.",
      st_title: "Estratto conto",
      st_period: "Periodo",
      st_from: "Da",
      st_to: "A",
      st_downloadPdf: "Scarica PDF",
      st_downloadCsv: "Scarica CSV",
      st_openingBalance: "Saldo iniziale",
      st_closingBalance: "Saldo finale",
      st_totalIn: "Totale entrate",
      st_totalOut: "Totale uscite",
      intl_title: "Bonifico bancario",
      intl_sendAmount: "Importo da inviare",
      intl_receiveAmount: "Importo ricevuto",
      intl_rate: "Tasso di cambio",
      intl_fee: "Commissione",
      intl_eta: "Tempo stimato",
      intl_recipientName: "Nome beneficiario",
      intl_recipientCountry: "Paese beneficiario",
      intl_recipientBank: "Banca beneficiario",
      intl_recipientAccount: "N. conto beneficiario",
      intl_recipientSwift: "SWIFT/BIC",
      intl_reference: "Riferimento",
      intl_submit: "Invia bonifico",
      profile_title: "Il mio profilo",
      profile_subtitle: "Aggiorna le informazioni personali e le preferenze",
      profile_save: "Salva modifiche",
      profile_updated: "Profilo aggiornato con successo.",
      pin_title: "PIN transazione",
      pin_current: "PIN attuale",
      pin_new: "Nuovo PIN",
      pin_confirm: "Conferma PIN",
      pin_save: "Aggiorna PIN",
      pin_saved: "PIN aggiornato con successo.",
      pw_title: "Password account",
      pw_current: "Password attuale",
      pw_new: "Nuova password",
      pw_confirm: "Conferma password",
      pw_save: "Aggiorna password",
      pw_saved: "Password aggiornata con successo.",
      card_title: "La mia carta",
      card_virtual: "Carta virtuale",
      card_physical: "Carta fisica",
      cards_addCard: "Aggiungi carta",
      card_activate: "Attiva",
      card_freeze: "Blocca",
      card_cvv: "CVV",
      card_exp: "Scadenza",
      card_limit: "Limite mensile",
      mk_title: "Mercati",
      mk_topMovers: "Maggiori movimenti",
      mk_watchlist: "Osservati",
      mk_portfolio: "Il mio portafoglio",
      mk_portfolioValue: "Valore portafoglio",
      mk_todaysGain: "Guadagno oggi",
      mk_totalGain: "Guadagno totale",
      stocks_title: "Azioni",
      stocks_price: "Prezzo",
      stocks_change: "Variazione",
      stocks_buy: "Compra",
      stocks_sell: "Vendi",
      kyc_title: "Completa il tuo profilo / KYC",
      kyc_subtitle: "Verifica il tuo account per abilitare la lingua preferita e tutte le funzionalità.",
      kyc_required_warning: "Questo passaggio è obbligatorio. Non potrai utilizzare il conto finché non sarà completato.",
      kyc_firstname: "Nome",
      kyc_lastname: "Cognome",
      kyc_phone: "Telefono",
      kyc_country: "Paese",
      kyc_language: "Lingua preferita",
      kyc_gender: "Sesso",
      kyc_gender_male: "Maschio",
      kyc_gender_female: "Femmina",
      kyc_gender_other: "Altro",
      kyc_gender_prefernotsay: "Preferisco non dire",
      kyc_dob: "Data di nascita",
      kyc_nationality: "Cittadinanza",
      kyc_occupation: "Professione",
      kyc_address: "Indirizzo",
      kyc_city: "Città",
      kyc_state: "Provincia/Stato",
      kyc_zip: "CAP",
      kyc_submit: "Completa configurazione",
      kyc_submitting: "Salvataggio…",
      kyc_success: "KYC completato. La lingua è stata aggiornata.",
      kyc_required: "Campo obbligatorio",
      kyc_genericError: "Impossibile salvare. Riprova.",
      search: "Cerca…",
      save: "Salva",
      cancel: "Annulla",
      close: "Chiudi",
      copy: "Copia",
      copied: "Copiato!",
      submit: "Invia",
      continue: "Continua",
      error_generic: "Si è verificato un errore. Riprova.",
      error_unauthorized: "Sessione terminata. Accedi di nuovo.",
      logout_confirm: "Sei sicuro di voler uscire?",
      footer_rights: "Tutti i diritti riservati.",
      common_required: "Obbligatorio"
    },
    nl: {
      _name: "Nederlands",
      nav_dashboard: "Dashboard",
      nav_profile: "Accountgegevens",
      nav_statement: "Accountoverzicht",
      nav_stocks: "Aandelen en trading",
      actions_transfer: "Bankoverschrijving",
      nav_international: "Bankoverschrijving",
      nav_transferHistory: "Overdrachtsgeschiedenis",
      nav_card: "ATM-pas",
      nav_pin: "Transactie-PIN",
      nav_password: "Accountwachtwoord",
      nav_logout: "Uitloggen",
      nav_kyc: "KYC",
      hero_welcome: "Welkom",
      hero_balance: "Beschikbaar saldo",
      hero_accountNo: "Rekeningnr.",
      hero_status: "Status",
      hero_viewDetails: "Details bekijken",
      hero_viewStatement: "Afschrift",
      quick_today: "Vandaag",
      quick_week: "Week",
      quick_month: "Maand",
      quick_in: "Inkomsten",
      quick_out: "Uitgaven",
      quick_balance: "Saldo",
      actions_more: "Snelle acties",
      actions_deposit: "Storten",
      actions_withdraw: "Opnemen",
      actions_bills: "Rekeningen",
      actions_card: "Kaart",
      actions_loan: "Lening",
      actions_invest: "Beleggen",
      actions_support: "Ondersteuning",
      recent_title: "Recente transacties",
      recent_viewAll: "Alles bekijken",
      recent_empty: "Nog geen transacties",
      th_title: "Geschiedenis",
      st_title: "Rekeningafschrift",
      intl_title: "Bankoverschrijving",
      profile_title: "Mijn profiel",
      pin_title: "Transactie-PIN",
      pw_title: "Accountwachtwoord",
      card_title: "Mijn kaart",
      mk_title: "Markten",
      mk_watchlist: "Volglijst",
      stocks_title: "Aandelen",
      kyc_title: "Voltooi je profiel / KYC",
      kyc_subtitle: "Verifieer je account om je voorkeurstaal en functies te activeren.",
      kyc_required_warning: "Deze stap is verplicht. Je kunt je account pas gebruiken na voltooiing.",
      kyc_firstname: "Voornaam",
      kyc_lastname: "Achternaam",
      kyc_country: "Land",
      kyc_language: "Voorkeurstaal",
      kyc_gender: "Geslacht",
      kyc_gender_male: "Man",
      kyc_gender_female: "Vrouw",
      kyc_gender_other: "Anders",
      kyc_gender_prefernotsay: "Zeg ik liever niet",
      kyc_dob: "Geboortedatum",
      kyc_nationality: "Nationaliteit",
      kyc_occupation: "Beroep",
      kyc_address: "Adres",
      kyc_city: "Stad",
      kyc_state: "Provincie/Staat",
      kyc_zip: "Postcode",
      kyc_submit: "Installatie voltooien",
      kyc_success: "KYC voltooid. Je taal is bijgewerkt.",
      search: "Zoeken…",
      save: "Opslaan",
      cancel: "Annuleren",
      close: "Sluiten",
      copy: "Kopiëren",
      copied: "Gekopieerd!",
      submit: "Verzenden",
      continue: "Doorgaan",
      error_generic: "Er is iets misgegaan. Probeer het opnieuw.",
      error_unauthorized: "Sessie beëindigd. Log opnieuw in.",
      logout_confirm: "Weet je zeker dat je wilt uitloggen?",
      footer_rights: "Alle rechten voorbehouden.",
      common_required: "Verplicht"
    },
    ja: {
      _name: "日本語",
      nav_dashboard: "ダッシュボード",
      nav_profile: "アカウント詳細",
      nav_statement: "アカウント概要",
      nav_stocks: "株式・トレード",
      actions_transfer: "銀行振込",
      nav_international: "銀行振込",
      nav_transferHistory: "送金履歴",
      nav_card: "ATMカード",
      nav_pin: "取引暗証番号",
      nav_password: "アカウントパスワード",
      nav_logout: "ログアウト",
      nav_kyc: "本人確認",
      hero_welcome: "ようこそ",
      hero_balance: "利用可能残高",
      hero_accountNo: "口座番号",
      hero_status: "ステータス",
      hero_viewDetails: "詳細を見る",
      hero_viewStatement: "明細書",
      actions_more: "クイック操作",
      actions_deposit: "入金",
      actions_withdraw: "出金",
      actions_bills: "料金の支払い",
      actions_card: "カード",
      actions_loan: "ローン",
      actions_invest: "投資",
      actions_support: "サポート",
      recent_title: "最近の取引",
      recent_viewAll: "すべて見る",
      recent_empty: "取引はまだありません",
      status_ACTIVE: "アクティブ",
      status_PENDING: "保留中",
      status_PROCESSING: "処理中",
      status_COMPLETED: "完了",
      status_FAILED: "失敗",
      status_SUSPENDED: "停止",
      th_title: "送金履歴",
      st_title: "口座明細",
      intl_title: "銀行振込",
      profile_title: "プロフィール",
      pin_title: "取引暗証番号",
      pw_title: "アカウントパスワード",
      card_title: "マイカード",
      mk_title: "市場",
      mk_watchlist: "ウォッチリスト",
      stocks_title: "株式",
      kyc_title: "プロフィール / KYC を完了",
      kyc_subtitle: "言語設定と全機能を有効にするため、アカウント認証を行ってください。",
      kyc_required_warning: "この手続きは必須です。完了するまでアカウントはご利用になれません。",
      kyc_firstname: "名",
      kyc_lastname: "姓",
      kyc_country: "国",
      kyc_language: "優先言語",
      kyc_gender: "性別",
      kyc_gender_male: "男性",
      kyc_gender_female: "女性",
      kyc_gender_other: "その他",
      kyc_gender_prefernotsay: "答えない",
      kyc_dob: "生年月日",
      kyc_nationality: "国籍",
      kyc_occupation: "職業",
      kyc_address: "住所",
      kyc_city: "市区町村",
      kyc_state: "都道府県/州",
      kyc_zip: "郵便番号",
      kyc_submit: "設定を完了",
      kyc_success: "KYC が完了しました。言語が切り替わりました。",
      search: "検索…",
      save: "保存",
      cancel: "キャンセル",
      close: "閉じる",
      copy: "コピー",
      copied: "コピーしました!",
      submit: "送信",
      continue: "続ける",
      error_generic: "エラーが発生しました。もう一度お試しください。",
      error_unauthorized: "セッションが期限切れです。再度ログインしてください。",
      logout_confirm: "ログアウトしてもよろしいですか?",
      footer_rights: "全著作権所有。",
      common_required: "必須"
    },
    ko: {
      _name: "한국어",
      nav_dashboard: "대시보드",
      nav_profile: "계정 세부 정보",
      nav_statement: "계정 요약",
      nav_stocks: "주식 및 거래",
      actions_transfer: "은행 이체",
      nav_international: "은행 이체",
      nav_transferHistory: "이체 기록",
      nav_card: "ATM 카드",
      nav_pin: "거래 비밀번호",
      nav_password: "계정 비밀번호",
      nav_logout: "로그아웃",
      nav_kyc: "KYC",
      hero_welcome: "환영합니다",
      hero_balance: "사용 가능한 잔액",
      hero_accountNo: "계좌 번호",
      hero_status: "상태",
      hero_viewDetails: "자세히 보기",
      hero_viewStatement: "명세서",
      actions_more: "빠른 작업",
      actions_deposit: "입금",
      actions_withdraw: "출금",
      actions_bills: "청구서",
      actions_card: "카드",
      actions_loan: "대출",
      actions_invest: "투자",
      actions_support: "지원",
      recent_title: "최근 거래",
      recent_viewAll: "모두 보기",
      recent_empty: "거래 내역이 없습니다",
      status_ACTIVE: "활성",
      status_PENDING: "대기 중",
      status_PROCESSING: "처리 중",
      status_COMPLETED: "완료",
      status_FAILED: "실패",
      status_SUSPENDED: "정지",
      th_title: "이체 기록",
      st_title: "계좌 명세서",
      intl_title: "은행 이체",
      profile_title: "내 프로필",
      pin_title: "거래 PIN",
      pw_title: "계정 비밀번호",
      card_title: "내 카드",
      mk_title: "시장",
      mk_watchlist: "관심 목록",
      stocks_title: "주식",
      kyc_title: "프로필 / KYC 완료",
      kyc_subtitle: "선호 언어 및 모든 기능을 활성화하려면 계정을 인증하세요.",
      kyc_required_warning: "이 단계는 필수입니다. 완료 전까지 계정을 사용할 수 없습니다.",
      kyc_firstname: "이름",
      kyc_lastname: "성",
      kyc_country: "국가",
      kyc_language: "선호 언어",
      kyc_gender: "성별",
      kyc_gender_male: "남성",
      kyc_gender_female: "여성",
      kyc_gender_other: "기타",
      kyc_gender_prefernotsay: "밝히지 않음",
      kyc_dob: "생년월일",
      kyc_nationality: "국적",
      kyc_occupation: "직업",
      kyc_address: "주소",
      kyc_city: "도시",
      kyc_state: "시/도",
      kyc_zip: "우편 번호",
      kyc_submit: "설정 완료",
      kyc_success: "KYC가 완료되었습니다. 언어가 업데이트되었습니다.",
      search: "검색…",
      save: "저장",
      cancel: "취소",
      close: "닫기",
      copy: "복사",
      copied: "복사됨!",
      submit: "제출",
      continue: "계속",
      error_generic: "오류가 발생했습니다. 다시 시도해 주세요.",
      error_unauthorized: "세션이 종료되었습니다. 다시 로그인해 주세요.",
      logout_confirm: "로그아웃하시겠습니까?",
      footer_rights: "모든 권리 보유.",
      common_required: "필수"
    },
    hi: {
      _name: "हिन्दी",
      nav_dashboard: "डैशबोर्ड",
      nav_profile: "खाता विवरण",
      nav_statement: "खाता सारांश",
      nav_stocks: "स्टॉक और ट्रेडिंग",
      actions_transfer: "बैंक ट्रांसफर",
      nav_international: "बैंक ट्रांसफर",
      nav_transferHistory: "ट्रांसफर इतिहास",
      nav_card: "ATM कार्ड",
      nav_pin: "लेन-देन पिन",
      nav_password: "खाता पासवर्ड",
      nav_logout: "लॉग आउट",
      nav_kyc: "KYC",
      hero_welcome: "स्वागत है",
      hero_balance: "उपलब्ध शेष",
      hero_accountNo: "खाता संख्या",
      hero_status: "स्थिति",
      hero_viewDetails: "विवरण देखें",
      hero_viewStatement: "स्टेटमेंट",
      actions_more: "त्वरित कार्य",
      actions_deposit: "जमा",
      actions_withdraw: "निकासी",
      actions_bills: "बिल",
      actions_card: "कार्ड",
      actions_loan: "ऋण",
      actions_invest: "निवेश",
      actions_support: "सहायता",
      recent_title: "हाल के लेन-देन",
      recent_viewAll: "सभी देखें",
      recent_empty: "अभी कोई लेन-देन नहीं",
      status_ACTIVE: "सक्रिय",
      status_PENDING: "लंबित",
      status_PROCESSING: "प्रोसेसिंग",
      status_COMPLETED: "पूर्ण",
      status_FAILED: "असफल",
      status_SUSPENDED: "निलंबित",
      th_title: "ट्रांसफर इतिहास",
      st_title: "खाता स्टेटमेंट",
      intl_title: "बैंक ट्रांसफर",
      profile_title: "मेरी प्रोफ़ाइल",
      pin_title: "लेन-देन पिन",
      pw_title: "खाता पासवर्ड",
      card_title: "मेरा कार्ड",
      mk_title: "बाज़ार",
      mk_watchlist: "वॉचलिस्ट",
      stocks_title: "स्टॉक",
      kyc_title: "अपनी प्रोफ़ाइल / KYC पूर्ण करें",
      kyc_subtitle: "अपनी पसंदीदा भाषा और सभी सुविधाओं को सक्षम करने के लिए अपने खाते को सत्यापित करें।",
      kyc_required_warning: "यह कदम अनिवार्य है। पूरा होने तक आप खाता उपयोग नहीं कर पाएंगे।",
      kyc_firstname: "पहला नाम",
      kyc_lastname: "अंतिम नाम",
      kyc_country: "देश",
      kyc_language: "पसंदीदा भाषा",
      kyc_gender: "लिंग",
      kyc_gender_male: "पुरुष",
      kyc_gender_female: "महिला",
      kyc_gender_other: "अन्य",
      kyc_gender_prefernotsay: "नहीं बताना पसंद करेंगे",
      kyc_dob: "जन्म तिथि",
      kyc_nationality: "राष्ट्रीयता",
      kyc_occupation: "पेशा",
      kyc_address: "पता",
      kyc_city: "शहर",
      kyc_state: "राज्य",
      kyc_zip: "पिन कोड",
      kyc_submit: "सेटअप पूरा करें",
      kyc_success: "KYC पूर्ण हुआ। आपकी भाषा अपडेट कर दी गई है।",
      search: "खोजें…",
      save: "सहेजें",
      cancel: "रद्द करें",
      close: "बंद करें",
      copy: "कॉपी करें",
      copied: "कॉपी हो गया!",
      submit: "जमा करें",
      continue: "जारी रखें",
      error_generic: "कोई त्रुटि आई। कृपया पुनः प्रयास करें।",
      error_unauthorized: "सत्र समाप्त हो गया। कृपया फिर से लॉग इन करें।",
      logout_confirm: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
      footer_rights: "सर्वाधिकार सुरक्षित।",
      common_required: "अनिवार्य"
    },
    bn: {
      _name: "বাংলা",
      nav_dashboard: "ড্যাশবোর্ড",
      nav_profile: "অ্যাকাউন্ট বিবরণ",
      nav_statement: "অ্যাকাউন্ট সারাংশ",
      nav_stocks: "স্টক ও ট্রেডিং",
      actions_transfer: "ব্যাংক ট্রান্সফার",
      nav_international: "ব্যাংক ট্রান্সফার",
      nav_transferHistory: "ট্রান্সফার ইতিহাস",
      nav_card: "এটিএম কার্ড",
      nav_pin: "লেনদেন পিন",
      nav_password: "অ্যাকাউন্ট পাসওয়ার্ড",
      nav_logout: "লগআউট",
      nav_kyc: "কেওয়াইসি",
      hero_welcome: "স্বাগতম",
      hero_balance: "উপলব্ধ ব্যালেন্স",
      hero_accountNo: "অ্যাকাউন্ট নম্বর",
      hero_status: "অবস্থা",
      hero_viewDetails: "বিস্তারিত দেখুন",
      hero_viewStatement: "বিবৃতি",
      actions_more: "দ্রুত ক্রিয়া",
      actions_deposit: "ডিপোজিট",
      actions_withdraw: "উত্তোলন",
      actions_bills: "বিল",
      actions_card: "কার্ড",
      actions_loan: "ঋণ",
      actions_invest: "বিনিয়োগ",
      actions_support: "সহায়তা",
      recent_title: "সাম্প্রতিক লেনদেন",
      recent_viewAll: "সব দেখুন",
      recent_empty: "এখনো কোনো লেনদেন নেই",
      status_ACTIVE: "সক্রিয়",
      status_PENDING: "মুলতুবি",
      status_PROCESSING: "প্রক্রিয়াধীন",
      status_COMPLETED: "সম্পন্ন",
      status_FAILED: "ব্যর্থ",
      status_SUSPENDED: "স্থগিত",
      th_title: "ট্রান্সফার ইতিহাস",
      st_title: "অ্যাকাউন্ট স্টেটমেন্ট",
      intl_title: "ব্যাংক ট্রান্সফার",
      profile_title: "আমার প্রোফাইল",
      pin_title: "লেনদেন পিন",
      pw_title: "অ্যাকাউন্ট পাসওয়ার্ড",
      card_title: "আমার কার্ড",
      mk_title: "বাজার",
      mk_watchlist: "ওয়াচলিস্ট",
      stocks_title: "স্টক",
      kyc_title: "আপনার প্রোফাইল / KYC সম্পূর্ণ করুন",
      kyc_subtitle: "আপনার পছন্দের ভাষা এবং সমস্ত সুবিধা সক্রিয় করতে আপনার অ্যাকাউন্ট যাচাই করুন।",
      kyc_required_warning: "এই ধাপটি বাধ্যতামূলক। সম্পূর্ণ না হওয়া পর্যন্ত আপনি অ্যাকাউন্ট ব্যবহার করতে পারবেন না।",
      kyc_firstname: "প্রথম নাম",
      kyc_lastname: "শেষ নাম",
      kyc_country: "দেশ",
      kyc_language: "পছন্দের ভাষা",
      kyc_gender: "লিঙ্গ",
      kyc_gender_male: "পুরুষ",
      kyc_gender_female: "মহিলা",
      kyc_gender_other: "অন্যান্য",
      kyc_gender_prefernotsay: "বলতে চাই না",
      kyc_dob: "জন্ম তারিখ",
      kyc_nationality: "জাতীয়তা",
      kyc_occupation: "পেশা",
      kyc_address: "ঠিকানা",
      kyc_city: "শহর",
      kyc_state: "রাজ্য",
      kyc_zip: "জিপ কোড",
      kyc_submit: "সেটআপ সম্পূর্ণ করুন",
      kyc_success: "KYC সম্পন্ন। আপনার ভাষা আপডেট করা হয়েছে।",
      search: "অনুসন্ধান…",
      save: "সংরক্ষণ",
      cancel: "বাতিল",
      close: "বন্ধ",
      copy: "কপি",
      copied: "কপি হয়েছে!",
      submit: "জমা দিন",
      continue: "চালিয়ে যান",
      error_generic: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      error_unauthorized: "সেশন শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।",
      logout_confirm: "আপনি কি নিশ্চিত লগআউট করতে চান?",
      footer_rights: "সর্বস্বত্ব সংরক্ষিত।",
      common_required: "প্রয়োজন"
    },
    ur: {
      _name: "اردو",
      nav_dashboard: "ڈیش بورڈ",
      nav_profile: "اکاؤنٹ کی تفصیلات",
      nav_statement: "اکاؤنٹ کا خلاصہ",
      nav_stocks: "اسٹاک اور ٹریڈنگ",
      actions_transfer: "بینک ٹرانسفر",
      nav_international: "بینک ٹرانسفر",
      nav_transferHistory: "ٹرانسفر کی تاریخ",
      nav_card: "ATM کارڈ",
      nav_pin: "ٹرانزیکشن پن",
      nav_password: "اکاؤنٹ پاس ورڈ",
      nav_logout: "لاگ آؤٹ",
      nav_kyc: "KYC",
      hero_welcome: "خوش آمدید",
      hero_balance: "دستیاب بیلنس",
      hero_accountNo: "اکاؤنٹ نمبر",
      hero_status: "سٹیٹس",
      hero_viewDetails: "تفصیل دیکھیں",
      hero_viewStatement: "اسٹیٹمنٹ",
      actions_more: "فوری کارروائیاں",
      actions_deposit: "جمع",
      actions_withdraw: "نکالنا",
      actions_bills: "بل",
      actions_card: "کارڈ",
      actions_loan: "قرض",
      actions_invest: "سرمایہ کاری",
      actions_support: "مدد",
      recent_title: "حالیہ لین دین",
      recent_viewAll: "سب دیکھیں",
      recent_empty: "ابھی کوئی لین دین نہیں",
      status_ACTIVE: "فعال",
      status_PENDING: "زیر التواء",
      status_PROCESSING: "جاری ہے",
      status_COMPLETED: "مکمل",
      status_FAILED: "ناکام",
      status_SUSPENDED: "معطل",
      th_title: "ٹرانسفر کی تاریخ",
      st_title: "اکاؤنٹ اسٹیٹمنٹ",
      intl_title: "بینک ٹرانسفر",
      profile_title: "میرا پروفائل",
      pin_title: "ٹرانزیکشن پن",
      pw_title: "اکاؤنٹ پاس ورڈ",
      card_title: "میرا کارڈ",
      mk_title: "منڈی",
      mk_watchlist: "واچ لسٹ",
      stocks_title: "اسٹاک",
      kyc_title: "اپنا پروفائل / KYC مکمل کریں",
      kyc_subtitle: "اپنی پسندیدہ زبان اور تمام خصوصیات کو چالو کرنے کے لیے اپنے اکاؤنٹ کی تصدیق کریں۔",
      kyc_required_warning: "یہ قدم ضروری ہے۔ مکمل ہونے تک آپ اکاؤنٹ استعمال نہیں کر سکیں گے۔",
      kyc_firstname: "پہلا نام",
      kyc_lastname: "آخری نام",
      kyc_country: "ملک",
      kyc_language: "ترجیحی زبان",
      kyc_gender: "جنس",
      kyc_gender_male: "مرد",
      kyc_gender_female: "عورت",
      kyc_gender_other: "دیگر",
      kyc_gender_prefernotsay: "نہیں بتانا چاہوں گا",
      kyc_dob: "تاریخ پیدائش",
      kyc_nationality: "قومیت",
      kyc_occupation: "پیشہ",
      kyc_address: "پتہ",
      kyc_city: "شہر",
      kyc_state: "صوبہ",
      kyc_zip: "زپ کوڈ",
      kyc_submit: "سیٹ اپ مکمل کریں",
      kyc_success: "KYC مکمل ہو گیا۔ آپ کی زبان اپ ڈیٹ کر دی گئی ہے۔",
      search: "تلاش کریں…",
      save: "محفوظ کریں",
      cancel: "منسوخ کریں",
      close: "بند کریں",
      copy: "کاپی",
      copied: "کاپی ہو گیا!",
      submit: "جمع کروائیں",
      continue: "جاری رکھیں",
      error_generic: "کوئی خرابی پیش آئی۔ براہ کرم دوبارہ کوشش کریں۔",
      error_unauthorized: "سیشن ختم ہو گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔",
      logout_confirm: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
      footer_rights: "جملہ حقوق محفوظ ہیں۔",
      common_required: "ضروری"
    },
    tr: {
      _name: "Türkçe",
      nav_dashboard: "Gösterge Paneli",
      nav_profile: "Hesap Detayları",
      nav_statement: "Hesap Özeti",
      nav_stocks: "Hisse Senetleri ve Ticaret",
      actions_transfer: "Banka Transferi",
      nav_international: "Banka Transferi",
      nav_transferHistory: "Transfer Geçmişi",
      nav_card: "ATM Kartı",
      nav_pin: "İşlem PIN'i",
      nav_password: "Hesap Şifresi",
      nav_logout: "Çıkış Yap",
      nav_kyc: "KYC",
      hero_welcome: "Hoş geldiniz",
      hero_balance: "Kullanılabilir Bakiye",
      hero_accountNo: "Hesap Numarası",
      hero_status: "Durum",
      hero_viewDetails: "Detayları Gör",
      hero_viewStatement: "Ekstre",
      actions_more: "Hızlı İşlemler",
      actions_deposit: "Para Yatırma",
      actions_withdraw: "Para Çekme",
      actions_bills: "Faturalar",
      actions_card: "Kart",
      actions_loan: "Kredi",
      actions_invest: "Yatırım",
      actions_support: "Destek",
      recent_title: "Son İşlemler",
      recent_viewAll: "Tümünü Gör",
      recent_empty: "Henüz işlem yok",
      status_ACTIVE: "Aktif",
      status_PENDING: "Beklemede",
      status_PROCESSING: "İşleniyor",
      status_COMPLETED: "Tamamlandı",
      status_FAILED: "Başarısız",
      status_SUSPENDED: "Duraklatıldı",
      th_title: "Transfer Geçmişi",
      st_title: "Hesap Ekstresi",
      intl_title: "Banka Transferi",
      profile_title: "Profilim",
      pin_title: "İşlem PIN'i",
      pw_title: "Hesap Şifresi",
      card_title: "Kartım",
      mk_title: "Piyasalar",
      mk_watchlist: "İzleme Listesi",
      stocks_title: "Hisseler",
      kyc_title: "Profilinizi / KYC'nizi Tamamlayın",
      kyc_subtitle: "Tercih ettiğiniz dili ve tüm özellikleri etkinleştirmek için hesabınızı doğrulayın.",
      kyc_required_warning: "Bu adım zorunludur. Tamamlanmadan hesabı kullanamazsınız.",
      kyc_firstname: "Ad",
      kyc_lastname: "Soyad",
      kyc_country: "Ülke",
      kyc_language: "Tercih Edilen Dil",
      kyc_gender: "Cinsiyet",
      kyc_gender_male: "Erkek",
      kyc_gender_female: "Kadın",
      kyc_gender_other: "Diğer",
      kyc_gender_prefernotsay: "Belirtmek istemiyorum",
      kyc_dob: "Doğum Tarihi",
      kyc_nationality: "Uyruk",
      kyc_occupation: "Meslek",
      kyc_address: "Adres",
      kyc_city: "Şehir",
      kyc_state: "Eyalet/İl",
      kyc_zip: "Posta Kodu",
      kyc_submit: "Kurulumu Tamamla",
      kyc_success: "KYC tamamlandı. Diliniz güncellendi.",
      search: "Ara…",
      save: "Kaydet",
      cancel: "İptal",
      close: "Kapat",
      copy: "Kopyala",
      copied: "Kopyalandı!",
      submit: "Gönder",
      continue: "Devam Et",
      error_generic: "Bir hata oluştu. Lütfen tekrar deneyin.",
      error_unauthorized: "Oturum sona erdi. Lütfen tekrar giriş yapın.",
      logout_confirm: "Çıkış yapmak istediğinizden emin misiniz?",
      footer_rights: "Tüm hakları saklıdır.",
      common_required: "Zorunlu"
    },
    vi: {
      _name: "Tiếng Việt",
      nav_dashboard: "Bảng điều khiển",
      nav_profile: "Chi tiết tài khoản",
      nav_statement: "Tóm tắt tài khoản",
      nav_stocks: "Cổ phiếu và giao dịch",
      actions_transfer: "Chuyển khoản ngân hàng",
      nav_international: "Chuyển khoản ngân hàng",
      nav_transferHistory: "Lịch sử chuyển khoản",
      nav_card: "Thẻ ATM",
      nav_pin: "Mã PIN giao dịch",
      nav_password: "Mật khẩu tài khoản",
      nav_logout: "Đăng xuất",
      nav_kyc: "KYC",
      hero_welcome: "Chào mừng",
      hero_balance: "Số dư khả dụng",
      hero_accountNo: "Số tài khoản",
      hero_status: "Trạng thái",
      hero_viewDetails: "Xem chi tiết",
      hero_viewStatement: "Sao kê",
      actions_more: "Tác vụ nhanh",
      actions_deposit: "Nạp tiền",
      actions_withdraw: "Rút tiền",
      actions_bills: "Hóa đơn",
      actions_card: "Thẻ",
      actions_loan: "Khoản vay",
      actions_invest: "Đầu tư",
      actions_support: "Hỗ trợ",
      recent_title: "Giao dịch gần đây",
      recent_viewAll: "Xem tất cả",
      recent_empty: "Chưa có giao dịch",
      status_ACTIVE: "Hoạt động",
      status_PENDING: "Chờ xử lý",
      status_PROCESSING: "Đang xử lý",
      status_COMPLETED: "Hoàn thành",
      status_FAILED: "Thất bại",
      status_SUSPENDED: "Đình chỉ",
      th_title: "Lịch sử chuyển khoản",
      st_title: "Sao kê tài khoản",
      intl_title: "Chuyển khoản ngân hàng",
      profile_title: "Hồ sơ của tôi",
      pin_title: "Mã PIN giao dịch",
      pw_title: "Mật khẩu tài khoản",
      card_title: "Thẻ của tôi",
      mk_title: "Thị trường",
      mk_watchlist: "Danh sách theo dõi",
      stocks_title: "Cổ phiếu",
      kyc_title: "Hoàn thành Hồ sơ / KYC của bạn",
      kyc_subtitle: "Xác minh tài khoản để kích hoạt ngôn ngữ ưa thích và mọi tính năng.",
      kyc_required_warning: "Bước này là bắt buộc. Bạn sẽ không thể sử dụng tài khoản cho đến khi hoàn tất.",
      kyc_firstname: "Họ",
      kyc_lastname: "Tên",
      kyc_country: "Quốc gia",
      kyc_language: "Ngôn ngữ ưa thích",
      kyc_gender: "Giới tính",
      kyc_gender_male: "Nam",
      kyc_gender_female: "Nữ",
      kyc_gender_other: "Khác",
      kyc_gender_prefernotsay: "Không muốn tiết lộ",
      kyc_dob: "Ngày sinh",
      kyc_nationality: "Quốc tịch",
      kyc_occupation: "Nghề nghiệp",
      kyc_address: "Địa chỉ",
      kyc_city: "Thành phố",
      kyc_state: "Tỉnh/Thành phố",
      kyc_zip: "Mã bưu chính",
      kyc_submit: "Hoàn tất cài đặt",
      kyc_success: "Đã hoàn thành KYC. Ngôn ngữ đã được cập nhật.",
      search: "Tìm kiếm…",
      save: "Lưu",
      cancel: "Hủy",
      close: "Đóng",
      copy: "Sao chép",
      copied: "Đã sao chép!",
      submit: "Gửi",
      continue: "Tiếp tục",
      error_generic: "Đã xảy ra lỗi. Vui lòng thử lại.",
      error_unauthorized: "Phiên đã hết hạn. Vui lòng đăng nhập lại.",
      logout_confirm: "Bạn có chắc chắn muốn đăng xuất không?",
      footer_rights: "Bản quyền đã được bảo hộ.",
      common_required: "Bắt buộc"
    },
    th: {
      _name: "ไทย",
      nav_dashboard: "แดชบอร์ด",
      nav_profile: "รายละเอียดบัญชี",
      nav_statement: "สรุปบัญชี",
      nav_stocks: "หุ้นและการซื้อขาย",
      actions_transfer: "โอนเงินผ่านธนาคาร",
      nav_international: "โอนเงินผ่านธนาคาร",
      nav_transferHistory: "ประวัติการโอน",
      nav_card: "บัตร ATM",
      nav_pin: "PIN ทำรายการ",
      nav_password: "รหัสผ่านบัญชี",
      nav_logout: "ออกจากระบบ",
      nav_kyc: "KYC",
      hero_welcome: "ยินดีต้อนรับ",
      hero_balance: "ยอดคงเหลือที่ใช้ได้",
      hero_accountNo: "เลขที่บัญชี",
      hero_status: "สถานะ",
      hero_viewDetails: "ดูรายละเอียด",
      hero_viewStatement: "ใบแจ้งยอด",
      actions_more: "การดำเนินการด่วน",
      actions_deposit: "ฝาก",
      actions_withdraw: "ถอน",
      actions_bills: "บิล",
      actions_card: "บัตร",
      actions_loan: "สินเชื่อ",
      actions_invest: "ลงทุน",
      actions_support: "สนับสนุน",
      recent_title: "รายการล่าสุด",
      recent_viewAll: "ดูทั้งหมด",
      recent_empty: "ยังไม่มีรายการ",
      status_ACTIVE: "ใช้งาน",
      status_PENDING: "รอดำเนินการ",
      status_PROCESSING: "กำลังดำเนินการ",
      status_COMPLETED: "เสร็จสมบูรณ์",
      status_FAILED: "ล้มเหลว",
      status_SUSPENDED: "ระงับ",
      th_title: "ประวัติการโอน",
      st_title: "รายการเดินบัญชี",
      intl_title: "โอนเงินผ่านธนาคาร",
      profile_title: "โปรไฟล์ของฉัน",
      pin_title: "PIN ทำรายการ",
      pw_title: "รหัสผ่านบัญชี",
      card_title: "บัตรของฉัน",
      mk_title: "ตลาด",
      mk_watchlist: "รายการเฝ้าดู",
      stocks_title: "หุ้น",
      kyc_title: "เสร็จสิ้นโปรไฟล์ / KYC ของคุณ",
      kyc_subtitle: "ยืนยันบัญชีเพื่อเปิดใช้งานภาษาที่คุณต้องการและคุณสมบัติทั้งหมด",
      kyc_required_warning: "ขั้นตอนนี้จำเป็น คุณจะไม่สามารถใช้บัญชีได้จนกว่าจะเสร็จสิ้น",
      kyc_firstname: "ชื่อ",
      kyc_lastname: "นามสกุล",
      kyc_country: "ประเทศ",
      kyc_language: "ภาษาที่ต้องการ",
      kyc_gender: "เพศ",
      kyc_gender_male: "ชาย",
      kyc_gender_female: "หญิง",
      kyc_gender_other: "อื่นๆ",
      kyc_gender_prefernotsay: "ไม่ต้องการระบุ",
      kyc_dob: "วันเกิด",
      kyc_nationality: "สัญชาติ",
      kyc_occupation: "อาชีพ",
      kyc_address: "ที่อยู่",
      kyc_city: "เมือง",
      kyc_state: "จังหวัด",
      kyc_zip: "รหัสไปรษณีย์",
      kyc_submit: "เสร็จสิ้นการตั้งค่า",
      kyc_success: "เสร็จสิ้น KYC แล้ว ได้อัปเดตภาษาเรียบร้อย",
      search: "ค้นหา…",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      copy: "คัดลอก",
      copied: "คัดลอกแล้ว!",
      submit: "ส่ง",
      continue: "ดำเนินการต่อ",
      error_generic: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
      error_unauthorized: "เซสชันสิ้นสุดแล้ว กรุณาเข้าสู่ระบบอีกครั้ง",
      logout_confirm: "คุณแน่ใจว่าต้องการออกจากระบบหรือไม่?",
      footer_rights: "สงวนลิขสิทธิ์",
      common_required: "จำเป็น"
    },
    id: {
      _name: "Bahasa Indonesia",
      nav_dashboard: "Dasbor",
      nav_profile: "Detail Rekening",
      nav_statement: "Ringkasan Rekening",
      nav_stocks: "Saham dan Perdagangan",
      actions_transfer: "Transfer Bank",
      nav_international: "Transfer Bank",
      nav_transferHistory: "Riwayat Transfer",
      nav_card: "Kartu ATM",
      nav_pin: "PIN Transaksi",
      nav_password: "Kata Sandi Akun",
      nav_logout: "Keluar",
      nav_kyc: "KYC",
      hero_welcome: "Selamat datang",
      hero_balance: "Saldo Tersedia",
      hero_accountNo: "Nomor Rekening",
      hero_status: "Status",
      hero_viewDetails: "Lihat Detail",
      hero_viewStatement: "Laporan",
      actions_more: "Tindakan Cepat",
      actions_deposit: "Setoran",
      actions_withdraw: "Tarik Tunai",
      actions_bills: "Tagihan",
      actions_card: "Kartu",
      actions_loan: "Pinjaman",
      actions_invest: "Investasi",
      actions_support: "Bantuan",
      recent_title: "Transaksi Terbaru",
      recent_viewAll: "Lihat Semua",
      recent_empty: "Belum ada transaksi",
      status_ACTIVE: "Aktif",
      status_PENDING: "Tertunda",
      status_PROCESSING: "Diproses",
      status_COMPLETED: "Selesai",
      status_FAILED: "Gagal",
      status_SUSPENDED: "Ditangguhkan",
      th_title: "Riwayat Transfer",
      st_title: "Laporan Rekening",
      intl_title: "Transfer Internasional",
      profile_title: "Profil Saya",
      pin_title: "PIN Transaksi",
      pw_title: "Kata Sandi Akun",
      card_title: "Kartu Saya",
      mk_title: "Pasar",
      mk_watchlist: "Daftar Pantauan",
      stocks_title: "Saham",
      kyc_title: "Lengkapi Profil / KYC Anda",
      kyc_subtitle: "Verifikasi akun untuk mengaktifkan bahasa pilihan dan semua fitur.",
      kyc_required_warning: "Langkah ini wajib. Anda tidak dapat menggunakan akun sebelum selesai.",
      kyc_firstname: "Nama Depan",
      kyc_lastname: "Nama Belakang",
      kyc_country: "Negara",
      kyc_language: "Bahasa Pilihan",
      kyc_gender: "Jenis Kelamin",
      kyc_gender_male: "Laki-laki",
      kyc_gender_female: "Perempuan",
      kyc_gender_other: "Lainnya",
      kyc_gender_prefernotsay: "Tidak ingin memberi tahu",
      kyc_dob: "Tanggal Lahir",
      kyc_nationality: "Kewarganegaraan",
      kyc_occupation: "Pekerjaan",
      kyc_address: "Alamat",
      kyc_city: "Kota",
      kyc_state: "Provinsi",
      kyc_zip: "Kode Pos",
      kyc_submit: "Selesaikan Pengaturan",
      kyc_success: "KYC selesai. Bahasa Anda telah diperbarui.",
      search: "Cari…",
      save: "Simpan",
      cancel: "Batal",
      close: "Tutup",
      copy: "Salin",
      copied: "Disalin!",
      submit: "Kirim",
      continue: "Lanjutkan",
      error_generic: "Terjadi kesalahan. Silakan coba lagi.",
      error_unauthorized: "Sesi berakhir. Silakan masuk kembali.",
      logout_confirm: "Anda yakin ingin keluar?",
      footer_rights: "Hak cipta dilindungi.",
      common_required: "Wajib"
    },
    ms: {
      _name: "Bahasa Melayu",
      nav_dashboard: "Papan Pemuka",
      nav_profile: "Butiran Akaun",
      nav_statement: "Ringkasan Akaun",
      nav_stocks: "Saham dan Dagangan",
      actions_transfer: "Pemindahan Tempatan",
      nav_international: "Pemindahan Antarabangsa",
      nav_transferHistory: "Sejarah Pemindahan",
      nav_card: "Kad ATM",
      nav_pin: "PIN Transaksi",
      nav_password: "Kata Laluan Akaun",
      nav_logout: "Log Keluar",
      nav_kyc: "KYC",
      hero_welcome: "Selamat datang",
      hero_balance: "Baki Tersedia",
      hero_accountNo: "Nombor Akaun",
      hero_status: "Status",
      hero_viewDetails: "Lihat Butiran",
      hero_viewStatement: "Penyata",
      actions_more: "Tindakan Pantas",
      actions_deposit: "Deposit",
      actions_withdraw: "Pengeluaran",
      actions_bills: "Bil",
      actions_card: "Kad",
      actions_loan: "Pinjaman",
      actions_invest: "Pelaburan",
      actions_support: "Sokongan",
      recent_title: "Transaksi Terkini",
      recent_viewAll: "Lihat Semua",
      recent_empty: "Tiada transaksi lagi",
      status_ACTIVE: "Aktif",
      status_PENDING: "Menunggu",
      status_PROCESSING: "Memproses",
      status_COMPLETED: "Selesai",
      status_FAILED: "Gagal",
      status_SUSPENDED: "Digantung",
      th_title: "Sejarah Pemindahan",
      st_title: "Penyata Akaun",
      intl_title: "Pemindahan Antarabangsa",
      profile_title: "Profil Saya",
      pin_title: "PIN Transaksi",
      pw_title: "Kata Laluan Akaun",
      card_title: "Kad Saya",
      mk_title: "Pasaran",
      mk_watchlist: "Senarai Pantau",
      stocks_title: "Saham",
      kyc_title: "Lengkapkan Profil / KYC Anda",
      kyc_subtitle: "Sahkan akaun untuk mendayakan bahasa pilihan dan semua ciri.",
      kyc_required_warning: "Langkah ini wajib. Anda tidak boleh menggunakan akaun sehingga selesai.",
      kyc_firstname: "Nama Pertama",
      kyc_lastname: "Nama Terakhir",
      kyc_country: "Negara",
      kyc_language: "Bahasa Pilihan",
      kyc_gender: "Jantina",
      kyc_gender_male: "Lelaki",
      kyc_gender_female: "Perempuan",
      kyc_gender_other: "Lain",
      kyc_gender_prefernotsay: "Tidak mahu memberitahu",
      kyc_dob: "Tarikh Lahir",
      kyc_nationality: "Warganegara",
      kyc_occupation: "Pekerjaan",
      kyc_address: "Alamat",
      kyc_city: "Bandar",
      kyc_state: "Negeri",
      kyc_zip: "Poskod",
      kyc_submit: "Selesaikan Persediaan",
      kyc_success: "KYC selesai. Bahasa anda telah dikemas kini.",
      search: "Cari…",
      save: "Simpan",
      cancel: "Batal",
      close: "Tutup",
      copy: "Salin",
      copied: "Disalin!",
      submit: "Hantar",
      continue: "Teruskan",
      error_generic: "Ralat berlaku. Sila cuba lagi.",
      error_unauthorized: "Sesi tamat. Sila log masuk semula.",
      logout_confirm: "Adakah anda pasti mahu log keluar?",
      footer_rights: "Hak cipta terpelihara.",
      common_required: "Wajib"
    },
    uk: {
      _name: "Українська",
      nav_dashboard: "Панель керування",
      nav_profile: "Деталі рахунку",
      nav_statement: "Підсумок рахунку",
      nav_stocks: "Акції та торгівля",
      actions_transfer: "Банківський переказ",
      nav_international: "Банківський переказ",
      nav_transferHistory: "Історія переказів",
      nav_card: "ATM-карта",
      nav_pin: "PIN-код транзакції",
      nav_password: "Пароль від акаунту",
      nav_logout: "Вийти",
      nav_kyc: "KYC",
      hero_welcome: "Ласкаво просимо",
      hero_balance: "Доступний баланс",
      hero_accountNo: "Номер рахунку",
      hero_status: "Статус",
      hero_viewDetails: "Переглянути деталі",
      hero_viewStatement: "Звіт",
      actions_more: "Швидкі дії",
      actions_deposit: "Поповнення",
      actions_withdraw: "Зняття",
      actions_bills: "Рахунки",
      actions_card: "Карта",
      actions_loan: "Позика",
      actions_invest: "Інвестиції",
      actions_support: "Підтримка",
      recent_title: "Останні транзакції",
      recent_viewAll: "Переглянути всі",
      recent_empty: "Транзакцій ще немає",
      status_ACTIVE: "Активний",
      status_PENDING: "Очікує",
      status_PROCESSING: "Обробляється",
      status_COMPLETED: "Завершено",
      status_FAILED: "Не вдалося",
      status_SUSPENDED: "Призупинено",
      th_title: "Історія переказів",
      st_title: "Виписка з рахунку",
      intl_title: "Банківський переказ",
      profile_title: "Мій профіль",
      pin_title: "PIN транзакції",
      pw_title: "Пароль акаунту",
      card_title: "Моя карта",
      mk_title: "Ринки",
      mk_watchlist: "Список спостереження",
      stocks_title: "Акції",
      kyc_title: "Заповніть профіль / KYC",
      kyc_subtitle: "Підтвердіть акаунт, щоб увімкнути бажану мову та усі можливості.",
      kyc_required_warning: "Цей крок є обов'язковим. Ви не зможете використовувати акаунт до завершення.",
      kyc_firstname: "Ім'я",
      kyc_lastname: "Прізвище",
      kyc_country: "Країна",
      kyc_language: "Бажана мова",
      kyc_gender: "Стать",
      kyc_gender_male: "Чоловік",
      kyc_gender_female: "Жінка",
      kyc_gender_other: "Інше",
      kyc_gender_prefernotsay: "Не хочу вказувати",
      kyc_dob: "Дата народження",
      kyc_nationality: "Громадянство",
      kyc_occupation: "Професія",
      kyc_address: "Адреса",
      kyc_city: "Місто",
      kyc_state: "Область",
      kyc_zip: "Поштовий індекс",
      kyc_submit: "Завершити налаштування",
      kyc_success: "KYC завершено. Вашу мову оновлено.",
      search: "Пошук…",
      save: "Зберегти",
      cancel: "Скасувати",
      close: "Закрити",
      copy: "Копіювати",
      copied: "Скопійовано!",
      submit: "Надіслати",
      continue: "Продовжити",
      error_generic: "Виникла помилка. Спробуйте ще раз.",
      error_unauthorized: "Сесію завершено. Увійдіть ще раз.",
      logout_confirm: "Чи дійсно ви хочете вийти?",
      footer_rights: "Усі права захищені.",
      common_required: "Обов'язкове"
    },
    pl: {
      _name: "Polski",
      nav_dashboard: "Panel",
      nav_profile: "Szczegóły konta",
      nav_statement: "Podsumowanie konta",
      nav_stocks: "Akcje i handel",
      actions_transfer: "Przelew bankowy",
      nav_international: "Przelew bankowy",
      nav_transferHistory: "Historia przelewów",
      nav_card: "Karta ATM",
      nav_pin: "PIN transakcji",
      nav_password: "Hasło do konta",
      nav_logout: "Wyloguj",
      nav_kyc: "KYC",
      hero_welcome: "Witaj",
      hero_balance: "Dostępne saldo",
      hero_accountNo: "Numer konta",
      hero_status: "Status",
      hero_viewDetails: "Zobacz szczegóły",
      hero_viewStatement: "Wyciąg",
      actions_more: "Szybkie akcje",
      actions_deposit: "Wpłata",
      actions_withdraw: "Wypłata",
      actions_bills: "Rachunki",
      actions_card: "Karta",
      actions_loan: "Pożyczka",
      actions_invest: "Inwestycje",
      actions_support: "Wsparcie",
      recent_title: "Ostatnie transakcje",
      recent_viewAll: "Zobacz wszystkie",
      recent_empty: "Brak transakcji",
      status_ACTIVE: "Aktywne",
      status_PENDING: "Oczekujące",
      status_PROCESSING: "Przetwarzane",
      status_COMPLETED: "Zakończone",
      status_FAILED: "Nieudane",
      status_SUSPENDED: "Zawieszone",
      th_title: "Historia przelewów",
      st_title: "Wyciąg z konta",
      intl_title: "Przelew bankowy",
      profile_title: "Mój profil",
      pin_title: "PIN transakcji",
      pw_title: "Hasło do konta",
      card_title: "Moja karta",
      mk_title: "Rynki",
      mk_watchlist: "Lista obserwowanych",
      stocks_title: "Akcje",
      kyc_title: "Uzupełnij profil / KYC",
      kyc_subtitle: "Zweryfikuj konto, aby włączyć preferowany język i wszystkie funkcje.",
      kyc_required_warning: "Ten krok jest obowiązkowy. Nie będziesz mógł korzystać z konta, dopóki nie zostanie ukończony.",
      kyc_firstname: "Imię",
      kyc_lastname: "Nazwisko",
      kyc_country: "Kraj",
      kyc_language: "Preferowany język",
      kyc_gender: "Płeć",
      kyc_gender_male: "Mężczyzna",
      kyc_gender_female: "Kobieta",
      kyc_gender_other: "Inne",
      kyc_gender_prefernotsay: "Wolę nie podawać",
      kyc_dob: "Data urodzenia",
      kyc_nationality: "Obywatelstwo",
      kyc_occupation: "Zawód",
      kyc_address: "Adres",
      kyc_city: "Miasto",
      kyc_state: "Województwo / Stan",
      kyc_zip: "Kod pocztowy",
      kyc_submit: "Zakończ konfigurację",
      kyc_success: "KYC ukończone. Twój język został zaktualizowany.",
      search: "Szukaj…",
      save: "Zapisz",
      cancel: "Anuluj",
      close: "Zamknij",
      copy: "Kopiuj",
      copied: "Skopiowano!",
      submit: "Prześlij",
      continue: "Kontynuuj",
      error_generic: "Wystąpił błąd. Spróbuj ponownie.",
      error_unauthorized: "Sesja zakończona. Zaloguj się ponownie.",
      logout_confirm: "Czy na pewno chcesz się wylogować?",
      footer_rights: "Wszelkie prawa zastrzeżone.",
      common_required: "Wymagane"
    },
    sv: {
      _name: "Svenska",
      nav_dashboard: "Instrumentpanel",
      nav_profile: "Kontouppgifter",
      nav_statement: "Kontosammanfattning",
      nav_stocks: "Aktier och handel",
      actions_transfer: "Banköverföring",
      nav_international: "Banköverföring",
      nav_transferHistory: "Överföringshistorik",
      nav_card: "ATM-kort",
      nav_pin: "Transaktions-PIN",
      nav_password: "Kontolösenord",
      nav_logout: "Logga ut",
      nav_kyc: "KYC",
      hero_welcome: "Välkommen",
      hero_balance: "Tillgängligt saldo",
      hero_accountNo: "Kontonummer",
      hero_status: "Status",
      hero_viewDetails: "Visa detaljer",
      hero_viewStatement: "Utdrag",
      actions_more: "Snabbåtgärder",
      actions_deposit: "Insättning",
      actions_withdraw: "Uttag",
      actions_bills: "Räkningar",
      actions_card: "Kort",
      actions_loan: "Lån",
      actions_invest: "Investera",
      actions_support: "Support",
      recent_title: "Senaste transaktioner",
      recent_viewAll: "Visa alla",
      recent_empty: "Inga transaktioner ännu",
      status_ACTIVE: "Aktiv",
      status_PENDING: "Väntande",
      status_PROCESSING: "Bearbetas",
      status_COMPLETED: "Slutförd",
      status_FAILED: "Misslyckades",
      status_SUSPENDED: "Uppsatt",
      th_title: "Överföringshistorik",
      st_title: "Kontoutdrag",
      intl_title: "Banköverföring",
      profile_title: "Min profil",
      pin_title: "Transaktions-PIN",
      pw_title: "Kontolösenord",
      card_title: "Mitt kort",
      mk_title: "Marknader",
      mk_watchlist: "Bevakningslista",
      stocks_title: "Aktier",
      kyc_title: "Slutför din profil / KYC",
      kyc_subtitle: "Verifiera ditt konto för att aktivera ditt föredragna språk och alla funktioner.",
      kyc_required_warning: "Detta steg är obligatoriskt. Du kan inte använda kontot förrän det är klart.",
      kyc_firstname: "Förnamn",
      kyc_lastname: "Efternamn",
      kyc_country: "Land",
      kyc_language: "Föredraget språk",
      kyc_gender: "Kön",
      kyc_gender_male: "Man",
      kyc_gender_female: "Kvinna",
      kyc_gender_other: "Annat",
      kyc_gender_prefernotsay: "Vill inte uppge",
      kyc_dob: "Födelsedatum",
      kyc_nationality: "Medborgarskap",
      kyc_occupation: "Yrke",
      kyc_address: "Adress",
      kyc_city: "Stad",
      kyc_state: "Län / Stat",
      kyc_zip: "Postnummer",
      kyc_submit: "Slutför installationen",
      kyc_success: "KYC klart. Ditt språk har uppdaterats.",
      search: "Sök…",
      save: "Spara",
      cancel: "Avbryt",
      close: "Stäng",
      copy: "Kopiera",
      copied: "Kopierad!",
      submit: "Skicka",
      continue: "Fortsätt",
      error_generic: "Ett fel inträffade. Försök igen.",
      error_unauthorized: "Sessionen har upphört. Logga in igen.",
      logout_confirm: "Är du säker på att du vill logga ut?",
      footer_rights: "Alla rättigheter förbehållna.",
      common_required: "Obligatorisk"
    },
    da: {
      _name: "Dansk",
      nav_dashboard: "Dashboard",
      nav_profile: "Kontodetaljer",
      nav_statement: "Kontosammendrag",
      nav_stocks: "Aktier og handel",
      actions_transfer: "Bankoverførsel",
      nav_international: "Bankoverførsel",
      nav_transferHistory: "Overførselshistorik",
      nav_card: "ATM-kort",
      nav_pin: "Transaktions-PIN",
      nav_password: "Kontoadgangskode",
      nav_logout: "Log ud",
      nav_kyc: "KYC",
      hero_welcome: "Velkommen",
      hero_balance: "Tilgængelig saldo",
      hero_accountNo: "Kontonummer",
      hero_status: "Status",
      hero_viewDetails: "Se detaljer",
      hero_viewStatement: "Kontoudtog",
      actions_more: "Hurtige handlinger",
      actions_deposit: "Indbetaling",
      actions_withdraw: "Udbetaling",
      actions_bills: "Regninger",
      actions_card: "Kort",
      actions_loan: "Lån",
      actions_invest: "Investering",
      actions_support: "Support",
      recent_title: "Seneste transaktioner",
      recent_viewAll: "Se alle",
      recent_empty: "Ingen transaktioner endnu",
      status_ACTIVE: "Aktiv",
      status_PENDING: "Afventer",
      status_PROCESSING: "Behandles",
      status_COMPLETED: "Fuldført",
      status_FAILED: "Mislykkedes",
      status_SUSPENDED: "Suspenderet",
      th_title: "Overførselshistorik",
      st_title: "Kontoudtog",
      intl_title: "Bankoverførsel",
      profile_title: "Min profil",
      pin_title: "Transaktions-PIN",
      pw_title: "Kontoadgangskode",
      card_title: "Mit kort",
      mk_title: "Markeder",
      mk_watchlist: "Overvågningsliste",
      stocks_title: "Aktier",
      kyc_title: "Fuldfør din profil / KYC",
      kyc_subtitle: "Bekræft din konto for at aktivere dit foretrukne sprog og alle funktioner.",
      kyc_required_warning: "Dette trin er obligatorisk. Du kan ikke bruge din konto, før det er fuldført.",
      kyc_firstname: "Fornavn",
      kyc_lastname: "Efternavn",
      kyc_country: "Land",
      kyc_language: "Foretrukket sprog",
      kyc_gender: "Køn",
      kyc_gender_male: "Mand",
      kyc_gender_female: "Kvinde",
      kyc_gender_other: "Andet",
      kyc_gender_prefernotsay: "Vil ikke oplyse",
      kyc_dob: "Fødselsdato",
      kyc_nationality: "Nationalitet",
      kyc_occupation: "Erhverv",
      kyc_address: "Adresse",
      kyc_city: "By",
      kyc_state: "Stat / Region",
      kyc_zip: "Postnummer",
      kyc_submit: "Fuldfør opsætning",
      kyc_success: "KYC fuldført. Dit sprog er blevet opdateret.",
      search: "Søg…",
      save: "Gem",
      cancel: "Annullér",
      close: "Luk",
      copy: "Kopiér",
      copied: "Kopieret!",
      submit: "Indsend",
      continue: "Fortsæt",
      error_generic: "Der opstod en fejl. Prøv igen.",
      error_unauthorized: "Sessionen er udløbet. Log ind igen.",
      logout_confirm: "Er du sikker på, at du vil logge ud?",
      footer_rights: "Alle rettigheder forbeholdes.",
      common_required: "Påkrævet"
    },
    nb: {
      _name: "Norsk Bokmål",
      nav_dashboard: "Dashbord",
      nav_profile: "Kontodetaljer",
      nav_statement: "Kontooppsummering",
      nav_stocks: "Aksjer og trading",
      actions_transfer: "Bankoverføring",
      nav_international: "Bankoverføring",
      nav_transferHistory: "Overføringshistorikk",
      nav_card: "Bankkort",
      nav_pin: "Transaksjons-PIN",
      nav_password: "Konto passord",
      nav_logout: "Logg ut",
      nav_kyc: "KYC",
      hero_welcome: "Velkommen",
      hero_balance: "Tilgjengelig saldo",
      hero_accountNo: "Kontonummer",
      hero_status: "Status",
      hero_viewDetails: "Vis detaljer",
      hero_viewStatement: "Kontoutskrift",
      actions_more: "Hurtige handlinger",
      actions_deposit: "Innskudd",
      actions_withdraw: "Uttak",
      actions_bills: "Regninger",
      actions_card: "Kort",
      actions_loan: "Lån",
      actions_invest: "Investering",
      actions_support: "Støtte",
      recent_title: "Nylige transaksjoner",
      recent_viewAll: "Se alle",
      recent_empty: "Ingen transaksjoner ennå",
      status_ACTIVE: "Aktiv",
      status_PENDING: "Venter",
      status_PROCESSING: "Behandles",
      status_COMPLETED: "Fullført",
      status_FAILED: "Mislyktes",
      status_SUSPENDED: "Suspendert",
      th_title: "Overføringshistorikk",
      st_title: "Kontoutskrift",
      intl_title: "Bankoverføring",
      profile_title: "Min profil",
      pin_title: "Transaksjons-PIN",
      pw_title: "Konto passord",
      card_title: "Kortet mitt",
      mk_title: "Markeder",
      mk_watchlist: "Overvåkningsliste",
      stocks_title: "Aksjer",
      kyc_title: "Fullfør profilen din / KYC",
      kyc_subtitle: "Bekreft kontoen din for å aktivere ønsket språk og alle funksjoner.",
      kyc_required_warning: "Dette trinnet er påkrevd. Du kan ikke bruke kontoen før den er fullført.",
      kyc_firstname: "Fornavn",
      kyc_lastname: "Etternavn",
      kyc_country: "Land",
      kyc_language: "Foretrukket språk",
      kyc_gender: "Kjønn",
      kyc_gender_male: "Mann",
      kyc_gender_female: "Kvinne",
      kyc_gender_other: "Annet",
      kyc_gender_prefernotsay: "Vil ikke oppgi",
      kyc_dob: "Fødselsdato",
      kyc_nationality: "Nasjonalitet",
      kyc_occupation: "Yrke",
      kyc_address: "Adresse",
      kyc_city: "By",
      kyc_state: "Fylke",
      kyc_zip: "Postnummer",
      kyc_submit: "Fullfør oppsettet",
      kyc_success: "KYC fullført. Språket ditt er oppdatert.",
      search: "Søk…",
      save: "Lagre",
      cancel: "Avbryt",
      close: "Lukk",
      copy: "Kopier",
      copied: "Kopiert!",
      submit: "Send inn",
      continue: "Fortsett",
      error_generic: "En feil oppstod. Prøv igjen.",
      error_unauthorized: "Økten er utløpt. Logg på igjen.",
      logout_confirm: "Er du sikker på at du vil logge ut?",
      footer_rights: "Alle rettigheter forbeholdes.",
      common_required: "Påkrevd"
    },
    fi: {
      _name: "Suomi",
      nav_dashboard: "Kojelauta",
      nav_profile: "Tilin tiedot",
      nav_statement: "Tilin yhteenveto",
      nav_stocks: "Osakkeet ja kauppa",
      actions_transfer: "Pankkisiirto",
      nav_international: "Pankkisiirto",
      nav_transferHistory: "Siirtohistoria",
      nav_card: "ATM-kortti",
      nav_pin: "Tapahtuma-PIN",
      nav_password: "Tilin salasana",
      nav_logout: "Kirjaudu ulos",
      nav_kyc: "KYC",
      hero_welcome: "Tervetuloa",
      hero_balance: "Käytettävissä oleva saldo",
      hero_accountNo: "Tilinumero",
      hero_status: "Tila",
      hero_viewDetails: "Katso tiedot",
      hero_viewStatement: "Tiliote",
      actions_more: "Pikatoiminnot",
      actions_deposit: "Talletus",
      actions_withdraw: "Nosto",
      actions_bills: "Laskut",
      actions_card: "Kortti",
      actions_loan: "Laina",
      actions_invest: "Sijoitus",
      actions_support: "Tuki",
      recent_title: "Viimeisimmät tapahtumat",
      recent_viewAll: "Näytä kaikki",
      recent_empty: "Ei vielä tapahtumia",
      status_ACTIVE: "Aktiivinen",
      status_PENDING: "Odottaa",
      status_PROCESSING: "Käsitellään",
      status_COMPLETED: "Valmis",
      status_FAILED: "Epäonnistui",
      status_SUSPENDED: "Keskeytetty",
      th_title: "Siirtohistoria",
      st_title: "Tiliote",
      intl_title: "Pankkisiirto",
      profile_title: "Oma profiili",
      pin_title: "Tapahtuma-PIN",
      pw_title: "Tilin salasana",
      card_title: "Oma kortti",
      mk_title: "Markkinat",
      mk_watchlist: "Seurantalista",
      stocks_title: "Osakkeet",
      kyc_title: "Täytä profiili / KYC",
      kyc_subtitle: "Vahvista tilisi aktivoidaksesi haluamasi kieli ja kaikki ominaisuudet.",
      kyc_required_warning: "Tämä vaihe on pakollinen. Et voi käyttää tiliä, ennen kuin se on valmis.",
      kyc_firstname: "Etunimi",
      kyc_lastname: "Sukunimi",
      kyc_country: "Maa",
      kyc_language: "Ensisijainen kieli",
      kyc_gender: "Sukupuoli",
      kyc_gender_male: "Mies",
      kyc_gender_female: "Nainen",
      kyc_gender_other: "Muu",
      kyc_gender_prefernotsay: "En halua ilmoittaa",
      kyc_dob: "Syntymäpäivä",
      kyc_nationality: "Kansalaisuus",
      kyc_occupation: "Ammatti",
      kyc_address: "Osoite",
      kyc_city: "Kaupunki",
      kyc_state: "Maakunta",
      kyc_zip: "Postinumero",
      kyc_submit: "Viimeistele asennus",
      kyc_success: "KYC valmis. Kieli on päivitetty.",
      search: "Etsi…",
      save: "Tallenna",
      cancel: "Peruuta",
      close: "Sulje",
      copy: "Kopioi",
      copied: "Kopioitu!",
      submit: "Lähetä",
      continue: "Jatka",
      error_generic: "Tapahtui virhe. Yritä uudelleen.",
      error_unauthorized: "Istunto on päättynyt. Kirjaudu uudelleen.",
      logout_confirm: "Haluatko varmasti kirjautua ulos?",
      footer_rights: "Kaikki oikeudet pidätetään.",
      common_required: "Pakollinen"
    },
    cs: {
      _name: "Čeština",
      nav_dashboard: "Přehled",
      nav_profile: "Detaily účtu",
      nav_statement: "Shrnutí účtu",
      nav_stocks: "Akcie a obchodování",
      actions_transfer: "Bankovní převod",
      nav_international: "Bankovní převod",
      nav_transferHistory: "Historie převodů",
      nav_card: "Bankomat karta",
      nav_pin: "Transakční PIN",
      nav_password: "Heslo k účtu",
      nav_logout: "Odhlásit se",
      nav_kyc: "KYC",
      hero_welcome: "Vítejte",
      hero_balance: "Dostupný zůstatek",
      hero_accountNo: "Číslo účtu",
      hero_status: "Stav",
      hero_viewDetails: "Zobrazit podrobnosti",
      hero_viewStatement: "Výpis",
      actions_more: "Rychlé akce",
      actions_deposit: "Vklad",
      actions_withdraw: "Výběr",
      actions_bills: "Faktury",
      actions_card: "Karta",
      actions_loan: "Půjčka",
      actions_invest: "Investice",
      actions_support: "Podpora",
      recent_title: "Nedávné transakce",
      recent_viewAll: "Zobrazit vše",
      recent_empty: "Zatím žádné transakce",
      status_ACTIVE: "Aktivní",
      status_PENDING: "Čeká na vyřízení",
      status_PROCESSING: "Zpracovává se",
      status_COMPLETED: "Dokončeno",
      status_FAILED: "Selhalo",
      status_SUSPENDED: "Pozastaveno",
      th_title: "Historie převodů",
      st_title: "Výpis z účtu",
      intl_title: "Bankovní převod",
      profile_title: "Můj profil",
      pin_title: "Transakční PIN",
      pw_title: "Heslo k účtu",
      card_title: "Moje karta",
      mk_title: "Trhy",
      mk_watchlist: "Sledované",
      stocks_title: "Akcie",
      kyc_title: "Dokončete profil / KYC",
      kyc_subtitle: "Ověřte si účet, abyste aktivovali preferovaný jazyk a všechny funkce.",
      kyc_required_warning: "Tento krok je povinný. Dokud nebude dokončen, účet nemůžete používat.",
      kyc_firstname: "Křestní jméno",
      kyc_lastname: "Příjmení",
      kyc_country: "Země",
      kyc_language: "Preferovaný jazyk",
      kyc_gender: "Pohlaví",
      kyc_gender_male: "Muž",
      kyc_gender_female: "Žena",
      kyc_gender_other: "Jiné",
      kyc_gender_prefernotsay: "Nechci sdílet",
      kyc_dob: "Datum narození",
      kyc_nationality: "Státní příslušnost",
      kyc_occupation: "Povolání",
      kyc_address: "Adresa",
      kyc_city: "Město",
      kyc_state: "Kraj / Stát",
      kyc_zip: "PSČ",
      kyc_submit: "Dokončit nastavení",
      kyc_success: "KYC dokončeno. Váš jazyk byl aktualizován.",
      search: "Hledat…",
      save: "Uložit",
      cancel: "Zrušit",
      close: "Zavřít",
      copy: "Kopírovat",
      copied: "Zkopírováno!",
      submit: "Odeslat",
      continue: "Pokračovat",
      error_generic: "Došlo k chybě. Zkuste to prosím znovu.",
      error_unauthorized: "Relace vypršela. Přihlaste se znovu.",
      logout_confirm: "Opravdu se chcete odhlásit?",
      footer_rights: "Všechna práva vyhrazena.",
      common_required: "Povinné"
    },
    he: {
      _name: "עברית",
      nav_dashboard: "לוח בקרה",
      nav_profile: "פרטי חשבון",
      nav_statement: "תקציר חשבון",
      nav_stocks: "מניות ומסחר",
      actions_transfer: "העברה בנקאית",
      nav_international: "העברה בנקאית",
      nav_transferHistory: "היסטוריית העברות",
      nav_card: "כרטיס אשראי",
      nav_pin: "PIN לעיסקה",
      nav_password: "סיסמה לחשבון",
      nav_logout: "יציאה",
      nav_kyc: "KYC",
      hero_welcome: "ברוכים הבאים",
      hero_balance: "יתרה זמינה",
      hero_accountNo: "מספר חשבון",
      hero_status: "סטטוס",
      hero_viewDetails: "הצג פרטים",
      hero_viewStatement: "חשבון",
      actions_more: "פעולות מהירות",
      actions_deposit: "הפקדה",
      actions_withdraw: "משיכה",
      actions_bills: "חשבונות",
      actions_card: "כרטיס",
      actions_loan: "הלוואה",
      actions_invest: "השקעה",
      actions_support: "תמיכה",
      recent_title: "עיסקאות אחרונות",
      recent_viewAll: "הצג הכל",
      recent_empty: "אין עדיין עיסקאות",
      status_ACTIVE: "פעיל",
      status_PENDING: "ממתין",
      status_PROCESSING: "בעיבוד",
      status_COMPLETED: "הושלם",
      status_FAILED: "נכשל",
      status_SUSPENDED: "מושעה",
      th_title: "היסטוריית העברות",
      st_title: "חשבון בנק",
      intl_title: "העברה בנקאית",
      profile_title: "הפרופיל שלי",
      pin_title: "PIN לעיסקה",
      pw_title: "סיסמה לחשבון",
      card_title: "הכרטיס שלי",
      mk_title: "שווקים",
      mk_watchlist: "רשימת מעקב",
      stocks_title: "מניות",
      kyc_title: "השלם את הפרופיל / KYC שלך",
      kyc_subtitle: "אמת את החשבון שלך כדי להפעיל את השפה המועדפת ואת כל התכונות.",
      kyc_required_warning: "שלב זה הוא חובה. לא תוכל להשתמש בחשבון עד להשלמתו.",
      kyc_firstname: "שם פרטי",
      kyc_lastname: "שם משפחה",
      kyc_country: "מדינה",
      kyc_language: "שפה מועדפת",
      kyc_gender: "מגדר",
      kyc_gender_male: "גבר",
      kyc_gender_female: "אישה",
      kyc_gender_other: "אחר",
      kyc_gender_prefernotsay: "איני רוצה למסור",
      kyc_dob: "תאריך לידה",
      kyc_nationality: "אזרחות",
      kyc_occupation: "מקצוע",
      kyc_address: "כתובת",
      kyc_city: "עיר",
      kyc_state: "מחוז / מדינה",
      kyc_zip: "מיקוד",
      kyc_submit: "השלם הגדרה",
      kyc_success: "KYC הושלם. השפה שלך עודכנה.",
      search: "חיפוש…",
      save: "שמור",
      cancel: "ביטול",
      close: "סגור",
      copy: "העתק",
      copied: "הועתק!",
      submit: "שלח",
      continue: "המשך",
      error_generic: "אירעה שגיאה. נסה שוב.",
      error_unauthorized: "הפגרת הסתיים נגמרה. היכנס שוב.",
      logout_confirm: "האם אתה בטוח שברצונך לצאת?",
      footer_rights: "כל הזכויות שמורות.",
      common_required: "נדרש"
    },
    fa: {
      _name: "فارسی",
      nav_dashboard: "داشبورد",
      nav_profile: "جزئیات حساب",
      nav_statement: "خلاصه حساب",
      nav_stocks: "سهام و معاملات",
      actions_transfer: "انتقال بانکی",
      nav_international: "انتقال بانکی",
      nav_transferHistory: "تاریخچه انتقال",
      nav_card: "کارت ATM",
      nav_pin: "PIN تراکنش",
      nav_password: "رمز عبور حساب",
      nav_logout: "خروج",
      nav_kyc: "احراز هویت",
      hero_welcome: "خوش آمدید",
      hero_balance: "موجودی در دسترس",
      hero_accountNo: "شماره حساب",
      hero_status: "وضعیت",
      hero_viewDetails: "مشاهده جزئیات",
      hero_viewStatement: "صورتحساب",
      actions_more: "اقدامات سریع",
      actions_deposit: "واریز",
      actions_withdraw: "برداشت",
      actions_bills: "قبض‌ها",
      actions_card: "کارت",
      actions_loan: "وام",
      actions_invest: "سرمایه‌گذاری",
      actions_support: "پشتیبانی",
      recent_title: "تراکنش‌های اخیر",
      recent_viewAll: "مشاهده همه",
      recent_empty: "هنوز تراکنشی وجود ندارد",
      status_ACTIVE: "فعال",
      status_PENDING: "در انتظار",
      status_PROCESSING: "در حال پردازش",
      status_COMPLETED: "تکمیل شده",
      status_FAILED: "ناموفق",
      status_SUSPENDED: "معلق",
      th_title: "تاریخچه انتقال",
      st_title: "صورتحساب حساب",
      intl_title: "انتقال بانکی",
      profile_title: "پروفایل من",
      pin_title: "PIN تراکنش",
      pw_title: "رمز عبور حساب",
      card_title: "کارت من",
      mk_title: "بازارها",
      mk_watchlist: "لیست پیگیری",
      stocks_title: "سهام",
      kyc_title: "پروفایل / احراز هویت خود را تکمیل کنید",
      kyc_subtitle: "برای فعال کردن زبان ترجیحی و همه ویژگی‌ها، حساب خود را تأیید کنید.",
      kyc_required_warning: "این مرحله الزامی است. تا زمانی که تکمیل نشود، نمی‌توانید از حساب استفاده کنید.",
      kyc_firstname: "نام",
      kyc_lastname: "نام خانوادگی",
      kyc_country: "کشور",
      kyc_language: "زبان ترجیحی",
      kyc_gender: "جنسیت",
      kyc_gender_male: "مرد",
      kyc_gender_female: "زن",
      kyc_gender_other: "سایر",
      kyc_gender_prefernotsay: "تمایلی به ذکر ندارم",
      kyc_dob: "تاریخ تولد",
      kyc_nationality: "تابعیت",
      kyc_occupation: "شغل",
      kyc_address: "آدرس",
      kyc_city: "شهر",
      kyc_state: "استان",
      kyc_zip: "کد پستی",
      kyc_submit: "تکمیل تنظیمات",
      kyc_success: "احراز هویت تکمیل شد. زبان شما به‌روز شد.",
      search: "جستجو…",
      save: "ذخیره",
      cancel: "لغو",
      close: "بستن",
      copy: "کپی",
      copied: "کپی شد!",
      submit: "ارسال",
      continue: "ادامه",
      error_generic: "خطایی رخ داد. لطفا دوباره تلاش کنید.",
      error_unauthorized: "نشست منقضی شد. لطفا دوباره وارد شوید.",
      logout_confirm: "آیا مطمئن هستید که می‌خواهید خارج شوید؟",
      footer_rights: "کلیه حقوق محفوظ است.",
      common_required: "الزامی"
    },
    ta: { _name: "தமிழ்", nav_dashboard: "டாஷ்போர்டு", nav_profile: "கணக்கு விவரங்கள்", nav_statement: "கணக்கு சுருக்கம்", nav_stocks: "பங்குகள் மற்றும் வர்த்தகம்", actions_transfer: "உள்ளூர் பரிமாற்றம்", nav_international: "சர்வதேச பரிமாற்றம்", nav_transferHistory: "பரிமாற்ற வரலாறு", nav_card: "ATM அட்டை", nav_pin: "பரிவர்த்தனை PIN", nav_password: "கணக்கு கடவுச்சொல்", nav_logout: "வெளியேறு", nav_kyc: "KYC", hero_welcome: "வரவேற்கிறோம்", hero_balance: "கிடைக்கக்கூடிய இருப்பு", hero_accountNo: "கணக்கு எண்", hero_status: "நிலை", hero_viewDetails: "விவரங்களைப் பார்க்கவும்", hero_viewStatement: "அறிக்கை", actions_more: "விரைவு செயல்கள்", recent_title: "சமீபத்திய பரிவர்த்தனைகள்", recent_viewAll: "அனைத்தையும் பார்க்கவும்", recent_empty: "இன்னும் பரிவர்த்தனைகள் இல்லை", status_ACTIVE: "செயலில்", status_PENDING: "காத்திருக்கிறது", status_PROCESSING: "செயலாகிறது", status_COMPLETED: "முடிந்தது", status_FAILED: "தோல்வி", status_SUSPENDED: "இடைநீக்கம்", kyc_title: "உங்கள் சுயவிவரம் / KYC ஐ நிறைவு செய்யவும்", kyc_subtitle: "விருப்ப மொழி மற்றும் அனைத்து அம்சங்களையும் செயல்படுத்த உங்கள் கணக்கை சரிபார்க்கவும்.", kyc_required_warning: "இந்தப் படி கட்டாயமாகும். நிறைவடையும் வரை கணக்கைப் பயன்படுத்த முடியாது.", kyc_firstname: "முதல் பெயர்", kyc_lastname: "கடைசி பெயர்", kyc_country: "நாடு", kyc_language: "விருப்ப மொழி", kyc_gender: "பாலினம்", kyc_gender_male: "ஆண்", kyc_gender_female: "பெண்", kyc_gender_other: "மற்றவை", kyc_gender_prefernotsay: "சொல்ல விரும்பவில்லை", kyc_dob: "பிறப்பு தேதி", kyc_nationality: "தேசியம்", kyc_occupation: "தொழில்", kyc_address: "முகவரி", kyc_city: "நகரம்", kyc_state: "மாநிலம்", kyc_zip: "அஞ்சல் குறியீடு", kyc_submit: "அமைப்பை நிறைவு செய்யவும்", kyc_success: "KYC நிறைவடைந்தது. உங்கள் மொழி புதுப்பிக்கப்பட்டது.", search: "தேடு…", save: "சேமி", cancel: "ரத்து", close: "மூடு", copy: "நகல் எடு", copied: "நகல் எடுக்கப்பட்டது!", submit: "சமர்ப்பிக்கவும்", continue: "தொடரவும்", error_generic: "ஒரு பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.", error_unauthorized: "அமர்வு முடிந்தது. தயவுசெய்து மீண்டும் உள்நுழையவும்.", logout_confirm: "நீங்கள் உண்மையில் வெளியேற விரும்புகிறீர்களா?", footer_rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டுள்ளன.", common_required: "தேவையானது" },
    te: { _name: "తెలుగు", nav_dashboard: "డాష్‌బోర్డ్", nav_profile: "ఖాతా వివరాలు", nav_statement: "ఖాతా సారాంశం", nav_stocks: "స్టాక్స్ & ట్రేడింగ్", actions_transfer: "స్థానిక బదిలీ", nav_international: "అంతర్జాతీయ బదిలీ", nav_transferHistory: "బదిలీ చరిత్ర", nav_card: "ATM కార్డ్", nav_pin: "లావాదేవి పిన్", nav_password: "ఖాతా పాస్‌వర్డ్", nav_logout: "లాగ్‌ అవుట్", nav_kyc: "KYC", hero_welcome: "స్వాగతం", hero_balance: "అందుబాటులో ఉన్న బ్యాలెన్స్", hero_accountNo: "ఖాతా సంఖ్య", hero_status: "స్థితి", hero_viewDetails: "వివరాలు చూడండి", hero_viewStatement: "స్టేట్‌మెంట్", actions_more: "త్వరిత చర్యలు", recent_title: "ఇటీవలి లావాదేవీలు", recent_viewAll: "అన్నీ చూడండి", recent_empty: "ఇంకా లావాదేవీలు లేవు", status_ACTIVE: "క్రియాశీల", status_PENDING: "పెండింగ్", status_PROCESSING: "ప్రాసెస్", status_COMPLETED: "పూర్తయింది", status_FAILED: "విఫలమైంది", status_SUSPENDED: "సస్పెండ్", kyc_title: "మీ ప్రొఫైల్ / KYC ని పూర్తి చేయండి", kyc_subtitle: "మీకు ఇష్టమైన భాష మరియు అన్ని ఫీచర్‌లను చేయడానికి మీ ఖాతాను ధృవీకరించండి.", kyc_required_warning: "ఈ దశ తప్పనిసరి. పూర్తి కావాలి వరకు మీరు ఖాతాను ఉపయోగించలేరు.", kyc_firstname: "మొదటి పేరు", kyc_lastname: "చివరి పేరు", kyc_country: "దేశం", kyc_language: "ఇష్టమైన భాష", kyc_gender: "లింగం", kyc_gender_male: "పురుషుడు", kyc_gender_female: "స్త్రీ", kyc_gender_other: "ఇతరం", kyc_gender_prefernotsay: "చెప్పడానికి ఇష్టపడను", kyc_dob: "పుట్టిన తేదీ", kyc_nationality: "జాతీయత", kyc_occupation: "వృత్తి", kyc_address: "చిరునామా", kyc_city: "నగరం", kyc_state: "రాష్ట్రం", kyc_zip: "జిప్ కోడ్", kyc_submit: "సెటప్ పూర్తి చేయండి", kyc_success: "KYC పూర్తయింది. మీ భాష అప్‌డేట్ చేయబడింది.", search: "వెతకండి…", save: "సేవ్", cancel: "రద్దు", close: "మూసివేయి", copy: "కాపీ", copied: "కాపీ చేయబడింది!", submit: "సబ్మిట్", continue: "కొనసాగించు", error_generic: "లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.", error_unauthorized: "సెషన్ ముగిసింది. దయచేసి మళ్లీ లాగిన్ అవ్వండి.", logout_confirm: "మీరు ఖచ్చితంగా లాగ్అవుట్ చేయాలనుకుంటున్నారా?", footer_rights: "అన్ని హక్కులు రిజర్వ్.", common_required: "అవసరం" },
    ml: { _name: "മലയാളം", nav_dashboard: "ഡാഷ്‌ബോർഡ്", nav_profile: "അക്കൗണ്ട് വിശദാംശങ്ങൾ", nav_statement: "അക്കൗണ്ട് സാരാംശം", nav_stocks: "സ്റ്റോക്കുകൾ, ട്രേഡിംഗ്", actions_transfer: "പ്രാദേശിക കൈമാറ്റം", nav_international: "അന്താരാഷ്ട്ര കൈമാറ്റം", nav_transferHistory: "കൈമാറ്റ ചരിത്രം", nav_card: "ATM കാർഡ്", nav_pin: "ട്രാൻസാക്ഷൻ പിൻ", nav_password: "അക്കൗണ്ട് പാസ്‌വേഡ്", nav_logout: "ലോഗൗട്ട്", nav_kyc: "KYC", hero_welcome: "സ്വാഗതം", hero_balance: "ലഭ്യമായ ബാലൻസ്", hero_accountNo: "അക്കൗണ്ട് നമ്പർ", hero_status: "സ്റ്റാറ്റസ്", hero_viewDetails: "വിശദാംശങ്ങൾ കാണുക", hero_viewStatement: "സ്റ്റേറ്റ്‌മെന്റ്", actions_more: "ത്വരിത പ്രവർത്തനങ്ങൾ", recent_title: "സമീപകാല ഇടപാടുകൾ", recent_viewAll: "എല്ലാം കാണുക", recent_empty: "ഇതുവരെ ഇടപാടുകളൊന്നുമില്ല", status_ACTIVE: "സജീവമാണ്", status_PENDING: "പെന്റിംഗ്", status_PROCESSING: "പ്രോസസ്സിംഗ്", status_COMPLETED: "പൂർത്തിയായി", status_FAILED: "പരാജയപ്പെട്ടു", status_SUSPENDED: "സസ്പെൻഡ്", kyc_title: "നിങ്ങളുടെ പ്രൊഫൈൽ / KYC പൂർത്തിയാക്കുക", kyc_subtitle: "ഇഷ്ടമായ ഭാഷയിലും എല്ലാ സവിശേഷതകളിലും പ്രവർത്തിക്കാൻ നിങ്ങളുടെ അക്കൗണ്ട് സ്ഥിരീകരിക്കുക.", kyc_required_warning: "ഈ ഘട്ടം നിർബന്ധമാണ്. പൂർത്തിയാക്കുന്നതുവരെ അക്കൗണ്ട് ഉപയോഗിക്കാൻ കഴിയില്ല.", kyc_firstname: "ആദ്യനാമം", kyc_lastname: "അവസാനനാമം", kyc_country: "രാജ്യം", kyc_language: "ഇഷ്ടമായ ഭാഷ", kyc_gender: "ലിംഗം", kyc_gender_male: "പുരുഷൻ", kyc_gender_female: "സ്ത്രീ", kyc_gender_other: "മറ്റുള്ളവ", kyc_gender_prefernotsay: "പറയാൻ താൽപ്പര്യമില്ല", kyc_dob: "ജനനത്തീയതി", kyc_nationality: "ദേശീയത", kyc_occupation: "തൊഴിൽ", kyc_address: "വിലാസം", kyc_city: "നഗരം", kyc_state: "സംസ്ഥാനം", kyc_zip: "സിപ് കോഡ്", kyc_submit: "സജ്ജീകരണം പൂർത്തിയാക്കുക", kyc_success: "KYC പൂർത്തിയായി. നിങ്ങളുടെ ഭാഷ അപ്‌ഡേറ്റ് ചെയ്തു.", search: "തിരയുക…", save: "സംരക്ഷിക്കുക", cancel: "റദ്ദാക്കുക", close: "അടയ്ക്കുക", copy: "കോപ്പി", copied: "കോപ്പി ചെയ്തു!", submit: "സബ്മിറ്റ്", continue: "തുടരുക", error_generic: "ഒരു പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.", error_unauthorized: "സെഷൻ അവസാനിച്ചു. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.", logout_confirm: "തീർച്ചയായും ലോഗൗട്ട് ചെയ്യണോ?", footer_rights: "എല്ലാ അവകാശങ്ങളും സംരക്ഷിച്ചിരിക്കുന്നു.", common_required: "ആവശ്യമാണ്" },
    mr: { _name: "मराठी", nav_dashboard: "डॅशबोर्ड", nav_profile: "खाते तपशील", nav_statement: "खाता सारांश", nav_stocks: "समभाग आणि व्यापार", actions_transfer: "स्थानिक हस्तांतरण", nav_international: "आंतरराष्ट्रीय हस्तांतरण", nav_transferHistory: "हस्तांतरण इतिहास", nav_card: "एटीएम कार्ड", nav_pin: "व्यवहार पिन", nav_password: "खाते संकेतशब्द", nav_logout: "बाहेर पडणे", nav_kyc: "KYC", hero_welcome: "स्वागत", hero_balance: "उपलब्ध शिल्लक", hero_accountNo: "खाते क्रमांक", hero_status: "स्थिती", hero_viewDetails: "तपशील पहा", hero_viewStatement: "विधान", actions_more: "जलद क्रिया", recent_title: "अलीकडील व्यवहार", recent_viewAll: "सर्व पहा", recent_empty: "अद्याप कोणतेही व्यवहार नाहीत", status_ACTIVE: "सक्रिय", status_PENDING: "प्रलंबित", status_PROCESSING: "प्रक्रिया", status_COMPLETED: "पूर्ण झाले", status_FAILED: "अयशस्वी", status_SUSPENDED: "निलंबित", kyc_title: "तुमचे प्रोफाइल / KYC पूर्ण करा", kyc_subtitle: "तुमची प्राधान्य भाषा आणि सर्व वैशिष्ट्ये सक्षम करण्यासाठी तुमचे खाते पडताळणी करा.", kyc_required_warning: "ही पायरी अनिवार्य आहे. पूर्ण होईपर्यंत तुम्ही खाते वापरू शकणार नाही.", kyc_firstname: "पहिले नाव", kyc_lastname: "आडनाव", kyc_country: "देश", kyc_language: "प्राधान्य भाषा", kyc_gender: "लिंग", kyc_gender_male: "पुरुष", kyc_gender_female: "महिला", kyc_gender_other: "इतर", kyc_gender_prefernotsay: "सांगू इच्छित नाही", kyc_dob: "जन्म तारीख", kyc_nationality: "राष्ट्रीयत्व", kyc_occupation: "व्यवसाय", kyc_address: "पत्ता", kyc_city: "शहर", kyc_state: "राज्य", kyc_zip: "पिन कोड", kyc_submit: "सेटअप पूर्ण करा", kyc_success: "KYC पूर्ण झाले. तुमची भाषा अद्ययावत करण्यात आली आहे.", search: "शोधा…", save: "जतन करा", cancel: "रद्द करा", close: "बंद करा", copy: "कॉपी", copied: "कॉपी केले!", submit: "सबमिट करा", continue: "सुरू ठेवा", error_generic: "एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.", error_unauthorized: "सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.", logout_confirm: "तुम्हाला खरोखरच लॉगआउट करायचे आहे का?", footer_rights: "सर्व हक्क राखीव.", common_required: "आवश्यक" },
    gu: { _name: "ગુજરાતી", nav_dashboard: "ડેશબોર્ડ", nav_profile: "એકાઉન્ટ વિગતો", nav_statement: "એકાઉન્ટ સારાંશ", nav_stocks: "શેરો અને ટ્રેડિંગ", actions_transfer: "સ્થાનિક ટ્રાન્સફર", nav_international: "આંતરરાષ્ટ્રીય ટ્રાન્સફર", nav_transferHistory: "ટ્રાન્સફર ઇતિહાસ", nav_card: "એટીએમ કાર્ડ", nav_pin: "વ્યવહાર પિન", nav_password: "એકાઉન્ટ પાસવર્ડ", nav_logout: "લૉગઆઉટ", nav_kyc: "KYC", hero_welcome: "સ્વાગત", hero_balance: "ઉપલબ્ધ બેલેન્સ", hero_accountNo: "એકાઉન્ટ નંબર", hero_status: "સ્થિતિ", hero_viewDetails: "વિગતો જુઓ", hero_viewStatement: "નિવેદન", actions_more: "ઝડપી ક્રિયાઓ", recent_title: "તાજેતરના વ્યવહારો", recent_viewAll: "બધું જુઓ", recent_empty: "હજુ સુધી કોઈ વ્યવહારો નથી", status_ACTIVE: "સક્રિય", status_PENDING: "બાકી", status_PROCESSING: "પ્રોસેસિંગ", status_COMPLETED: "પૂર્ણ", status_FAILED: "નિષ્ફળ", status_SUSPENDED: "સ્થગિત", kyc_title: "તમારું પ્રોફાઇલ / KYC પૂર્ણ કરો", kyc_subtitle: "તમારી પસંદગીની ભાષા અને બધા લક્ષણો સક્ષમ કરવા માટે તમારું એકાઉન્ટ ચકાસો.", kyc_required_warning: "આ પગલું જરૂરી છે. પૂર્ણ ન થાય ત્યાં સુધી તમે એકાઉન્ટનો ઉપયોગ કરી શકશો નહીં.", kyc_firstname: "પ્રથમ નામ", kyc_lastname: "છેલ્લું નામ", kyc_country: "દેશ", kyc_language: "પસંદગીની ભાષા", kyc_gender: "લિંગ", kyc_gender_male: "પુરુષ", kyc_gender_female: "સ્ત્રી", kyc_gender_other: "અન્ય", kyc_gender_prefernotsay: "કહેવા માગતા નથી", kyc_dob: "જન્મ તારીખ", kyc_nationality: "રાષ્ટ્રીયતા", kyc_occupation: "વ્યવસાય", kyc_address: "સરનામું", kyc_city: "શહેર", kyc_state: "રાજ્ય", kyc_zip: "ઝિપ કોડ", kyc_submit: "સેટઅપ પૂર્ણ કરો", kyc_success: "KYC પૂર્ણ થયું. તમારી ભાષા અપડેટ કરવામાં આવી છે.", search: "શોધો…", save: "સાચવો", cancel: "રદ કરો", close: "બંધ કરો", copy: "કૉપિ", copied: "કૉપિ થયું!", submit: "સબમિટ કરો", continue: "ચાલુ રાખો", error_generic: "કોઈ ભૂલ આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.", error_unauthorized: "સત્ર સમાપ્ત થયું છે. કૃપા કરીને ફરીથી લૉગિન કરો.", logout_confirm: "શું તમે ખરેખર લૉગઆઉટ કરવા માંગો છો?", footer_rights: "બધા અધિકારો સુરક્ષિત.", common_required: "જરૂરી" },
    pa: { _name: "ਪੰਜਾਬੀ", nav_dashboard: "ਡੈਸ਼ਬੋਰਡ", nav_profile: "ਖਾਤੇ ਦੇ ਵੇਰਵੇ", nav_statement: "ਖਾਤਾ ਸਾਰਾਂਸ਼", nav_stocks: "ਸਟਾਕ ਅਤੇ ਵਪਾਰ", actions_transfer: "ਸਥਾਨਕ ਟ੍ਰਾਂਸਫਰ", nav_international: "ਅੰਤਰਰਾਸ਼ਟਰੀ ਟ੍ਰਾਂਸਫਰ", nav_transferHistory: "ਟ੍ਰਾਂਸਫਰ ਇਤਿਹਾਸ", nav_card: "ਏਟੀਐਮ ਕਾਰਡ", nav_pin: "ਲੈਣ-ਦੇਣ ਪਿੰਨ", nav_password: "ਖਾਤਾ ਪਾਸਵਰਡ", nav_logout: "ਲੌਗ ਆਊਟ", nav_kyc: "KYC", hero_welcome: "ਸੁਆਗਤ ਹੈ", hero_balance: "ਉਪਲਬਧ ਬਕਾਇਆ", hero_accountNo: "ਖਾਤਾ ਨੰਬਰ", hero_status: "ਸਥਿਤੀ", hero_viewDetails: "ਵੇਰਵੇ ਦੇਖੋ", hero_viewStatement: "ਸਟੇਟਮੈਂਟ", actions_more: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ", recent_title: "ਹਾਲੀਆ ਲੈਣ-ਦੇਣ", recent_viewAll: "ਸਭ ਦੇਖੋ", recent_empty: "ਅਜੇ ਕੋਈ ਲੈਣ-ਦੇਣ ਨਹੀਂ", status_ACTIVE: "ਸਰਗਰਮ", status_PENDING: "ਬਾਕੀ", status_PROCESSING: "ਪ੍ਰੋਸੈਸਿੰਗ", status_COMPLETED: "ਮੁਕੰਮਲ", status_FAILED: "ਅਸਫਲ", status_SUSPENDED: "ਮੁਅੱਤਲ", kyc_title: "ਆਪਣਾ ਪ੍ਰੋਫਾਈਲ / KYC ਪੂਰਾ ਕਰੋ", kyc_subtitle: "ਆਪਣੀ ਪਸੰਦਦੀ ਭਾਸ਼ਾ ਅਤੇ ਸਾਰੀਆਂ ਸੁਵਿਧਾਵਾਂ ਨੂੰ ਸਮਰੱਥ ਕਰਨ ਲਈ ਆਪਣੇ ਖਾਤੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।", kyc_required_warning: "ਇਹ ਕਦਮ ਜ਼ਰੂਰੀ ਹੈ। ਪੂਰਾ ਨਾ ਹੋਣ ਤੱਕ ਤੁਸੀਂ ਖਾਤੇ ਦੀ ਵਰਤੋਂ ਨਹੀਂ ਕਰ ਸਕੋਗੇ।", kyc_firstname: "ਪਹਿਲਾ ਨਾਮ", kyc_lastname: "ਆਖ਼ਰੀ ਨਾਮ", kyc_country: "ਦੇਸ਼", kyc_language: "ਪਸੰਦਦੀ ਭਾਸ਼ਾ", kyc_gender: "ਲਿੰਗ", kyc_gender_male: "ਮਰਦ", kyc_gender_female: "ਔਰਤ", kyc_gender_other: "ਹੋਰ", kyc_gender_prefernotsay: "ਨਹੀਂ ਦੱਸਣਾ ਚਾਹੁੰਦੇ", kyc_dob: "ਜਨਮ ਤਰੀਖ਼", kyc_nationality: "ਕੌਮੀਅਤ", kyc_occupation: "ਕਿੱਤਾ", kyc_address: "ਪਤਾ", kyc_city: "ਸ਼ਹਿਰ", kyc_state: "ਰਾਜ", kyc_zip: "ਜ਼ਿਪ ਕੋਡ", kyc_submit: "ਸੈੱਟਅੱਪ ਪੂਰਾ ਕਰੋ", kyc_success: "KYC ਪੂਰਾ ਹੋ ਗਿਆ। ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ ਹੈ।", search: "ਖੋਜੋ…", save: "ਸੁਰੱਖਿਆ ਕਰੋ", cancel: "ਰੱਦ ਕਰੋ", close: "ਬੰਦ ਕਰੋ", copy: "ਕਾਪੀ", copied: "ਕਾਪੀ ਹੋ ਗਿਆ!", submit: "ਜਮ੍ਹਾਂ ਕਰੋ", continue: "ਜਾਰੀ ਰੱਖੋ", error_generic: "ਕੋਈ ਗਲਤੀ ਆਈ। ਦੋਸਤੋ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", error_unauthorized: "ਸ਼ੈਸ਼ਨ ਖਤਮ ਹੋ ਗਿਆ ਹੈ। ਦੋਸਤੋ ਦੁਬਾਰਾ ਲੌਗਇਨ ਕਰੋ।", logout_confirm: "ਕੀ ਤੁਸੀਂ ਯਕੀਨਨ ਲੌਗਆਉਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?", footer_rights: "ਸਾਰੇ ਹੱਕ ਰਾਮ ਰਾਖਵੇਂ ਹਨ।", common_required: "ਜ਼ਰੂਰੀ" },
    af: { _name: "Afrikaans" },
    sw: { _name: "Kiswahili", nav_dashboard: "Dashibodi", nav_profile: "Maelezo ya Akaunti", nav_statement: "Muhtasari wa Akaunti", nav_stocks: "Hisa na Biashara", actions_transfer: "Hamisho la Ndani", nav_international: "Hamisho la Kimataifa", nav_transferHistory: "Historia ya Hamisho", nav_card: "Kadi ya ATM", nav_pin: "Nambari ya siri ya Muamala", nav_password: "Nenosiri la Akaunti", nav_logout: "Toka", nav_kyc: "KYC", hero_welcome: "Karibu", hero_balance: "Mizani Inayopatikana", hero_accountNo: "Nambari ya Akaunti", hero_status: "Hali", hero_viewDetails: "Ona Maelezo", hero_viewStatement: "Taarifa", actions_more: "Vitendo vya Haraka", recent_title: "Miamala ya Hivi Karibuni", recent_viewAll: "Ona Zote", recent_empty: "Hakuna miamala bado", status_ACTIVE: "Inatumika", status_PENDING: "Inasubiri", status_PROCESSING: "Inachakatiwa", status_COMPLETED: "Imekamilika", status_FAILED: "Imeshindikana", status_SUSPENDED: "Imelemwa", kyc_title: "Kamilisha Wasifu wako / KYC", kyc_subtitle: "Thibitisha akaunti yako ili kutoa lugha unayopendelea na vifaa vyawezi.", kyc_required_warning: "Hatua hii ni lazima. Hutaweza kutumia akaunti mpaka iwakamilika.", kyc_firstname: "Jina la kwanza", kyc_lastname: "Jina la mwisho", kyc_country: "Nchi", kyc_language: "Lugha unayopendelea", kyc_gender: "Jinsia", kyc_gender_male: "Mwanaume", kyc_gender_female: "Mwanamke", kyc_gender_other: "Nyingine", kyc_gender_prefernotsay: "Sitaki kusema", kyc_dob: "Siku ya kuzaliwa", kyc_nationality: "Uraia", kyc_occupation: "Kazi", kyc_address: "Anwani", kyc_city: "Mji", kyc_state: "Jimbo", kyc_zip: "Mshira ya posta", kyc_submit: "Kamilisha usanidi", kyc_success: "KYC imekamilika. Lugha yako imesasishwa.", search: "Tafuta…", save: "Hifadhi", cancel: "Ghairi", close: "Funga", copy: "Nakala", copied: "Imenakiliwa!", submit: "Wasilisha", continue: "Endelea", error_generic: "Hitilafu imetokea. Tafadhali jaribu tena.", error_unauthorized: "Kipindi cha sasa kimeisha. Tafadhali ingia tena.", logout_confirm: "Una uhakika unataka kutoka?", footer_rights: "Haki zote zimehifadhiwa.", common_required: "Inahitajika" },
    am: { _name: "አማርኛ" }, ha: { _name: "Hausa" }, yo: { _name: "Yorùbá" }, ig: { _name: "Igbo" },
    zu: { _name: "isiZulu" }, xh: { _name: "isiXhosa" }, st: { _name: "Sesotho" }, tn: { _name: "Setswana" }, ss: { _name: "Siswati" }, ve: { _name: "Tshivenda" }, nr: { _name: "isiNdebele" },
    sq: { _name: "Shqip" }, hy: { _name: "Հայերեն" }, az: { _name: "Azərbaycanca" }, be: { _name: "Беларуская" },
    bs: { _name: "Bosanski" }, bg: { _name: "Български" }, ca: { _name: "Català" }, hr: { _name: "Hrvatski" },
    et: { _name: "Eesti" }, ka: { _name: "ქართული" }, el: { _name: "Ελληνικά" }, is: { _name: "Íslenska" },
    kk: { _name: "Қазақ" }, lv: { _name: "Latviešu" }, lt: { _name: "Lietuvių" }, mk: { _name: "Македонски" },
    mt: { _name: "Malti" }, mn: { _name: "Монгол" }, ro: { _name: "Română" }, sr: { _name: "Српски" },
    sk: { _name: "Slovenčina" }, sl: { _name: "Slovenščina" }, tg: { _name: "Тоҷикӣ" }, uz: { _name: "Oʻzbekcha" },
    ky: { _name: "Кыргызча" }, tk: { _name: "Türkmen" }, eu: { _name: "Euskara" }, gl: { _name: "Galego" },
    cy: { _name: "Cymraeg" }, ga: { _name: "Gaeilge" }, gd: { _name: "Gàidhlig" },
    lb: { _name: "Lëtzebuergesch" }, li: { _name: "Limburgs" }, rm: { _name: "Rumantsch" }, fy: { _name: "Frysk" },
    qu: { _name: "Kichwa" }, gn: { _name: "Guaraní" }, ay: { _name: "Aymara" },
    km: { _name: "ខ្មែរ" }, lo: { _name: "ລາວ" }, my: { _name: "မြန်မာဘာသာ" }, ne: { _name: "नेपाली" },
    si: { _name: "සිංහල" }, ps: { _name: "پښتو" }, ku: { _name: "Kurdî" }, so: { _name: "Soomaali" },
    mg: { _name: "Malagasy" }, eo: { _name: "Esperanto" }, ht: { _name: "Kreyòl Ayisyen" },
    la: { _name: "Lingua Latina" },
    grc: { _name: "Ἀρχαία Ἑλληνική" },
    egy: { _name: "𓂋𓏺𓈖𓆓𓌻𓇌𓊖" },
    got: { _name: "𐌲𐌿𐍄𐌹𐍃𐌺" },
    non: { _name: "Norrœnt mál" },
    ang: { _name: "Englisc" },
    cv: { _name: "Чӑвашла" }, ba: { _name: "Башҡортса" }, tt: { _name: "Татарча" },
    sah: { _name: "Саха тыла" }, os: { _name: "Ирон" },
    ab: { _name: "Аҧсшәа" }, av: { _name: "Авар" }, ce: { _name: "Нохчийн" },
    kn: { _name: "ಕನ್ನಡ" },
    ae: { _name: "Avestan" },
    nv: { _name: "Diné bizaad" },
    ii: { _name: "ꆈꌠꉙ" }, ik: { _name: "Iñupiaq" }, iu: { _name: "ᐃᓄᒃᑎᑐᑦ" },
    hz: { _name: "Otsiherero" },
    kj: { _name: "Kuanyama" }, kv: { _name: "Коми" },
    na: { _name: "Ekakairũ Naoero" }, ng: { _name: "Owambo" },
    oc: { _name: "Occitan" }, oj: { _name: "Ojibwemowin" }, om: { _name: "Afaan Oromoo" },
    pi: { _name: "पालि" },
    ts: { _name: "Xitsonga" }, tw: { _name: "Twi" },
    ug: { _name: "ئۇيغۇرچە" },
    wo: { _name: "Wollof" }, za: { _name: "Saw cuengh" },
    nd: { _name: "isiNdebele" }
  };

  const COUNTRY_LANGS = {
    AF: { primary: "fa", langs: ["fa", "ps", "uz", "tk", "en"] },
    AL: { primary: "sq", langs: ["sq", "en", "it", "el", "mk", "sr"] },
    DZ: { primary: "ar", langs: ["ar", "fr", "kab", "en"] },
    AS: { primary: "en", langs: ["en", "sm"] },
    AD: { primary: "ca", langs: ["ca", "es", "fr", "en"] },
    AO: { primary: "pt", langs: ["pt", "umb", "kik", "ny", "en"] },
    AI: { primary: "en", langs: ["en"] },
    AQ: { primary: "en", langs: ["en", "ru", "es", "fr"] },
    AG: { primary: "en", langs: ["en"] },
    AR: { primary: "es", langs: ["es", "en", "it", "de", "gn", "qu"] },
    AM: { primary: "hy", langs: ["hy", "ru", "en"] },
    AW: { primary: "nl", langs: ["nl", "pap", "es", "en"] },
    AU: { primary: "en", langs: ["en", "zh", "ar", "it", "el", "vi", "th", "ko", "ja", "id"] },
    AT: { primary: "de", langs: ["de", "en", "hr", "hu", "sl", "it", "tr"] },
    AZ: { primary: "az", langs: ["az", "ru", "en", "hy", "ka", "tr"] },
    BS: { primary: "en", langs: ["en"] },
    BH: { primary: "ar", langs: ["ar", "en", "fa", "ur"] },
    BD: { primary: "bn", langs: ["bn", "en", "ar", "ur", "hi"] },
    BB: { primary: "en", langs: ["en"] },
    BY: { primary: "be", langs: ["be", "ru", "en", "uk", "pl"] },
    BE: { primary: "nl", langs: ["nl", "fr", "de", "en", "ar", "tr"] },
    BZ: { primary: "en", langs: ["en", "es"] },
    BJ: { primary: "fr", langs: ["fr", "fon", "yor", "ha"] },
    BM: { primary: "en", langs: ["en", "pt"] },
    BT: { primary: "dz", langs: ["dz", "en", "ne"] },
    BO: { primary: "es", langs: ["es", "qu", "ay", "gn"] },
    BQ: { primary: "nl", langs: ["nl", "en", "pap"] },
    BA: { primary: "bs", langs: ["bs", "hr", "sr", "en"] },
    BW: { primary: "en", langs: ["en", "tn", "st"] },
    BV: { primary: "no", langs: ["no", "en"] },
    BR: { primary: "pt", langs: ["pt", "es", "en", "it", "de", "ja", "ar"] },
    IO: { primary: "en", langs: ["en"] },
    BN: { primary: "ms", langs: ["ms", "en", "zh", "ja"] },
    BG: { primary: "bg", langs: ["bg", "en", "ru", "tr", "ro", "mk"] },
    BF: { primary: "fr", langs: ["fr", "mos", "diou", "ful"] },
    BI: { primary: "rn", langs: ["rn", "fr", "en", "sw"] },
    CV: { primary: "pt", langs: ["pt", "kea"] },
    KH: { primary: "km", langs: ["km", "en", "zh", "fr"] },
    CM: { primary: "fr", langs: ["fr", "en", "ff", "kik", "ha", "sw"] },
    CA: { primary: "en", langs: ["en", "fr", "zh", "es", "ar", "it", "de", "pt", "ru", "ko", "ja", "vi", "ur", "fa", "ta"] },
    KY: { primary: "en", langs: ["en"] },
    CF: { primary: "fr", langs: ["fr", "sg", "ln"] },
    TD: { primary: "fr", langs: ["fr", "ar", "en"] },
    CL: { primary: "es", langs: ["es", "en", "ay", "qu"] },
    CN: { primary: "zh", langs: ["zh", "en", "ru", "ja", "ko", "vi", "zh-TW", "zh-HK", "ug", "zh-CN"] },
    CX: { primary: "en", langs: ["en", "zh"] },
    CC: { primary: "ms", langs: ["ms", "en", "zh"] },
    CO: { primary: "es", langs: ["es", "en"] },
    KM: { primary: "ar", langs: ["ar", "fr", "kj", "sw"] },
    CG: { primary: "fr", langs: ["fr", "kik", "ln"] },
    CD: { primary: "fr", langs: ["fr", "ln", "sw", "kik", "lu"] },
    CK: { primary: "en", langs: ["en", "mi"] },
    CR: { primary: "es", langs: ["es", "en", "bzs"] },
    CI: { primary: "fr", langs: ["fr", "dyu", "bau", "en"] },
    HR: { primary: "hr", langs: ["hr", "en", "sr", "it", "de", "hu"] },
    CU: { primary: "es", langs: ["es", "en"] },
    CW: { primary: "nl", langs: ["nl", "pap", "en", "es"] },
    CY: { primary: "el", langs: ["el", "tr", "en", "ru", "ar"] },
    CZ: { primary: "cs", langs: ["cs", "en", "de", "ru", "sk", "uk", "ro", "pl"] },
    DK: { primary: "da", langs: ["da", "en", "de", "nb", "sv", "is", "fo", "tr"] },
    DJ: { primary: "fr", langs: ["fr", "ar", "aa", "so"] },
    DM: { primary: "en", langs: ["en"] },
    DO: { primary: "es", langs: ["es", "en"] },
    EC: { primary: "es", langs: ["es", "en", "qu"] },
    EG: { primary: "ar", langs: ["ar", "en", "fr", "cop"] },
    SV: { primary: "es", langs: ["es", "en"] },
    GQ: { primary: "es", langs: ["es", "fr", "pt", "fan"] },
    ER: { primary: "ti", langs: ["ti", "ar", "en", "aa", "tig"] },
    EE: { primary: "et", langs: ["et", "ru", "en", "fi", "sv"] },
    SZ: { primary: "en", langs: ["en", "ss", "st"] },
    ET: { primary: "am", langs: ["am", "or", "ti", "en", "ar", "so", "sw", "ha"] },
    FK: { primary: "en", langs: ["en"] },
    FO: { primary: "fo", langs: ["fo", "da", "en"] },
    FJ: { primary: "en", langs: ["en", "fj", "hi"] },
    FI: { primary: "fi", langs: ["fi", "sv", "en", "ru", "et", "smn", "sms", "sma", "swe"] },
    FR: { primary: "fr", langs: ["fr", "en", "es", "de", "it", "pt", "ar", "nl", "tr", "br", "co", "eu", "oc", "wa"] },
    GF: { primary: "fr", langs: ["fr", "gcr", "en"] },
    PF: { primary: "fr", langs: ["fr", "ty", "en"] },
    TF: { primary: "fr", langs: ["fr", "en"] },
    GA: { primary: "fr", langs: ["fr", "fan", "mbe"] },
    GM: { primary: "en", langs: ["en", "wo", "ful", "mand"] },
    GE: { primary: "ka", langs: ["ka", "ru", "en", "hy", "az", "tr"] },
    DE: { primary: "de", langs: ["de", "en", "fr", "es", "it", "nl", "ru", "tr", "ar", "pl", "pt", "da", "sv", "nb", "cs", "uk"] },
    GH: { primary: "en", langs: ["en", "ak", "ee", "tw", "dag", "ha", "ewe", "ga"] },
    GI: { primary: "en", langs: ["en", "es", "it", "pt"] },
    GR: { primary: "el", langs: ["el", "en", "de", "fr", "it", "ru", "sq", "tr", "bg"] },
    GL: { primary: "kl", langs: ["kl", "da", "en"] },
    GD: { primary: "en", langs: ["en"] },
    GP: { primary: "fr", langs: ["fr", "en", "gcf"] },
    GU: { primary: "en", langs: ["en", "ch", "ja", "ko", "zh"] },
    GT: { primary: "es", langs: ["es", "en", "qu", "kac"] },
    GG: { primary: "en", langs: ["en", "fr", "de"] },
    GN: { primary: "fr", langs: ["fr", "ff", "suc", "kpe", "mal", "lg"] },
    GW: { primary: "pt", langs: ["pt", "pov", "suc", "bal"] },
    GY: { primary: "en", langs: ["en", "hns", "es", "pt"] },
    HT: { primary: "fr", langs: ["fr", "ht", "en"] },
    HM: { primary: "en", langs: ["en"] },
    VA: { primary: "it", langs: ["it", "la", "en", "fr", "es", "pt"] },
    HN: { primary: "es", langs: ["es", "en", "gar"] },
    HK: { primary: "zh", langs: ["zh", "en", "zh-TW", "zh-HK", "ja"] },
    HU: { primary: "hu", langs: ["hu", "en", "de", "ru", "ro", "sk", "sr", "uk", "tr"] },
    IS: { primary: "is", langs: ["is", "en", "da", "nb", "sv", "de", "pl", "lt", "lv", "ga", "gd"] },
    IN: { primary: "hi", langs: ["hi", "en", "bn", "te", "ta", "mr", "gu", "pa", "ur", "ml", "kn", "or", "as", "sd", "ks", "kok", "doi", "mai", "brx", "sat", "lus", "ne", "si", "ta-LK", "te-IN", "ta-IN"] },
    ID: { primary: "id", langs: ["id", "en", "zh", "ja", "ar", "ms", "jv", "su", "mad", "bug", "min", "ace", "ban"] },
    IR: { primary: "fa", langs: ["fa", "en", "ar", "azb", "ku", "ps", "ur", "ti", "hy"] },
    IQ: { primary: "ar", langs: ["ar", "en", "ku", "ps", "fa", "ur"] },
    IE: { primary: "en", langs: ["en", "ga", "pl", "fr", "de", "pt", "es", "ro", "lv", "lt", "uk", "sk", "hu", "hr"] },
    IM: { primary: "en", langs: ["en", "gv", "ga", "gd"] },
    IL: { primary: "he", langs: ["he", "en", "ar", "ru", "am", "fr", "yi", "fa", "pl", "uk"] },
    IT: { primary: "it", langs: ["it", "en", "fr", "de", "es", "pt", "ar", "sl", "hr", "sq", "de", "ca", "oc", "lld", "fur", "lij", "scn", "nap", "pms", "srd"] },
    JM: { primary: "en", langs: ["en", "jam", "es"] },
    JP: { primary: "ja", langs: ["ja", "en", "zh", "ko", "pt", "es", "ru", "vi", "tl", "th", "id", "ms"] },
    JE: { primary: "en", langs: ["en", "fr"] },
    JO: { primary: "ar", langs: ["ar", "en", "he", "fa", "ur"] },
    KZ: { primary: "kk", langs: ["kk", "ru", "en", "uk", "de", "tr", "uz", "tg", "ky", "tt", "ba", "az"] },
    KE: { primary: "en", langs: ["en", "sw", "ar", "ki", "luo", "kam", "kik", "luh", "lus", "som", "am", "ha", "mer", "ny", "teo", "mas", "tuv", "luo", "naiv"] },
    KI: { primary: "en", langs: ["en", "gil"] },
    KP: { primary: "ko", langs: ["ko", "zh", "en", "ru"] },
    KR: { primary: "ko", langs: ["ko", "en", "zh", "ja", "vi", "th", "tl", "id", "ms", "ar", "ru", "zh-CN", "zh-TW"] },
    KW: { primary: "ar", langs: ["ar", "en", "fa", "ur", "ko", "bn", "hi", "tl"] },
    KG: { primary: "ky", langs: ["ky", "ru", "en", "uz", "tg", "uk"] },
    LA: { primary: "lo", langs: ["lo", "en", "zh", "th", "vi", "fr"] },
    LV: { primary: "lv", langs: ["lv", "ru", "en", "lt", "et", "uk", "be", "pl", "de"] },
    LB: { primary: "ar", langs: ["ar", "fr", "en", "hy", "he"] },
    LS: { primary: "st", langs: ["st", "en", "zu", "xh"] },
    LR: { primary: "en", langs: ["en", "kpe", "bla", "gio", "krn", "man", "vai"] },
    LY: { primary: "ar", langs: ["ar", "en", "it", "ta", "pis"] },
    LI: { primary: "de", langs: ["de", "en", "fr", "it", "rm"] },
    LT: { primary: "lt", langs: ["lt", "ru", "en", "pl", "lv", "ee", "uk", "be", "de"] },
    LU: { primary: "lb", langs: ["lb", "fr", "de", "en", "pt", "it", "es"] },
    MO: { primary: "zh", langs: ["zh", "pt", "en", "zh-HK", "zh-TW"] },
    MG: { primary: "mg", langs: ["mg", "fr", "en"] },
    MW: { primary: "en", langs: ["en", "ny", "tumb", "yao", "sng", "sw"] },
    MY: { primary: "ms", langs: ["ms", "en", "zh", "ta", "ja", "ko", "th", "ur", "bn", "ar", "id", "te", "ml", "pa", "gu", "si"] },
    MV: { primary: "dv", langs: ["dv", "en", "ar", "si", "ta", "bn", "ur"] },
    ML: { primary: "fr", langs: ["fr", "bm", "ff", "koy", "ses", "zh", "ar"] },
    MT: { primary: "mt", langs: ["mt", "en", "it", "ar"] },
    MH: { primary: "en", langs: ["en", "mh"] },
    MQ: { primary: "fr", langs: ["fr", "en", "gcf"] },
    MR: { primary: "ar", langs: ["ar", "fr", "mey", "ff", "wo", "zen"] },
    MU: { primary: "en", langs: ["en", "fr", "mfe", "bho", "ta", "ur", "hi", "zh"] },
    YT: { primary: "fr", langs: ["fr", "swb", "ar"] },
    MX: { primary: "es", langs: ["es", "en", "nah", "qu", "yua", "zap", "mix", "tzo"] },
    FM: { primary: "en", langs: ["en", "chk", "pon", "kos", "yap", "ulw", "woe", "nmg", "kpg", "tvl"] },
    MD: { primary: "ro", langs: ["ro", "ru", "uk", "en", "bg", "gag"] },
    MC: { primary: "fr", langs: ["fr", "en", "it", "mcj"] },
    MN: { primary: "mn", langs: ["mn", "zh", "ru", "en", "bo", "kv", "bua"] },
    ME: { primary: "sr", langs: ["sr", "en", "hr", "bs", "sq", "it", "de", "ru"] },
    MS: { primary: "en", langs: ["en", "sq"] },
    MA: { primary: "ar", langs: ["ar", "fr", "en", "ber", "shi", "tzm"] },
    MZ: { primary: "pt", langs: ["pt", "en", "sw", "vmw", "sna", "tsn", "xog"] },
    MM: { primary: "my", langs: ["my", "en", "zh", "shn", "kar", "rki", "caa", "mnw", "kht", "phk", "bmv", "int"] },
    NA: { primary: "en", langs: ["en", "af", "de", "hz", "naq", "kj", "kho", "twf", "nd", "nr", "ss", "st", "tn", "ts", "ve", "xh", "zu"] },
    NR: { primary: "en", langs: ["en", "nao"] },
    NP: { primary: "ne", langs: ["ne", "en", "hi", "ur", "bo", "mai", "bho", "thl", "new", "mag", "chak", "sat", "ljp", "unr", "mtj", "tdt", "bqj", "txb", "mjk", "mlh", "unw", "wme", "tck", "waw"] },
    NL: { primary: "nl", langs: ["nl", "en", "de", "fr", "ar", "tr", "ur", "fa", "bn", "zh", "id", "ms", "ku", "pl", "es", "it", "pt", "ar-SA", "ar-EG"] },
    NC: { primary: "fr", langs: ["fr", "zh", "en", "ncq"] },
    NZ: { primary: "en", langs: ["en", "mi", "zh", "smo", "hi", "ko", "zh-CN", "zh-TW"] },
    NI: { primary: "es", langs: ["es", "en", "csa"] },
    NE: { primary: "fr", langs: ["fr", "ha", "djr", "kr", "suo", "dje", "za", "shi"] },
    NG: { primary: "en", langs: ["en", "ha", "yo", "ig", "pcd", "ff", "bin", "knc", "kr", "ibib", "gbo", "isc", "kam", "ncd", "nsb", "bib", "ven", "nbl", "hau", "ebi", "nau", "ijo", "kqr", "pcp", "sw", "ar", "pt"] },
    NU: { primary: "en", langs: ["en", "niu"] },
    NF: { primary: "en", langs: ["en", "pih"] },
    MK: { primary: "mk", langs: ["mk", "en", "sq", "sr", "hr", "bg", "tr", "ru", "ro"] },
    MP: { primary: "en", langs: ["en", "ch"] },
    NO: { primary: "nb", langs: ["nb", "nn", "se", "en", "sv", "da", "ru", "de", "fi", "is"] },
    OM: { primary: "ar", langs: ["ar", "en", "fa", "ur", "bal", "bgn", "shu", "mdr"] },
    PK: { primary: "ur", langs: ["ur", "en", "pa", "sd", "ps", "bn", "brh", "bal", "bsk", "kxp", "gwc", "hnd", "hno", "mvy", "phr", "skr", "scl", "snd", "tst", "ug", "zh", "ar", "hi", "fa", "ps-AF", "zh-CN"] },
    PW: { primary: "en", langs: ["en", "pau", "ja", "zh", "ko", "tox", "sov", "en-PH", "fil", "ckb", "pau"] },
    PS: { primary: "ar", langs: ["ar", "en", "he", "fa", "ur"] },
    PA: { primary: "es", langs: ["es", "en", "cpa"] },
    PG: { primary: "en", langs: ["en", "tpi", "ho", "meu", "psu", "tpc", "pih", "pon", "agk"] },
    PY: { primary: "es", langs: ["es", "gn", "pt", "de", "uk", "it"] },
    PE: { primary: "es", langs: ["es", "en", "qu", "ay", "bve", "am", "zh", "ja"] },
    PH: { primary: "tl", langs: ["tl", "en", "zh", "ceb", "hil", "ilo", "war", "pam", "pag", "tsg", "mrw", "akb", "bcl", "cbk", "ksh", "lsg", "mdh", "sgb", "ur", "ar", "ja", "ko", "id", "ms", "es", "hi", "th"] },
    PN: { primary: "en", langs: ["en", "pih"] },
    PL: { primary: "pl", langs: ["pl", "en", "de", "ru", "uk", "be", "lt", "lv", "cs", "sk", "hu", "ro", "it", "fr", "es", "pt", "uk-UA", "be-BY", "sms", "szl", "csb", "dsb", "hsb", "cnr"] },
    PT: { primary: "pt", langs: ["pt", "en", "es", "fr", "de", "it", "ar", "zh", "ja", "tl", "mwl", "mpp", "tfz"] },
    PR: { primary: "en", langs: ["en", "es"] },
    QA: { primary: "ar", langs: ["ar", "en", "ur", "fa", "hi", "bn", "ps", "id", "ms", "tl", "th", "ko", "zh", "vi", "ne", "ml", "ta", "te", "si", "my"] },
    RE: { primary: "fr", langs: ["fr", "en", "ar", "ta", "zh", "ml", "ur"] },
    RO: { primary: "ro", langs: ["ro", "en", "hu", "de", "uk", "ru", "sr", "bg", "tr", "hr", "pl", "it", "fr", "es", "pt"] },
    RU: { primary: "ru", langs: ["ru", "en", "zh", "de", "fr", "es", "it", "pt", "ar", "tr", "uk", "kk", "ky", "uz", "tg", "tt", "ba", "cv", "ce", "ab", "os", "av", "kbd", "dar", "lez", "che", "inh", "mhr", "mrj", "sah", "tyv", "xal", "bua", "ady", "kbd", "krc", "nog", "krl", "vep", "kpv", "udm", "mdf", "myv", "koi", "as", "bs", "yrk", "nio", "sel", "kfo", "esk", "aln", "alr"] },
    RW: { primary: "rw", langs: ["rw", "en", "fr", "sw"] },
    BL: { primary: "fr", langs: ["fr", "en"] },
    SH: { primary: "en", langs: ["en"] },
    KN: { primary: "en", langs: ["en"] },
    LC: { primary: "en", langs: ["en"] },
    MF: { primary: "fr", langs: ["fr", "en"] },
    PM: { primary: "fr", langs: ["fr", "en"] },
    VC: { primary: "en", langs: ["en"] },
    WS: { primary: "en", langs: ["en", "sm", "zh", "to"] },
    SM: { primary: "it", langs: ["it", "en", "de", "fr"] },
    ST: { primary: "pt", langs: ["pt", "fr", "en"] },
    SA: { primary: "ar", langs: ["ar", "en", "ur", "fa", "hi", "bn", "id", "ms", "tl", "th", "ko", "zh", "vi", "te", "ml", "ta", "si", "my", "ne", "ps", "am", "so", "sw", "ar-SA", "zh-CN", "ta-IN", "hi-IN", "bn-IN", "ur-PK", "th-TH", "vi-VN", "id-ID", "ms-MY", "tr-TR", "he-IL", "fa-IR"] },
    SN: { primary: "fr", langs: ["fr", "wo", "pulaar", "srr", "wof", "dyo", "mwo", "bst", "knf", "nyf", "sav", "src", "srr", "sss", "sxf", "tov", "tyr", "vrs", "xcl", "xnr", "yap"] },
    RS: { primary: "sr", langs: ["sr", "en", "hu", "ro", "bg", "hr", "sq", "mk", "uk", "ru", "de", "it", "fr"] },
    SC: { primary: "en", langs: ["en", "fr", "crs"] },
    SL: { primary: "en", langs: ["en", "kpe", "men", "tem", "lim", "snn", "mam", "bul", "gag", "puk"] },
    SG: { primary: "en", langs: ["en", "zh", "ms", "ta", "ja", "ko", "th", "bn", "ur", "vi", "id", "tl", "si", "gu", "hi", "pa", "ml", "te", "zh-CN", "zh-TW", "zh-HK"] },
    SX: { primary: "nl", langs: ["nl", "en", "es", "pap"] },
    SK: { primary: "sk", langs: ["sk", "en", "hu", "cs", "de", "uk", "ru", "pl", "ro", "hr", "sr", "it", "fr"] },
    SI: { primary: "sl", langs: ["sl", "en", "de", "hr", "it", "sr", "hu", "fr"] },
    SB: { primary: "en", langs: ["en", "tpi", "ar", "mus", "pij", "pis"] },
    SO: { primary: "so", langs: ["so", "ar", "en", "sw", "aa", "osm", "kmr", "rwr"] },
    ZA: { primary: "en", langs: ["en", "af", "zu", "xh", "st", "tn", "ss", "ve", "nr", "ts", "nr", "ts", "nso", "sot", "tsi", "xho", "zul", "afr", "eng", "nbl", "nde", "ssw", "sw", "ar", "pt", "zh", "fr"] },
    GS: { primary: "en", langs: ["en"] },
    SS: { primary: "en", langs: ["en", "ar", "nu", "dje", "zre", "kr", "kqj", "lgo", "mad", "nyy", "saj", "tsk", "sig", "bax", "bkq", "cym", "nus", "fur", "par", "cok", "luo", "dav", "guz", "kln", "luh", "luo", "naiv", "mas", "saq", "saq", "mer"] },
    ES: { primary: "es", langs: ["es", "en", "fr", "de", "it", "pt", "ar", "ca", "eu", "gl", "oc", "an", "ast", "ext", "lad", "wo", "ber"] },
    LK: { primary: "si", langs: ["si", "en", "ta", "ar", "ur", "ml", "zh"] },
    SD: { primary: "ar", langs: ["ar", "en", "fur", "nus", "dje", "koalib", "ks", "msa", "sara", "nko", "osm", "ar-SA"] },
    SR: { primary: "nl", langs: ["nl", "en", "srn", "hns", "zh", "hi", "jv"] },
    SJ: { primary: "no", langs: ["no", "en", "ru", "sv"] },
    EH: { primary: "ar", langs: ["ar", "es", "fr", "ber"] },
    SE: { primary: "sv", langs: ["sv", "en", "fi", "nb", "da", "de", "ru", "is", "ar", "tr", "ur", "fa", "so", "fa-IR", "ar-SA"] },
    CH: { primary: "de", langs: ["de", "fr", "it", "en", "rm", "es", "pt", "ar", "nl", "sv", "nb", "tr", "ur", "fa", "ks"] },
    SY: { primary: "ar", langs: ["ar", "en", "fr", "ku", "tr", "hy", "fa", "ur", "ps", "ar-SA"] },
    TW: { primary: "zh", langs: ["zh", "zh-TW", "zh-CN", "en", "ja", "ko", "id", "ms", "tl", "vi", "th", "ar", "ur", "ta", "ml", "te", "ne", "bn", "my"] },
    TJ: { primary: "tg", langs: ["tg", "ru", "en", "uz", "ky", "ps", "fa"] },
    TZ: { primary: "sw", langs: ["sw", "en", "ar", "ha", "so", "mas", "suk", "ny", "xog", "lag", "zap", "umb", "kik", "rof", "mgh", "kde", "rwk", "ssw", "vun", "yao", "dae", "gog", "nia", "tuv", "sbp", "jmc", "pma", "teo", "asa", "mer", "mfe", "kam", "khq", "shi", "tzm", "luo", "naiv"] },
    TH: { primary: "th", langs: ["th", "en", "zh", "ms", "ja", "ko", "vi", "id", "tl", "ar", "ur", "fa", "hi", "bn", "ta", "ml", "te", "my", "km", "lo", "ne", "si", "pt", "fr", "th-TH", "zh-CN", "zh-TW"] },
    TL: { primary: "pt", langs: ["pt", "tet", "en", "id", "zh", "tl"] },
    TG: { primary: "fr", langs: ["fr", "ee", "hna", "kbp", "dag", "dga", "ha", "kdh", "mey", "miq", "mif", "ha", "en", "ar"] },
    TK: { primary: "en", langs: ["en", "tkl", "sm"] },
    TO: { primary: "en", langs: ["en", "to", "sm", "hi", "zh"] },
    TT: { primary: "en", langs: ["en", "hns", "es", "fr", "zh", "ar", "hi", "ta"] },
    TN: { primary: "ar", langs: ["ar", "fr", "en", "ber", "it", "tr"] },
    TR: { primary: "tr", langs: ["tr", "en", "de", "fr", "ar", "fa", "ku", "az", "ru", "ur", "bs", "sq", "mk", "bg", "ka", "hy", "kk", "ky", "uz", "tg", "tt", "ba", "ar-SA", "tr-TR", "ku-IQ"] },
    TM: { primary: "tk", langs: ["tk", "ru", "en", "uz", "fa", "az", "tr", "ky", "kk"] },
    TC: { primary: "en", langs: ["en"] },
    TV: { primary: "en", langs: ["en", "tvl", "sm", "gil", "tuval"] },
    UG: { primary: "en", langs: ["en", "sw", "ar", "so", "luo", "lg", "teo", "xog", "ach", "nyn", "run", "xmb", "myx", "kcg", "nnb", "quc", "xmm", "kky", "tlj", "yom", "xog", "guc", "xoc"] },
    UA: { primary: "uk", langs: ["uk", "ru", "en", "de", "pl", "ro", "hu", "sk", "be", "pl", "crh", "rom", "yid", "pl-PL", "ru-RU", "de-DE", "cs-CZ", "sk-SK", "hu-HU", "bg-BG", "sr-RS", "hr-HR", "sl-SI", "el-GR", "it-IT", "fr-FR", "es-ES", "pt-PT", "ar-SA"] },
    AE: { primary: "ar", langs: ["ar", "en", "ur", "fa", "hi", "bn", "id", "ms", "tl", "th", "ko", "zh", "vi", "te", "ml", "ta", "si", "my", "ne", "ps", "am", "so", "sw", "af", "ckb", "ku", "sd", "gu", "pa", "ps-AF", "zh-CN", "zh-TW", "ta-IN", "hi-IN", "bn-IN", "ur-PK", "th-TH", "vi-VN", "id-ID", "ms-MY", "tr-TR", "he-IL", "fa-IR"] },
    GB: { primary: "en", langs: ["en", "cy", "gd", "ga", "kw", "gv", "sco", "fr", "de", "es", "it", "pt", "ru", "ar", "zh", "ja", "ko", "vi", "th", "tl", "id", "ms", "ur", "fa", "bn", "hi", "pa", "ta", "te", "ml", "gu", "mr", "ne", "si", "my", "so", "sw", "pl", "tr", "ku", "uk", "bg", "cs", "sk", "hu", "ro", "sr", "hr", "sl", "sq", "el", "lv", "lt", "et", "is", "fi", "sv", "nb", "da", "nl", "he", "af", "zu", "xh", "st", "tn", "ss", "ve", "nr", "ts", "ar-SA", "zh-CN", "zh-TW", "ta-IN", "hi-IN", "bn-IN", "ur-PK", "th-TH", "vi-VN", "id-ID", "ms-MY", "tr-TR", "he-IL", "fa-IR"] },
    UM: { primary: "en", langs: ["en"] },
    US: { primary: "en", langs: ["en", "es", "fr", "zh", "ar", "pt", "ru", "it", "de", "ja", "ko", "vi", "tl", "th", "ur", "fa", "hi", "bn", "pa", "ta", "te", "ml", "gu", "mr", "pl", "tr", "ku", "uk", "cs", "sk", "hu", "ro", "sr", "hr", "sl", "el", "bg", "sq", "ca", "eu", "he", "yi", "id", "ms", "ne", "si", "my", "so", "sw", "af", "zu", "xh", "st", "tn", "ss", "ve", "nr", "ts", "haw", "srn", "yua", "moh", "en-US", "es-MX", "es-ES", "en-CA", "en-AU", "en-NZ", "en-IN", "en-ZA", "en-NG", "en-PH", "ar-SA", "zh-CN", "zh-TW", "ja-JP", "ko-KR", "hi-IN", "bn-BD", "ur-PK", "th-TH", "vi-VN", "id-ID", "ms-MY", "tr-TR", "he-IL", "fa-IR", "pt-BR", "pt-PT", "fr-FR", "fr-CA", "fr-BE", "fr-CH", "de-DE", "de-AT", "de-CH", "it-IT", "nl-NL", "sv-SE", "nb-NO", "da-DK", "fi-FI", "pl-PL", "ru-RU", "uk-UA"] },
    UY: { primary: "es", langs: ["es", "pt", "en", "it", "de", "fr", "ar"] },
    UZ: { primary: "uz", langs: ["uz", "ru", "en", "kk", "ky", "tg", "tk", "fa", "tr", "ar"] },
    VU: { primary: "en", langs: ["en", "fr", "bi", "zh"] },
    VE: { primary: "es", langs: ["es", "en", "it", "pt", "zh", "ar"] },
    VN: { primary: "vi", langs: ["vi", "en", "zh", "ja", "ko", "km", "lo", "th", "tl", "id", "ms", "ar", "ur", "fa", "hi", "fr", "zh-CN", "zh-TW", "vi-VN"] },
    VG: { primary: "en", langs: ["en"] },
    VI: { primary: "en", langs: ["en"] },
    WF: { primary: "fr", langs: ["fr", "wls", "fud", "en"] },
    EH: { primary: "ar", langs: ["ar", "es", "fr", "ber"] },
    YE: { primary: "ar", langs: ["ar", "en", "fa", "ur", "so", "af", "ar-SA"] },
    ZM: { primary: "en", langs: ["en", "ny", "bem", "rnd", "loz", "toi", "lun", "lue", "saj", "hrk", "kqn", "mcl", "njn", "nrj", "nso", "tee", "tjv", "xbr", "xng", "yom"] },
    ZW: { primary: "en", langs: ["en", "sn", "nd", "nr", "st", "tn", "ts", "ve", "xh", "zu", "ss", "kck", "kqn", "kgi", "mcq", "ndc", "ndl", "nbl", "sot", "tsn", "xho", "zul"] }
  };

  function dictForCode(code) {
    const want = String(code || "en").toLowerCase();
    if (DICT[want]) return DICT[want];
    const base = want.split("-")[0];
    if (DICT[base]) return DICT[base];
    return DICT.en;
  }

  function t(code, key, vars) {
    const dict = dictForCode(code);
    const entry = dict && dict[key];
    let str = typeof entry === "string" ? entry : (DICT.en && DICT.en[key] ? DICT.en[key] : String(key));
    if (vars && typeof vars === "object") {
      for (const k of Object.keys(vars)) {
        const re = new RegExp(`\\{\\{${k}\\}\\}`, "g");
        str = String(str).replace(re, String(vars[k]));
      }
    }
    return str;
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function applyLanguageToDocument(code, rootEl) {
    const dict = dictForCode(code);
    const scope = rootEl || (typeof document !== "undefined" ? document : null);
    if (!scope || typeof scope.querySelectorAll !== "function") return;
    const root = scope.documentElement || scope;
    if (root && "setAttribute" in root) {
      root.setAttribute("lang", code);
      const base = String(code || "en").split("-")[0].toLowerCase();
      const RTL_BASES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd", "ug", "yi", "syc", "dv"]);
      if (RTL_BASES.has(base)) {
        root.setAttribute("dir", "rtl");
      } else {
        root.setAttribute("dir", "ltr");
      }
    }
    scope.querySelectorAll && scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const vars = el.getAttribute("data-i18n-vars");
      let varsObj = null;
      if (vars) {
        try { varsObj = JSON.parse(vars); } catch (_) { varsObj = null; }
      }
      const entry = (dict && dict[key]) ? dict[key] : (DICT.en[key] || key);
      let str = typeof entry === "string" ? entry : String(key);
      if (varsObj) {
        for (const k of Object.keys(varsObj)) {
          str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(varsObj[k]));
        }
      }
      el.textContent = str;
    });
    scope.querySelectorAll && scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key || !("setAttribute" in el)) return;
      const entry = (dict && dict[key]) ? dict[key] : (DICT.en[key] || key);
      el.setAttribute("placeholder", String(entry));
    });
    scope.querySelectorAll && scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (!key || !("setAttribute" in el)) return;
      const entry = (dict && dict[key]) ? dict[key] : (DICT.en[key] || key);
      el.setAttribute("title", String(entry));
    });
    scope.querySelectorAll && scope.querySelectorAll("[data-i18n-value]").forEach((el) => {
      const key = el.getAttribute("data-i18n-value");
      if (!key || !("setAttribute" in el)) return;
      const entry = (dict && dict[key]) ? dict[key] : (DICT.en[key] || key);
      el.setAttribute("value", String(entry));
    });
    scope.querySelectorAll && scope.querySelectorAll("[data-i18n-status]").forEach((el) => {
      const status = String(el.getAttribute("data-i18n-status") || "").trim().toUpperCase();
      if (!status) return;
      const key = "status_" + status;
      const entry = (dict && dict[key]) ? dict[key] : (DICT.en[key] || status);
      el.textContent = entry;
    });
  }

  function getAllDictionaryLanguages() {
    return Object.keys(DICT || {}).filter((c) => c.length === 2 || /^[a-z]{2}-[A-Z]{2}$/.test(c));
  }

  function getCountryLanguages(countryCodeOrName) {
    if (!countryCodeOrName) {
      const all = getAllDictionaryLanguages();
      return { primary: "en", langs: all.length ? all : ["en", "es", "fr", "de", "pt", "ru", "zh", "ar"] };
    }
    const key = String(countryCodeOrName).trim().toUpperCase();
    if (COUNTRY_LANGS[key]) return COUNTRY_LANGS[key];
    const countryLanguages = Object.values(COUNTRY_LANGS);
    for (const row of countryLanguages) {
      if (String(countryCodeOrName).toLowerCase() === String(row?.name || "").toLowerCase()) return row;
    }
    return { primary: "en", langs: ["en", "es", "fr", "de", "pt", "ru", "zh", "ar"] };
  }

  function languageName(code) {
    const d = dictForCode(code);
    return d?._name || String(code || "");
  }

  function availableDictionaryLanguages() {
    const out = [];
    for (const key of Object.keys(DICT)) {
      if (key.length > 2 && DICT[key.slice(0, 2)]) continue;
      out.push({ code: key, name: DICT[key]._name });
    }
    return out;
  }

  async function fetchJson(url, options) {
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(((options || {}).headers) || {}) },
      ...(options || {})
    }).catch(() => ({
      ok: false,
      status: 0,
      statusText: "Network error",
      headers: { get: () => "" },
      json: async () => null
    }));
    let data = null;
    try { data = await res.json(); } catch (_) { data = null; }
    if (!res.ok) {
      const host = (typeof window !== "undefined" && window.location && window.location.hostname) ? String(window.location.hostname) : "";
      const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "" ||
        (typeof window !== "undefined" && window.location && window.location.protocol === "file:");
      const isMeCall = typeof url === "string" && url.indexOf("/api/me") !== -1;
      if (isLocal && isMeCall) {
        const safeRead = function(key){
          try {
            const v = (typeof localStorage !== "undefined") ? localStorage.getItem(key) : null;
            return v ? JSON.parse(v) : null;
          } catch (_) { return null; }
        };
        const fallback = safeRead("demo_me") || safeRead("vt_me_v1") || {
          uid: "demo",
          email: "pj03165@gmail.com",
          profile: {
            firstname: "Frank",
            lastname: "James",
            phone: "+4478789166724",
            gender: "Male",
            createdAt: new Date().toISOString()
          }
        };
        return fallback;
      }
      const msg = String((data && data.error) ? data.error : (res.statusText || "Request failed"));
      if (res.status === 401) {
        throw new Error(msg || VT.I18N.t("en", "error_unauthorized"));
      }
      throw new Error(msg);
    }
    return data;
  }

  function api(path, options) { return fetchJson(path, options); }

  function toastMessage(message, kind) {
    let bar = typeof document !== "undefined" ? document.getElementById("vtI18nToast") : null;
    if (typeof document !== "undefined" && !bar) {
      bar = document.createElement("div");
      bar.id = "vtI18nToast";
      Object.assign(bar.style, {
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999",
        padding: "10px 14px",
        borderRadius: "12px",
        background: kind === "error" ? "rgba(127,29,29,0.92)" : kind === "warn" ? "rgba(146,64,14,0.92)" : "rgba(22,101,52,0.92)",
        color: "#fff",
        fontWeight: "700",
        fontSize: "13px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        maxWidth: "92vw"
      });
      document.body.appendChild(bar);
    }
    if (bar) {
      bar.textContent = String(message || "");
      bar.style.display = "block";
      clearTimeout(bar._vtTid);
      bar._vtTid = setTimeout(() => { bar.style.display = "none"; }, 3000);
    }
  }

  function ensureKycGateCss() {
    if (typeof document === "undefined") return;
    if (document.getElementById("vtKycGateCss")) return;
    const el = document.createElement("style");
    el.id = "vtKycGateCss";
    el.textContent = `
      #vtKycGate {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        background: radial-gradient(circle at top, rgba(212,175,55,0.14), transparent 30%),
          linear-gradient(180deg, #070b10, #0b0f14);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      #vtKycGate .k-shell { max-width: 920px; margin: 0 auto; padding: 24px; }
      #vtKycGate .k-brand { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
      #vtKycGate .k-brand img { height: 36px; max-width: 220px; }
      #vtKycGate .k-head {
        background: rgba(15,23,42,0.7);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px 18px 16px;
        margin-bottom: 14px;
      }
      #vtKycGate .k-head h1 { margin: 0 0 6px; font-size: 22px; color: #f8fafc; }
      #vtKycGate .k-head p { margin: 0; color: #94a3b8; font-size: 13px; }
      #vtKycGate .k-warn {
        background: rgba(146,64,14,0.12);
        border: 1px solid rgba(251,191,36,0.32);
        color: #fde68a;
        padding: 10px 12px;
        border-radius: 14px;
        font-size: 13px;
        margin-bottom: 14px;
      }
      #vtKycGate .k-card {
        background: rgba(15,23,42,0.7);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px;
      }
      #vtKycGate .k-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      #vtKycGate .k-full { grid-column: 1 / -1; }
      #vtKycGate label {
        display: block;
        font-size: 12px;
        color: #cbd5e1;
        font-weight: 800;
        margin: 0 0 6px;
      }
      #vtKycGate label .req { color: #fca5a5; margin-left: 4px; }
      #vtKycGate input, #vtKycGate select {
        width: 100%;
        padding: 12px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: #f8fafc;
        font-size: 14px;
        outline: none;
      }
      #vtKycGate input:focus, #vtKycGate select:focus {
        border-color: rgba(212,175,55,0.75);
        box-shadow: 0 0 0 3px rgba(212,175,55,0.18);
      }
      #vtKycGate .k-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 16px;
        flex-wrap: wrap;
      }
      #vtKycGate .k-btn {
        border: 0;
        border-radius: 14px;
        padding: 12px 16px;
        font-weight: 800;
        cursor: pointer;
        font-size: 14px;
      }
      #vtKycGate .k-btn.primary {
        background: linear-gradient(135deg, #d4af37, #f5d87a);
        color: #0b0f14;
      }
      #vtKycGate .k-btn.primary:disabled { opacity: 0.7; cursor: progress; }
      #vtKycGate .k-btn.secondary {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        color: #f8fafc;
      }
      #vtKycGate .k-foot { margin-top: 18px; text-align: center; color: #94a3b8; font-size: 12px; }
      #vtKycGate .k-err {
        font-size: 12px;
        color: #fecaca;
        margin-top: 4px;
      }
      @media (max-width: 880px) {
        #vtKycGate .k-grid { grid-template-columns: 1fr; }
        #vtKycGate .k-shell { padding: 14px; }
        #vtKycGate .k-head h1 { font-size: 19px; }
      }
    `;
    document.head.appendChild(el);
  }

  function getInitialsFromProfile(userProfile, fallbackEmail) {
    const prof = (userProfile && typeof userProfile === "object" ? userProfile : {}) || {};
    const topLevel = userProfile || {};
    const first = String(prof.firstname || topLevel.firstname || "").trim();
    const last = String(prof.lastname || topLevel.lastname || "").trim();
    if (first || last) {
      let out = "";
      if (first) out += first.charAt(0).toUpperCase();
      if (last) out += last.charAt(0).toUpperCase();
      if (out) return out;
    }
    const email = String(fallbackEmail || prof.email || topLevel.email || "").trim();
    if (email) return email.charAt(0).toUpperCase();
    return "VT";
  }

  function applyAvatarImages(rootEl, userProfileOrMe) {
    if (typeof document === "undefined") return;
    const root = (rootEl && typeof rootEl.querySelectorAll === "function")
      ? rootEl
      : document;
    const profile = (userProfileOrMe && typeof userProfileOrMe === "object") ? userProfileOrMe : {};
    const nestedProfile = (profile.profile && typeof profile.profile === "object") ? profile.profile : {};
    const nestedSecurity = (profile.security && typeof profile.security === "object") ? profile.security : {};
    const profilePic =
      (typeof profile.profilePic === "string" ? profile.profilePic : "") ||
      (typeof profile.photoURL === "string" ? profile.photoURL : "") ||
      (typeof profile.photo === "string" ? profile.photo : "") ||
      (typeof profile.avatar === "string" ? profile.avatar : "") ||
      (typeof nestedProfile.profilePic === "string" ? nestedProfile.profilePic : "") ||
      (typeof nestedProfile.photoURL === "string" ? nestedProfile.photoURL : "") ||
      (typeof nestedProfile.photo === "string" ? nestedProfile.photo : "") ||
      (typeof nestedProfile.avatar === "string" ? nestedProfile.avatar : "") ||
      (typeof nestedSecurity.profilePic === "string" ? nestedSecurity.profilePic : "") ||
      (typeof nestedSecurity.photoURL === "string" ? nestedSecurity.photoURL : "") ||
      (typeof nestedSecurity.photo === "string" ? nestedSecurity.photo : "") ||
      (typeof nestedSecurity.avatar === "string" ? nestedSecurity.avatar : "") || "";
    const email = String(profile.email || nestedProfile.email || "").trim();
    const initials = getInitialsFromProfile(profile, email);
    const trimmedPic = typeof profilePic === "string" ? profilePic.trim() : "";
    let safePicUrl = "";
    if (trimmedPic && (
        /^https?:\/\//i.test(trimmedPic) ||
        /^\/\//i.test(trimmedPic) ||
        /^data:image\//i.test(trimmedPic) ||
        /^\//.test(trimmedPic)
      )) {
      safePicUrl = trimmedPic;
    }

    const avatarSelectors = [
      "#avatarInitials",
      "#profileAvatar",
      ".vt-user .avatar",
      ".user-avatar",
      ".avatar"
    ];
    let processed = 0;
    avatarSelectors.forEach(function(sel){
      try {
        const nodes = root.querySelectorAll(sel);
        if (!nodes || !nodes.length) return;
        nodes.forEach(function(el){
          if (!el || (el.dataset && el.dataset.vtAvatarHandled === "initials")) {
            if (safePicUrl && el.dataset && el.dataset.vtAvatarHandled === "initials") {
              delete el.dataset.vtAvatarHandled;
            } else if (el.dataset && el.dataset.vtAvatarHandled) {
              return;
            }
          }
          const existingImgs = el.querySelectorAll ? el.querySelectorAll("img.vt-avatar-image") : [];
          for (let i = 0; i < existingImgs.length; i++) {
            try { existingImgs[i].remove(); } catch (_) {}
          }
          if (safePicUrl) {
            try { el.dataset.vtAvatarHandled = "image"; } catch (_) {}
            const img = document.createElement("img");
            img.className = "vt-avatar-image";
            img.src = safePicUrl;
            img.alt = initials || "User Avatar";
            img.onerror = function() {
              try {
                if (img.parentNode) img.parentNode.removeChild(img);
                if (el) {
                  el.textContent = initials || "VT";
                  try { el.style.background = ""; } catch (_) {}
                  try { el.style.color = ""; } catch (_) {}
                  try { el.style.backgroundImage = ""; } catch (_) {}
                  try { el.style.padding = ""; } catch (_) {}
                }
              } catch (_) {}
            };
            try {
              img.style.cssText = "width:100%;height:100%;object-fit:cover;object-position:center;display:block;border-radius:inherit;pointer-events:none;";
              el.style.background = "transparent";
              el.style.backgroundImage = "none";
              el.style.padding = "0";
              el.style.color = "transparent";
              el.textContent = "";
              el.appendChild(img);
            } catch (_) {}
          } else {
            try { el.dataset.vtAvatarHandled = "initials"; } catch (_) {}
            try { el.textContent = initials || "VT"; } catch (_) {}
            try {
              el.style.background = "";
              el.style.color = "";
              el.style.backgroundImage = "";
              el.style.padding = "";
            } catch (_) {}
          }
          processed++;
        });
      } catch (_) {}
    });
    return processed;
  }

  function ensurePicGateCss() {
    if (typeof document === "undefined") return;
    if (document.getElementById("vtPicGateCss")) return;
    const el = document.createElement("style");
    el.id = "vtPicGateCss";
    el.textContent = `
      #vtPicGate {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        background: radial-gradient(circle at top, rgba(212,175,55,0.14), transparent 30%),
          linear-gradient(180deg, #070b10, #0b0f14);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      #vtPicGate .p-shell { max-width: 640px; margin: 0 auto; padding: 24px; }
      #vtPicGate .p-brand { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
      #vtPicGate .p-brand img { height: 36px; max-width: 220px; }
      #vtPicGate .p-head {
        background: rgba(15,23,42,0.7);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px 18px 16px;
        margin-bottom: 14px;
        text-align: center;
      }
      #vtPicGate .p-head h1 { margin: 0 0 6px; font-size: 22px; color: #f8fafc; }
      #vtPicGate .p-head p { margin: 0; color: #94a3b8; font-size: 13px; }
      #vtPicGate .p-card {
        background: rgba(15,23,42,0.7);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 22px 18px;
      }
      #vtPicGate .p-preview-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      #vtPicGate .p-avatar {
        width: 168px;
        height: 168px;
        border-radius: 50%;
        border: 3px solid rgba(212,175,55,0.5);
        background: rgba(255,255,255,0.04);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      }
      #vtPicGate .p-avatar img { width: 100%; height: 100%; object-fit: cover; }
      #vtPicGate .p-avatar i, #vtPicGate .p-avatar svg { font-size: 56px; width: 56px; height: 56px; }
      #vtPicGate .p-file-row {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #vtPicGate .p-file-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: linear-gradient(135deg, #d4af37, #f5d87a);
        color: #0b0f14;
        border: 0;
        border-radius: 14px;
        padding: 12px 16px;
        font-weight: 800;
        font-size: 14px;
        cursor: pointer;
        width: 100%;
      }
      #vtPicGate .p-file-btn input[type="file"] { display: none; }
      #vtPicGate .p-hint {
        text-align: center;
        color: #64748b;
        font-size: 12px;
      }
      #vtPicGate .p-filename {
        text-align: center;
        color: #cbd5e1;
        font-size: 12px;
        word-break: break-all;
      }
      #vtPicGate .p-progress {
        width: 100%;
        height: 8px;
        background: rgba(255,255,255,0.06);
        border-radius: 999px;
        overflow: hidden;
        display: none;
      }
      #vtPicGate .p-progress.visible { display: block; }
      #vtPicGate .p-progress-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #d4af37, #f5d87a);
        transition: width 0.2s ease;
      }
      #vtPicGate .p-actions {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 18px;
        flex-wrap: wrap;
      }
      #vtPicGate .p-btn {
        border: 0;
        border-radius: 14px;
        padding: 12px 16px;
        font-weight: 800;
        cursor: pointer;
        font-size: 14px;
        flex: 1 1 140px;
      }
      #vtPicGate .p-btn.primary {
        background: linear-gradient(135deg, #d4af37, #f5d87a);
        color: #0b0f14;
      }
      #vtPicGate .p-btn.primary:disabled { opacity: 0.7; cursor: progress; }
      #vtPicGate .p-btn.secondary {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        color: #f8fafc;
      }
      #vtPicGate .p-foot { margin-top: 18px; text-align: center; color: #94a3b8; font-size: 12px; }
      #vtPicGate .p-err {
        width: 100%;
        font-size: 12px;
        color: #fecaca;
        text-align: center;
        margin-top: 4px;
      }
      @media (max-width: 880px) {
        #vtPicGate .p-shell { padding: 14px; }
        #vtPicGate .p-head h1 { font-size: 19px; }
        #vtPicGate .p-avatar { width: 140px; height: 140px; }
      }
    `;
    document.head.appendChild(el);
  }

  async function cloudinaryUploadFile({ file, cloudName, uploadPreset, folder, onProgress }) {
    if (!file || !cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary upload configuration.");
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", String(uploadPreset));
    if (folder) fd.append("folder", String(folder));

    const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`;

    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.upload.onprogress = function (evt) {
          if (evt.lengthComputable && typeof onProgress === "function") {
            const pct = Math.min(100, Math.max(0, Math.round((evt.loaded / evt.total) * 100)));
            try { onProgress(pct); } catch (_) {}
          }
        };

        xhr.onerror = function () { reject(new Error("Network error during upload.")); };
        xhr.onabort = function () { reject(new Error("Upload aborted.")); };
        xhr.onload = function () {
          let data = null;
          try { data = JSON.parse(xhr.responseText || "{}"); } catch (_) { data = {}; }
          if (xhr.status >= 200 && xhr.status < 300 && data && data.secure_url) {
            resolve({
              secure_url: String(data.secure_url),
              public_id: String(data.public_id || ""),
              width: Number(data.width || 0),
              height: Number(data.height || 0),
              format: String(data.format || ""),
              bytes: Number(data.bytes || 0)
            });
          } else {
            const msg = String((data && (data.error?.message || data.message)) || xhr.statusText || "Upload failed.");
            reject(new Error(msg));
          }
        };

        xhr.send(fd);
      } catch (e) {
        reject(e && e.message ? e : new Error("Upload failed."));
      }
    });
  }

  function buildPicGate({ me, onComplete, onSkip, forceOpen, requireUpload }) {
    ensurePicGateCss();
    ensureKycGateCss();
    if (typeof document === "undefined") return null;
    const existing = document.getElementById("vtPicGate");
    if (existing) existing.remove();

    const cachedPic = readVtKycCache() || null;
    const mergedGateMe = applyKycCacheToMe(me || {});
    const profile = (mergedGateMe && mergedGateMe.profile) || {};
    const cachedHasPic = !!(cachedPic && (cachedPic.profilePic || cachedPic.photoURL || cachedPic.photo || cachedPic.avatar));
    const currentPic = String((mergedGateMe && mergedGateMe.profilePic) || profile.profilePic || profile.photoURL || profile.photo || profile.avatar ||
      (mergedGateMe && mergedGateMe.security && (mergedGateMe.security.profilePic || mergedGateMe.security.photoURL || mergedGateMe.security.photo || mergedGateMe.security.avatar)) || "").trim();
    const mustRequire = requireUpload === true;
    if (!forceOpen && !mustRequire && (currentPic || cachedHasPic)) {
      const finalPic = currentPic || (cachedPic && (cachedPic.profilePic || cachedPic.photoURL || cachedPic.photo || cachedPic.avatar)) || "";
      const publicId = (profile && profile.profilePicPublicId) || (cachedPic && cachedPic.profilePicPublicId) || "";
      if (typeof onComplete === "function") {
        try { setTimeout(function(){ try { onComplete({ profilePic: finalPic, photoURL: finalPic, photo: finalPic, avatar: finalPic, publicId }); } catch (_) {} }, 0); } catch (_) {}
      }
      return null;
    }

    const gate = document.createElement("div");
    gate.id = "vtPicGate";
    document.body.appendChild(gate);
    document.body.style.overflow = "hidden";

    const currentLang = (mergedGateMe && mergedGateMe.preferredLanguage) || "en";
    const dict = DICT[currentLang] ? DICT[currentLang] : DICT.en;
    const subtitleRequired = mustRequire
      ? "<strong style=\"color:#ef4444;\">This step is required</strong> before you can access your dashboard and perform any transfers. Please upload a clear photo of yourself."
      : (dict.pic_subtitle || "Upload a clear photo so we can recognize your account. This step is optional.");

    let pendingFile = null;
    let previewObjectUrl = null;
    let uploadConfig = null;
    let destroyed = false;

    gate.innerHTML = `
      <div class="p-shell">
        <div class="p-brand">
          <img src="/assets/images/brand/logo_VanguardDoubleTrust_white.svg" alt="VanguardDoubleTrust" />
          <div style="color:#94a3b8; font-size:12px" data-i18n="pic_section_title">${dict.pic_section_title || "Profile Picture"}</div>
        </div>
        <div class="p-head">
          <h1 data-i18n="pic_title">${dict.pic_title || "Add Your Profile Picture"}</h1>
          <p>${subtitleRequired}</p>
        </div>
        <div class="p-card">
          <div class="p-preview-wrap">
            <div class="p-avatar" id="pAvatar">
              ${currentPic ? `<img src="${escapeHtml(currentPic)}" alt="preview" />` : `<i class="ti ti-user"></i>`}
            </div>
            <div class="p-file-row">
              <label class="p-file-btn" id="pChooseLabel">
                <i class="ti ti-upload"></i>
                <span data-i18n="pic_upload_label" id="pChooseText">${dict.pic_upload_label || "Choose a Photo"}</span>
                <input type="file" id="pFileInput" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" />
              </label>
              <div class="p-progress" id="pProgress"><div class="p-progress-fill" id="pProgressFill"></div></div>
              <div class="p-filename" id="pFilename"></div>
              <div class="p-hint" data-i18n="pic_hint">${dict.pic_hint || "JPG, PNG, or WebP. Max 8 MB."}</div>
              <div class="p-err" id="pErr"></div>
            </div>
          </div>
          <div class="p-actions">
            ${mustRequire ? "" : `<button type="button" class="p-btn secondary" id="pSkipBtn" data-i18n="pic_skip">${dict.pic_skip || "Skip for now"}</button>`}
            <button type="button" class="p-btn primary" id="pSaveBtn" data-i18n="pic_save" disabled>${dict.pic_save || "Save Profile Picture"}</button>
          </div>
        </div>
        <div class="p-foot" data-i18n="footer_rights">© ${new Date().getFullYear()} VanguardDoubleTrust. ${dict.footer_rights}</div>
      </div>
    `;

    const fileInput = gate.querySelector("#pFileInput");
    const avatarEl = gate.querySelector("#pAvatar");
    const chooseTextEl = gate.querySelector("#pChooseText");
    const filenameEl = gate.querySelector("#pFilename");
    const errEl = gate.querySelector("#pErr");
    const progressEl = gate.querySelector("#pProgress");
    const progressFillEl = gate.querySelector("#pProgressFill");
    const saveBtn = gate.querySelector("#pSaveBtn");
    const skipBtn = gate.querySelector("#pSkipBtn");
    const chooseLabel = gate.querySelector("#pChooseLabel");

    function setError(msg) {
      if (!errEl) return;
      errEl.textContent = msg ? String(msg) : "";
    }

    function setProgress(pct) {
      if (!progressEl || !progressFillEl) return;
      if (typeof pct === "number") {
        progressEl.classList.add("visible");
        progressFillEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      } else {
        progressEl.classList.remove("visible");
        progressFillEl.style.width = "0%";
      }
    }

    function clearPreview() {
      if (previewObjectUrl) {
        try { URL.revokeObjectURL(previewObjectUrl); } catch (_) {}
        previewObjectUrl = null;
      }
      if (avatarEl) {
        avatarEl.innerHTML = currentPic
          ? `<img src="${escapeHtml(currentPic)}" alt="preview" />`
          : `<i class="ti ti-user"></i>`;
      }
      if (filenameEl) filenameEl.textContent = "";
      pendingFile = null;
      if (saveBtn) saveBtn.disabled = true;
      setProgress(null);
    }

    function applyPreview(file) {
      if (!file || !avatarEl) return;
      if (previewObjectUrl) { try { URL.revokeObjectURL(previewObjectUrl); } catch (_) {} previewObjectUrl = null; }
      try {
        previewObjectUrl = URL.createObjectURL(file);
        avatarEl.innerHTML = `<img src="${previewObjectUrl}" alt="preview" />`;
      } catch (_) {
        avatarEl.innerHTML = `<i class="ti ti-user"></i>`;
      }
    }

    function validateFile(file) {
      if (!file) return "No file selected.";
      const name = String(file.name || "").toLowerCase();
      const maxBytes = uploadConfig && Number(uploadConfig.maxBytes) ? Number(uploadConfig.maxBytes) : (8 * 1024 * 1024);
      if (file.size > maxBytes) return dict.pic_error_size || "File too large. Max 8 MB.";
      const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
      const ext = name.includes(".") ? name.split(".").pop() : "";
      if (ext && !allowedExts.includes(ext)) return dict.pic_error_format || "Invalid format. Use JPG, PNG, or WebP.";
      if (file.type) {
        const t = String(file.type).toLowerCase();
        if (!/^image\/(jpeg|png|webp|gif|avif|jpg)$/i.test(t) && !allowedExts.includes(ext)) {
          return dict.pic_error_format || "Invalid format. Use JPG, PNG, or WebP.";
        }
      }
      return "";
    }

    async function loadConfig() {
      try {
        const cfg = await fetchJson("/api/upload/config", { method: "GET" });
        uploadConfig = cfg || {};
      } catch (_) {
        uploadConfig = { enabled: false };
      }
    }

    loadConfig();

    chooseLabel && chooseLabel.addEventListener("click", function () {
      setError("");
    });

    fileInput && fileInput.addEventListener("change", function () {
      setError("");
      const files = fileInput.files;
      const f = files && files[0] ? files[0] : null;
      if (!f) return;
      const err = validateFile(f);
      if (err) {
        setError(err);
        clearPreview();
        fileInput.value = "";
        return;
      }
      pendingFile = f;
      applyPreview(f);
      if (filenameEl) filenameEl.textContent = String(f.name || "");
      if (saveBtn) saveBtn.disabled = false;
    });

    skipBtn && skipBtn.addEventListener("click", function () {
      closeGate();
      if (typeof onSkip === "function") { try { onSkip(); } catch (_) {} }
    });

    saveBtn && saveBtn.addEventListener("click", async function () {
      setError("");
      if (!pendingFile) {
        setError(dict.pic_error_generic || "Please choose a photo first.");
        return;
      }
      if (!uploadConfig || !uploadConfig.enabled || !uploadConfig.cloudName || !uploadConfig.uploadPreset) {
        setError(dict.pic_error_generic || "Upload is currently unavailable. Please try again later.");
        return;
      }
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = dict.pic_uploading || "Uploading…";
      }
      setProgress(0);
      let result = null;
      try {
        result = await cloudinaryUploadFile({
          file: pendingFile,
          cloudName: uploadConfig.cloudName,
          uploadPreset: uploadConfig.uploadPreset,
          folder: uploadConfig.folder || "",
          onProgress: function (pct) { setProgress(pct); }
        });
      } catch (e) {
        setProgress(null);
        setError(String(e?.message || dict.pic_error_generic || "Unable to upload."));
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = dict.pic_save || "Save Profile Picture";
        }
        return;
      }

      if (result && result.secure_url) {
        writeVtKycCache({
          profilePic: String(result.secure_url),
          photoURL: String(result.secure_url),
          photo: String(result.secure_url),
          avatar: String(result.secure_url),
          profilePicPublicId: String(result.public_id || ""),
          photoURLPublicId: String(result.public_id || ""),
          photoPublicId: String(result.public_id || ""),
          avatarPublicId: String(result.public_id || "")
        });
      }

      if (saveBtn) saveBtn.textContent = dict.pic_saving || "Saving…";
      try {
        const saved = await fetchJson("/api/customer/profile-pic", {
          method: "POST",
          body: JSON.stringify({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          })
        });
        const finalPic = String(
          (saved && (saved.profilePic || saved.photoURL || saved.photo || saved.avatar)) ||
          (saved && saved.profile && (saved.profile.profilePic || saved.profile.photoURL || saved.profile.photo || saved.profile.avatar)) ||
          result.secure_url || ""
        );
        const finalPublicId = String(
          (saved && (saved.profilePicPublicId || saved.photoURLPublicId || saved.photoPublicId || saved.avatarPublicId)) ||
          (saved && saved.profile && (saved.profile.profilePicPublicId || saved.profile.photoURLPublicId || saved.profile.photoPublicId || saved.profile.avatarPublicId)) ||
          result.public_id || ""
        );
        const savedKycDone = !!(saved && (saved.kycCompleted === true || saved.kycDone === true || saved.KYCDone === true ||
          (saved.profile && (saved.profile.kycCompleted === true || saved.profile.kycDone === true || saved.profile.KYCDone === true)) ||
          (saved.security && (saved.security.kycCompleted === true || saved.security.kycDone === true || saved.security.KYCDone === true))));
        var picCachePatch = {
          profilePic: finalPic,
          photoURL: finalPic,
          photo: finalPic,
          avatar: finalPic,
          profilePicPublicId: finalPublicId,
          photoURLPublicId: finalPublicId,
          photoPublicId: finalPublicId,
          avatarPublicId: finalPublicId
        };
        if (savedKycDone) {
          picCachePatch.kycCompleted = true;
          picCachePatch.kycDone = true;
          picCachePatch.KYCDone = true;
        }
        writeVtKycCache(picCachePatch);
        toastMessage(dict.pic_success || "Profile picture saved!", "ok");
        closeGate();
        if (typeof onComplete === "function") {
          try { onComplete({
            profilePic: finalPic,
            photoURL: finalPic,
            photo: finalPic,
            avatar: finalPic,
            publicId: finalPublicId,
            profilePicPublicId: finalPublicId,
            photoURLPublicId: finalPublicId,
            photoPublicId: finalPublicId,
            avatarPublicId: finalPublicId,
            kycCompleted: savedKycDone,
            kycDone: savedKycDone,
            KYCDone: savedKycDone,
            saved: saved || {}
          }); } catch (_) {}
        }
      } catch (e) {
        setProgress(null);
        setError(String(e?.message || dict.pic_error_generic || "Unable to save."));
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = dict.pic_save || "Save Profile Picture";
        }
      }
    });

    function closeGate() {
      if (destroyed) return;
      destroyed = true;
      clearPreview();
      try { gate.remove(); } catch (_) {}
      try { document.body.style.overflow = ""; } catch (_) {}
    }

    applyLanguageToDocument(currentLang, gate);
    return { gate, close: closeGate };
  }

  function countryOptions() {
    return [
      { code: "US", name: "United States" },
      { code: "GB", name: "United Kingdom" },
      { code: "CA", name: "Canada" },
      { code: "AU", name: "Australia" },
      { code: "NG", name: "Nigeria" },
      { code: "GH", name: "Ghana" },
      { code: "KE", name: "Kenya" },
      { code: "ZA", name: "South Africa" },
      { code: "EG", name: "Egypt" },
      { code: "MA", name: "Morocco" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "AE", name: "UAE" },
      { code: "QA", name: "Qatar" },
      { code: "KW", name: "Kuwait" },
      { code: "BH", name: "Bahrain" },
      { code: "JO", name: "Jordan" },
      { code: "LB", name: "Lebanon" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "ES", name: "Spain" },
      { code: "IT", name: "Italy" },
      { code: "PT", name: "Portugal" },
      { code: "NL", name: "Netherlands" },
      { code: "BE", name: "Belgium" },
      { code: "CH", name: "Switzerland" },
      { code: "SE", name: "Sweden" },
      { code: "NO", name: "Norway" },
      { code: "DK", name: "Denmark" },
      { code: "PL", name: "Poland" },
      { code: "RU", name: "Russia" },
      { code: "UA", name: "Ukraine" },
      { code: "BR", name: "Brazil" },
      { code: "MX", name: "Mexico" },
      { code: "AR", name: "Argentina" },
      { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" },
      { code: "PE", name: "Peru" },
      { code: "CN", name: "China" },
      { code: "HK", name: "Hong Kong" },
      { code: "TW", name: "Taiwan" },
      { code: "JP", name: "Japan" },
      { code: "KR", name: "South Korea" },
      { code: "SG", name: "Singapore" },
      { code: "MY", name: "Malaysia" },
      { code: "TH", name: "Thailand" },
      { code: "VN", name: "Vietnam" },
      { code: "PH", name: "Philippines" },
      { code: "ID", name: "Indonesia" },
      { code: "IN", name: "India" },
      { code: "PK", name: "Pakistan" },
      { code: "BD", name: "Bangladesh" },
      { code: "NZ", name: "New Zealand" },
      { code: "TR", name: "Turkey" },
      { code: "IL", name: "Israel" },
      { code: "DZ", name: "Algeria" },
      { code: "TN", name: "Tunisia" },
      { code: "SN", name: "Senegal" },
      { code: "CI", name: "Côte d'Ivoire" },
      { code: "CM", name: "Cameroon" },
      { code: "UG", name: "Uganda" },
      { code: "TZ", name: "Tanzania" },
      { code: "ET", name: "Ethiopia" }
    ];
  }

  function buildKycGate({ me, onComplete }) {
    ensureKycGateCss();
    if (typeof document === "undefined") return null;
    const existing = document.getElementById("vtKycGate");
    if (existing) existing.remove();

    const existingCached = readVtKycCache() || null;
    const cachedDone = !!(existingCached && existingCached.kycCompleted === true);
    const mergedGateMe = applyKycCacheToMe(me || {});
    const profile = (mergedGateMe && mergedGateMe.profile) || {};
    const serverDone = !!(mergedGateMe && mergedGateMe.security && mergedGateMe.security.kycCompleted === true);
    const fieldsDone = !!(profile && profile.country && profile.preferredLanguage);
    const serverSignalExplicitDone = !!(me && me.security && (me.security.kycCompleted === true || me.security.kycDone === true || me.security.KYCDone === true));
    if (cachedDone || serverDone || serverSignalExplicitDone || fieldsDone) {
      const lang = (existingCached && existingCached.preferredLanguage) || (mergedGateMe && mergedGateMe.preferredLanguage) || (mergedGateMe && mergedGateMe.profile && mergedGateMe.profile.preferredLanguage) || "en";
      const retData = {
        ok: true,
        preferredLanguage: lang,
        profile: Object.assign({}, profile || {}, existingCached ? { country: existingCached.country || "" } : {}),
        security: Object.assign({}, (mergedGateMe && mergedGateMe.security) || {}, { kycCompleted: true })
      };
      if (typeof onComplete === "function") {
        try { setTimeout(function(){ try { onComplete({ data: retData, language: lang }); } catch (_) {} }, 0); } catch (_) {}
      }
      return null;
    }

    const gate = document.createElement("div");
    gate.id = "vtKycGate";
    document.body.appendChild(gate);
    document.body.style.overflow = "hidden";

    const currentLang = (mergedGateMe && mergedGateMe.preferredLanguage) || "en";

    const countries = countryOptions();
    const dict = DICT[currentLang] ? DICT[currentLang] : DICT.en;

    const firstName = String(
      (profile.firstname || profile.firstName || profile.first_name || (mergedGateMe && mergedGateMe.firstname) || (mergedGateMe && mergedGateMe.firstName) || (mergedGateMe && mergedGateMe.first_name) || "")
    ).trim();
    const lastName = String(
      (profile.lastname || profile.lastName || profile.last_name || (mergedGateMe && mergedGateMe.lastname) || (mergedGateMe && mergedGateMe.lastName) || (mergedGateMe && mergedGateMe.last_name) || "")
    ).trim();

    function buildLanguageOptions(countryCode, selectedCode) {
      const info = getCountryLanguages(countryCode);
      const allLangs = getAllDictionaryLanguages();
      const allowed = new Set(allLangs.length ? allLangs : ["en", "es", "fr", "de", "pt", "ru", "zh", "ar"]);
      const rawCodes = (info.langs && info.langs.length ? info.langs : (allLangs.length ? allLangs : ["en", "es", "fr", "de", "pt", "ru", "zh", "ar"]))
        .map((c) => (allowed.has(c) ? c : String(c).split("-")[0]))
        .filter((c) => allowed.has(c));
      const seen = new Set();
      const list = [];
      for (const c of rawCodes) {
        if (!seen.has(c)) { seen.add(c); list.push(c); }
      }
      if (!list.includes("en") && allowed.has("en")) list.unshift("en");
      const primary = info.primary || (list[0] || "en");
      const primaryBase = allowed.has(primary) ? primary : (allowed.has(String(primary).split("-")[0]) ? String(primary).split("-")[0] : "en");
      const opts = list
        .map((c) => ({ code: c, name: languageName(c) }))
        .sort((a, b) => (a.code === primaryBase ? -1 : b.code === primaryBase ? 1 : 0));
      return { options: opts, defaultCode: selectedCode || primaryBase };
    }

    let initialCountry = (profile.country || "").trim();
    if (!initialCountry) initialCountry = "";
    const initialInfo = buildLanguageOptions(initialCountry, (profile.preferredLanguage || currentLang));

    const countryOptionHtml = [
      `<option value="">-- ${dict.kyc_country || "Country"} --</option>`,
      ...countries.map((c) => `<option value="${c.code}" ${initialCountry === c.code ? "selected" : ""}>${escapeHtml(c.name)}</option>`)
    ].join("");

    const languageOptionHtml = (opts, sel) => {
      return opts
        .map((o) => `<option value="${o.code}" ${o.code === sel ? "selected" : ""}>${escapeHtml(o.name)}</option>`)
        .join("");
    };

    const genderOptions = [
      `<option value="">-- ${dict.kyc_gender || "Gender"} --</option>`,
      `<option value="male" ${profile.gender === "male" ? "selected" : ""}>${dict.kyc_gender_male || "Male"}</option>`,
      `<option value="female" ${profile.gender === "female" ? "selected" : ""}>${dict.kyc_gender_female || "Female"}</option>`,
      `<option value="other" ${profile.gender === "other" ? "selected" : ""}>${dict.kyc_gender_other || "Other"}</option>`,
      `<option value="prefer_not_say" ${profile.gender === "prefer_not_say" ? "selected" : ""}>${dict.kyc_gender_prefernotsay || "Prefer not to say"}</option>`
    ].join("");

    gate.innerHTML = `
      <div class="k-shell">
        <div class="k-brand">
          <img src="/assets/images/brand/logo_VanguardDoubleTrust_white.svg" alt="VanguardDoubleTrust" />
          <div style="color:#94a3b8; font-size:12px" data-i18n="nav_kyc">${dict.nav_kyc}</div>
        </div>
        <div class="k-head">
          <h1 data-i18n="kyc_title">${dict.kyc_title}</h1>
          <p data-i18n="kyc_subtitle">${dict.kyc_subtitle}</p>
        </div>
        <div class="k-warn" data-i18n="kyc_required_warning">${dict.kyc_required_warning}</div>
        <div class="k-card">
          <form id="vtKycForm" autocomplete="on" novalidate>
            <div class="k-grid">
              <div>
                <label data-i18n="kyc_firstname">${dict.kyc_firstname}<span class="req">*</span></label>
                <input id="kFirstname" name="firstname" type="text" value="${escapeHtml(firstName || "")}" autocomplete="given-name" />
                <div class="k-err" data-k-err="firstname"></div>
              </div>
              <div>
                <label data-i18n="kyc_lastname">${dict.kyc_lastname}<span class="req">*</span></label>
                <input id="kLastname" name="lastname" type="text" value="${escapeHtml(lastName || "")}" autocomplete="family-name" />
                <div class="k-err" data-k-err="lastname"></div>
              </div>
              <div>
                <label data-i18n="kyc_phone">${dict.kyc_phone}</label>
                <input id="kPhone" name="phone" type="tel" value="${escapeHtml(profile.phone || "")}" autocomplete="tel" inputmode="tel" />
                <div class="k-err" data-k-err="phone"></div>
              </div>
              <div>
                <label data-i18n="kyc_country">${dict.kyc_country}<span class="req">*</span></label>
                <select id="kCountry" name="country" required>${countryOptionHtml}</select>
                <div class="k-err" data-k-err="country"></div>
              </div>
              <div>
                <label data-i18n="kyc_language">${dict.kyc_language}</label>
                <select id="kLanguage" name="preferredLanguage">${languageOptionHtml(initialInfo.options || [], initialInfo.defaultCode || "en")}</select>
                <div class="k-err" data-k-err="preferredLanguage"></div>
              </div>
              <div>
                <label data-i18n="kyc_gender">${dict.kyc_gender}</label>
                <select id="kGender" name="gender">${genderOptions}</select>
              </div>
              <div>
                <label data-i18n="kyc_dob">${dict.kyc_dob}</label>
                <input id="kDob" name="dateOfBirth" type="date" value="${escapeHtml(profile.dateOfBirth || profile.dob || "")}" />
              </div>
              <div>
                <label data-i18n="kyc_nationality">${dict.kyc_nationality}</label>
                <input id="kNationality" name="nationality" type="text" value="${escapeHtml(profile.nationality || "")}" />
              </div>
              <div>
                <label data-i18n="kyc_occupation">${dict.kyc_occupation}</label>
                <input id="kOccupation" name="occupation" type="text" value="${escapeHtml(profile.occupation || "")}" />
              </div>
              <div class="k-full">
                <label data-i18n="kyc_address">${dict.kyc_address}</label>
                <input id="kAddress" name="address" type="text" value="${escapeHtml(profile.address || "")}" autocomplete="street-address" />
              </div>
              <div>
                <label data-i18n="kyc_city">${dict.kyc_city}</label>
                <input id="kCity" name="city" type="text" value="${escapeHtml(profile.city || "")}" autocomplete="address-level2" />
              </div>
              <div>
                <label data-i18n="kyc_state">${dict.kyc_state}</label>
                <input id="kState" name="state" type="text" value="${escapeHtml(profile.state || "")}" autocomplete="address-level1" />
              </div>
              <div class="k-full">
                <label data-i18n="kyc_zip">${dict.kyc_zip}</label>
                <input id="kZip" name="zipCode" type="text" value="${escapeHtml(profile.zipCode || "")}" autocomplete="postal-code" />
              </div>
            </div>
            <div class="k-actions">
              <button type="submit" class="k-btn primary" id="kSubmitBtn" data-i18n="kyc_submit">${dict.kyc_submit}</button>
            </div>
          </form>
        </div>
        <div class="k-foot" data-i18n="footer_rights">© ${new Date().getFullYear()} VanguardDoubleTrust. ${dict.footer_rights}</div>
      </div>
    `;

    const form = gate.querySelector("#vtKycForm");
    const countryEl = gate.querySelector("#kCountry");
    const languageEl = gate.querySelector("#kLanguage");

    function refreshLanguageOptions(selectedCode) {
      if (!countryEl || !languageEl) return;
      const countryCode = countryEl.value || "";
      const info = buildLanguageOptions(countryCode, "");
      const available = new Set((info.options || []).map((o) => o.code));
      let preferred = "";
      if (typeof selectedCode === "string" && selectedCode && available.has(selectedCode)) {
        preferred = selectedCode;
      } else if (available.has(languageEl.value) && !countryCode) {
        preferred = languageEl.value;
      }
      const finalSel = preferred || info.defaultCode || "en";
      languageEl.innerHTML = languageOptionHtml(info.options, finalSel);
    }

    countryEl && countryEl.addEventListener("change", () => {
      refreshLanguageOptions("");
    });

    form && form.addEventListener("submit", async (e) => {
      e.preventDefault();
      gate.querySelectorAll("[data-k-err]").forEach((el) => (el.textContent = ""));
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      const firstname = String(payload.firstname || "").trim();
      const lastname = String(payload.lastname || "").trim();
      const country = String(payload.country || "").trim();
      const pLanguage = String(payload.preferredLanguage || "en").trim();
      let hasErr = false;
      if (!firstname) {
        const el = gate.querySelector("[data-k-err='firstname']");
        if (el) { el.textContent = dict.kyc_required || "Required"; hasErr = true; }
      }
      if (!lastname) {
        const el = gate.querySelector("[data-k-err='lastname']");
        if (el) { el.textContent = dict.kyc_required || "Required"; hasErr = true; }
      }
      if (!country) {
        const el = gate.querySelector("[data-k-err='country']");
        if (el) { el.textContent = dict.kyc_required || "Required"; hasErr = true; }
      }
      if (hasErr) return;
      const submitBtn = gate.querySelector("#kSubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = dict.kyc_submitting || "Saving…";
      }
      writeVtKycCache({ kycCompleted: true, country: country, preferredLanguage: pLanguage, firstname, lastname });
      try {
        const data = await api("/api/customer/kyc", {
          method: "POST",
          body: JSON.stringify({
            firstname,
            lastname,
            country,
            preferredLanguage: pLanguage,
            phone: String(payload.phone || "").trim(),
            gender: String(payload.gender || "").trim(),
            dateOfBirth: String(payload.dateOfBirth || "").trim(),
            nationality: String(payload.nationality || "").trim(),
            occupation: String(payload.occupation || "").trim(),
            address: String(payload.address || "").trim(),
            city: String(payload.city || "").trim(),
            state: String(payload.state || "").trim(),
            zipCode: String(payload.zipCode || "").trim()
          })
        });
        const newLang = (data && data.preferredLanguage) || (data && data.profile && data.profile.preferredLanguage) || pLanguage;
        const serverPic = String((data && (data.profilePic || data.photoURL || data.photo || data.avatar)) ||
          (data && data.profile && (data.profile.profilePic || data.profile.photoURL || data.profile.photo || data.profile.avatar)) || "");
        const serverPicPub = String((data && (data.profilePicPublicId || data.photoURLPublicId || data.photoPublicId || data.avatarPublicId)) ||
          (data && data.profile && (data.profile.profilePicPublicId || data.profile.photoURLPublicId || data.profile.photoPublicId || data.profile.avatarPublicId)) || "");
        var cachePatch = { kycCompleted: true, kycDone: true, KYCDone: true, country: country, preferredLanguage: newLang, firstname, lastname };
        if (serverPic) {
          cachePatch.profilePic = serverPic;
          cachePatch.photoURL = serverPic;
          cachePatch.photo = serverPic;
          cachePatch.avatar = serverPic;
        }
        if (serverPicPub) {
          cachePatch.profilePicPublicId = serverPicPub;
          cachePatch.photoURLPublicId = serverPicPub;
          cachePatch.photoPublicId = serverPicPub;
          cachePatch.avatarPublicId = serverPicPub;
        }
        writeVtKycCache(cachePatch);
        applyLanguageToDocument(newLang, document);
        toastMessage(DICT[newLang]?.kyc_success || dict.kyc_success, "ok");
        gate.remove();
        try { document.body.style.overflow = ""; } catch (_) {}
        if (typeof onComplete === "function") {
          try { onComplete({ data: data || {}, language: newLang }); } catch (_) {}
        }
      } catch (err) {
        toastMessage(String(err?.message || dict.kyc_genericError || "Unable to save."), "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = dict.kyc_submit || "Complete Setup";
        }
      }
    });

    applyLanguageToDocument(currentLang, gate);
    return gate;
  }

  let _vtBootstrapRan = false;
  let _vtKycGateOpened = false;
  let _vtPicGateOpened = false;

  var VT_KYC_CACHE_KEY = "vt_kyc_state_v1";
  var VT_KYC_PERM_KEY = "vt_kyc_perm_v1";

  function readVtKycCache() {
    try {
      if (typeof window === "undefined") return null;
      var ss = null;
      try {
        if (window.sessionStorage) {
          var raw = window.sessionStorage.getItem(VT_KYC_CACHE_KEY);
          if (raw) ss = JSON.parse(raw);
        }
      } catch (_) { ss = null; }
      var ls = null;
      try {
        if (window.localStorage) {
          var raw2 = window.localStorage.getItem(VT_KYC_PERM_KEY);
          if (raw2) ls = JSON.parse(raw2);
        }
      } catch (_) { ls = null; }
      if (!ss && !ls) return null;
      var merged = Object.assign({}, ls || {}, ss || {});
      if (ls && ls.kycCompleted === true && merged.kycCompleted !== true) merged.kycCompleted = true;
      if (ss && ss.kycCompleted === true && merged.kycCompleted !== true) merged.kycCompleted = true;
      var lsPic = String(ls?.profilePic || ls?.photoURL || ls?.photo || ls?.avatar || "");
      var ssPic = String(ss?.profilePic || ss?.photoURL || ss?.photo || ss?.avatar || "");
      var finalPic = ssPic || lsPic || "";
      if (finalPic) {
        merged.profilePic = merged.profilePic || finalPic;
        merged.photoURL = merged.photoURL || finalPic;
        merged.photo = merged.photo || finalPic;
        merged.avatar = merged.avatar || finalPic;
      }
      var lsPub = String(ls?.profilePicPublicId || ls?.photoURLPublicId || ls?.photoPublicId || ls?.avatarPublicId || "");
      var ssPub = String(ss?.profilePicPublicId || ss?.photoURLPublicId || ss?.photoPublicId || ss?.avatarPublicId || "");
      var finalPub = ssPub || lsPub || "";
      if (finalPub) {
        merged.profilePicPublicId = merged.profilePicPublicId || finalPub;
        merged.photoURLPublicId = merged.photoURLPublicId || finalPub;
        merged.photoPublicId = merged.photoPublicId || finalPub;
        merged.avatarPublicId = merged.avatarPublicId || finalPub;
      }
      return merged;
    } catch (_) { return null; }
  }

  function writeVtKycCache(patch) {
    try {
      if (typeof window === "undefined") return;
      var existing = readVtKycCache() || {};
      var patchObj = patch || {};
      var patchProfilePic = String(patchObj.profilePic || existing.profilePic || "");
      var patchPhotoURL = String(patchObj.photoURL || patchProfilePic || existing.photoURL || "");
      var patchPhoto = String(patchObj.photo || patchPhotoURL || existing.photo || "");
      var patchAvatar = String(patchObj.avatar || patchPhoto || existing.avatar || "");
      var patchPublicId = String(patchObj.profilePicPublicId || existing.profilePicPublicId || "");
      if (patchProfilePic) patchPhotoURL = patchPhotoURL || patchProfilePic;
      if (patchPhotoURL) patchPhoto = patchPhoto || patchPhotoURL;
      if (patchPhoto) patchAvatar = patchAvatar || patchPhoto;
      var normalizedPatch = Object.assign({}, patchObj || {}, {
        profilePic: patchProfilePic || patchObj.profilePic || "",
        photoURL: patchPhotoURL || patchObj.photoURL || patchProfilePic || "",
        photo: patchPhoto || patchObj.photo || patchPhotoURL || "",
        avatar: patchAvatar || patchObj.avatar || patchPhoto || "",
        profilePicPublicId: patchPublicId || "",
        photoURLPublicId: patchPublicId || "",
        photoPublicId: patchPublicId || "",
        avatarPublicId: patchPublicId || ""
      });
      var next = Object.assign({}, existing || {}, normalizedPatch || {}, { savedAt: Date.now() });
      try { if (window.sessionStorage) window.sessionStorage.setItem(VT_KYC_CACHE_KEY, JSON.stringify(next)); } catch (_) {}
      if (patch && patch.kycCompleted === true) {
        try { if (window.localStorage) window.localStorage.setItem(VT_KYC_PERM_KEY, JSON.stringify({
          kycCompleted: true,
          kycDone: true,
          KYCDone: true,
          country: next.country || existing.country || "",
          preferredLanguage: next.preferredLanguage || existing.preferredLanguage || "en"
        })); } catch (_) {}
      }
      if (patch && (patch.profilePic || patch.photoURL || patch.photo || patch.avatar || existing.profilePic || existing.photoURL || existing.photo || existing.avatar)) {
        try { if (window.localStorage) {
          var existingPerm = null;
          try { existingPerm = JSON.parse(window.localStorage.getItem(VT_KYC_PERM_KEY) || "{}"); } catch (_) { existingPerm = {}; }
          var perm = Object.assign({}, existingPerm || {}, {
            profilePic: next.profilePic || "",
            photoURL: next.photoURL || next.profilePic || "",
            photo: next.photo || next.photoURL || next.profilePic || "",
            avatar: next.avatar || next.photo || next.photoURL || next.profilePic || "",
            profilePicPublicId: next.profilePicPublicId || "",
            photoURLPublicId: next.profilePicPublicId || "",
            photoPublicId: next.profilePicPublicId || "",
            avatarPublicId: next.profilePicPublicId || ""
          });
          window.localStorage.setItem(VT_KYC_PERM_KEY, JSON.stringify(perm));
        } } catch (_) {}
      }
    } catch (_) {}
  }

  function applyKycCacheToMe(me) {
    if (!me || typeof me !== "object") return me;
    var cached = readVtKycCache();
    if (!cached) return me;
    var merged = Object.assign({}, me);
    if (cached.kycCompleted) {
      merged.security = Object.assign({}, merged.security || {});
      merged.security.kycCompleted = true;
      merged.security.KYCDone = true;
      merged.security.kycDone = true;
      if (!merged.security.kycCompletedAt) merged.security.kycCompletedAt = cached.kycCompletedAt || (new Date()).toISOString();
      if (!merged.security.KYCDoneAt) merged.security.KYCDoneAt = cached.KYCDoneAt || merged.security.kycCompletedAt || (new Date()).toISOString();
      if (!merged.security.kycDoneAt) merged.security.kycDoneAt = cached.kycDoneAt || merged.security.kycCompletedAt || (new Date()).toISOString();
      merged.profile = Object.assign({}, merged.profile || {});
      merged.profile.kycCompleted = true;
      merged.profile.KYCDone = true;
      merged.profile.kycDone = true;
      if (!merged.profile.kycCompletedAt) merged.profile.kycCompletedAt = cached.kycCompletedAt || merged.security.kycCompletedAt || (new Date()).toISOString();
      if (!merged.profile.KYCDoneAt) merged.profile.KYCDoneAt = cached.KYCDoneAt || merged.profile.kycCompletedAt || (new Date()).toISOString();
      if (!merged.profile.kycDoneAt) merged.profile.kycDoneAt = cached.kycDoneAt || merged.profile.kycCompletedAt || (new Date()).toISOString();
      if (cached.country) merged.profile.country = cached.country;
      if (cached.preferredLanguage) {
        merged.profile.preferredLanguage = cached.preferredLanguage;
        if (!merged.preferredLanguage) merged.preferredLanguage = cached.preferredLanguage;
      }
    }
    var cachedPic = String(cached.profilePic || cached.photoURL || cached.photo || cached.avatar || "");
    var cachedPicPublic = String(cached.profilePicPublicId || cached.photoURLPublicId || cached.photoPublicId || cached.avatarPublicId || "");
    if (cachedPic) {
      merged.profilePic = merged.profilePic || cachedPic;
      merged.photoURL = merged.photoURL || merged.profilePic || cachedPic;
      merged.photo = merged.photo || merged.photoURL || merged.profilePic || cachedPic;
      merged.avatar = merged.avatar || merged.photo || merged.photoURL || merged.profilePic || cachedPic;
      merged.profile = Object.assign({}, merged.profile || {});
      merged.profile.profilePic = merged.profile.profilePic || cachedPic;
      merged.profile.photoURL = merged.profile.photoURL || merged.profile.profilePic || cachedPic;
      merged.profile.photo = merged.profile.photo || merged.profile.photoURL || merged.profile.profilePic || cachedPic;
      merged.profile.avatar = merged.profile.avatar || merged.profile.photo || merged.profile.photoURL || merged.profile.profilePic || cachedPic;
      if (cachedPicPublic) {
        merged.profile.profilePicPublicId = merged.profile.profilePicPublicId || cachedPicPublic;
        merged.profile.photoURLPublicId = merged.profile.photoURLPublicId || cachedPicPublic;
        merged.profile.photoPublicId = merged.profile.photoPublicId || cachedPicPublic;
        merged.profile.avatarPublicId = merged.profile.avatarPublicId || cachedPicPublic;
      }
      merged.security = Object.assign({}, merged.security || {});
      merged.security.profilePic = merged.security.profilePic || cachedPic;
      merged.security.photoURL = merged.security.photoURL || merged.security.profilePic || cachedPic;
      merged.security.photo = merged.security.photo || merged.security.photoURL || merged.security.profilePic || cachedPic;
      merged.security.avatar = merged.security.avatar || merged.security.photo || merged.security.photoURL || merged.security.profilePic || cachedPic;
      if (cachedPicPublic) {
        merged.security.profilePicPublicId = merged.security.profilePicPublicId || cachedPicPublic;
        merged.security.photoURLPublicId = merged.security.photoURLPublicId || cachedPicPublic;
        merged.security.photoPublicId = merged.security.photoPublicId || cachedPicPublic;
        merged.security.avatarPublicId = merged.security.avatarPublicId || cachedPicPublic;
      }
    }
    return merged;
  }

  async function bootstrapCustomerPage(options) {
    if (typeof document === "undefined") return null;
    if (_vtBootstrapRan) {
      return new Promise(function(resolve){ resolve({ me: null, language: "en", kycCompleted: true, profilePicPrompted: false, duplicateBootstrapPrevented: true }); });
    }
    _vtBootstrapRan = true;
    let me = null;
    try {
      me = await api("/api/me");
    } catch (err) {
      const str = String(err?.message || "");
      if (/unauthorized|sign in|session ended/i.test(str) || /401|403/.test(str)) {
        window.location.href = "/customer/login.php";
      }
      _vtBootstrapRan = false;
      throw err;
    }
    me = applyKycCacheToMe(me || null);
    const lang = (me && me.preferredLanguage) || "en";
    applyLanguageToDocument(lang, document);
    try { applyAvatarImages(document, me || {}); } catch (_) {}

    (function hydrateBalanceElements(){
      try {
        if (!me || !document || typeof document.getElementById !== "function") return;
        const a = me.account || {};
        const avail = Number(a.availableBalance);
        const rawBal = Number.isFinite(avail) && avail >= 0 ? avail : (Number.isFinite(Number(a.balance)) && Number(a.balance) >= 0 ? Number(a.balance) : 0);
        const currency = String(a.currency || "USD").trim().toUpperCase() || "USD";
        let formatted;
        try {
          formatted = rawBal.toLocaleString(undefined, { style: "currency", currency: currency === "USD" || /^[A-Z]{3}$/.test(currency) ? currency : "USD" });
        } catch (_) {
          formatted = "$" + rawBal.toFixed(2);
        }
        const balanceIds = [
          "internationalBalance",
          "dashboardBalance",
          "heroBalance",
          "availableBalance",
          "accountBalance",
          "stCurrentBalance",
          "currentBalance"
        ];
        for (let i = 0; i < balanceIds.length; i++) {
          const id = balanceIds[i];
          const el = document.getElementById(id);
          if (el && !el.dataset.vtBalanceHydrated) {
            try {
              el.textContent = formatted;
              el.dataset.vtBalanceHydrated = "1";
            } catch (_) {}
          }
        }
        const balAttrSel = document.querySelectorAll("[data-vt-balance], [data-balance='available']");
        if (balAttrSel && balAttrSel.forEach) {
          balAttrSel.forEach(function(el){
            try {
              if (!el.dataset.vtBalanceHydrated) {
                el.textContent = formatted;
                el.dataset.vtBalanceHydrated = "1";
              }
            } catch (_) {}
          });
        }
      } catch (_) {}
    })();

    function resolveProfilePicUrl(obj) {
      if (!obj || typeof obj !== "object") return "";
      const p = obj.profile || {};
      const s = obj.security || {};
      return String(
        (typeof obj.profilePic === "string" ? obj.profilePic : "") ||
        (typeof obj.photoURL === "string" ? obj.photoURL : "") ||
        (typeof obj.photo === "string" ? obj.photo : "") ||
        (typeof obj.avatar === "string" ? obj.avatar : "") ||
        (typeof p.profilePic === "string" ? p.profilePic : "") ||
        (typeof p.photoURL === "string" ? p.photoURL : "") ||
        (typeof p.photo === "string" ? p.photo : "") ||
        (typeof p.avatar === "string" ? p.avatar : "") ||
        (typeof s.profilePic === "string" ? s.profilePic : "") ||
        (typeof s.photoURL === "string" ? s.photoURL : "") ||
        (typeof s.photo === "string" ? s.photo : "") ||
        (typeof s.avatar === "string" ? s.avatar : "") || ""
      ).trim();
    }
    const actualProfilePic = resolveProfilePicUrl(me || {});

    function maybeRunAfter(finalMe, finalLanguage, extras) {
      if (options && typeof options.after === "function") {
        try {
          options.after(Object.assign(
            {
              me: finalMe,
              language: finalLanguage,
              kycCompleted: true,
              picUploaded: !!actualProfilePic,
              profilePicUploaded: !!actualProfilePic,
              profilePicPrompted: false,
              profilePic: actualProfilePic,
              photoURL: actualProfilePic
            },
            extras || {}
          ));
        } catch (_) {}
      }
    }

    return new Promise((resolve) => {
      maybeRunAfter(me || {}, lang, { profilePicPrompted: false, profilePic: actualProfilePic, photoURL: actualProfilePic });
      resolve({ me: me || {}, language: lang, kycCompleted: true, profilePicPrompted: false, profilePic: actualProfilePic, photoURL: actualProfilePic, kycGateSkipped: true, picGateSkipped: true });
    });
  }

  function safeShowKycGate(opts) {
    const options = opts || {};
    const cached = readVtKycCache();
    const mergedMe = applyKycCacheToMe(options.me || {});
    const sDone = !!(
      (mergedMe && mergedMe.security && mergedMe.security.kycCompleted === true) ||
      (mergedMe && mergedMe.security && mergedMe.security.kycDone === true) ||
      (mergedMe && mergedMe.security && mergedMe.security.KYCDone === true) ||
      (mergedMe && mergedMe.profile && mergedMe.profile.kycCompleted === true) ||
      (mergedMe && mergedMe.profile && mergedMe.profile.kycDone === true) ||
      (mergedMe && mergedMe.profile && mergedMe.profile.KYCDone === true)
    );
    const pDone = !!((mergedMe && mergedMe.profile) && (mergedMe.profile.country) && (mergedMe.profile.preferredLanguage));
    const cDone = !!(cached && (cached.kycCompleted === true || cached.kycDone === true || cached.KYCDone === true));
    if (sDone || pDone || cDone) {
      const finalCountry = (mergedMe && mergedMe.profile && mergedMe.profile.country) || (cached && cached.country) || "";
      const finalLang = (cached && cached.preferredLanguage) || (mergedMe && mergedMe.preferredLanguage) || (mergedMe && mergedMe.profile && mergedMe.profile.preferredLanguage) || "en";
      const finalPic = String(
        (mergedMe && (mergedMe.profilePic || mergedMe.photoURL || mergedMe.photo || mergedMe.avatar)) ||
        (mergedMe && mergedMe.profile && (mergedMe.profile.profilePic || mergedMe.profile.photoURL || mergedMe.profile.photo || mergedMe.profile.avatar)) ||
        (cached && (cached.profilePic || cached.photoURL || cached.photo || cached.avatar)) || ""
      );
      const finalPub = String(
        (mergedMe && mergedMe.profile && (mergedMe.profile.profilePicPublicId || mergedMe.profile.photoURLPublicId || mergedMe.profile.photoPublicId || mergedMe.profile.avatarPublicId)) ||
        (cached && (cached.profilePicPublicId || cached.photoURLPublicId || cached.photoPublicId || cached.avatarPublicId)) || ""
      );
      if (typeof options.onComplete === "function") {
        try {
          var profileMerged = Object.assign({}, mergedMe.profile || {},
            finalCountry ? { country: finalCountry } : {},
            { preferredLanguage: finalLang },
            { kycCompleted: true, kycDone: true, KYCDone: true },
            finalPic ? {
              profilePic: finalPic,
              photoURL: finalPic,
              photo: finalPic,
              avatar: finalPic,
              profilePicPublicId: finalPub || (mergedMe.profile && mergedMe.profile.profilePicPublicId) || "",
              photoURLPublicId: finalPub || (mergedMe.profile && mergedMe.profile.photoURLPublicId) || "",
              photoPublicId: finalPub || (mergedMe.profile && mergedMe.profile.photoPublicId) || "",
              avatarPublicId: finalPub || (mergedMe.profile && mergedMe.profile.avatarPublicId) || ""
            } : {}
          );
          var securityMerged = Object.assign({}, mergedMe.security || {},
            { kycCompleted: true, kycDone: true, KYCDone: true },
            finalPic ? {
              profilePic: finalPic,
              photoURL: finalPic,
              photo: finalPic,
              avatar: finalPic,
              profilePicPublicId: finalPub || (mergedMe.security && mergedMe.security.profilePicPublicId) || "",
              photoURLPublicId: finalPub || (mergedMe.security && mergedMe.security.photoURLPublicId) || "",
              photoPublicId: finalPub || (mergedMe.security && mergedMe.security.photoPublicId) || "",
              avatarPublicId: finalPub || (mergedMe.security && mergedMe.security.avatarPublicId) || ""
            } : {}
          );
          options.onComplete({
            data: {
              profile: profileMerged,
              security: securityMerged,
              profilePic: finalPic,
              photoURL: finalPic,
              photo: finalPic,
              avatar: finalPic,
              profilePicPublicId: finalPub,
              kycCompleted: true,
              kycDone: true,
              KYCDone: true
            },
            language: finalLang
          });
        } catch (_) {}
      }
      return null;
    }
    return buildKycGate(Object.assign({}, options, { me: mergedMe }));
  }

  function safeShowPicGate(opts) {
    const options = opts || {};
    const cached = readVtKycCache();
    const mergedMe = applyKycCacheToMe(options.me || {});
    const hasPic = !!(
      (mergedMe && mergedMe.profilePic) ||
      (mergedMe && mergedMe.profile && (mergedMe.profile.profilePic || mergedMe.profile.photoURL || mergedMe.profile.photo || mergedMe.profile.avatar)) ||
      (cached && (cached.profilePic || cached.photoURL || cached.photo || cached.avatar))
    );
    if (!options.forceOpen && hasPic) {
      const cachedPic = String(cached && (cached.profilePic || cached.photoURL || cached.photo || cached.avatar) || "");
      const mergedPic = String(mergedMe && (mergedMe.profilePic || mergedMe.photoURL || mergedMe.photo || mergedMe.avatar ||
        (mergedMe.profile && (mergedMe.profile.profilePic || mergedMe.profile.photoURL || mergedMe.profile.photo || mergedMe.profile.avatar))) || "");
      const profilePic = mergedPic || cachedPic || "";
      const mergedPub = String(mergedMe && mergedMe.profile && (mergedMe.profile.profilePicPublicId || mergedMe.profile.photoURLPublicId || mergedMe.profile.photoPublicId || mergedMe.profile.avatarPublicId) || "");
      const cachedPub = String(cached && (cached.profilePicPublicId || cached.photoURLPublicId || cached.photoPublicId || cached.avatarPublicId) || "");
      const publicId = mergedPub || cachedPub || "";
      const kycDone = !!(
        (cached && cached.kycCompleted === true) ||
        (mergedMe && mergedMe.security && mergedMe.security.kycCompleted === true) ||
        (mergedMe && mergedMe.profile && mergedMe.profile.kycCompleted === true) ||
        (mergedMe && mergedMe.profile && mergedMe.profile.country && mergedMe.profile.preferredLanguage)
      );
      if (typeof options.onComplete === "function") {
        try { options.onComplete({
          profilePic,
          photoURL: profilePic,
          photo: profilePic,
          avatar: profilePic,
          publicId,
          profilePicPublicId: publicId,
          photoURLPublicId: publicId,
          photoPublicId: publicId,
          avatarPublicId: publicId,
          kycCompleted: kycDone,
          kycDone: kycDone,
          KYCDone: kycDone
        }); } catch (_) {}
      }
      return null;
    }
    return buildPicGate(Object.assign({}, options, { me: mergedMe, forceOpen: !!options.forceOpen }));
  }

  function replaceTextInRoot(rootNode) {
    if (!rootNode) return;
    const labelMap = [
      ["International Transfer", "Bank Transfer"],
      ["International transfer", "Bank transfer"],
      ["Local Transfer", "Bank Transfer"],
      ["local transfer", "Bank transfer"],
      [" Transfer", " Bank Transfer"],
      [" transfer", " bank transfer"]
    ];
    const titleSuffixMap = [
      ["International Transfer", "Bank Transfer"],
      ["International transfer", "Bank transfer"],
      ["Transfer ", "Bank Transfer "],
      ["Transfer", "Bank Transfer"],
      ["transfer", "Bank transfer"]
    ];
    walkText(rootNode, function (node) {
      if (!node) return;
      if (node.nodeType === 3) {
        let txt = node.nodeValue || "";
        labelMap.forEach(function (pair) {
          if (!txt) return;
          const from = pair[0];
          const to = pair[1];
          if (from && txt.includes(from)) {
            txt = txt.split(from).join(to);
          }
        });
        if (txt !== node.nodeValue && node.parentNode) {
          try { node.parentNode.replaceChild(document.createTextNode(txt), node); } catch (_) {}
        }
      } else if (node.nodeType === 1) {
        const attrs = ["title", "alt", "placeholder", "aria-label"];
        for (let i = 0; i < attrs.length; i++) {
          const a = attrs[i];
          if (!node.getAttribute) continue;
          const attrVal = node.getAttribute(a);
          if (typeof attrVal !== "string" || !attrVal) continue;
          let nextVal = attrVal;
          titleSuffixMap.forEach(function (pair) {
            const from = pair[0];
            const to = pair[1];
            if (from && nextVal.includes(from)) {
              nextVal = nextVal.split(from).join(to);
            }
          });
          if (nextVal !== attrVal) {
            try { node.setAttribute(a, nextVal); } catch (_) {}
          }
        }
        const datAttrs = ["data-i18n", "data-i18n-title", "data-i18n-placeholder", "data-i18n-label"];
        for (let i = 0; i < datAttrs.length; i++) {
          const a = datAttrs[i];
          if (!node.getAttribute) continue;
          const val = node.getAttribute(a);
          if (typeof val !== "string" || !val) continue;
          if (val === "nav_international") try { node.setAttribute(a, "actions_transfer"); } catch (_) {}
        }
        if (node.tagName === "A" || node.tagName === "BUTTON") {
          if (!node.getAttribute) return;
          const href = node.getAttribute("href");
          if (typeof href === "string" && /\/international\.php/i.test(href)) {
            try { node.removeAttribute("onclick"); } catch (_) {}
          }
        }
      }
    });
  }

  function walkText(root, visitor) {
    if (!root || typeof document.createTreeWalker !== "function") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: function () { return NodeFilter.FILTER_ACCEPT; } });
    let n = walker.nextNode();
    while (n) {
      visitor(n);
      n = walker.nextNode();
    }
  }

  function bindBankTransferHijack(el) {
    if (!el || typeof el.addEventListener !== "function") return;
    el.addEventListener("click", function (e) {
      if (e) {
        try { e.preventDefault(); } catch (_) {}
        try { e.stopPropagation(); } catch (_) {}
      }
      if (window && window.location) {
        window.location.href = "/customer/international.php";
      }
      return false;
    });
  }

  function installBankTransferLinks() {
    if (typeof document === "undefined") return;
    try {
      document.querySelectorAll("a,button").forEach(function (el) {
        if (!el.getAttribute) return;
        const txt = el.textContent || "";
        const href = el.getAttribute("href");
        const hasTransferWord = /Transfer|Local Transfer|International Transfer/i.test(txt);
        const isTransferLink = typeof href === "string" && /\/international\.php/i.test(href);
        if (!hasTransferWord && !isTransferLink) return;
        if (el.getAttribute("data-vt-bank-transfer")) return;
        try { el.setAttribute("data-vt-bank-transfer", "1"); } catch (_) {}
        if (el.tagName === "A" && !/\/international\.php/i.test(href || "")) {
          try { el.setAttribute("href", "/customer/international.php"); } catch (_) {}
          try { el.removeAttribute("onclick"); } catch (_) {}
        } else if (el.tagName === "BUTTON") {
          bindBankTransferHijack(el);
        }
      });
    } catch (_) {}
    replaceTextInRoot(document.body || document.documentElement);
    if (document.title) {
      let t = String(document.title || "");
      if (/International Transfer/i.test(t)) document.title = t.replace(/International Transfer/gi, "Bank Transfer");
      else if (/Transfer/i.test(t)) document.title = t.replace(/Transfer/gi, "Bank Transfer");
    }
  }

  const exports = {
    I18N: {
      dict: DICT,
      countryLanguages: COUNTRY_LANGS,
      t,
      apply: applyLanguageToDocument,
      forCountry: getCountryLanguages,
      languageName,
      availableLanguages: availableDictionaryLanguages,
      countryOptions,
      dictForCode,
      replaceText: replaceTextInRoot
    },
    API: {
      fetchJson,
      api,
      me: () => fetchJson("/api/me")
    },
    Upload: {
      cloudinaryUploadFile
    },
    Cache: {
      readKyc: readVtKycCache,
      writeKyc: writeVtKycCache,
      applyKycToMe: applyKycCacheToMe
    },
    UI: {
      toast: toastMessage,
      showKycGate: safeShowKycGate,
      showPicGate: safeShowPicGate,
      bootstrapCustomerPage: bootstrapCustomerPage,
      applyAvatarImages: applyAvatarImages,
      getInitialsFromProfile: getInitialsFromProfile,
      setupMobileSidebarOutsideClick: function setupMobileSidebarOutsideClick(opts) {
        if (typeof document === "undefined" || typeof window === "undefined") return function(){};
        try {
          const sidebarSelector = (opts && opts.sidebarSelector) || ".vt-sidebar";
          const toggleSelector = (opts && opts.toggleSelector) || "#sidebarToggle";
          const overlaySelector = (opts && opts.overlaySelector) || "#sidebarOverlay";
          const closeFn = (opts && typeof opts.closeFn === "function") ? opts.closeFn : function closeSidebarDefault(){ try { document.body.classList.remove("vt-sidebar-open"); } catch (_) {} };
          const isMobileFn = (opts && typeof opts.isMobileFn === "function") ? opts.isMobileFn : function defaultIsMobile(){ try { return window.matchMedia("(max-width: 992px)").matches; } catch (_) { return true; } };
          const body = typeof document !== "undefined" ? document.body : null;
          function handler(e) {
            if (!isMobileFn()) return;
            if (!body || !body.classList.contains("vt-sidebar-open")) return;
            const tgt = e.target;
            if (!tgt || typeof tgt.closest !== "function") return;
            if (tgt.closest(sidebarSelector)) return;
            if (tgt.closest(toggleSelector)) return;
            if (tgt.closest(overlaySelector)) return;
            try { closeFn(); } catch (_) {}
          }
          try { document.addEventListener("click", handler, true); } catch (_) {}
          return function cleanupMobileSidebarOutsideClick(){ try { document.removeEventListener("click", handler, true); } catch (_) {} };
        } catch (_) {
          return function(){};
        }
      }
    }
  };

  if (typeof document !== "undefined") {
    window.VT = window.VT || {};
    window.VT.I18N = exports.I18N;
    window.VT.API = exports.API;
    window.VT.UI = Object.assign({}, exports.UI || {}, {
      installBankTransferLinks: installBankTransferLinks
    });
    if (typeof window.VT.UI.bootstrapCustomerPage !== "function") {
      window.VT.UI.bootstrapCustomerPage = bootstrapCustomerPage;
    }
    if (typeof window.__vtBootstrapCustomerPage !== "function") {
      window.__vtBootstrapCustomerPage = bootstrapCustomerPage;
    }
    window.__vtBuildKycGate = buildKycGate;
    window.__vtBuildPicGate = buildPicGate;
    window.VT.Upload = exports.Upload;
    window.VT.Cache = exports.Cache;
    if (window.addEventListener && typeof installBankTransferLinks === "function") {
      function vtBootBank() {
        try { installBankTransferLinks(); } catch (_) {}
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", vtBootBank, false);
      } else {
        vtBootBank();
      }
    }
  }

  return exports;
});
