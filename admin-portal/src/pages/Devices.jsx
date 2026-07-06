import { Plus, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import DeviceForm from '../components/devices/DeviceForm';
import DeviceReadingsModal from '../components/devices/DeviceReadingsModal';
import DevicesFilters from '../components/devices/DevicesFilters';
import DevicesTable from '../components/devices/DevicesTable';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import Pagination from '../components/ui/pagination';
import { devicesAPI } from '../services/api';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActive, setFilterActive] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [readings, setReadings] = useState(null);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
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
    } catch (err) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterActive]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const viewReadings = async (id) => {
    try {
      setLoadingReadings(true);
      setSelectedDevice(id);
      const res = await devicesAPI.getReadings(id);
      setReadings(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load readings');
    } finally {
      setLoadingReadings(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editingDevice) {
        await devicesAPI.update(editingDevice.dev_id, data);
        toast.success('Device updated!');
      } else {
        await devicesAPI.create(data);
        toast.success('Device created!');
      }
      setShowForm(false);
      setEditingDevice(null);
      loadDevices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deviceName = devices.find((d) => d.dev_id === selectedDevice)?.dev_name;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Devices
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage IoT devices and air quality monitors
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDevice(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Device
        </Button>
      </div>

      {showForm && (
        <DeviceForm
          initialData={editingDevice}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingDevice(null);
          }}
        />
      )}

      <DeviceReadingsModal
        open={!!selectedDevice}
        onClose={() => {
          setSelectedDevice(null);
          setReadings(null);
        }}
        deviceName={deviceName}
        readings={readings}
        loading={loadingReadings}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-warning to-warning/70">
              <Smartphone className="h-3.5 w-3.5 text-white" />
            </div>
            All Devices
          </CardTitle>
          <DevicesFilters
            search={search}
            onSearchChange={setSearch}
            filterActive={filterActive}
            onFilterActiveChange={(v) => {
              setFilterActive(v);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <DevicesTable
            devices={devices}
            loading={loading}
            onViewReadings={viewReadings}
            onEdit={(d) => {
              setEditingDevice(d);
              setShowForm(true);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="devices"
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
