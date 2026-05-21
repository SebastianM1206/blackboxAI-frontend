# Notas internas - modo demo y mocks

- La app usa autenticacion local y datos mock cuando Firebase o el backend no responden.
- En ese modo se puede iniciar sesion con cualquier correo y contrasena.
- Para usar autenticacion real, completa VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID en .env y reinicia npm run dev.
- Para forzar mocks: VITE_USE_MOCKS=true
- Para desactivar fallback automatico: VITE_AUTO_MOCKS=false
