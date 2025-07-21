import React, { useState } from 'react';
import axios from 'axios';

interface OnboardTenantProps {
  godMode: boolean;
}

const OnboardTenant: React.FC<OnboardTenantProps> = ({ godMode }) => {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!teamName) {
      setError('Please fill in a team name.');
      return;
    }
    try {
      await axios.post('http://localhost:4000/tenants', { name: teamName.trim() });
      setSuccess(`Team '${teamName.trim()}' onboarded successfully!`);
      setTeamName('');
    } catch (err) {
      const axiosError = err as import('axios').AxiosError;
      if (axiosError.response && axiosError.response.status === 409) {
        setError('A team with this name already exists.');
      } else {
        setError('Failed to onboard team. Please try again.');
      }
      console.error('Onboarding error:', err);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Onboard a New Team</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Enter team name"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-semibold"
        >
          Onboard Team
        </button>
      </form>
      {godMode && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded">
          <span className="text-indigo-700 font-semibold">God Mode:</span> You have elevated permissions.
        </div>
      )}
    </div>
  );
};

export default OnboardTenant; 