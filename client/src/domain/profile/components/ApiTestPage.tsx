import React, { useState } from 'react';
import { ActivityService } from '../services/ActivityService';
import { ProfileRepository } from '../repositories/ProfileRepository';

/**
 * Simple test page to verify API endpoints are working
 */
export const ApiTestPage: React.FC = () => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const testUserId = 'f0bf523e-fbe3-4c54-82d7-5871b6552e1c';

    const runTests = async () => {
        setLoading(true);
        setResults([]);
        
        const activityService = new ActivityService();
        const profileRepository = new ProfileRepository();
        
        const tests = [
            {
                name: 'Get Profile',
                test: () => profileRepository.findByUserId(testUserId)
            },
            {
                name: 'Get Activity Stats',
                test: () => activityService.getActivityStats(testUserId)
            },
            {
                name: 'Get Achievements',
                test: () => activityService.getAchievements(testUserId)
            },
            {
                name: 'Get Public Profiles',
                test: () => profileRepository.getPublicProfiles(3)
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                setResults(prev => [...prev, {
                    name: test.name,
                    success: true,
                    data: result,
                    error: null
                }]);
            } catch (error) {
                setResults(prev => [...prev, {
                    name: test.name,
                    success: false,
                    data: null,
                    error: error instanceof Error ? error.message : String(error)
                }]);
            }
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <button
                        onClick={runTests}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Running Tests...' : 'Run API Tests'}
                    </button>
                </div>

                {results.length > 0 && (
                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                                    result.success ? 'border-green-500' : 'border-red-500'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {result.name}
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            result.success
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {result.success ? 'SUCCESS' : 'FAILED'}
                                    </span>
                                </div>

                                {result.success ? (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Response Data:</h4>
                                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="text-sm font-medium text-red-700 mb-2">Error:</h4>
                                        <p className="text-red-600 text-sm">{result.error}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};