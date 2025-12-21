-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can create notifications (via service role or triggers)
CREATE POLICY "Service can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Create function to notify vendor on approval/rejection
CREATE OR REPLACE FUNCTION public.notify_vendor_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when is_approved or status changes
  IF (OLD.is_approved IS DISTINCT FROM NEW.is_approved) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Only notify if vendor has a user_id
    IF NEW.user_id IS NOT NULL THEN
      IF NEW.is_approved = true AND (OLD.is_approved = false OR OLD.is_approved IS NULL) THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
          NEW.user_id,
          'Shop Approved! 🎉',
          'Congratulations! Your shop "' || NEW.business_name || '" has been approved. Start adding products now!',
          'success',
          '/vendor/dashboard'
        );
      ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
          NEW.user_id,
          'Shop Application Update',
          'Your shop application for "' || NEW.business_name || '" was not approved. Please contact support for more details.',
          'error',
          '/vendor/register'
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for vendor status changes
CREATE TRIGGER on_vendor_status_change
  AFTER UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_status_change();