import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function UserForm({ userTypes, userStatuses, onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    f_name: '', l_name: '', email: '', phone: '', password: '',
    ut_id_fk: 4, us_id_fk: 1,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        f_name: initialData.f_name || '',
        l_name: initialData.l_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        ut_id_fk: initialData.ut_id_fk || 4,
        us_id_fk: initialData.us_id_fk || 1,
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold">{isEditing ? 'Edit User' : 'Add New User'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">First Name *</label>
          <Input 
            value={form.f_name} 
            onChange={e => setForm(prev => ({...prev, f_name: e.target.value}))} 
            required 
            placeholder="John"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Last Name *</label>
          <Input 
            value={form.l_name} 
            onChange={e => setForm(prev => ({...prev, l_name: e.target.value}))} 
            required 
            placeholder="Doe"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email *</label>
          <Input 
            type="email" 
            value={form.email} 
            onChange={e => setForm(prev => ({...prev, email: e.target.value}))} 
            required 
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Phone *</label>
          <Input 
            value={form.phone} 
            onChange={e => setForm(prev => ({...prev, phone: e.target.value}))} 
            required 
            placeholder="1234567890"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">
            Password {!isEditing && '*'}
          </label>
          <Input 
            type="password" 
            value={form.password} 
            onChange={e => setForm(prev => ({...prev, password: e.target.value}))} 
            required={!isEditing} 
            placeholder={isEditing ? 'Leave blank to keep' : 'Enter password'}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">User Type *</label>
          <select 
            value={form.ut_id_fk} 
            onChange={e => setForm(prev => ({...prev, ut_id_fk: parseInt(e.target.value)}))} 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
          >
            {userTypes.map(t => (
              <option key={t.ut_id} value={t.ut_id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <select 
            value={form.us_id_fk} 
            onChange={e => setForm(prev => ({...prev, us_id_fk: parseInt(e.target.value)}))} 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
          >
            {userStatuses.map(s => (
              <option key={s.us_id} value={s.us_id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">{isEditing ? 'Update User' : 'Create User'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
