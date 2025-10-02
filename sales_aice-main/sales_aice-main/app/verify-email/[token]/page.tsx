'use client';  // This marks the component as a client-side component

import { useState, useLayoutEffect, useEffect } from 'react';  // useLayoutEffect is used here
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

const VerifyEmailPage = () => {
    const { token } = useParams<{ uid: string; token: string }>();  // Extract `uid` and `token` from the URL

    const [status, setStatus] = useState<string>('Verifying...');
    const [email, setEmail] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(true);  // To track the loading state
    const [expired, setExpired] = useState<boolean>(false);
    const router = useRouter();
    
    useLayoutEffect(() => {
        if (token) {
            console.log("Token received:", token);  // For debugging

            const checkTokenExpiry = async () => {
                try {
                    // Send a request to check if the token is expired
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/check-verification-link/${token}/`
                    );

                    // If the token is expired, set the status and stop further processing
                    if (response.data.expired) {
                        setExpired(true)
                        setIsLoading(false);
                    } else {
                        console.log('email is 12345 ', response.data.email)
                        setEmail(response.data.email)
                        setExpired(false)
                        // Proceed with email verification if the token is valid
                    }
                } catch (error) {
                    setIsLoading(false);
                }
            };

            checkTokenExpiry();  // Check token expiry first
        } else {
            setStatus('Invalid verification link.');
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/verify-email/${token}/`
                );

                if (response.status === 200) {
                    // setStatus('Email successfully verified!');
                    toast.success(`Email is verified. Please Login!`, { position: 'bottom-right' });
                    router.push('/login')
                }
            } catch (error) {
                setStatus('Verification failed. Please try again.');
                setIsLoading(false);
            }
        };
        verifyEmail()
    })

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center p-6 w-full max-w-md flex flex-col justify-center items-center">
                {expired ? (
                    <div>Verification Link expired. Try again</div>
                ) : (
                    <>
                        <h2 className="text-2xl text-black font-semibold mb-4">Email Verification</h2>
                        <p className="mb-4">Verifying your email: {email}</p>

                        {/* Loader centered in the middle */}
                        {isLoading && (
                            <div className="flex justify-center items-center mt-4">
                                <Loader className="animate-spin text-blue-500 w-8 h-8" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

    );
};

export default VerifyEmailPage;
