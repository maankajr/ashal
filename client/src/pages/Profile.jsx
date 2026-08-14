import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { parseApiError } from "../api/auth.js";
import { getMyProfile, updateMyProfile } from "../api/users.js";
import { useAuth } from "../store/AuthContext";

const emptyAddressDraft = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  country: "",
  phone: "",
};

function formatAddress(address) {
  const location = [address.city, address.region, address.country].filter(Boolean).join(", ");
  const street = [address.line1, address.line2].filter(Boolean).join(", ");
  return [street, location].filter(Boolean).join(" · ");
}

function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [addressDraft, setAddressDraft] = useState(emptyAddressDraft);
  const [addingAddress, setAddingAddress] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAddresses, setSavingAddresses] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user?.name, user?.email, user?.phone]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getMyProfile();
        if (cancelled) return;
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setAddresses(data.addresses || []);
        if (data.avatarUrl && !photoPreview) {
          setPhotoPreview(data.avatarUrl);
        }
      } catch (error) {
        if (!cancelled) {
          const { message } = parseApiError(error);
          setSaveError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSaveError("");
  }

  function handlePhotoSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(URL.createObjectURL(file));
    event.target.value = "";
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const updated = await updateMyProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      });
      setProfile({
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
      });
      updateUser(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      setSaveError(fieldErrors.name || message);
    } finally {
      setSaving(false);
    }
  }

  async function persistAddresses(nextAddresses) {
    setSavingAddresses(true);
    setAddressError("");

    try {
      const updated = await updateMyProfile({ addresses: nextAddresses });
      setAddresses(updated.addresses || []);
      updateUser(updated);
      return true;
    } catch (error) {
      const { message } = parseApiError(error);
      setAddressError(message);
      return false;
    } finally {
      setSavingAddresses(false);
    }
  }

  function startEdit(address) {
    setAddingAddress(false);
    setEditingId(address._id);
    setAddressDraft({
      label: address.label || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      region: address.region || "",
      country: address.country || "",
      phone: address.phone || "",
    });
    setAddressError("");
  }

  async function saveAddressEdit(addressId) {
    const nextAddresses = addresses.map((address) =>
      address._id === addressId ? { ...address, ...addressDraft } : address
    );
    const ok = await persistAddresses(nextAddresses);
    if (ok) setEditingId(null);
  }

  async function deleteAddress(addressId) {
    const nextAddresses = addresses.filter((address) => address._id !== addressId);
    await persistAddresses(nextAddresses);
  }

  async function addAddress(event) {
    event.preventDefault();
    if (
      !addressDraft.label.trim() ||
      !addressDraft.line1.trim() ||
      !addressDraft.city.trim() ||
      !addressDraft.country.trim()
    ) {
      setAddressError("Label, address line, city, and country are required.");
      return;
    }

    const nextAddresses = [
      ...addresses,
      {
        ...addressDraft,
        isDefault: addresses.length === 0,
      },
    ];
    const ok = await persistAddresses(nextAddresses);
    if (ok) {
      setAddressDraft(emptyAddressDraft);
      setAddingAddress(false);
    }
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

  const avatarInitial = profile.name?.charAt(0)?.toUpperCase() || "?";

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

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading profile…
          </p>
        ) : (
          <>
            <form
              onSubmit={saveProfile}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
              <div className="mt-5 flex flex-col gap-6 sm:flex-row">
                <div className="flex flex-col items-center gap-3">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt=""
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-teal-100"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-2xl font-semibold text-teal-800">
                      {avatarInitial}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Upload photo
                  </button>
                  <p className="max-w-[10rem] text-center text-[11px] leading-snug text-slate-500">
                    Photo upload will be saved once image storage is connected.
                  </p>
                </div>
                <div className="flex-1 space-y-4">
                  <label className="block text-sm font-medium text-slate-800">
                    Name
                    <input
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      disabled={saving}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-800">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                      Email changes require separate verification.
                    </span>
                  </label>
                  <label className="block text-sm font-medium text-slate-800">
                    Phone number
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      disabled={saving}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {saved && <p className="text-sm text-emerald-700">Profile saved successfully.</p>}
                {saveError && <p className="text-sm text-rose-700">{saveError}</p>}
              </div>
            </form>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Saved addresses</h2>
                <button
                  type="button"
                  disabled={savingAddresses}
                  onClick={() => {
                    setAddingAddress(true);
                    setEditingId(null);
                    setAddressDraft(emptyAddressDraft);
                    setAddressError("");
                  }}
                  className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  Add New Address
                </button>
              </div>

              {addressError && (
                <p className="mt-3 text-sm text-rose-700">{addressError}</p>
              )}

              <ul className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <li key={address._id} className="rounded-xl border border-slate-200 p-4">
                    {editingId === address._id ? (
                      <AddressForm
                        draft={addressDraft}
                        setDraft={setAddressDraft}
                        onSave={() => saveAddressEdit(address._id)}
                        onCancel={() => setEditingId(null)}
                        saving={savingAddresses}
                      />
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
                        <p className="mt-1 text-sm text-slate-600">{formatAddress(address)}</p>
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
                            disabled={savingAddresses}
                            onClick={() => deleteAddress(address._id)}
                            className="text-sm font-medium text-rose-700 hover:text-rose-800 disabled:opacity-60"
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
                <form
                  onSubmit={addAddress}
                  className="mt-4 space-y-3 rounded-xl border border-dashed border-slate-300 p-4"
                >
                  <AddressForm
                    draft={addressDraft}
                    setDraft={setAddressDraft}
                    onSave={addAddress}
                    onCancel={() => setAddingAddress(false)}
                    saving={savingAddresses}
                    isForm
                  />
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function AddressForm({ draft, setDraft, onSave, onCancel, saving, isForm = false }) {
  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  const fields = (
    <>
      <input
        placeholder="Label (Home, Office)"
        value={draft.label}
        onChange={(event) => updateField("label", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
      />
      <input
        placeholder="Address line 1"
        value={draft.line1}
        onChange={(event) => updateField("line1", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
      />
      <input
        placeholder="Address line 2 (optional)"
        value={draft.line2}
        onChange={(event) => updateField("line2", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          placeholder="City"
          value={draft.city}
          onChange={(event) => updateField("city", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
        />
        <input
          placeholder="Country"
          value={draft.country}
          onChange={(event) => updateField("country", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
        />
      </div>
      <input
        placeholder="Region (optional)"
        value={draft.region}
        onChange={(event) => updateField("region", event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
      />
      <div className="flex gap-2">
        <button
          type={isForm ? "submit" : "button"}
          onClick={isForm ? undefined : onSave}
          disabled={saving}
          className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : isForm ? "Add address" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </>
  );

  return isForm ? fields : <div className="space-y-3">{fields}</div>;
}

export default Profile;
