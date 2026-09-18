import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'SmartMed',
      tagline: 'Skip the queue. Book smart.',
      nav_home: 'Home', nav_login: 'Log in', nav_register: 'Sign up', nav_logout: 'Log out',
      nav_dashboard: 'Dashboard', nav_book: 'Book Appointment', nav_queue: 'Live Queue',
      nav_prescriptions: 'My Prescriptions', nav_profile: 'Profile',
      login_title: 'Welcome back', login_subtitle: 'Log in to manage your appointments',
      email: 'Email', password: 'Password', full_name: 'Full name', phone: 'Phone number',
      login_button: 'Log in', register_button: 'Create account',
      no_account: "Don't have an account?", have_account: 'Already have an account?',
      symptom_title: 'Tell us what you\u2019re feeling',
      symptom_subtitle: 'Describe your symptoms and we\u2019ll suggest the right specialist',
      symptom_placeholder: 'e.g. headache and nausea since this morning',
      check_symptoms: 'Check symptoms', suggested_specialist: 'Suggested specialist',
      book_now: 'Book now', choose_doctor: 'Choose a doctor',
      select_date: 'Select date', select_slot: 'Select a time slot',
      confirm_booking: 'Confirm booking', booking_confirmed: 'Booking confirmed',
      your_token: 'Your token number', patients_ahead: 'Patients ahead of you',
      estimated_wait: 'Estimated wait', minutes: 'min', status: 'Status',
      status_booked: 'Booked', status_waiting: 'Waiting', status_consulting: 'Consulting',
      status_completed: 'Completed', status_cancelled: 'Cancelled',
      you_are_next: 'You are next!', cancel_appointment: 'Cancel appointment',
      today_queue: "Today's Queue", start_consultation: 'Start', mark_complete: 'Mark Complete',
      no_patients_today: 'No patients in queue right now',
      doctor_on_leave: 'On leave', toggle_leave: 'Toggle leave',
      admin_overview: 'Overview', admin_departments: 'Departments', admin_users: 'Users',
      admin_reports: 'Daily Report', admin_notifications: 'Notification Log',
      upload_prescription: 'Upload prescription', extracted_medicines: 'Extracted medicines',
      no_prescriptions: 'No prescriptions yet', language: 'Language',
      hero_title: 'Hospital queues, finally under control.',
      hero_subtitle: 'AI symptom triage, live token tracking, and digital prescriptions \u2014 all in one place.',
      get_started: 'Get started', view_doctors: 'Browse doctors'
    }
  },
  hi: {
    translation: {
      appName: 'स्मार्टमेड',
      tagline: 'कतार छोड़ें। समझदारी से बुक करें।',
      nav_home: 'होम', nav_login: 'लॉग इन', nav_register: 'साइन अप', nav_logout: 'लॉग आउट',
      nav_dashboard: 'डैशबोर्ड', nav_book: 'अपॉइंटमेंट बुक करें', nav_queue: 'लाइव कतार',
      nav_prescriptions: 'मेरे नुस्खे', nav_profile: 'प्रोफ़ाइल',
      login_title: 'वापसी पर स्वागत है', login_subtitle: 'अपनी अपॉइंटमेंट प्रबंधित करने के लिए लॉग इन करें',
      email: 'ईमेल', password: 'पासवर्ड', full_name: 'पूरा नाम', phone: 'फ़ोन नंबर',
      login_button: 'लॉग इन करें', register_button: 'खाता बनाएं',
      no_account: 'खाता नहीं है?', have_account: 'पहले से खाता है?',
      symptom_title: 'बताएं आपको क्या महसूस हो रहा है',
      symptom_subtitle: 'अपने लक्षण बताएं और हम सही विशेषज्ञ सुझाएंगे',
      symptom_placeholder: 'जैसे: आज सुबह से सिरदर्द और जी मिचलाना',
      check_symptoms: 'लक्षण जांचें', suggested_specialist: 'सुझाया गया विशेषज्ञ',
      book_now: 'अभी बुक करें', choose_doctor: 'डॉक्टर चुनें',
      select_date: 'तारीख चुनें', select_slot: 'समय स्लॉट चुनें',
      confirm_booking: 'बुकिंग की पुष्टि करें', booking_confirmed: 'बुकिंग की पुष्टि हो गई',
      your_token: 'आपका टोकन नंबर', patients_ahead: 'आपसे पहले मरीज़',
      estimated_wait: 'अनुमानित प्रतीक्षा', minutes: 'मिनट', status: 'स्थिति',
      status_booked: 'बुक किया गया', status_waiting: 'प्रतीक्षारत', status_consulting: 'परामर्श जारी',
      status_completed: 'पूर्ण', status_cancelled: 'रद्द',
      you_are_next: 'अब आपकी बारी है!', cancel_appointment: 'अपॉइंटमेंट रद्द करें',
      today_queue: 'आज की कतार', start_consultation: 'शुरू करें', mark_complete: 'पूर्ण के रूप में चिह्नित करें',
      no_patients_today: 'अभी कतार में कोई मरीज़ नहीं है',
      doctor_on_leave: 'छुट्टी पर', toggle_leave: 'छुट्टी टॉगल करें',
      admin_overview: 'अवलोकन', admin_departments: 'विभाग', admin_users: 'उपयोगकर्ता',
      admin_reports: 'दैनिक रिपोर्ट', admin_notifications: 'सूचना लॉग',
      upload_prescription: 'नुस्खा अपलोड करें', extracted_medicines: 'निकाली गई दवाएं',
      no_prescriptions: 'अभी तक कोई नुस्खा नहीं', language: 'भाषा',
      hero_title: 'अस्पताल की कतारें, अब पूरी तरह नियंत्रण में।',
      hero_subtitle: 'एआई लक्षण जांच, लाइव टोकन ट्रैकिंग, और डिजिटल नुस्खे — सब एक ही जगह।',
      get_started: 'शुरू करें', view_doctors: 'डॉक्टर देखें'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('smartmed_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
