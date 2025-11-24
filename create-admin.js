require('dotenv').config({ path: '.env.local' });
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function createAdmin() {
    try {
        console.log("🔄 Creating admin user...");
        const result = await client.mutation("admin:createInitialAdmin", {
            email: "admin@chicho.tech",
            name: "Admin User",
            setupToken: "chicho_admin_setup_2025",
        });
        console.log("✅ Admin user created with ID:", result);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

createAdmin();
