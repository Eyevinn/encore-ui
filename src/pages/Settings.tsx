import React, { useState } from 'react';
import { useConfig } from '../hooks/useConfig';

const Settings: React.FC = () => {
  const { config, updateConfig, resetConfig } = useConfig();
  const [encoreApiUrl, setEncoreApiUrl] = useState(config.encoreApiUrl);
  const [bearerToken, setBearerToken] = useState(config.bearerToken || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = () => {
    updateConfig({ encoreApiUrl, bearerToken });
  };

  const handleReset = () => {
    resetConfig();
    setEncoreApiUrl(config.encoreApiUrl);
    setBearerToken(config.bearerToken || '');
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (bearerToken && bearerToken.trim()) {
        headers.Authorization = `Bearer ${bearerToken.trim()}`;
      }
      
      const response = await fetch(`${encoreApiUrl.replace(/\/$/, '')}/`, {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const hasChanges = encoreApiUrl !== config.encoreApiUrl || bearerToken !== (config.bearerToken || '');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            API Configuration
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="encoreApiUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Encore API URL
              </label>
              <input
                type="url"
                id="encoreApiUrl"
                value={encoreApiUrl}
                onChange={(e) => setEncoreApiUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The base URL for your Encore API server
              </p>
            </div>

            <div>
              <label htmlFor="bearerToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bearer Token (Optional)
              </label>
              <input
                type="password"
                id="bearerToken"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                placeholder="Enter your authentication token"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Optional bearer token for API authentication
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={testConnection}
                disabled={isTestingConnection}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
              
              {connectionStatus === 'success' && (
                <span className="text-green-600 dark:text-green-400 text-sm">
                  ✓ Connection successful
                </span>
              )}
              
              {connectionStatus === 'error' && (
                <span className="text-red-600 dark:text-red-400 text-sm">
                  ✗ Connection failed
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Reset to Default
              </button>
              
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;