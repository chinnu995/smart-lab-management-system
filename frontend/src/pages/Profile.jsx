import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Phone, Mail, GraduationCap, ShieldCheck, Key, Edit3, Save, X, CheckCircle2, Lock, Building, Calendar, Sparkles, Camera } from 'lucide-react';

const getImageUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
  if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    apiHost = `http://${window.location.hostname}:5005`;
  }
  return `${apiHost}${filePath}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [semester, setSemester] = useState('1');
  const [profileImage, setProfileImage] = useState(null);
  
  // Password change fields
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch full user profile details on load
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/me');
      if (data) {
        setFullName(data.full_name || user?.name || '');
        setPhone(data.phone || '');
        setDepartment(data.department || user?.department || 'Computer Science & Engineering');
        setProfileImage(data.profile_image || user?.profile_image || null);
        
        // Map semester to academic year
        const sem = data.semester ? parseInt(data.semester) : 1;
        setSemester(sem.toString());
        if (sem <= 2) setAcademicYear('1st Year');
        else if (sem <= 4) setAcademicYear('2nd Year');
        else if (sem <= 6) setAcademicYear('3rd Year');
        else setAcademicYear('4th Year');

        // Update auth context state if details changed
        const updated = {
          ...user,
          name: data.full_name,
          phone: data.phone,
          department: data.department || user?.department,
          profile_image: data.profile_image || user?.profile_image,
          semester: data.semester
        };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      if (fullName) formData.append('full_name', fullName);

      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.dismiss(toastId);
      toast.success('Profile picture updated!');

      const newImg = data.user?.profile_image || profileImage;
      setProfileImage(newImg);

      const updatedUser = {
        ...user,
        profile_image: newImg
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      toast.dismiss(toastId);
      console.error('Failed to upload profile picture:', err);
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    fetchProfile();
  };

  const handleAcademicYearChange = (e) => {
    const val = e.target.value;
    setAcademicYear(val);
    if (val === '1st Year') setSemester('1');
    else if (val === '2nd Year') setSemester('3');
    else if (val === '3rd Year') setSemester('5');
    else if (val === '4th Year') setSemester('7');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }

    if (changePassword) {
      if (!currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        department: department.trim(),
        ...(user?.role === 'student' && {
          academic_year: academicYear,
          semester: semester
        }),
        ...(changePassword && {
          current_password: currentPassword,
          new_password: newPassword
        })
      };

      const { data } = await api.put('/auth/profile', payload);
      
      toast.success(data.message || 'Profile updated successfully!');
      
      // Update local storage and AuthContext state
      const updatedUser = {
        ...user,
        name: data.user.full_name || fullName,
        phone: data.user.phone || phone,
        department: data.user.department || department,
        profile_image: data.user.profile_image || profileImage,
        semester: data.user.semester || semester
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const roleTheme = user?.role === 'student'
    ? {
        roleLabel: 'Student Profile',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300',
        bannerGradient: 'from-emerald-900 via-teal-950 to-slate-900',
        glowColor: 'from-emerald-500/20 to-teal-500/20'
      }
    : user?.role === 'faculty'
    ? {
        roleLabel: 'Faculty Profile',
        badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-300',
        bannerGradient: 'from-violet-900 via-purple-950 to-slate-900',
        glowColor: 'from-violet-500/20 to-purple-500/20'
      }
    : {
        roleLabel: 'HOD Executive Profile',
        badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300',
        bannerGradient: 'from-sky-900 via-blue-950 to-slate-900',
        glowColor: 'from-sky-500/20 to-blue-500/20'
      };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      {/* Background Decorative Ambient Glow */}
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-gradient-to-r ${roleTheme.glowColor} blur-3xl opacity-50 pointer-events-none rounded-full`} />

      {/* Header Banner */}
      <div className={`relative bg-gradient-to-r ${roleTheme.bannerGradient} text-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden border border-white/10`}>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <User size={240} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container with Image Upload Option */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-indigo-500/30 border-2 border-white/20 overflow-hidden relative">
              {profileImage ? (
                <img
                  src={getImageUrl(profileImage)}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(fullName || user?.name)
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Camera Upload Button Badge */}
            <label
              htmlFor="avatar-upload-input"
              className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg border-2 border-slate-900 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 z-20 flex items-center justify-center"
              title="Upload Profile Picture"
            >
              <Camera size={15} />
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{fullName || user?.name}</h2>
              <span className={`px-3 py-0.5 text-xs font-bold uppercase rounded-full border ${roleTheme.badgeColor}`}>
                {roleTheme.roleLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-300 text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Mail size={16} className="text-indigo-400" /> {user?.email}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Building size={16} className="text-sky-400" /> {department}
              </span>
              {user?.usn && (
                <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700 font-mono text-xs">
                  <GraduationCap size={15} className="text-emerald-400" /> USN: {user.usn}
                </span>
              )}
              {user?.emp_code && (
                <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700 font-mono text-xs">
                  <ShieldCheck size={15} className="text-violet-400" /> Emp Code: {user.emp_code}
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            >
              <Edit3 size={17} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Main Form / Details Card */}
      <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative z-10`}>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="text-primary" size={20} /> Personal & Department Profile
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isEditing ? 'Update your profile information below and save your changes.' : 'View your official account details and department profile.'}
            </p>
          </div>
          {isEditing && (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 flex items-center gap-1.5">
              <Sparkles size={13} /> Edit Mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-medium">
                  <User size={18} className="text-slate-400" /> {fullName || 'Not provided'}
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Mobile Phone Number
              </label>
              {isEditing ? (
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-medium">
                  <Phone size={18} className="text-slate-400" /> {phone || 'Not provided'}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address <span className="text-[10px] font-normal text-slate-400">(Account ID)</span>
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 text-sm font-medium">
                <Mail size={18} className="text-slate-400" /> {user?.email}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Department
              </label>
              {isEditing ? (
                <div className="relative">
                  <Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Science & Engineering">Information Science & Engineering</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                    <option value="Computer Science & Design">Computer Science & Design</option>
                    <option value="Computer Science & Data Science">Computer Science & Data Science</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-medium">
                  <Building size={18} className="text-slate-400" /> {department}
                </div>
              )}
            </div>

            {/* Academic Year / Semester (ONLY for Student role) */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Academic Year / Semester
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={academicYear}
                      onChange={handleAcademicYearChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    >
                      <option value="1st Year">1st Year (Semester 1 & 2)</option>
                      <option value="2nd Year">2nd Year (Semester 3 & 4)</option>
                      <option value="3rd Year">3rd Year (Semester 5 & 6)</option>
                      <option value="4th Year">4th Year (Semester 7 & 8)</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-medium">
                    <Calendar size={18} className="text-slate-400" /> {academicYear} (Semester {semester})
                  </div>
                )}
              </div>
            )}

            {/* USN or Employee Code */}
            {user?.usn ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  USN (University Seat No.)
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 text-sm font-mono font-bold">
                  <GraduationCap size={18} className="text-slate-400" /> {user.usn}
                </div>
              </div>
            ) : user?.emp_code ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Employee Code
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-400 text-sm font-mono font-bold">
                  <ShieldCheck size={18} className="text-slate-400" /> {user.emp_code}
                </div>
              </div>
            ) : null}
          </div>

          {/* Change Password Section (In Edit Mode) */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                  />
                  <Key size={18} className="text-amber-500" /> Change Password
                </label>
              </div>

              {changePassword && (
                <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <CheckCircle2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
