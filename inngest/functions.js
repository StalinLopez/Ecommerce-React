import {inngest} from "./client.js"
import {prisma} from "@/lib/prisma.ts"

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-create",
    triggers: {
      event: "clerk/user.created",
    },
  },
  async ({ event }) => {
    const user = event.data;

    if (!user) {
      console.log("⚠️ No hay usuario en este webhook");
      return;
    }

    const email =
      user.email_addresses.find(
        (email) => email.id === user.primary_email_address_id
      )?.email_address;

    if (!email) {
      console.log("⚠️ El usuario no tiene un email válido");
      return;
    }

    await prisma.user.create({
      data: {
        id: user.id,
        email,
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        image: user.image_url,
      },
    });

    console.log(`✅ Usuario ${user.id} sincronizado correctamente`);
  }
);


// Inngest Function to update user data in database
export const syncUserUpdation = inngest.createFunction(
    {
      id: "sync-user-update",
      triggers: {
        event: "clerk/user.updated"   
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
        event: 'clerk/user.deleted',

      }
    },
    async ({ event }) => {
        const { data } = event
        await prisma.user.delete({
            where: {id: data.id,}
        })
    }
)