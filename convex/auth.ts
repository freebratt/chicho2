import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTP } from "./ResendOTP"
import { Password } from "@convex-dev/auth/providers/Password"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ResendOTP,
    Password({
      // No verification required for internal portal
      // Admin manually creates accounts, so email verification is not needed
      // Users can login immediately after password is set
      // Profile callback: only return auth-specific fields
      profile(params) {
        const email = typeof params.email === "string" ? params.email : undefined;
        if (!email) {
          throw new Error("Email je povinný");
        }
        return {
          email,
          // Use email username as default name if not provided
          name: email.split("@")[0],
        };
      },
    }),
  ],
})