import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import api from "../services/api";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | invalid-token

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    setError("");

    if (!token) {
      setStatus("invalid-token");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setStatus("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 400 || err.response?.status === 404) {
        setStatus("invalid-token");
      } else {
        setError(message || "Something went wrong. Please try again.");
      }
    }
  };

  const loading = isSubmitting;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* ——— Left: brand panel, hidden on small screens ——— */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <Stethoscope className="h-6 w-6 text-brand-300" />
          <span className="text-sm font-semibold tracking-wide text-brand-100">
            VitalFlo
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Choose a new
            <br />
            password.
          </h1>
          <p className="max-w-sm text-brand-200 text-sm leading-relaxed">
            Pick something you'll remember. Once it's set, you'll be able to
            sign back in right away.
          </p>

          {/* Signature element: a live ECG trace */}
          <div className="relative pt-4">
            <svg
              viewBox="0 0 320 60"
              className="w-full max-w-sm text-brand-400"
              fill="none"
            >
              <path
                d="M0 30 H100 L112 10 L124 50 L136 30 H180 L192 18 L200 42 L208 30 H320"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
            <span className="absolute right-0 top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-300" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-300">
          <ShieldCheck className="h-4 w-4" />
          Built for secure clinical data handling
        </div>
      </div>

      {/* ——— Right: form panel ——— */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Brand mark shown only when the left panel is hidden */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="rounded-full bg-brand-500/10 p-2">
              <Stethoscope className="h-5 w-5 text-brand-500" />
            </div>
            <span className="text-sm font-semibold text-fg">VitalFlo</span>
          </div>

          {status === "success" ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-fg">
                Password updated
              </h2>
              <p className="mt-1.5 text-sm text-fg-muted">
                Redirecting you to sign in...
              </p>
            </div>
          ) : status === "invalid-token" ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <XCircle className="h-6 w-6 text-danger" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-fg">
                Link expired
              </h2>
              <p className="mt-1.5 text-sm text-fg-muted">
                This reset link is invalid or has expired. Please request a new
                one.
              </p>
              <Link to="/forgot-password">
                <Button className="mt-6 h-11 w-full bg-brand-600 text-white hover:bg-brand-700">
                  Request new link
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-fg">
                Reset your password
              </h2>
              <p className="mt-1.5 text-sm text-fg-muted">
                Enter a new password for your account
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-4"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-fg-muted"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      {...register("password")}
                      className="h-11 pl-10 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-muted/90 transition-colors cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-danger">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium text-fg-muted"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      {...register("confirmPassword")}
                      className="h-11 pl-10 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-muted/90 transition-colors cursor-pointer"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-danger">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-danger" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full bg-brand-600 text-white hover:bg-brand-700"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </span>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </>
          )}

          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-fg-muted lg:hidden">
            <Activity className="h-3.5 w-3.5" />
            Built for secure clinical data handling
          </p>
        </div>
      </div>
    </div>
  );
}
