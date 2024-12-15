import React from 'react';
import { Shield, MessageSquare, AlertTriangle } from 'lucide-react';
import { Property, Report } from '../../types';
import { Button } from '../ui/Button';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonitoringPanelProps {
  reportedProperties: Property[];
  reportedMessages: any[]; // Replace with proper Message type
  onResolveReport: (type: 'property' | 'message', id: string, action: 'approve' | 'reject') => void;
}

export const MonitoringPanel: React.FC<MonitoringPanelProps> = ({
  reportedProperties = [],
  reportedMessages = [],
  onResolveReport
}) => {
  return (
    <div className="space-y-6">
      {/* Propiedades Reportadas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Propiedades Reportadas ({Array.isArray(reportedProperties) ? reportedProperties.length : 0})
          </h2>
        </div>
        
        <div className="divide-y">
          {Array.isArray(reportedProperties) && reportedProperties.length > 0 ? (
            reportedProperties.map(property => (
              <div key={property.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{property.title}</h3>
                    <p className="text-sm text-gray-500">{property.location}</p>
                    
                    {Array.isArray(property.reports) && property.reports.map((report: Report) => (
                      <div key={report.id} className="mt-2 bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium">Motivo: {report.reason}</p>
                        {report.description && (
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Reportado hace {formatDistance(new Date(report.date), new Date(), { locale: es })}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveReport('property', property.id, 'approve')}
                      className="text-green-600 hover:bg-green-50"
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveReport('property', property.id, 'reject')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No hay propiedades reportadas
            </div>
          )}
        </div>
      </div>

      {/* Mensajes Reportados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-yellow-500" />
            Mensajes Reportados ({Array.isArray(reportedMessages) ? reportedMessages.length : 0})
          </h2>
        </div>

        <div className="divide-y">
          {Array.isArray(reportedMessages) && reportedMessages.length > 0 ? (
            reportedMessages.map(message => (
              <div key={message.id} className="p-4">
                {/* Message report content */}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No hay mensajes reportados
            </div>
          )}
        </div>
      </div>
    </div>
  );
};