import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_BASE_URL } from '@/lib/config';

export function LoginDebug() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (!response.ok) {
        setError(`Error ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-4">Login Debug</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <Input 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <Input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Testing...' : 'Test Login'}
        </Button>
      </form>
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded text-red-800">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded">
          <p className="font-bold">Response:</p>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        <p>API URL: {API_BASE_URL ? `${API_BASE_URL}/api/login` : '/api/login'}</p>
      </div>
    </div>
  );
} 