
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon, CheckIcon, SpinnerIcon } from './icons';
import { useNavigate } from 'react-router-dom';

// Define the structure for the user's profile data
type UserProfile = {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  bodyAge?: number;
};

type UpdateStatus = 'idle' | 'updating' | 'success' | 'error';

const DashboardPage: React.FC = () => {
  const { user, getIdToken, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({});
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Fetch user profile data when the component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profileData = {
          height: user.height || '',
          weight: user.weight || '',
          age: user.age || '',
          gender: user.gender || 'male',
          bodyAge: user.bodyAge,
        };
        setProfile(profileData);
        // Determine if the profile is complete enough to show the body age
        if (profileData.height && profileData.weight && profileData.age) {
          setIsProfileComplete(true);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    // If the user is editing, we can consider the profile incomplete until saved
    setIsProfileComplete(false);
    setStatus('idle');
  };

  // Handle form submission to update the profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('updating');
    try {
      const token = await getIdToken();
      const response = await fetch('http://localhost:3001/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: Number(profile.height),
          weight: Number(profile.weight),
          age: Number(profile.age),
          gender: profile.gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      // Update the local state with the newly calculated bodyAge
      setProfile(prev => ({ ...prev, bodyAge: result.profile.bodyAge }));
      
      // Update the user in the AuthContext
      updateUser(result.profile);

      setIsProfileComplete(true); // Profile is now complete
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  // --- UI Components ---

  const renderUpdateButton = () => {
    switch (status) {
      case 'updating':
        return <><SpinnerIcon /> Saving...</>;
      case 'success':
        return <><CheckIcon /> Saved!</>;
      case 'error':
        return 'Save Failed - Retry';
      default:
        return 'Save & Calculate Body Age';
    }
  };

  const renderBodyAgeCard = () => {
    // Only render the card if the profile is complete and bodyAge is calculated
    if (!isProfileComplete || !profile.bodyAge) return null;

    const ageDifference = Math.round(Math.abs(profile.bodyAge - (profile.age || 0)) * 10) / 10;
    let comparisonMessage = "You’re right on track 👍";
    if (profile.bodyAge > (profile.age || 0)) {
      comparisonMessage = `Your body is acting ${ageDifference} years older 🫣`;
    } else if (profile.bodyAge < (profile.age || 0)) {
      comparisonMessage = `You’re ${ageDifference} years younger than your age 🔥`;
    }

    return (
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 mt-8 text-center shadow-lg animate-fade-in">
        <p className="text-blue-300 font-semibold">Your Real Body Age</p>
        <p className="text-6xl font-bold text-white my-2">{profile.bodyAge}</p>
        <p className="text-gray-300 font-medium">{comparisonMessage}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 text-white">
      <div className="container mx-auto max-w-2xl">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowLeftIcon />
            Back to Monitoring
          </button>
        </header>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          {!isProfileComplete && (
            <div className="text-center mb-6 p-4 bg-cyan-900/30 rounded-lg">
              <h2 className="text-2xl font-semibold text-cyan-300">Welcome!</h2>
              <p className="text-gray-300">Complete your profile to calculate your Body Age.</p>
            </div>
          )}
          <h2 className="text-2xl font-semibold text-cyan-300 mb-4">{isProfileComplete ? 'Update Your Profile' : 'Enter Your Details'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">Age (years)</label>
                <input type="number" name="age" id="age" value={profile.age || ''} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                <select name="gender" id="gender" value={profile.gender || 'male'} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            {/* Form Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                <input type="number" name="height" id="height" value={profile.height || ''} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                <input type="number" name="weight" id="weight" value={profile.weight || ''} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
            </div>
            
            <div className="pt-2">
              <button type="submit" disabled={status === 'updating'} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600">
                {renderUpdateButton()}
              </button>
            </div>
          </form>
        </div>

        {renderBodyAgeCard()}

      </div>
    </div>
  );
};

export default DashboardPage;
