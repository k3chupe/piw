export function formatAuthError(error) {
  const code = error?.code ?? "";
  switch (code) {
    case "auth/operation-not-allowed":
      return "Logowanie e-mailem nie jest włączone w Firebase.";
    case "auth/invalid-email":
      return "Nieprawidłowy adres e-mail.";
    case "auth/user-disabled":
      return "To konto zostało wyłączone.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Błędny e-mail lub hasło.";
    case "auth/email-already-in-use":
      return "Ten e-mail jest już zarejestrowany.";
    case "auth/weak-password":
      return "Hasło jest za słabe (min. 6 znaków).";
    case "auth/popup-closed-by-user":
      return "Logowanie Google zostało anulowane.";
    case "auth/unauthorized-domain":
      return "Ta domena nie jest dozwolona w Firebase.";
  }
  return error?.message || "Błąd logowania.";
}

export function formatFirestoreError(error) {
  const code = error?.code ?? "";
  const msg = error?.message ?? "";

  if (code === "permission-denied") {
    return "Brak uprawnień do bazy.";
  }
  if (code === "failed-precondition" || msg.includes("index")) {
    return "Brakuje indeksu w bazie.";
  }
  if (code === "not-found" || msg.includes("NOT_FOUND")) {
    return "Baza nie istnieje.";
  }
  if (code === "unavailable") {
    return "Baza jest chwilowo niedostępna.";
  }
  return msg || "Nie udało się połączyć z bazą.";
}
