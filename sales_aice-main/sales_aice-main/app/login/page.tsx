'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/auth-context';
import { Loader2 } from "lucide-react";
import Image from 'next/image';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passEmail, setPassEmail] = useState('');
  const [sentPassEmail, setSentPassEmail] = useState(false)
  const { user, login } = useAuth();
  const router = useRouter()
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [passLoading, setPassLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Modal visibility state
  const [resentEmail, setResentEmail] = useState(false)

  useLayoutEffect(() => {
    // Ensure user is not null before comparing the role
    if (user) {
      if (user.role === "user") {
        router.push('/dashboard');
      } else if (user.role === "admin") {
        router.push('/admin/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {debugger
    e.preventDefault();
    setLoading(true);
    setError('');  // Reset previous errors

    // Validate if both fields are not empty
    if (!email || !password) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.', {
        position: 'bottom-right',
      });
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.', {
        position: 'bottom-right',
      });
      setLoading(false);
      return;
    }

    // Validate password length (at least 6 characters)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      toast.error('Password must be at least 6 characters.', {
        position: 'bottom-right',
      });
      setLoading(false);
      return;
    }

    try {
      // Call login function from context
    await login(email, password);  // This will handle API request and state updates
    
    } catch (error: any) {
      setError('Login failed. Please check your credentials and try again.');
      toast.error('Login failed. Please check your credentials and try again.', {
        position: 'bottom-right',
      });
      console.error('Error during login', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePassEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setPassEmail(newEmail);
    // verifyPassEmailAvailability(newEmail);
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/resend-verification-email/`, { email });
      if (response.data.message === 'email resent') {
        toast.success(`Verification Email resent to ${email}`, { position: 'bottom-right' });
        setResentEmail(true)
        setLoading(false);
      }
      else if (response.data.message === 'email verified') {
        toast.success(`Email is already verified. Please Login!`, { position: 'bottom-right' });
        setLoading(false);
        router.push('/login')
      }
    } catch (error) {
      toast.error('Failed to resend email. Please try again later.', { position: 'bottom-right' });
      setLoading(false);

    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handlePassSubmit = async () => {
    if (passLoading || passEmail === "" ){
      console.log("PASS EMAIL IS NOT THERE")
      return
    }
    setPassLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/send-password-recovery-email/`, { email:passEmail });
      if (response.data.status === '410') {
        toast.success(`Verification Email sent to ${passEmail}`, { position: 'bottom-right' });
        setSentPassEmail(true)
        setPassLoading(false);
      }
      else if (response.data.status === '420'){
        setSentPassEmail(true)
        setPassLoading(false);
      }
    } catch (error) {
      toast.error('Failed to send email. Please try again later.', { position: 'bottom-right' });
      setPassLoading(false);

    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-white pt-45 px-4 sm:px-0 ">
      <div className="w-[100%] max-w-sm bg-white my-12 rounded-2xl shadow-lg p-6 sm:p-8">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          
            <img
              src="aicelogo-final.png"
              alt="Logo"
              
              className="w-40 h-40"
            />
          
        </div>

        {/* Title */}
        <div className="text-[#787881] text-[24px] font-semibold text-center mb-6">
          Log in to your Account
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-3 border rounded">
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-[5px] text-12px bg-white text-[#787881] placeholder-[#787881] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4 border rounded">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-[5px] bg-white text-[#787881] placeholder-[#787881] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Display error message if validation fails */}
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
          )}

          {/* Submit Button */}
          <div className="mb-4">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-[#1A2639] bg-[#FFD700] font-medium py-3 rounded-md transition duration-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging In
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-[#0E4683] text-bold text-white font-medium py-3 rounded-md transition duration-300"
                disabled={loading}  // Disable while loading
              >
                Log in
              </button>
            )}
          </div>
        </form>

        {/* Forgot Password & SignUp Links */}
        <div className="text-center text-sm text-gray-400">
          <button className="hover:underline" onClick={() => {
            setModalOpen(true)
          }}>
            Forgot password?
          </button>
        </div>

        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#0E4683] hover:text-[#FF7043]">
            Sign Up
          </Link>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#131F36] p-6 rounded-lg w-80 text-center mt-12">
            <h2 className="text-xl font-semibold mb-4">Recover your Password</h2>
            <p>Enter your registered email, we will send you recovery password link at your mail</p>
            {/* {resentEmail ? (<p>We have resent you a verification email at <strong>{email}</strong>. Please check your inbox.</p>)
              :
              (<p>We have sent you a recovery password email at <strong>{email}</strong>. Please check your inbox.</p>
              )} */}
            {/* <form onSubmit={handlePassSubmit}> */}
            <form>
              <div className="mb-4">
                <input
                  type="email"
                  value={passEmail}
                  onChange={handlePassEmailChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-[5px] bg-white text-black placeholder-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {/* {emailError && <div className="text-red-500 text-sm mt-2">{emailError}</div>} */}
              </div>
            </form>
            <div className="mt-4">
              <button
                onClick={handlePassSubmit}
                className="bg-[#FFD700] text-[#1A2639] px-4 py-2 rounded-md mr-2"
              >
                {/* {loading ? (<div className="flex items-center justify-center gap-2 text-[#1A2639] bg-[#FFD700] font-medium rounded-md transition duration-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resending Link
                  </div>) : (<button
                    type="submit"
                    className="w-full bg-[#FFD700] text-[#1A2639] font-medium  rounded-md transition duration-300"
                  >
                    Resend Link
                  </button>)} */}

                {passLoading ? (<div className="flex items-center justify-center gap-2 text-[#1A2639] bg-[#FFD700] font-medium rounded-md transition duration-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Link
                </div>) : (<button
                  // onClick={() => {
                  //   handlePassSubmit()
                  // }}
                  className="w-full bg-[#FFD700] text-[#1A2639] font-medium  rounded-md transition duration-300"
                >
                  send Link
                </button>)}

              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>


            {/* </form> */}


          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
