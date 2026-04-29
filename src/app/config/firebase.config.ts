/**
 * Configuración de Firebase
 * 
 * Credenciales del proyecto Firebase "ink-creature-0".
 * Importada en app.config.ts para inicializar la app Firebase
 * mediante provideFirebaseApp() y initializeApp().
 * 
 * Campos:
 * - apiKey: Clave API para llamadas REST/SDK
 * - authDomain: Dominio de autenticación Firebase
 * - projectId: Identificador del proyecto GCP
 * - storageBucket: Bucket de Cloud Storage
 * - messagingSenderId: ID remitente FCM (push notifications)
 * - appId: ID de la aplicación web Firebase
 * 
 * Seguridad:
 * ⚠️ Esta configuración es pública por diseño en apps web.
 *    Restringir el acceso mediante Firebase App Check y
 *    reglas de seguridad de Firestore/Storage/Database.
 * 
 * @module
 */
export const firebaseConfig = {
  apiKey: "AIzaSyC_C9xgd1meREEkJOm8GBTMKBozrcH8jfA",
  authDomain: "ink-creature-0.firebaseapp.com",
  projectId: "ink-creature-0",
  storageBucket: "ink-creature-0.firebasestorage.app",
  messagingSenderId: "682765380715",
  appId: "1:682765380715:web:7dbb01b830993f467e152e"
};
