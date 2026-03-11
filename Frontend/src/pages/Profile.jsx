import React, { useEffect, useMemo, useState } from 'react';
import { authService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import '../Styles/profile.css';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await authService.getMe();
        if (!mounted) return;
        setForm((prev) => ({
          ...prev,
          name: me?.name || '',
          email: me?.email || '',
          phone: me?.phone || '',
          gender: me?.gender || '',
        }));
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canSave = useMemo(() => {
    if (saving) return false;
    if (!editing) return true;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return false;
    if (form.newPassword || form.currentPassword || form.confirmPassword) {
      return (
        form.currentPassword &&
        form.newPassword &&
        form.confirmPassword &&
        form.newPassword === form.confirmPassword
      );
    }
    return true;
  }, [form, saving]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editing) {
      setEditing(true);
      return;
    }
    setError('');
    setNote('');

    if (form.newPassword || form.currentPassword || form.confirmPassword) {
      if (form.newPassword !== form.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (!form.currentPassword || !form.newPassword) {
        setError('Current and new password are required.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender || null,
      };

      if (form.currentPassword && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await authService.updateProfile(payload);
      if (res?.user) {
        login({ ...user, ...res.user });
      }
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setNote(res?.message || 'Profile updated.');
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <header className="profile-header">
          <h2>My Profile</h2>
          <p>Update your personal details and password.</p>
        </header>

        {loading ? (
          <p className="profile-note">Loading profile...</p>
        ) : (
          <form className="profile-card" onSubmit={handleSubmit}>
            <div className="profile-grid">
              <label className="profile-field">
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={!editing}
                />
              </label>
              <label className="profile-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={!editing}
                />
              </label>
              <label className="profile-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={!editing}
                />
              </label>
              <label className="profile-field">
                <span>Gender</span>
                <select value={form.gender || ''} onChange={handleChange('gender')} disabled={!editing}>
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            

            {error && <p className="profile-note profile-note--error">{error}</p>}
            {note && <p className="profile-note profile-note--success">{note}</p>}

            <div className="profile-actions">
              <button type="submit" disabled={!canSave}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Update Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
