import { Navigate } from "react-router-dom";

// Old /account-deletion page. The form now lives inside the Help Center,
// so this just sends visitors there (old links and store listings keep working).
export default function AccountDeletion() {
  return <Navigate to="/help-center#account-deletion" replace />;
}
