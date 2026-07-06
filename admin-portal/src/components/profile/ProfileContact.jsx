import { Building2, Clock, Mail, Phone, Shield } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import ContactLine from '../shared/ContactLine';

export default function ProfileContact({ profileData }) {
  const isDoctor = !!profileData?.doctor_details;

  return (
    <Card className="lg:col-span-1 shadow-none border-border h-fit">
      <CardContent className="p-6 space-y-5">
        <div className="space-y-0.5">
          <p className="text-caption font-semibold text-fg-muted uppercase tracking-wider px-1 mb-3">
            Contact
          </p>
          <ContactLine icon={Mail} value={profileData.email} />
          <ContactLine
            icon={Phone}
            value={profileData.phone || 'Not provided'}
          />
        </div>

        {isDoctor && (
          <div className="space-y-0.5 pt-1 border-t border-border">
            <p className="text-caption font-semibold text-fg-muted uppercase tracking-wider px-1 mb-3 mt-4">
              Professional
            </p>
            <ContactLine
              icon={Shield}
              value={profileData.doctor_details.license_no}
              label="License"
            />
            <ContactLine
              icon={Building2}
              value={profileData.doctor_details.hospital?.name}
              label="Hospital"
            />
            <ContactLine
              icon={Clock}
              value={profileData.doctor_details.experience}
              label="Experience"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
