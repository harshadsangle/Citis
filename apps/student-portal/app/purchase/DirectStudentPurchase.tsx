"use client";

import { useEffect, useMemo, useState } from "react";

type ApiEnvelope<T> = {
  data?: T;
  error?: { message?: string } | string;
  message?: string;
};

type AuthSession = {
  id: string;
  email?: string | null;
  mobile?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  studentType?: string | null;
  roles?: Array<{ code: string }>;
};

type PurchasableCourse = {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  thumbnail?: string | null;
  priceMinor: number;
  currency: string;
  isEnrolled: boolean;
};

type PaymentOrder = {
  amountMinor: number;
  currency: string;
  razorpayOrderId: string;
  keyId: string | null;
};

type PaymentVerification = {
  status: string;
  enrollmentId?: string;
};

type OtpPurpose = "registration" | "mobile-login";
type AuthMode = "register" | "login";
type LoginMethod = "email" | "mobile";
type RegistrationChannel = "email" | "mobile";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const TENANT_SLUG = "citis-platform";
let razorpayScriptPromise: Promise<void> | null = null;

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok) {
    const message = typeof body?.error === "string"
      ? body.error
      : body?.error?.message || body?.message || "The request could not be completed.";
    throw new ApiRequestError(message, response.status);
  }
  if (!body || !("data" in body)) {
    throw new Error("The server returned an unexpected response.");
  }
  return body.data as T;
}

function isDirectStudent(profile: AuthSession) {
  return profile.studentType === "DIRECT_STUDENT"
    && profile.roles?.some((role) => role.code === "STUDENT") === true;
}

function normalizedKey(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function money(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amountMinor / 100);
  } catch {
    return `${currency.toUpperCase()} ${(amountMinor / 100).toFixed(2)}`;
  }
}

