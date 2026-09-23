import { Loader2, Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { patientsAPI } from '../../../services/api';
import { Button } from '../../ui/button';
import Modal from '../../ui/Modal';
import formatDate from './format';

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(110px,0.8fr)_minmax(0,1.2fr)] items-start gap-4 border-b border-border py-3 last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[150px_minmax(0,1fr)]">
      <span className="text-sm font-medium text-fg">{label}</span>

      <span className="min-w-0 break-words text-right text-sm text-fg-muted">
        {value ?? '—'}
      </span>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-fg">{label}</label>

      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-(--radius-control) border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-brand-500"
      />
    </div>
  );
}

export default function PatientInfoTab({ patientId, data, onRefetch }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [form, setForm] = useState({});

  useEffect(() => {
    if (!data) return;

    setForm({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',

      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',

      address: data.address || '',
      zip_code: data.zip_code || '',

      height:
        data.height !== null && data.height !== undefined ? data.height : '',

      weight:
        data.weight !== null && data.weight !== undefined ? data.weight : '',

      smoking: data.smoking ?? false,
      ethnic_group: data.ethnicity || '',
    });
  }, [data]);

  if (!data) {
    return <p className="text-sm text-fg-muted">No patient info available.</p>;
  }

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,

        dob: form.dob || undefined,

        address: form.address,
        zip_code: form.zip_code,

        height: form.height === '' ? null : parseFloat(form.height),

        weight: form.weight === '' ? null : parseFloat(form.weight),

        smoking: Boolean(form.smoking),

        ethnic_group: form.ethnic_group,
      };

      await patientsAPI.updatePatient(patientId, payload);

      toast.success('Patient information updated');

      setEditing(false);

      // Reload patient-info tab
      if (onRefetch) {
        await onRefetch({});
      }
    } catch (error) {
      console.error('[PatientInfoTab] Update error:', error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to update patient';

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await patientsAPI.deletePatient(patientId);

      toast.success('Patient deleted successfully');

      setDeleteDialogOpen(false);

      window.location.href = '/patients';
    } catch (error) {
      console.error('[PatientInfoTab] Delete error:', error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to delete patient';

      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        {!editing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Edit Patient
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              className="gap-1.5 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete Patient
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="gap-1.5"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={saving}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </div>

      {/* EDIT FORM */}
      {editing ? (
        <div className="space-y-8 animate-fade-in">
          {/* Basic Information */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-fg">
                Basic Information
              </h3>
              <p className="mt-0.5 text-xs text-fg-muted">
                Patient identity and contact details
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <InputField
                label="Name"
                value={form.name}
                onChange={(value) => updateField('name', value)}
              />

              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField('email', value)}
              />

              <InputField
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField('phone', value)}
              />

              <InputField
                label="Birth Date"
                type="date"
                value={form.dob}
                onChange={(value) => updateField('dob', value)}
              />
            </div>
          </section>

          {/* Physical Information */}
          <section className="border-t border-border pt-7">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-fg">
                Physical Information
              </h3>
              <p className="mt-0.5 text-xs text-fg-muted">
                Physical measurements and lifestyle information
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <InputField
                label="Height"
                type="number"
                value={form.height}
                onChange={(value) => updateField('height', value)}
              />

              <InputField
                label="Weight"
                type="number"
                value={form.weight}
                onChange={(value) => updateField('weight', value)}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-fg">Smoking</label>

                <select
                  value={form.smoking ? 'true' : 'false'}
                  onChange={(e) =>
                    updateField('smoking', e.target.value === 'true')
                  }
                  className="w-full rounded-(--radius-control) border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-focus-ring focus:ring-3 focus:ring-focus-ring/20"
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
              </div>

              <InputField
                label="Ethnicity / Race"
                value={form.ethnic_group}
                onChange={(value) => updateField('ethnic_group', value)}
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-border pt-7">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-fg">
                Contact Information
              </h3>
              <p className="mt-0.5 text-xs text-fg-muted">
                Patient address and location details
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <InputField
                label="Address"
                value={form.address}
                onChange={(value) => updateField('address', value)}
              />
            </div>
          </section>
        </div>
      ) : (
        /* VIEW */
        <div className="space-y-8 animate-fade-in">
          {/* Personal */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-fg">
                Personal Information
              </h3>
              <p className="mt-0.5 text-xs text-fg-muted">
                Basic patient information
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
              <div>
                <InfoRow label="Name" value={data.name} />

                <InfoRow label="Username" value={data.username} />

                <InfoRow label="Sex at Birth" value={data.sexAtBirth} />

                <InfoRow label="Birth Date" value={formatDate(data.dob)} />

                <InfoRow label="Age" value={data.age} />
              </div>

              <div>
                <InfoRow label="Height" value={data.height} />

                <InfoRow label="Weight" value={data.weight} />

                <InfoRow
                  label="Smoking"
                  value={
                    data.smoking === null
                      ? null
                      : data.smoking
                        ? 'True'
                        : 'False'
                  }
                />

                <InfoRow label="Ethnicity / Race" value={data.ethnicity} />

                <InfoRow
                  label="Start Date"
                  value={formatDate(data.startDate)}
                />
              </div>
            </div>
          </section>

          {/* Contact & Treatment */}
          <section className="border-dashed border-t border-border pt-7">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-fg">
                Contact & Treatment
              </h3>
              <p className="mt-0.5 text-xs text-fg-muted">
                Contact details and current treatment information
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
              <div>
                <InfoRow label="Address" value={data.address} />

                <InfoRow label="Phone" value={data.phone} />

                <InfoRow label="Email" value={data.email} />
              </div>

              <div>
                <InfoRow
                  label="Medications"
                  value={
                    data.medications && data.medications.length > 0
                      ? data.medications.join(', ')
                      : 'None'
                  }
                />

                <InfoRow label="Status" value={data.status} />
              </div>
            </div>
          </section>
        </div>
      )}

      <Modal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Patient?"
        className="max-w-md"
        ariaLabel="Delete Patient Confirmation"
      >
        <div>
          <p className="text-sm text-fg-muted">
            Are you sure you want to delete{' '}
            <strong className="text-fg">{data?.name || 'this patient'}</strong>?
          </p>

          <p className="mt-3 text-sm text-fg-muted">
            The patient will be removed from the active patient list. Their
            clinical data will remain in the system.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Patient'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
