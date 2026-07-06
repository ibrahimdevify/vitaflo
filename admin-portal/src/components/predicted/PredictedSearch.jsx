import { Brain, Loader2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

export default function PredictedSearch({
  userId,
  onUserIdChange,
  loading,
  onSearch,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <Input
              placeholder="Patient ID, Username, or Email..."
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={onSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Loading...' : 'Load Predictions'}
          </Button>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Supports: Patient ID, Username, or Email
        </p>
      </CardContent>
    </Card>
  );
}
