import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "../../lib/utils";
import { patientsAPI } from "../../services/api";
import Field from "../shared/Field";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genderOptions = ["M", "F"];

const patientSchema = z.object({
  f_name: z.string().min(1, "First name is required"),
  l_name: z.string().min(1, "Last name is required"),
  email: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().optional(),
  dob: z.string().optional(),
  chart_no: z.string().optional(),
  blood_group: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
  patient_group_id: z.string().optional(),
  assigned_clinician_id: z.string().optional(),
});

export default function PatientForm({ onCancel, onSuccess, initialData }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);
  const maxStep = 3;
  const [clinicians, setClinicians] = useState([]);
  const [patientGroups, setPatientGroups] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      f_name: "",
      l_name: "",
      email: "",
      phone: "",
      password: "",
      dob: "",
      chart_no: "",
      blood_group: "",
      height: "",
      weight: "",
      gender: "M",
      status: "active",
      patient_group_id: "",
      assigned_clinician_id: "",
    },
  });

  useEffect(() => {
    // Load clinicians for dropdown
    patientsAPI
      .getClinicians?.()
      .then((res) => setClinicians(res.data.data || []))
      .catch(() => setClinicians([]));

    // Load patient groups
    patientsAPI
      .getGroups()
      .then((res) => setPatientGroups(res.data.data || []))
      .catch(() => setPatientGroups([]));
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        f_name: initialData.f_name || "",
        l_name: initialData.l_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        password: "",
        dob: initialData.patient_details?.attributes?.dob || "",
        chart_no: initialData.patient_details?.chart_no || "",
        blood_group: initialData.patient_details?.blood_group || "",
        height:
          initialData.patient_details?.attributes?.height?.toString() || "",
        weight:
          initialData.patient_details?.attributes?.weight?.toString() || "",
        gender: initialData.patient_details?.attributes?.gender || "M",
        status: initialData.patient_details?.status || "active",
        patient_group_id:
          initialData.patient_details?.patient_group_id?.toString() || "",
        assigned_clinician_id:
          initialData.patient_details?.assigned_clinician_id?.toString() || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        f_name: data.f_name,
        l_name: data.l_name,
        email:
          data.email ||
          `${data.f_name.toLowerCase()}.${data.l_name.toLowerCase()}@vitalflow.com`,
        phone: data.phone,
        password: data.password || "TempPass123!",
        dob: data.dob,
        chart_no: data.chart_no || "",
        blood_group: data.blood_group || null,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        gender: data.gender || "",
        status: data.status || "active",
        patient_group_id: data.patient_group_id
          ? parseInt(data.patient_group_id)
          : null,
        assigned_clinician_id: data.assigned_clinician_id
          ? parseInt(data.assigned_clinician_id)
          : null,
      };

      await patientsAPI.create(payload);
      toast.success("Patient created successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create patient");
    }
  };

  const formValues = watch();

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s, idx, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  s <= step
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-surface-raised text-fg-muted"
                }`}
              >
                {s <= step ? "✓" : s}
              </div>
              <span
                className={`text-sm font-medium ${s <= step ? "text-fg" : "text-fg-muted"}`}
              >
                {s === 1 ? "Info" : s === 2 ? "Medical" : "Assign"}
              </span>
              {idx < arr.length - 1 && (
                <div
                  className={`h-px w-8 ${s < step ? "bg-brand-400" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form
          onSubmit={handleSubmit(
            step >= maxStep ? onSubmit : () => setStep(step + 1),
          )}
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-body font-semibold text-fg">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name *" error={errors.f_name?.message}>
                  <Input {...register("f_name")} placeholder="John" />
                </Field>
                <Field label="Last Name *" error={errors.l_name?.message}>
                  <Input {...register("l_name")} placeholder="Doe" />
                </Field>
                <Field label="Email (optional)">
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="john@example.com"
                  />
                </Field>
                <Field label="Phone *" error={errors.phone?.message}>
                  <Input {...register("phone")} placeholder="1234567890" />
                </Field>
                <Field label="Password (default: TempPass123!)">
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="Min 6 chars"
                  />
                </Field>
                <Field label="Date of Birth">
                  <Input {...register("dob")} type="date" />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Medical Info */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-body font-semibold text-fg">
                Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Chart Number">
                  <Input {...register("chart_no")} placeholder="CH-001" />
                </Field>
                <Field label="Blood Group">
                  <Controller
                    name="blood_group"
                    control={control}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                            <span
                              className={
                                !field.value ? "text-fg-muted" : "text-fg"
                              }
                            >
                              {field.value || "Select"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-fg-muted" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-(--anchor-width)"
                        >
                          {bloodGroups.map((bg) => (
                            <DropdownMenuItem
                              key={bg}
                              onClick={() => field.onChange(bg)}
                              className={cn(
                                "cursor-pointer",
                                field.value === bg &&
                                  "bg-surface-raised font-medium",
                              )}
                            >
                              {bg}
                              {field.value === bg && (
                                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                </Field>
                <Field label="Height (cm)">
                  <Input
                    {...register("height")}
                    type="number"
                    step="0.1"
                    placeholder="170"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <Input
                    {...register("weight")}
                    type="number"
                    step="0.1"
                    placeholder="70"
                  />
                </Field>
                <Field label="Gender">
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                            <span className="text-fg">
                              {field.value === "M" ? "Male" : "Female"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-fg-muted" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-(--anchor-width)"
                        >
                          {genderOptions.map((g) => (
                            <DropdownMenuItem
                              key={g}
                              onClick={() => field.onChange(g)}
                              className={cn(
                                "cursor-pointer",
                                field.value === g &&
                                  "bg-surface-raised font-medium",
                              )}
                            >
                              {g === "M" ? "Male" : "Female"}
                              {field.value === g && (
                                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                </Field>
                <Field label="Status">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                            <span className="text-fg">
                              {field.value === "active" ? "Active" : "Pending"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-fg-muted" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-(--anchor-width)"
                        >
                          <DropdownMenuItem
                            onClick={() => field.onChange("active")}
                            className="cursor-pointer"
                          >
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => field.onChange("unverified")}
                            className="cursor-pointer"
                          >
                            Unverified
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Step 3: Assignment */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-body font-semibold text-fg">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Patient Group">
                  <Controller
                    name="patient_group_id"
                    control={control}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                            <span
                              className={
                                !field.value ? "text-fg-muted" : "text-fg"
                              }
                            >
                              {patientGroups.find(
                                (g) => g.id.toString() === field.value,
                              )?.name || "Select Group"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-fg-muted" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-(--anchor-width)"
                        >
                          {patientGroups.map((g) => (
                            <DropdownMenuItem
                              key={g.id}
                              onClick={() => field.onChange(g.id.toString())}
                              className={cn(
                                "cursor-pointer",
                                field.value === g.id.toString() &&
                                  "bg-surface-raised font-medium",
                              )}
                            >
                              {g.name}
                              {field.value === g.id.toString() && (
                                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                </Field>
                <Field label="Assigned Clinician">
                  <Controller
                    name="assigned_clinician_id"
                    control={control}
                    render={({ field }) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex w-full items-center justify-between h-9 px-3 text-sm rounded-(--radius-control) border border-border bg-surface text-fg cursor-pointer hover:bg-surface-raised transition-colors">
                            <span
                              className={
                                !field.value ? "text-fg-muted" : "text-fg"
                              }
                            >
                              {clinicians.find(
                                (c) => c.user_id.toString() === field.value,
                              )
                                ? `${clinicians.find((c) => c.user_id.toString() === field.value).f_name} ${clinicians.find((c) => c.user_id.toString() === field.value).l_name}`
                                : "Select Clinician"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-fg-muted" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-(--anchor-width) max-h-60 overflow-y-auto"
                        >
                          {clinicians.map((c) => (
                            <DropdownMenuItem
                              key={c.user_id}
                              onClick={() =>
                                field.onChange(c.user_id.toString())
                              }
                              className={cn(
                                "cursor-pointer",
                                field.value === c.user_id.toString() &&
                                  "bg-surface-raised font-medium",
                              )}
                            >
                              {c.f_name} {c.l_name}
                              <span className="text-caption text-fg-muted ml-2">
                                ({c.email})
                              </span>
                              {field.value === c.user_id.toString() && (
                                <Check className="h-3.5 w-3.5 ml-auto text-brand-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-6 border-t border-border mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-border gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? (
                "Saving..."
              ) : step >= maxStep ? (
                <>
                  <Save className="h-4 w-4" /> Create Patient
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}