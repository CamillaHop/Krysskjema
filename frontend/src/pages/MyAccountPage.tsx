import { useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import type { KryssEntry, IceEntry, Person } from "../types";

interface Props {
  user: FirebaseUser;
  people: Person[];
  entries: KryssEntry[];
  iceEntries: IceEntry[];
  onLogout: () => Promise<void>;
}

function pName(people: Person[], id: string) {
  return people.find((p) => p.id === id)?.name ?? id;
}

export default function MyAccountPage({
  user,
  people,
  entries,
  iceEntries,
  onLogout,
}: Props) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("kryss_username") ?? "";
  });
  const [saved, setSaved] = useState(false);

  const displayName = user.displayName ?? user.email ?? "Bruker";

  // Try to match this Firebase user to a person in the system by name
  const matchedPerson = people.find(
    (p) =>
      p.name.toLowerCase() === displayName.toLowerCase() ||
      p.id === username.replace("@", "").toLowerCase()
  );

  // Stats for matched person
  const myKryss = matchedPerson
    ? entries
        .filter((e) => e.recipientPersonId === matchedPerson.id)
        .reduce((sum, e) => sum + (e.kryssCount ?? 1), 0)
    : 0;

  const myIceReceived = matchedPerson
    ? iceEntries.filter((e) => e.iceePersonId === matchedPerson.id).length
    : 0;

  const myIceGiven = matchedPerson
    ? iceEntries.filter((e) => e.icerPersonId === matchedPerson.id).length
    : 0;

  function handleSaveUsername() {
    localStorage.setItem("kryss_username", username);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="account-page">
      <h2>Min konto</h2>

      <div className="account-profile">
        <div className="account-avatar-wrapper">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="account-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="account-avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="account-info">
          <p className="account-name">{displayName}</p>
          <p className="account-email">{user.email}</p>
        </div>
      </div>

      <div className="account-field">
        <label htmlFor="username">Brukernavn</label>
        <div className="account-username-row">
          <span className="account-at">@</span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setSaved(false);
            }}
            placeholder="f.eks. camillahop"
          />
          <button className="btn btn-primary" onClick={handleSaveUsername}>
            {saved ? "Lagret!" : "Lagre"}
          </button>
        </div>
      </div>

      {matchedPerson ? (
        <>
          <h3 className="account-stats-heading">
            Din statistikk ({pName(people, matchedPerson.id)})
          </h3>
          <div className="account-stats">
            <div className="stat-card">
              <span className="stat-card-icon">✕</span>
              <span className="stat-card-value">{myKryss}</span>
              <span className="stat-card-label">Kryss mottatt</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon">🥶</span>
              <span className="stat-card-value">{myIceReceived}</span>
              <span className="stat-card-label">Ice mottatt</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon">🧊</span>
              <span className="stat-card-value">{myIceGiven}</span>
              <span className="stat-card-label">Ice gitt</span>
            </div>
          </div>
        </>
      ) : (
        <p className="account-no-match">
          Kunne ikke koble kontoen din til en person i systemet. Sett et
          brukernavn som samsvarer med person-ID-en din (f.eks.{" "}
          <strong>camilla-hop</strong>).
        </p>
      )}

      <button className="btn btn-secondary account-logout" onClick={onLogout}>
        Logg ut
      </button>
    </section>
  );
}
