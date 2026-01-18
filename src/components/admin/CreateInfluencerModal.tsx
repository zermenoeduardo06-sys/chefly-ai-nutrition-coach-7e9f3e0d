import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2 } from "lucide-react";

interface CreateInfluencerModalProps {
  onSuccess: () => void;
}

export function CreateInfluencerModal({ onSuccess }: CreateInfluencerModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    socialHandle: "",
    commissionRate: "25",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.fullName || !form.email) {
      toast({
        title: "Error",
        description: "Nombre y email son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate unique affiliate code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_affiliate_code");
      
      if (codeError) throw codeError;

      const affiliateCode = codeData as string;

      // Create affiliate profile directly (no auth user needed for influencers)
      const { data: profile, error: profileError } = await supabase
        .from("affiliate_profiles")
        .insert({
          user_id: crypto.randomUUID(), // Placeholder - influencers don't need real auth
          full_name: form.fullName,
          email: form.email,
          phone: form.phone || null,
          social_handle: form.socialHandle || null,
          affiliate_code: affiliateCode,
          commission_rate_basic: Number(form.commissionRate),
          commission_rate_intermediate: Number(form.commissionRate),
          internal_notes: form.notes || null,
          is_influencer: true,
          status: "active",
          approved_at: new Date().toISOString(),
          current_tier: "bronce",
        })
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Influencer creado",
        description: `Código: ${affiliateCode}`,
      });

      setForm({
        fullName: "",
        email: "",
        phone: "",
        socialHandle: "",
        commissionRate: "25",
        notes: "",
      });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating influencer:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el influencer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Influencer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Influencer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="María García"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="maria@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono/WhatsApp</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+52 55 1234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialHandle">Instagram/TikTok</Label>
            <Input
              id="socialHandle"
              value={form.socialHandle}
              onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
              placeholder="@usuario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionRate">Comisión (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              min="1"
              max="100"
              value={form.commissionRate}
              onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
              placeholder="25"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contactado vía Instagram, 50k seguidores..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Influencer"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
