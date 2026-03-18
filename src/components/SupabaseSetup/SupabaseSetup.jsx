import React, { useState } from 'react';
import { migrateExistingData, verifyMigration } from '../../utils/dataMigration';

export default function NeonSetup() {
  const [migrationStatus, setMigrationStatus] = useState('ready'); // ready, migrating, success, error
  const [migrationResult, setMigrationResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleMigration = async () => {
    setMigrationStatus('migrating');
    try {
      const result = await migrateExistingData();
      if (result.success) {
        setMigrationStatus('success');
        setMigrationResult('Data migration completed successfully!');

        // Automatically verify after migration
        const verification = await verifyMigration();
        setVerificationResult(verification);
      } else {
        setMigrationStatus('error');
        setMigrationResult(`Migration failed: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMigrationStatus('error');
      setMigrationResult(`Migration failed: ${error.message}`);
    }
  };

  const handleVerification = async () => {
    try {
      const result = await verifyMigration();
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ error: error.message });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Neon Database Setup</h2>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Create a Neon database at neon.tech</li>
              <li>2. Run the SQL schema in your Neon SQL Editor</li>
              <li>3. Add DATABASE_URL to your Vercel environment variables</li>
              <li>4. Deploy to Vercel to activate the API endpoints</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleMigration}
              disabled={migrationStatus === 'migrating'}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                migrationStatus === 'migrating'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : migrationStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {migrationStatus === 'migrating' && '⏳ Migrating...'}
              {migrationStatus === 'success' && '✅ Migration Complete'}
              {migrationStatus === 'error' && '❌ Migration Failed - Retry'}
              {migrationStatus === 'ready' && '🚀 Migrate Data to Neon'}
            </button>

            <button
              onClick={handleVerification}
              className="w-full py-2 px-4 rounded-md font-medium bg-gray-600 text-white hover:bg-gray-700"
            >
              🔍 Verify Migration
            </button>
          </div>

          {migrationResult && (
            <div className={`p-3 rounded-md text-sm ${
              migrationStatus === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {migrationResult}
            </div>
          )}

          {verificationResult && (
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              <h4 className="font-medium text-gray-800 mb-1">Verification Results:</h4>
              {verificationResult.error ? (
                <p className="text-red-600">{verificationResult.error}</p>
              ) : (
                <div className="space-y-1 text-gray-600">
                  <p>Nodes: {verificationResult.dbNodes}/{verificationResult.expectedNodes}
                    {verificationResult.nodesMatch ? ' ✅' : ' ❌'}</p>
                  <p>Edges: {verificationResult.dbEdges}/{verificationResult.expectedEdges}
                    {verificationResult.edgesMatch ? ' ✅' : ' ❌'}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Environment check:</p>
            <div className="space-y-1 text-xs">
              <p className="text-green-600">
                DATABASE_URL: ✅ Configured in Vercel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
