import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProfilePage = () => {
  const { user, isAuthenticated, fetchUserProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const [passData, setPassData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileMsg, setProfileMsg] = useState(null);
  const [passMsg, setPassMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Sign in to view your profile</h2>
        <Link to="/login" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.put('/auth/profile/', profileData);
      await fetchUserProfile();
      setProfileMsg({ success: true, text: 'Profile details updated successfully!' });
    } catch (err) {
      setProfileMsg({ success: false, text: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      setPassMsg({ success: false, text: 'New passwords do not match' });
      return;
    }
    setSavingPass(true);
    setPassMsg(null);
    try {
      await api.post('/auth/change-password/', {
        old_password: passData.old_password,
        new_password: passData.new_password,
      });
      setPassMsg({ success: true, text: 'Password changed successfully!' });
      setPassData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPassMsg({ success: false, text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '30px', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Manage your personal details and account security
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Personal Details Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Personal Information</h3>
          </div>

          {profileMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: profileMsg.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: profileMsg.success ? 'var(--accent)' : 'var(--danger)', fontSize: '13px' }}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>First Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Last Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
              style={{ padding: '12px', marginTop: '6px' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Security & Password</h3>
          </div>

          {passMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: passMsg.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: passMsg.success ? 'var(--accent)' : 'var(--danger)', fontSize: '13px' }}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Current Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={passData.old_password}
                onChange={(e) => setPassData({ ...passData, old_password: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={passData.new_password}
                onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={passData.confirm_password}
                onChange={(e) => setPassData({ ...passData, confirm_password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="btn-accent"
              style={{ padding: '12px', marginTop: '6px' }}
            >
              {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
