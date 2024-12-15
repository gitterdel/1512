import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/groups/tugrupo',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    name: 'Instagram',
    url: '#',
    icon: Instagram,
    color: 'bg-pink-600 hover:bg-pink-700'
  },
  {
    name: 'Twitter',
    url: '#',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600'
  }
];

export const SocialSection = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Síguenos en redes sociales</h2>
          <p className="mt-2 text-gray-600">Mantente al día con las últimas novedades</p>
        </div>

        <div className="flex justify-center space-x-4">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} p-3 rounded-full text-white transition-colors`}
            >
              <link.icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};