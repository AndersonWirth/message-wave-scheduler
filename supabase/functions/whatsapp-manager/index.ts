import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Store active WhatsApp clients
const activeClients = new Map()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, deviceId } = await req.json()

    switch (action) {
      case 'generateQR':
        return await generateQRCode(supabaseClient, deviceId)
      
      case 'getStatus':
        return await getDeviceStatus(deviceId)
      
      case 'disconnect':
        return await disconnectDevice(supabaseClient, deviceId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateQRCode(supabaseClient: any, deviceId: string) {
  try {
    // Import WhatsApp Web.js dynamically
    const { Client, LocalAuth } = await import('https://esm.sh/whatsapp-web.js@1.24.3')
    
    // Create new client for this device
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: deviceId }),
      puppeteer: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    })

    // Store client reference
    activeClients.set(deviceId, client)

    // Set up event listeners
    client.on('qr', async (qr) => {
      console.log('QR Code generated for device:', deviceId)
      
      // Update database with QR code
      await supabaseClient
        .from('devices')
        .update({ 
          qr_code: qr,
          status: 'connecting',
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
    })

    client.on('ready', async () => {
      console.log('WhatsApp client ready for device:', deviceId)
      
      // Get phone number
      const info = client.info
      
      // Update database with connected status
      await supabaseClient
        .from('devices')
        .update({ 
          status: 'connected',
          phone_number: info.wid.user,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
    })

    client.on('authenticated', async () => {
      console.log('WhatsApp client authenticated for device:', deviceId)
    })

    client.on('auth_failure', async (msg) => {
      console.error('WhatsApp auth failure for device:', deviceId, msg)
      
      // Update database with error
      await supabaseClient
        .from('devices')
        .update({ 
          status: 'disconnected',
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
    })

    client.on('disconnected', async (reason) => {
      console.log('WhatsApp client disconnected for device:', deviceId, reason)
      
      // Update database
      await supabaseClient
        .from('devices')
        .update({ 
          status: 'disconnected',
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
      
      // Remove from active clients
      activeClients.delete(deviceId)
    })

    // Initialize client
    await client.initialize()

    return new Response(
      JSON.stringify({ success: true, message: 'QR generation started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating QR:', error)
    
    // Update database with error status
    await supabaseClient
      .from('devices')
      .update({ 
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', deviceId)

    return new Response(
      JSON.stringify({ error: 'Failed to generate QR code' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getDeviceStatus(deviceId: string) {
  const client = activeClients.get(deviceId)
  
  if (!client) {
    return new Response(
      JSON.stringify({ status: 'disconnected' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const isReady = await client.getState()
  
  return new Response(
    JSON.stringify({ 
      status: isReady === 'CONNECTED' ? 'connected' : 'connecting',
      state: isReady 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function disconnectDevice(supabaseClient: any, deviceId: string) {
  const client = activeClients.get(deviceId)
  
  if (client) {
    await client.destroy()
    activeClients.delete(deviceId)
  }

  // Update database
  await supabaseClient
    .from('devices')
    .update({ 
      status: 'disconnected',
      qr_code: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', deviceId)

  return new Response(
    JSON.stringify({ success: true, message: 'Device disconnected' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}