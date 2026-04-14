import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Save, Clock, DollarSign } from 'lucide-react';

const SettingsPage = () => {
  const { loanDurationDays, fineRatePerDay, updateSettings } = useSettingsStore();

  const [localLoanDuration, setLocalLoanDuration] = useState(loanDurationDays.toString());
  const [localFineRate, setLocalFineRate] = useState(fineRatePerDay.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalLoanDuration(loanDurationDays.toString());
    setLocalFineRate(fineRatePerDay.toString());
  }, [loanDurationDays, fineRatePerDay]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const parsedDuration = parseInt(localLoanDuration);
      const parsedFine = parseFloat(localFineRate);

      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        toast.error("Invalid Loan Duration provided.");
        setIsSaving(false);
        return;
      }
      
      if (isNaN(parsedFine) || parsedFine < 0) {
        toast.error("Invalid Fine Rate provided.");
        setIsSaving(false);
        return;
      }

      updateSettings({
        loanDurationDays: parsedDuration,
        fineRatePerDay: parsedFine
      });

      toast.success("Settings updated successfully!");
      setIsSaving(false);
    }, 600); // simulate network request for polish setup
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global configuration for the Library Hub.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card className="shadow-lg border-primary/10 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Loan Policies
            </CardTitle>
            <CardDescription>
              Configure how long members can borrow library items by default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanDuration">Default Loan Duration (Days)</Label>
              <div className="relative">
                <Input
                  id="loanDuration"
                  type="number"
                  min="1"
                  value={localLoanDuration}
                  onChange={(e) => setLocalLoanDuration(e.target.value)}
                  className="pl-4 h-11 text-lg font-medium bg-muted/50 focus:bg-background transition-colors w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This will automatically set the due date to exactly <strong>{localLoanDuration}</strong> days after the item is issued.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-500" />
              Fine & Penalties
            </CardTitle>
            <CardDescription>
              Configure monetary penalties for overdue library items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fineRate">Fine Rate per Day ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">$</span>
                <Input
                  id="fineRate"
                  type="number"
                  step="0.10"
                  min="0"
                  value={localFineRate}
                  onChange={(e) => setLocalFineRate(e.target.value)}
                  className="pl-8 h-11 text-lg font-medium bg-muted/50 focus:bg-background transition-colors w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                An overdue transaction will quietly accumulate a penalty of <strong>${localFineRate}</strong> each day past the due date.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-8 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Configuration
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
