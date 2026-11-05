import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI!);

const db = client.db(process.env.MONGODB_DB);

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: ["customer", "studio_owner", "admin"],
        required: false,
        input: true,
        defaultValue: "customer",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "studio_owner" ? "studio_owner" : "customer",
          },
        }),
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: { 
    enabled: true, 
  }, 
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    // Registers GET /api/auth/token (+ /jwks). The client calls
    // authClient.token() and the backend verifies the resulting Bearer JWT.
    plugins: [jwt()],
});