function getPurchaseIdempotencyKey(courseId: string) {
  const storageKey = `citis-direct-course-purchase:${courseId}`;
  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const next = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `purchase-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(storageKey, next);
    return next;
  } catch {
    return `purchase-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function clearPurchaseIdempotencyKey(courseId: string) {
  try {
    window.sessionStorage.removeItem(`citis-direct-course-purchase:${courseId}`);
  } catch {
    // Session storage can be unavailable in private browsing; the order remains server-verified.
  }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Razorpay Checkout did not initialize."));
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Razorpay Checkout could not be loaded. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return razorpayScriptPromise;
}

export function DirectStudentPurchase({ courseSlug, courseTitle }: { courseSlug: string; courseTitle: string }) {
  const [accountState, setAccountState] = useState<"checking" | "guest" | "direct" | "other">("checking");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [registrationChannel, setRegistrationChannel] = useState<RegistrationChannel>("email");
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose | null>(null);
  const [pendingContact, setPendingContact] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerContact, setRegisterContact] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMobile, setLoginMobile] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [courses, setCourses] = useState<PurchasableCourse[]>([]);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const requestedCourse = useMemo(() => {
    const expectedTitle = normalizedKey(courseTitle);
    const expectedSlug = normalizedKey(courseSlug.replace(/-/g, " "));
    const exactTitle = courses.filter((course) => normalizedKey(course.title) === expectedTitle);
    if (exactTitle.length === 1) return exactTitle[0];
    if (exactTitle.length > 1) return null;

    const exactCode = courses.filter((course) => normalizedKey(course.code) === normalizedKey(courseSlug));
    if (exactCode.length === 1) return exactCode[0];
    if (exactCode.length > 1) return null;

    const slugTitle = courses.filter((course) => normalizedKey(course.title) === expectedSlug);
    return slugTitle.length === 1 ? slugTitle[0] : null;
  }, [courseSlug, courseTitle, courses]);

  async function loadPurchasableCourses() {
    setCatalogBusy(true);
    setCatalogError("");
    try {
      const result = await apiRequest<PurchasableCourse[]>("/payments/purchasable-courses");
      setCourses(result);
    } catch (reason) {
      setCatalogError(reason instanceof Error ? reason.message : "We couldn't load courses available for direct purchase.");
    } finally {
      setCatalogBusy(false);
    }
  }

  async function refreshSession() {
    const profile = await apiRequest<AuthSession>("/auth/me");
    setSession(profile);
    if (!isDirectStudent(profile)) {
      setAccountState("other");
      return;
    }
    setAccountState("direct");
    await loadPurchasableCourses();
  }

  useEffect(() => {
    let active = true;
    async function loadSession() {
      try {
        const profile = await apiRequest<AuthSession>("/auth/me");
        if (!active) return;
        setSession(profile);
        if (!isDirectStudent(profile)) {
          setAccountState("other");
          return;
        }
        setAccountState("direct");
        setCatalogBusy(true);
        const result = await apiRequest<PurchasableCourse[]>("/payments/purchasable-courses");
        if (active) setCourses(result);
      } catch (reason) {
        if (!active) return;
        if (reason instanceof ApiRequestError && reason.status === 401) {
          setAccountState("guest");
        } else {
          setAccountState("guest");
          setAuthError(reason instanceof Error ? reason.message : "We couldn't check your account.");
        }
      } finally {
        if (active) {
          setCatalogBusy(false);
          setScreenLoading(false);
        }
      }
    }
    void loadSession();
    return () => { active = false; };
  }, []);

  async function finishAuthentication() {
    setAuthError("");
    setAuthNotice("");
    await refreshSession();
    setOtpPurpose(null);
    setOtpCode("");
    setRegisterPassword("");
    setLoginPassword("");
  }

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    const contact = registerContact.trim();
    const contactInput = registrationChannel === "email" ? { email: contact } : { mobile: contact };
    try {
      await apiRequest("/auth/direct-students/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password: registerPassword,
          ...contactInput,
        }),
      });
      setPendingContact(contact);
      setRegisterPassword("");
      setOtpCode("");
      setOtpPurpose("registration");
      setAuthNotice("If this is a new contact, a one-time code has been sent. If you have registered before, sign in instead.");
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason.message : "We couldn't start registration.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitEmailLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      await finishAuthentication();
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason.message : "We couldn't sign you in.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function requestMobileLoginCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    const mobile = loginMobile.trim();
    try {
      await apiRequest("/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ mobile, tenantSlug: TENANT_SLUG }),
      });
      setPendingContact(mobile);
      setOtpCode("");
      setOtpPurpose("mobile-login");
      setAuthNotice("If this mobile is registered, a sign-in code has been sent.");
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason.message : "We couldn't send a sign-in code.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!otpPurpose) return;
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    try {
      if (otpPurpose === "registration") {
        const contactInput = registrationChannel === "email"
          ? { email: pendingContact }
          : { mobile: pendingContact };
        await apiRequest("/auth/direct-students/otp/verify", {
          method: "POST",
          body: JSON.stringify({ ...contactInput, code: otpCode.trim() }),
        });
      } else {
        await apiRequest("/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ mobile: pendingContact, code: otpCode.trim(), tenantSlug: TENANT_SLUG }),
        });
      }
      await finishAuthentication();
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason.message : "That code couldn't be verified.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function resendCode() {
    if (!otpPurpose) return;
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    try {
      if (otpPurpose === "registration") {
        const contactInput = registrationChannel === "email"
          ? { email: pendingContact }
          : { mobile: pendingContact };
        await apiRequest("/auth/direct-students/otp/resend", {
          method: "POST",
          body: JSON.stringify(contactInput),
        });
        setAuthNotice("If a registration is waiting for verification, a new code has been sent.");
      } else {
        await apiRequest("/auth/otp/request", {
          method: "POST",
          body: JSON.stringify({ mobile: pendingContact, tenantSlug: TENANT_SLUG }),
        });
        setAuthNotice("If this mobile is registered, a new sign-in code has been sent.");
      }
    } catch (reason) {
      setAuthError(reason instanceof Error ? reason.message : "We couldn't resend the code.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function beginCheckout() {
    if (!requestedCourse || requestedCourse.isEnrolled || checkoutBusy) return;
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const order = await apiRequest<PaymentOrder>(
        `/payments/courses/${encodeURIComponent(requestedCourse.id)}/order`,
        {
          method: "POST",
          body: JSON.stringify({ idempotencyKey: getPurchaseIdempotencyKey(requestedCourse.id) }),
        },
      );
      if (!order.keyId) throw new Error("Secure checkout is not configured for this course. Please try again later.");
      if (!order.razorpayOrderId || order.amountMinor <= 0) throw new Error("The course order returned incomplete checkout details.");

      await loadRazorpayCheckout();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout did not initialize.");

      let verifying = false;
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amountMinor,
        currency: order.currency,
        name: "CITIS Skills Excellence Centre",
        description: requestedCourse.title,
        order_id: order.razorpayOrderId,
        prefill: {
          name: [session?.firstName, session?.lastName].filter(Boolean).join(" ") || undefined,
          email: session?.email || undefined,
          contact: session?.mobile || undefined,
        },
        theme: { color: "#176276" },
        handler: (response) => {
          verifying = true;
          void (async () => {
            try {
              const verified = await apiRequest<PaymentVerification>("/payments/verify", {
                method: "POST",
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              if (verified.status !== "CAPTURED") {
                throw new Error("The payment has not been confirmed. Course access remains locked.");
              }

              let accessConfirmed = false;
              for (let attempt = 0; attempt < 5; attempt += 1) {
                const progress = await apiRequest<Array<{ course: { id: string } }>>("/progress");
                if (progress.some((item) => item.course?.id === requestedCourse.id)) {
                  accessConfirmed = true;
                  break;
                }
                await new Promise((resolve) => setTimeout(resolve, 350));
              }
              if (!accessConfirmed) {
                throw new Error("Payment was verified, but course access is still updating. Open your learning library in a moment.");
              }

              clearPurchaseIdempotencyKey(requestedCourse.id);
              setUnlocked(true);
              setCheckoutError("");
            } catch (reason) {
              setCheckoutError(reason instanceof Error ? reason.message : "Payment verification failed. Course access remains locked.");
            } finally {
              setCheckoutBusy(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            if (!verifying) {
              setCheckoutBusy(false);
              setCheckoutError("Checkout was closed. No course access was granted; you can try again.");
            }
          },
        },
      });
      checkout.on("payment.failed", () => {
        setCheckoutBusy(false);
        setCheckoutError("The payment did not complete. Course access remains locked; you can try again.");
      });
      checkout.open();
    } catch (reason) {
      setCheckoutBusy(false);
      setCheckoutError(reason instanceof Error ? reason.message : "We couldn't start secure checkout.");
    }
  }

  const displayTitle = courseTitle || courseSlug.replace(/-/g, " ");
  const showOtpForm = otpPurpose !== null;

  return (
    <main className="purchase-page">
      <div className="purchase-shell">
        <header className="purchase-header">
          <a href="/" className="purchase-brand" aria-label="CITIS student portal home">
            <span className="purchase-brand-mark">C</span>
            <span><strong>CITIS</strong><small>Skills Excellence Centre</small></span>
          </a>
          <span className="purchase-secure-label">Secure course enrolment</span>
        </header>

        <nav className="purchase-steps" aria-label="Purchase progress">
          <span className="is-current"><i>1</i>Course</span>
          <span className={accountState === "direct" ? "is-current" : ""}><i>2</i>Account</span>
          <span className={checkoutBusy || unlocked ? "is-current" : ""}><i>3</i>Payment</span>
          <span className={unlocked ? "is-current" : ""}><i>4</i>Access</span>
        </nav>

        <div className="purchase-layout">
          <section className="purchase-course-panel">
            <span className="purchase-eyebrow">DIRECT STUDENT CHECKOUT</span>
            <h1>{displayTitle}</h1>
            <p className="purchase-intro">
              Verify your learner account, review the course price, and complete secure checkout to unlock your course.
            </p>
            <div className="purchase-course-points">
              <span><i aria-hidden="true">✓</i>Price and eligibility confirmed by CITIS</span>
              <span><i aria-hidden="true">✓</i>Course access activates only after payment verification</span>
              <span><i aria-hidden="true">✓</i>Institution-assigned learners keep using their usual access</span>
            </div>

            {screenLoading && <p className="purchase-status" role="status">Checking your learner account…</p>}
            {!screenLoading && accountState === "other" && (
              <div className="purchase-notice" role="status">
                This checkout is for direct students. Institution learners should open courses assigned by their college or programme team.
              </div>
            )}
            {!screenLoading && accountState === "direct" && (
              <div className="purchase-summary" aria-live="polite">
                {catalogBusy ? (
                  <p className="purchase-status" role="status">Checking direct-purchase availability…</p>
                ) : catalogError ? (
                  <p className="purchase-error" role="alert">{catalogError}</p>
                ) : unlocked ? (
                  <div className="purchase-success" role="status">
                    <span className="purchase-success-icon" aria-hidden="true">✓</span>
                    <h2>Course unlocked</h2>
                    <p>Payment was verified and your course is available in your learning library.</p>
                    <a className="purchase-primary" href="/">Open my learning library</a>
                  </div>
                ) : requestedCourse?.isEnrolled ? (
                  <div className="purchase-success" role="status">
                    <span className="purchase-success-icon" aria-hidden="true">✓</span>
                    <h2>You already have access</h2>
                    <p>This course is already active in your learning library.</p>
                    <a className="purchase-primary" href="/">Open my learning library</a>
                  </div>
                ) : requestedCourse ? (
                  <>
                    <div className="purchase-price-row">
                      <span>Course price</span>
                      <strong>{money(requestedCourse.priceMinor, requestedCourse.currency)}</strong>
                    </div>
                    <p className="purchase-caption">Final amount is set by the course catalogue and confirmed again when your order is created.</p>
                    {checkoutError && <p className="purchase-error" role="alert">{checkoutError}</p>}
                    <button className="purchase-primary" type="button" onClick={() => void beginCheckout()} disabled={checkoutBusy}>
                      {checkoutBusy ? "Preparing secure checkout…" : "Pay securely with Razorpay"}
                    </button>
                    <p className="purchase-caption purchase-caption-center">Your course unlocks only after the server verifies the payment.</p>
                  </>
                ) : (
                  <div className="purchase-notice" role="status">
                    <strong>Direct purchase is not available for this course.</strong>
                    <span>This course may be available through an institution or programme. No payment has been started.</span>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="purchase-auth-panel" aria-labelledby="purchase-auth-title">
            {screenLoading ? (
              <div className="purchase-auth-loading" role="status">Loading account options…</div>
            ) : accountState === "guest" ? (
              <>
                <div className="purchase-auth-heading">
                  <span className="purchase-step-label">{showOtpForm ? "ACCOUNT VERIFICATION" : "STEP 2 OF 4"}</span>
                  <h2 id="purchase-auth-title">{showOtpForm ? "Verify your code" : authMode === "register" ? "Create your direct student account" : "Sign in to continue"}</h2>
                  <p>{showOtpForm ? `Enter the code sent to ${pendingContact}.` : "Direct students need an account before purchasing a course."}</p>
                </div>

                {!showOtpForm && (
                  <div className="purchase-tabs" role="tablist" aria-label="Account options">
                    <button type="button" role="tab" aria-selected={authMode === "register"} className={authMode === "register" ? "is-active" : ""} onClick={() => { setAuthMode("register"); setAuthError(""); setAuthNotice(""); }}>Create account</button>
                    <button type="button" role="tab" aria-selected={authMode === "login"} className={authMode === "login" ? "is-active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); setAuthNotice(""); }}>Sign in</button>
                  </div>
                )}

                {authError && <p className="purchase-error" role="alert">{authError}</p>}
                {authNotice && <p className="purchase-notice" role="status">{authNotice}</p>}

                {showOtpForm ? (
                  <form className="purchase-form" onSubmit={verifyCode}>
                    <label className="purchase-field">
                      <span>6-digit verification code</span>
                      <input value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
                    </label>
                    <button className="purchase-primary" type="submit" disabled={authBusy || otpCode.length !== 6}>
                      {authBusy ? "Verifying…" : "Verify and continue"}
                    </button>
                    <div className="purchase-form-links">
                      <button type="button" onClick={() => void resendCode()} disabled={authBusy}>Resend code</button>
                      <button type="button" onClick={() => { setOtpPurpose(null); setOtpCode(""); setAuthError(""); setAuthNotice(""); }}>Use another method</button>
                    </div>
                  </form>
                ) : authMode === "register" ? (
                  <form className="purchase-form" onSubmit={submitRegistration}>
                    <div className="purchase-name-fields">
                      <label className="purchase-field"><span>First name</span><input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required maxLength={100} /></label>
                      <label className="purchase-field"><span>Last name</span><input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" maxLength={100} /></label>
                    </div>
                    <div className="purchase-choice-row" role="group" aria-label="Choose verification method">
                      <button type="button" className={registrationChannel === "email" ? "is-active" : ""} onClick={() => setRegistrationChannel("email")}>Email OTP</button>
                      <button type="button" className={registrationChannel === "mobile" ? "is-active" : ""} onClick={() => setRegistrationChannel("mobile")}>Mobile OTP</button>
                    </div>
                    <label className="purchase-field">
                      <span>{registrationChannel === "email" ? "Email address" : "Mobile number"}</span>
                      <input
                        value={registerContact}
                        onChange={(event) => setRegisterContact(event.target.value)}
                        type={registrationChannel === "email" ? "email" : "tel"}
                        autoComplete={registrationChannel === "email" ? "email" : "tel"}
                        inputMode={registrationChannel === "email" ? "email" : "tel"}
                        required
                      />
                    </label>
                    <label className="purchase-field">
                      <span>Create password</span>
                      <input value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required />
                    </label>
                    <button className="purchase-primary" type="submit" disabled={authBusy}>
                      {authBusy ? "Sending verification code…" : "Continue with verification"}
                    </button>
                    <p className="purchase-caption">Your account is created after the email or mobile code is verified.</p>
                  </form>
                ) : (
                  <>
                    <div className="purchase-choice-row" role="group" aria-label="Choose sign-in method">
                      <button type="button" className={loginMethod === "email" ? "is-active" : ""} onClick={() => { setLoginMethod("email"); setAuthError(""); }}>Email and password</button>
                      <button type="button" className={loginMethod === "mobile" ? "is-active" : ""} onClick={() => { setLoginMethod("mobile"); setAuthError(""); }}>Mobile OTP</button>
                    </div>
                    {loginMethod === "email" ? (
                      <form className="purchase-form" onSubmit={submitEmailLogin}>
                        <label className="purchase-field"><span>Email address</span><input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} autoComplete="email" required /></label>
                        <label className="purchase-field"><span>Password</span><input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} autoComplete="current-password" required /></label>
                        <button className="purchase-primary" type="submit" disabled={authBusy}>{authBusy ? "Signing in…" : "Sign in and continue"}</button>
                      </form>
                    ) : (
                      <form className="purchase-form" onSubmit={requestMobileLoginCode}>
                        <label className="purchase-field"><span>Mobile number</span><input type="tel" inputMode="tel" autoComplete="tel" value={loginMobile} onChange={(event) => setLoginMobile(event.target.value)} required /></label>
                        <button className="purchase-primary" type="submit" disabled={authBusy}>{authBusy ? "Sending code…" : "Send sign-in code"}</button>
                      </form>
                    )}
                  </>
                )}
              </>
            ) : accountState === "other" ? (
              <div className="purchase-auth-heading">
                <span className="purchase-step-label">ACCOUNT TYPE</span>
                <h2 id="purchase-auth-title">Direct student access required</h2>
                <p>This signed-in account is not a direct student account. College course access and allocations are unchanged.</p>
              </div>
            ) : accountState === "direct" ? (
              <div className="purchase-auth-heading">
                <span className="purchase-step-label">{unlocked ? "STEP 4 OF 4" : "STEP 3 OF 4"}</span>
                <h2 id="purchase-auth-title">{unlocked ? "Ready to learn" : "Account verified"}</h2>
                <p>{unlocked ? "Your verified course is now in your learning library." : "Your direct student account is ready. Review the price and continue to secure payment."}</p>
              </div>
            ) : (
              <div className="purchase-auth-loading" role="status">Loading account options…</div>
            )}
          </section>
        </div>

        <footer className="purchase-footer">
          <span>Secure checkout · Payment verification is handled by CITIS</span>
          <span>Need help? Contact your programme team.</span>
        </footer>
      </div>
    </main>
  );
}