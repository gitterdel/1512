import React, { useEffect, useState } from 'react';
import { checkAdminUsers } from '../lib/check-admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const TestPage = () => {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmins = async () => {
      const users = await checkAdminUsers();
      if (users) {
        setAdminUsers(users);
      }
      setLoading(false);
    };

    checkAdmins();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Admin Users</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(adminUsers, null, 2)}
        </pre>
      </div>
    </div>
  );
};