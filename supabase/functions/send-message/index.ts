import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Store for active WhatsApp clients (shared with whatsapp-manager)
const getActiveClient = async (deviceId: string) => {
  // In a real implementation, you'd retrieve the client from a shared store
  // For now, we'll make a request to check device status
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { deviceId, targetNumbers, message, messageType = 'text', fileUrl, fileName } = await req.json()

    // Get device information
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .eq('status', 'connected')
      .single()

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: 'Device not found or not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create message record
    const { data: messageRecord, error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        device_id: deviceId,
        target_groups: targetNumbers,
        content: message,
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        status: 'sending',
        user_id: device.user_id
      })
      .select()
      .single()

    if (messageError) {
      throw messageError
    }

    // In a real implementation, you would:
    // 1. Get the active WhatsApp client for this device
    // 2. Send the message through WhatsApp Web.js
    // 3. Update the message status based on the result

    // For now, we'll simulate sending
    setTimeout(async () => {
      try {
        // Simulate message sending logic here
        const success = Math.random() > 0.1; // 90% success rate for demo

        await supabaseClient
          .from('messages')
          .update({
            status: success ? 'sent' : 'failed',
            sent_at: success ? new Date().toISOString() : null,
            error_message: success ? null : 'Simulated error - device offline',
            updated_at: new Date().toISOString()
          })
          .eq('id', messageRecord.id)

      } catch (error) {
        console.error('Error updating message status:', error)
      }
    }, 2000) // Simulate 2 second delay

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageRecord.id,
        message: 'Message queued for sending' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})