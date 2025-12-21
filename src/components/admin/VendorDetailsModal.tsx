import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
} from "lucide-react";

interface VendorDetails {
  id: string;
  business_name: string;
  description: string | null;
  whatsapp_number: string;
  city: string | null;
  location: string | null;
  gst_number: string | null;
  udyam_number: string | null;
  years_active: number | null;
  logo_url: string | null;
  shop_image_url: string | null;
  created_at: string;
  category: { name: string } | null;
}

interface VendorDetailsModalProps {
  vendor: VendorDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function VendorDetailsModal({
  vendor,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isLoading,
}: VendorDetailsModalProps) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Vendor Application
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shop Image */}
          {vendor.shop_image_url && (
            <div className="rounded-lg overflow-hidden aspect-video bg-muted">
              <img
                src={vendor.shop_image_url}
                alt={vendor.business_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start gap-3">
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={vendor.business_name}
                className="w-14 h-14 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{vendor.business_name}</h3>
              {vendor.category && (
                <Badge variant="secondary" className="mt-1">
                  {vendor.category.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{vendor.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{vendor.whatsapp_number}</p>
              </div>
            </div>

            {(vendor.city || vendor.location) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {vendor.location || vendor.city}
                  </p>
                </div>
              </div>
            )}

            {vendor.years_active !== null && vendor.years_active > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Years Active</p>
                  <p className="font-medium">{vendor.years_active} years</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Applied</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(vendor.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Documents */}
          {(vendor.gst_number || vendor.udyam_number) && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Verification Documents
              </h4>
              <div className="space-y-2">
                {vendor.gst_number && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm">GST Number</span>
                    <span className="text-sm font-mono">{vendor.gst_number}</span>
                  </div>
                )}
                {vendor.udyam_number && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm">Udyam Number</span>
                    <span className="text-sm font-mono">{vendor.udyam_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={onReject}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}