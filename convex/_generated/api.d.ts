/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTP from "../ResendOTP.js";
import type * as admin from "../admin.js";
import type * as attachments from "../attachments.js";
import type * as auth from "../auth.js";
import type * as cleanupAuth from "../cleanupAuth.js";
import type * as createAuthAccount from "../createAuthAccount.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as logo from "../logo.js";
import type * as mergeUsers from "../mergeUsers.js";
import type * as migration from "../migration.js";
import type * as navody from "../navody.js";
import type * as passwordActions from "../passwordActions.js";
import type * as seed from "../seed.js";
import type * as tags from "../tags.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  admin: typeof admin;
  attachments: typeof attachments;
  auth: typeof auth;
  cleanupAuth: typeof cleanupAuth;
  createAuthAccount: typeof createAuthAccount;
  feedback: typeof feedback;
  http: typeof http;
  logo: typeof logo;
  mergeUsers: typeof mergeUsers;
  migration: typeof migration;
  navody: typeof navody;
  passwordActions: typeof passwordActions;
  seed: typeof seed;
  tags: typeof tags;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
