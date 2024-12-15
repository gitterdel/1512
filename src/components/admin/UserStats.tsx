import React from 'react';
import { Users, Home, UserCheck, Activity } from 'lucide-react';

interface UserStatsProps {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
}

export const UserStats: React.FC<UserStatsProps> = ({
  totalUsers,
  totalLandlords,
  totalTenants,
}) => {
  const stats = [
    {
      name: 'Total Usuarios',
      value: totalUsers,
      icon: Users,
      color: 'bg-indigo-500',
      increase: '12%',
    },
    {
      name: 'Propietarios',
      value: totalLandlords,
      icon: Home,
      color: 'bg-purple-500',
      increase: '8%',
    },
    {
      name: 'Inquilinos',
      value: totalTenants,
      icon: UserCheck,
      color: 'bg-green-500',
      increase: '15%',
    },
    {
      name: 'Usuarios Activos',
      value: Math.round(totalUsers * 0.85),
      icon: Activity,
      color: 'bg-blue-500',
      increase: '5%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-lg shadow px-5 py-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`${stat.color} rounded-lg p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <span>↑</span>
                  <span className="sr-only">Increased by</span>
                  {stat.increase}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};