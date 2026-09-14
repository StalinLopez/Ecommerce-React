import {inngest} from "./client.js"
import {prisma} from "@/lib/prisma"

// Inngest Function to save user data to a database
// inngest/functions.js
import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/prisma';

export const syncUserCreation = inngest.createFunction(
  {
    id: 'sync-user-create',
    triggers: {
      event: 'webhook/request.received', // ✅ El evento genérico
    }
  },
  async ({event}) => {
    try {
      const webhookData = event.data.data; // Acceso correcto a los datos
      
      // Filtrar solo eventos de usuario creado (pueden ser session.created, user.created, etc.)
      if (webhookData.type !== 'user.created') {
        console.log('Ignorando evento:', webhookData.type);
        return;
      }

      const user = webhookData.data; // Los datos del usuario están aquí
      
      // Verificar que el usuario exista en la BD antes de crear
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (existingUser) {
        console.log('✅ Usuario ya existe:', user.id);
        return;
      }

      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email_addresses?.[0]?.email_address || '',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          image: user.image_url || null,
        }
      });
      
      console.log('✅ Usuario creado en BD:', user.id);
    } catch (error) {
      console.error('❌ Error sincronizando usuario:', error);
      throw error; // Inngest reintentar automáticamente
    }
  }
);

// Inngest Function to update user data in database
export const syncUserUpdation = inngest.createFunction(
    {
      id: 'sync-user-update',
      triggers: {
        event: 'clerk/user.updated'
      }
    },
    async ({ event }) => {
        const { data } = event
        await prisma.user.update({
            where: {id: data.id,},
            data: {
                email: data.email_addresses[0].email_address,
                name: `${data.first_name} ${data.last_name}`,
                image: data.image_url,
            }
        })
    }
)

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
    {
      id: 'sync-user-delete',
      triggers: {
        event: 'clerk/user.deleted'
      }
    },
    async ({ event }) => {
        const { data } = event
        await prisma.user.delete({
            where: {id: data.id,}
        })
    }
)