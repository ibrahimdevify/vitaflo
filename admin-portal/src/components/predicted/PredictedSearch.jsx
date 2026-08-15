import { Search, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

export default function PredictedSearch({
  userId,
  onUserIdChange,
  loading,
  onSearch,
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <Input
              placeholder="Search by Patient Username..."
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={onSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {loading ? "Loading..." : "Search"}
          </Button>
        </div>
        <p className="text-caption text-fg-muted mt-2">
          Supports: Patient Username
        </p>
      </CardContent>
    </Card>
  );
}
