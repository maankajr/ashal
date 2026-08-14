import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const initialAddresses = [
  {
    id: 1,
    label: "Home",
    text: "12 Maka Al Mukarama Rd, Hodan, Mogadishu",
    isDefault: true,
  },
  {
    id: 2,
    label: "Office",
    text: "KM4, Airport Road, Wadajir, Mogadishu",
    isDefault: false,
  },
];

function Profile() {
  const [profile, setProfile] = useState({
    name: "Eng. Abdirahman",
    email: "abdimaanka56@gmail.com",
    phone: "+252 61 000 0000",
  });
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState(null);
  const [addressDraft, setAddressDraft] = useState({ label: "", text: "" });
  const [addingAddress, setAddingAddress] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [saved, setSaved] = useState(false);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function saveProfile(event) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function startEdit(address) {
    setAddingAddress(false);
    setEditingId(address.id);
    setAddressDraft({ label: address.label, text: address.text });
  }

  function saveAddressEdit(addressId) {
    setAddresses((current) =>
      current.map((address) =>
        address.id === addressId
          ? { ...address, label: addressDraft.label, text: addressDraft.text }
          : address
      )
    );
    setEditingId(null);
  }

  function deleteAddress(addressId) {
    setAddresses((current) => current.filter((address) => address.id !== addressId));
  }

  function addAddress(event) {
    event.preventDefault();
    if (!addressDraft.label.trim() || !addressDraft.text.trim()) return;
    setAddresses((current) => [
      ...current,
      {
        id: Date.now(),
        label: addressDraft.label,
        text: addressDraft.text,
        isDefault: current.length === 0,
      },
    ]);
    setAddressDraft({ label: "", text: "" });
    setAddingAddress(false);
  }

  function updatePassword(event) {
    event.preventDefault();
    if (!passwordForm.current || !passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage(
        passwordForm.next !== passwordForm.confirm
          ? "New passwords do not match."
          : "Please fill in all password fields."
      );
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }
    setPasswordMessage("Password updated (demo only).");
    setPasswordForm({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your profile
            </h1>
            <p className="mt-1 text-sm text-slate-600">Manage your account, addresses, and password.</p>
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <Link to="/orders" className="text-teal-700 hover:text-teal-800">
              Orders
            </Link>
            <Link to="/wishlist" className="text-teal-700 hover:text-teal-800">
              Wishlist
            </Link>
          </div>
        </div>

        <form
          onSubmit={saveProfile}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-2xl font-semibold text-teal-800">
                {profile.name.charAt(0)}
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Upload photo
              </button>
            </div>
            <div className="flex-1 space-y-4">
              <label className="block text-sm font-medium text-slate-800">
                Name
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Email
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Phone number
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                />
              </label>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Save changes
            </button>
            {saved && <p className="text-sm text-emerald-700">Profile saved successfully.</p>}
          </div>
        </form>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Saved addresses</h2>
            <button
              type="button"
              onClick={() => {
                setAddingAddress(true);
                setEditingId(null);
                setAddressDraft({ label: "", text: "" });
              }}
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Add New Address
            </button>
          </div>

          <ul className="mt-4 space-y-3">
            {addresses.map((address) => (
              <li key={address.id} className="rounded-xl border border-slate-200 p-4">
                {editingId === address.id ? (
                  <div className="space-y-3">
                    <input
                      value={addressDraft.label}
                      onChange={(event) =>
                        setAddressDraft((current) => ({ ...current, label: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <textarea
                      value={addressDraft.text}
                      onChange={(event) =>
                        setAddressDraft((current) => ({ ...current, text: event.target.value }))
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveAddressEdit(address.id)}
                        className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{address.label}</p>
                      {address.isDefault && (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{address.text}</p>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(address)}
                        className="text-sm font-medium text-teal-700 hover:text-teal-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        className="text-sm font-medium text-rose-700 hover:text-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {addingAddress && (
            <form onSubmit={addAddress} className="mt-4 space-y-3 rounded-xl border border-dashed border-slate-300 p-4">
              <input
                placeholder="Label (Home, Office)"
                value={addressDraft.label}
                onChange={(event) =>
                  setAddressDraft((current) => ({ ...current, label: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
              <textarea
                placeholder="Full address"
                value={addressDraft.text}
                onChange={(event) =>
                  setAddressDraft((current) => ({ ...current, text: event.target.value }))
                }
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Add address
                </button>
                <button
                  type="button"
                  onClick={() => setAddingAddress(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <form
          onSubmit={updatePassword}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-800">
              Current password
              <input
                type="password"
                value={passwordForm.current}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, current: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              New password
              <input
                type="password"
                value={passwordForm.next}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, next: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Confirm password
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, confirm: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Update Password
          </button>
          {passwordMessage && (
            <p className="mt-3 text-sm text-slate-600">{passwordMessage}</p>
          )}
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
