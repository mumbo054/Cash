import React, { useState } from 'react';
import { TopoBackground } from '@/components/kokonutui/topo-background';
import { DynamicText } from '@/components/kokonutui/dynamic-text';
import { ParticleButton } from '@/components/kokonutui/ParticleButton';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PasswordField from '@/registry/ruixenui/password-field';
import { X, AlertCircle } from 'lucide-react';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LandingPage() {
  const {
    signInWithCredentials,
    signUpNewUser,
  } = useWallet();

  const [authModal, setAuthModal] = useState<'login' | 'join' | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Status and error states
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenLogin = () => {
    setFormError(null);
    setAuthModal('login');
  };

  const handleOpenJoin = () => {
    setFormError(null);
    setAcceptTerms(false);
    setAuthModal('join');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setFormError('Please enter both your login ID and password.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await signInWithCredentials(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      setAuthModal(null);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setFormError(res.error || 'Incorrect login credentials.');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinEmail.trim() || !joinPassword) {
      setFormError('Please provide your name, email, and password.');
      return;
    }

    if (joinPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (!acceptTerms) {
      setFormError('Please accept the terms and conditions to proceed.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await signUpNewUser({
      fullName: joinName,
      email: joinEmail,
      password: joinPassword,
      phone: joinPhone,
    });
    setIsSubmitting(false);

    if (res.success) {
      setAuthModal(null);
      setJoinName('');
      setJoinEmail('');
      setJoinPassword('');
      setJoinPhone('');
      setAcceptTerms(false);
    } else {
      setFormError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-zinc-100 flex flex-col font-sans overflow-hidden selection:bg-[#00D632] selection:text-black">
      {/* Official Kokonut UI Topo Background with full-page container */}
      <TopoBackground
        className="min-h-screen w-full bg-black text-zinc-400 dark:bg-black dark:text-zinc-400 flex flex-col justify-between"
        speed={1}
        interactive={true}
        labels={true}
        interval={0.1}
        seed={26}
      >
        {/* Apple Glass Navigation Bar */}
        <header className="relative z-20 w-full border-b border-white/[0.08] bg-black/35 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.06)]">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D632] flex items-center justify-center shadow-[0_0_20px_rgba(0,214,50,0.4)]">
                <span className="text-black font-black text-xl tracking-tighter font-display">C</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-display">
                Cash
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <ParticleButton
                variant="outline"
                onClick={handleOpenLogin}
                className="px-5 py-2.5 text-xs font-semibold font-sans backdrop-blur-xl border-white/15 bg-white/[0.04] hover:bg-white/[0.08]"
              >
                Log In
              </ParticleButton>

              <ParticleButton
                variant="cash"
                onClick={handleOpenJoin}
                className="px-6 py-2.5 text-xs font-bold font-sans"
              >
                Join Us
              </ParticleButton>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
          {/* Cash + Kokonut UI Dynamic Text */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[1.12] text-white mb-6">
            <span className="block mb-3">Cash</span>
            <span className="inline-block">
              <DynamicText
                words={['Smarter.', 'Simpler.', 'Seamless.', 'Effortless.', 'Yours.']}
                interval={2200}
                className="text-[#00D632] font-display"
              />
            </span>
          </h1>

          {/* Minimal Subtitle */}
          <p className="font-sans text-zinc-400 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Send, save, and manage your money with lightning speed. Built for absolute simplicity and total financial control.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <ParticleButton
              variant="cash"
              onClick={handleOpenJoin}
              showArrow
              className="w-full sm:w-auto px-8 py-4 text-base font-bold font-sans shadow-[0_0_25px_rgba(0,214,50,0.4)]"
            >
              Join Us
            </ParticleButton>

            <ParticleButton
              variant="outline"
              onClick={handleOpenLogin}
              className="w-full sm:w-auto px-8 py-4 text-base font-sans backdrop-blur-xl border-white/15 bg-white/[0.04] hover:bg-white/[0.08]"
            >
              Log In
            </ParticleButton>
          </div>
        </main>

        {/* Minimal Footer Spacer */}
        <footer className="h-10 w-full" />
      </TopoBackground>

      {/* Modal Dialog with Apple Glass Styling */}
      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAuthModal(null);
              setFormError(null);
            }
          }}
        >
          <div className="relative w-full max-w-sm">
            {/* Close Button */}
            <button
              onClick={() => {
                setAuthModal(null);
                setFormError(null);
              }}
              className="absolute top-4 right-4 z-20 p-2 rounded-full text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {authModal === 'login' ? (
              /* LOGIN CARD */
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <div className="space-y-1">
                      <CardTitle>Login to your account</CardTitle>
                      <CardDescription>
                        Enter your email below to login to your account
                      </CardDescription>
                    </div>
                    <CardAction>
                      <div className="flex flex-col items-end text-right pt-0.5">
                        <span className="text-[11px] text-zinc-400 font-sans whitespace-nowrap">
                          Don't have an account?
                        </span>
                        <Button
                          variant="link"
                          className="text-[#00D632] font-semibold text-xs hover:underline cursor-pointer p-0 h-auto"
                          onClick={() => {
                            setFormError(null);
                            setAuthModal('join');
                          }}
                        >
                          Sign Up
                        </Button>
                      </div>
                    </CardAction>
                  </div>
                </CardHeader>
                <CardContent>
                  {formError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <p className="leading-snug">{formError}</p>
                    </div>
                  )}

                  <form id="login-form" onSubmit={handleLoginSubmit}>
                    <div className="flex flex-col gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                          <a
                            href="#"
                            className="ml-auto inline-block text-xs text-zinc-400 underline-offset-4 hover:underline hover:text-white"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <PasswordField
                          id="password"
                          required
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          showStrength={false}
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex-col gap-2.5">
                  <Button
                    type="submit"
                    form="login-form"
                    className="w-full font-bold shadow-[0_0_20px_rgba(0,214,50,0.35)]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2.5 font-medium border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-zinc-200 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                  >
                    <GoogleLogo className="w-4 h-4" />
                    <span>Login with Google</span>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              /* JOIN US CARD */
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <div className="space-y-1">
                      <CardTitle>Create an account</CardTitle>
                      <CardDescription>
                        Enter your email below to create your account
                      </CardDescription>
                    </div>
                    <CardAction>
                      <div className="flex flex-col items-end text-right pt-0.5">
                        <span className="text-[11px] text-zinc-400 font-sans whitespace-nowrap">
                          Already have an account?
                        </span>
                        <Button
                          variant="link"
                          className="text-[#00D632] font-semibold text-xs hover:underline cursor-pointer p-0 h-auto"
                          onClick={() => {
                            setFormError(null);
                            setAuthModal('login');
                          }}
                        >
                          Login
                        </Button>
                      </div>
                    </CardAction>
                  </div>
                </CardHeader>
                <CardContent>
                  {formError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <p className="leading-snug">{formError}</p>
                    </div>
                  )}

                  <form id="join-form" onSubmit={handleJoinSubmit}>
                    <div className="flex flex-col gap-3.5">
                      <div className="grid gap-1.5">
                        <Label htmlFor="join-name">Full Name</Label>
                        <Input
                          id="join-name"
                          type="text"
                          placeholder="Anand Kumar"
                          required
                          value={joinName}
                          onChange={(e) => setJoinName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="join-email">Email</Label>
                        <Input
                          id="join-email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={joinEmail}
                          onChange={(e) => setJoinEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="join-password">Password</Label>
                        <PasswordField
                          id="join-password"
                          required
                          placeholder="Create password"
                          value={joinPassword}
                          onChange={(e) => setJoinPassword(e.target.value)}
                          showStrength={true}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="join-phone">Phone Number (optional)</Label>
                        <Input
                          id="join-phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={joinPhone}
                          onChange={(e) => setJoinPhone(e.target.value)}
                        />
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
                        />
                        <Label
                          htmlFor="terms"
                          className="text-xs text-zinc-300 normal-case font-normal cursor-pointer"
                        >
                          Accept terms and conditions
                        </Label>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex-col gap-2.5">
                  <Button
                    type="submit"
                    form="join-form"
                    className="w-full font-bold shadow-[0_0_20px_rgba(0,214,50,0.35)]"
                    disabled={isSubmitting || !acceptTerms}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2.5 font-medium border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-zinc-200 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                  >
                    <GoogleLogo className="w-4 h-4" />
                    <span>Sign up with Google</span>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MainContent() {
  const { currentProfile } = useWallet();

  if (currentProfile) {
    return <DashboardHome />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}
