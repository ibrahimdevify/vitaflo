import { Activity, Wind } from 'lucide-react';
import { Button } from '../ui/button';

const tabs = [
  {
    key: 'spirometry',
    label: 'Spirometry',
    icon: Activity,
    desc: 'Lung function trends',
  },
  { key: 'iaq', label: 'Air Quality', icon: Wind, desc: 'IAQ sensor data' },
];

export default function TrendsTabSwitcher({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b border-border pb-3">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeTab === tab.key ? 'default' : 'ghost'}
          onClick={() => onTabChange(tab.key)}
          className={`flex-col h-auto py-3 px-5 ${activeTab === tab.key ? '' : 'text-fg-muted hover:text-fg'}`}
        >
          <div className="flex items-center gap-2">
            <tab.icon className="h-4 w-4" />
            <span className="font-medium text-body">{tab.label}</span>
          </div>
          <span className="text-caption opacity-70 mt-0.5">{tab.desc}</span>
        </Button>
      ))}
    </div>
  );
}
