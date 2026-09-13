import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

interface ConsentGateProps {
  children: React.ReactNode;
}

export function ConsentGate({ children }: ConsentGateProps) {
  const { user } = useAuth();
  const [consentStatus, setConsentStatus] = useState<string>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app we would fetch the user's consent status from the students table.
  // For this demo, we'll mock it if not available.
  
  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consent-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'mock_valid_token_123',
          studentId: user?.id,
          method: 'digilocker_mock'
        })
      });
      
      if (!res.ok) throw new Error("Verification failed");
      setConsentStatus('verified');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Please log in to continue.</div>;
  }

  if (consentStatus !== 'verified') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 max-w-md mx-auto text-center space-y-6">
        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-none border border-amber-500/30">
          <ShieldAlert className="w-12 h-12 text-amber-600 dark:text-amber-500" />
        </div>
        <h2 className="text-2xl font-semibold">Parental Consent Required</h2>
        <p className="text-gray-600 dark:text-gray-400">
          In accordance with the DPDP Act 2023 (Rule 10), we require verifiable parental consent before you can take assessments or receive AI-generated reports.
        </p>
        
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        
        <Button 
          onClick={handleVerify} 
          disabled={isVerifying}
          className="w-full"
          size="lg"
        >
          {isVerifying ? "Verifying via Mock DigiLocker..." : "Verify Consent Now"}
        </Button>
        <p className="text-xs text-gray-500">
          This uses a mocked verification webhook for local development.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
