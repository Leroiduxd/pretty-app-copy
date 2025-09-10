import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bug, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";

export const ReportBugModal = () => {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet to submit a bug report",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('bug_reports')
        .insert({
          wallet_address: address,
          contact_method: contact.trim(),
          complaint: description.trim()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Bug Report Submitted",
        description: "Thank you for your feedback. We'll review your report.",
      });
      
      setContact("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
        >
          <Bug className="w-3 h-3 mr-1" />
          Report Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            Report a Bug
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-foreground">
              Contact Method (Email or Telegram)
            </Label>
            <Input
              id="contact"
              type="text"
              placeholder="your.email@example.com or @telegram_username"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="bg-background border-border text-foreground"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Describe what happened
            </Label>
            <Textarea
              id="description"
              placeholder="Please describe the bug you encountered, what you were doing when it happened, and any error messages you saw..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-background border-border text-foreground resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};