-- Enable realtime for devices table
ALTER TABLE public.devices REPLICA IDENTITY FULL;

-- Add devices table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;

-- Enable realtime for messages table as well
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;