import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import img_1 from "../assets/img-1.png";
import img_2 from "../assets/img-2.jpg";
import img_3 from "../assets/img-3.png";
import logo from "../assets/vitalflo-text-logo.png";
import AnimatedText from "../components/ui/AnimatedText";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

const SLIDES = [
  {
    id: 1,
    title: "Proactive respiratory care,",
    gradient: "in every setting.",
    description:
      "VitalFlo is transforming the delivery of respiratory care for health systems, ACOs, physician practices, and academic medical centers.",
    image: img_1,
    badge1: "Proactive Care",
    badge2: "Respiratory Health",
  },
  {
    id: 2,
    title: "World-class solutions,",
    gradient: "made easy to use.",
    description:
      "We create thoughtful, easy-to-use solutions while building successful partnerships with the organizations we serve.",
    image: img_2,
    badge1: "Easy-to-Use",
    badge2: "Partnerships",
  },
  {
    id: 3,
    title: "Clinical advancement,",
    gradient: "with meaningful impact.",
    description:
      "Our work is guided by clinical advancement, thoughtful innovation, and a commitment to driving better outcomes.",
    image: img_3,
    badge1: "Better Outcomes",
    badge2: "Innovation",
  },
];

const loginSchema = z.object({
  username: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      await login(data.username, data.password, "admin");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const loading = isSubmitting;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen bg-surface p-3 sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1800px] overflow-hidden shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-32px)]">
        {/* ───────────────────────── LEFT PANEL ───────────────────────── */}
        <div className="relative hidden rounded-2xl flex-1 overflow-hidden bg-brand-950 lg:flex">
          {/* Background image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              key={slide.id}
              src={slide.image}
              alt="Clinical care"
              className="h-full w-full object-cover animate-[zoomIn_5s_ease-out_forwards]"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-950/70 to-brand-900/80" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_30%)]" />
          </div>

          {/* Decorative glow */}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand-300/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-8 xl:p-12">
            {/* Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-auto items-center justify-center">
                  <img
                    src={logo}
                    alt="VitalFlow"
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl">
              {/* Badges */}
              <div className="mb-6 flex flex-wrap gap-2">
                {[slide.badge1, slide.badge2].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/12 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/80 shadow-sm backdrop-blur-md animate-gelatine"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Heading */}
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white xl:text-5xl">
                <AnimatedText speed={20}>{slide.title}</AnimatedText>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 xl:text-[15px] animate-fade-in">
                {slide.description}
              </p>
            </div>

            {/* Bottom */}
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="mb-4 flex items-center gap-1.5">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      aria-label={`Show slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === current
                          ? "w-8 bg-white"
                          : "w-2 bg-white/25 hover:bg-white/45"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/45">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
                  Built for secure clinical data handling
                </div>
              </div>

              <div className="hidden text-right xl:block">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                  Healthcare intelligence
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Connected. Secure. Insightful.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────── RIGHT PANEL ───────────────────────── */}
        <div className="flex w-full items-center justify-center bg-surface px-5 py-8 sm:px-10 lg:w-[500px] lg:flex-none xl:w-[540px]">
          <div className="w-full max-w-[380px] animate-fade-in">
            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/15 bg-brand-500/8">
                <Stethoscope className="h-5 w-5 text-brand-600" />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-tight text-fg">
                  VitalFlow
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-fg-muted">
                  Admin Portal
                </p>
              </div>
            </div>

            {/* Header */}
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-fg">
                Sign In
              </h2>

              <p className="mt-2 text-sm leading-6 text-fg-muted">
                Sign in to your admin portal to manage the system.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-xs font-semibold text-fg"
                >
                  Email or phone
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />

                  <Input
                    id="username"
                    type="text"
                    placeholder="admin@vitalflow.com"
                    {...register("username")}
                    className="pl-10 shadow-sm transition-all placeholder:text-fg-muted/50 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    autoComplete="username"
                  />
                </div>

                {errors.username && (
                  <p className="text-xs font-medium text-danger">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-fg"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    {...register("password")}
                    className="pl-10 pr-11 shadow-sm transition-all placeholder:text-fg-muted/50 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-fg-muted transition-colors hover:text-fg"
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
                  <p className="text-xs font-medium text-danger">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* API error */}
              {error && (
                <div
                  className="rounded-xl border border-danger/15 bg-danger/5 px-3.5 py-3 text-sm text-danger"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                className="w-full"
                size="default"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-fg-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Secure admin access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
