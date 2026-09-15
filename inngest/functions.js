import {inngest} from "./client.js"
import {prisma} from "@/lib/prisma"

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-create",
    triggers: {
      event: "webhook/request.received"
    }
  },
  async ({event}) => {
    const { data } = event;
    const user = data.data?.user;

    if (!user) {
      console.log("⚠️ No hay usuario en este webhook");
      return;
    }

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email_addresses[0].email_address,
        name: `${user.first_name} ${user.last_name}`,
        image: user.image_url,
      }
    });
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