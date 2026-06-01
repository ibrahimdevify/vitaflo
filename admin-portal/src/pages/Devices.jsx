import { useEffect, useState, useCallback, useRef } from 'react';
import { devicesAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Activity, Smartphone, Wifi, WifiOff, ChevronLeft, ChevronRight, X, Edit, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActive, setFilterActive] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [readings, setReadings] = useState(null);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [form, setForm] = useState({ dev_name: '', dev_detail: '', dev_image: '' });
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterActive !== 'all') params.is_active = filterActive;
      const res = await devicesAPI.getAll(params);
      setDevices(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) { toast.error('Failed to load devices'); }
    finally { setLoading(false); }
  }, [page, limit, debouncedSearch, filterActive]);

  useEffect(() => { loadDevices(); }, [loadDevices]);

  const viewReadings = async (id) => {
    try {
      setLoadingReadings(true);
      setSelectedDevice(id);
      const res = await devicesAPI.getReadings(id);
      setReadings(res.data.data || res.data);
    } catch (err) { toast.error('Failed to load readings'); }
    finally { setLoadingReadings(false); }
  };

  const startEdit = (device) => {
    setEditingDevice(device);
    setForm({
      dev_name: device.dev_name || '',
      dev_detail: device.dev_detail || '',
      dev_image: device.dev_image || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingDevice) {
        await devicesAPI.update(editingDevice.dev_id, form);
        toast.success('Device updated!');
      } else {
        await devicesAPI.create(form);
        toast.success('Device created!');
      }
      setShowForm(false);
      setEditingDevice(null);
      setForm({ dev_name: '', dev_detail: '', dev_image: '' });
      loadDevices();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const getPageNumbers = () => {
    const pages = []; const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Devices</h1>
        <Button onClick={() => { setEditingDevice(null); setForm({ dev_name: '', dev_detail: '', dev_image: '' }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Device
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">{editingDevice ? 'Edit Device' : 'Register New Device'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Device Name *</label>
                <Input value={form.dev_name} onChange={e => setForm({...form, dev_name: e.target.value})} required placeholder="Air Sensor A1" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input value={form.dev_detail} onChange={e => setForm({...form, dev_detail: e.target.value})} placeholder="Indoor air quality monitor" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  <ImageIcon className="h-3 w-3 inline mr-1" /> Image URL
                </label>
                <Input value={form.dev_image} onChange={e => setForm({...form, dev_image: e.target.value})} placeholder="https://example.com/device-image.jpg" />
                {form.dev_image && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1">Preview:</p>
                    <img src={form.dev_image} alt="Preview" className="h-24 w-24 object-cover rounded-lg border" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingDevice ? 'Update Device' : 'Create Device'}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingDevice(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Readings Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setSelectedDevice(null); setReadings(null); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                <Activity className="h-5 w-5 inline mr-2 text-blue-500" />
                {readings?.device_name || 'Device'} Readings
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedDevice(null); setReadings(null); }}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              {loadingReadings ? (
                <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
              ) : readings?.readings?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>PM2.5</TableHead>
                      <TableHead>PM10</TableHead>
                      <TableHead>Temp (°C)</TableHead>
                      <TableHead>Humidity</TableHead>
                      <TableHead>CO2</TableHead>
                      <TableHead>VOC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readings.readings.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{new Date(r.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{r.pm25 ?? '-'}</TableCell>
                        <TableCell>{r.pm10 ?? '-'}</TableCell>
                        <TableCell>{r.temperature ?? '-'}</TableCell>
                        <TableCell>{r.humidity ? `${r.humidity}%` : '-'}</TableCell>
                        <TableCell>{r.co2 ?? '-'}</TableCell>
                        <TableCell>{r.voc ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-lg">No readings available</p>
                  <p className="text-sm">Air quality data will appear here once the device starts sending data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Devices</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search devices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}
                className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-2 text-slate-500">Loading...</p></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Monitors</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map(device => (
                    <TableRow key={device.dev_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-orange-600" />
                          </div>
                          <p>{device.dev_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.dev_image ? (
                          <img src={device.dev_image} alt={device.dev_name} className="h-10 w-10 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">{device.dev_detail || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={device.is_active ? 'bg-green-500' : 'bg-red-500'}>
                          {device.is_active ? <><Wifi className="h-3 w-3 inline mr-1" />Active</> : <><WifiOff className="h-3 w-3 inline mr-1" />Inactive</>}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline">{device._count?.air_monitors || 0}</Badge></TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(device.dev_date_time).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewReadings(device.dev_id)}>
                              <Activity className="h-4 w-4 mr-2" /> View Readings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startEdit(device)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {devices.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500"><Smartphone className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No devices found</p></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Showing {devices.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}</span>
                  <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }} className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs h-8">
                    {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <span>per page</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  {getPageNumbers().map(p => (<Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(p)}>{p}</Button>))}
                  <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
