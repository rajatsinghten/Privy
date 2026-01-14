import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { role } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Profile</h1>
        <p><strong>Role:</strong> {role}</p>
        <p>Environment: DEV</p>
      </div>
    </div>
  );
}
