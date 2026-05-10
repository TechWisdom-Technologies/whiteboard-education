import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div>
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Company Name</Label><Input defaultValue="YourUni" /></div>
            <div><Label>Contact Email</Label><Input defaultValue="info@youruni.com" /></div>
            <div><Label>Phone Number</Label><Input defaultValue="+60 12-345 6789" /></div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
