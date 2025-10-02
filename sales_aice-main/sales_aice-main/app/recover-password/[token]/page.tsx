'use client';

import { useState, useLayoutEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Verifying...');

  // Check token validity
  useLayoutEffect(() => {
    const checkTokenExpiry = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/check-verification-link/${token}/`
        );
        if (response.data.expired) {
          setExpired(true);
          setStatus("This link has expired.");
        } else {
          setExpired(false);
          setStatus('');
        }
      } catch {
        setExpired(true);
        setStatus("Invalid or expired link.");
      }
    };
    if (token) checkTokenExpiry();
    else {
      setStatus('Invalid verification link.');
      setExpired(true);
    }
  }, [token]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/change-password-token/${token}/`,
        { password: newPassword }
      );
      if (response.status === 200) {
        toast.success(`Password changed successfully! Please login.`, { position: 'bottom-right' });
        router.push('/login');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-white pt-24 px-4 sm:px-0">
      <div className="w-[90%] max-w-sm bg-[#131F36] my-12 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-center mb-5">
          <div className="w-66 h-45 overflow-hidden flex items-center justify-center">
            <Image
              src="/card_logo.jpg"
              alt="Logo"
              width={220}
              height={220}
              className="object-cover"
            />
          </div>
        </div>
        <div className="text-white text-[24px] font-semibold text-center mb-6">
          Set a New Password
        </div>
        {expired ? (
          <div className="text-red-400 text-center my-6">{status}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-[5px] bg-white text-black placeholder-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-[5px] bg-white text-black placeholder-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
            <div className="mb-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-[#1A2639] bg-[#FFD700] font-medium py-3 rounded-md transition duration-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-[#FFD700] text-[#1A2639] font-medium py-3 rounded-md transition duration-300"
                >
                  Set Password
                </button>
              )}
            </div>
            <div className="text-center text-sm text-gray-400">
              Remembered your password?{' '}
              <a href="/login" className="text-[#FFD700] hover:text-[#FF7043]">
                Login now
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
