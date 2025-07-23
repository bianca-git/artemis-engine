"use client";
import React, { useEffect } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (token: string) => void;
  onError?: (error: Error) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  useEffect(() => {
    if (!(window as any).google) {
      console.warn('Google Identity Services SDK not loaded');
      return;
    }
    (window as any).google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else if (onError) {
          onError(new Error('No credential returned'));
        }
      },
    });
    (window as any).google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large' },
    );
  }, [onSuccess, onError]);

  return <div id="google-signin-button" />;
}
