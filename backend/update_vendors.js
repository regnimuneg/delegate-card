import { supabaseAdmin } from './src/db/supabase.js';

const newVendors = [
    {
        name: "Billy's Belly",
        description: "10% Discount on show of card.",
        icon: "/assets/jnimun/vendors/billys_belly.png",
        vendor_name: "Billy's Belly",
        vendor_location: "Billy's Belly",
        usage_limit: null,
        static_code: null,
        valid_from: new Date().toISOString(),
        valid_until: "2026-07-30T23:59:59+03:00",
        is_active: true
    },
    {
        name: "Yole",
        description: "15% off. Unlimited usages.",
        icon: "/assets/jnimun/vendors/yole.png",
        vendor_name: "Yole",
        vendor_location: "Yole",
        usage_limit: null,
        static_code: null,
        valid_from: new Date().toISOString(),
        valid_until: null,
        is_active: true
    },
    {
        name: "B&f",
        description: "10% Discount.",
        icon: "/assets/jnimun/vendors/b_and_f.png",
        vendor_name: "B&f",
        vendor_location: "B&f",
        usage_limit: null,
        static_code: null,
        valid_from: new Date().toISOString(),
        valid_until: "2026-08-01T23:59:59+03:00",
        is_active: true
    },
    {
        name: "Vapiano",
        description: "20% Discount at Arkan and Marassi branches.",
        icon: "/assets/jnimun/vendors/vapiano.png",
        vendor_name: "Vapiano",
        vendor_location: "Arkan & Marassi",
        usage_limit: null,
        static_code: null,
        valid_from: new Date().toISOString(),
        valid_until: "2026-12-31T23:59:59+03:00",
        is_active: true
    },
    {
        name: "Coddiwomple",
        description: "25% Discount.",
        icon: "/assets/jnimun/vendors/coddiwomple.png",
        vendor_name: "Coddiwomple",
        vendor_location: "Online",
        usage_limit: null,
        static_code: "NIMUN26xCoddiwomple",
        valid_from: "2026-07-06T00:00:00+03:00",
        valid_until: "2026-09-01T23:59:59+03:00",
        is_active: true
    },
    {
        name: "Superpark",
        description: "10% Discount.",
        icon: "/assets/jnimun/vendors/superpark.png",
        vendor_name: "Superpark",
        vendor_location: "Superpark",
        usage_limit: null,
        static_code: null,
        valid_from: new Date().toISOString(),
        valid_until: "2026-08-15T23:59:59+03:00",
        is_active: true
    },
    {
        name: "2ooltasa",
        description: "50% off the first meal. Subsequent orders are 10% off. Place orders 1 day before via Instagram DM by sending a card photo.",
        icon: "/assets/jnimun/vendors/2ooltasa.png",
        vendor_name: "2ooltasa",
        vendor_location: "Instagram DM",
        usage_limit: null,
        static_code: null,
        valid_from: new Date().toISOString(),
        valid_until: "2026-12-31T23:59:59+03:00",
        is_active: true
    }
];

async function updateVendors() {
    console.log("🚀 Starting database update for partner vendors...\n");

    try {
        // Step 1: Deactivate all existing vouchers
        const { error: deactivateError } = await supabaseAdmin
            .from("vouchers")
            .update({ is_active: false })
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deactivateError) {
            throw new Error(`Failed to deactivate existing vouchers: ${deactivateError.message}`);
        }
        console.log("✅ Deactivated all existing vouchers.");

        // Step 2: Query all existing vouchers to check for updates vs inserts
        const { data: existingVouchers, error: queryError } = await supabaseAdmin
            .from("vouchers")
            .select("id, name");

        if (queryError) {
            throw new Error(`Failed to query existing vouchers: ${queryError.message}`);
        }

        // Create a mapping of lowercase name -> id
        const nameToId = {};
        existingVouchers.forEach(v => {
            nameToId[v.name.toLowerCase()] = v.id;
        });

        // Step 3: Insert or Update new vendors
        for (const vendor of newVendors) {
            const existingId = nameToId[vendor.name.toLowerCase()];

            if (existingId) {
                // Update
                const { error: updateError } = await supabaseAdmin
                    .from("vouchers")
                    .update(vendor)
                    .eq("id", existingId);

                if (updateError) {
                    console.error(`❌ Failed to update vendor "${vendor.name}":`, updateError.message);
                } else {
                    console.log(`✅ Updated existing vendor: "${vendor.name}" (ID: ${existingId})`);
                }
            } else {
                // Insert
                const { error: insertError } = await supabaseAdmin
                    .from("vouchers")
                    .insert(vendor);

                if (insertError) {
                    console.error(`❌ Failed to insert vendor "${vendor.name}":`, insertError.message);
                } else {
                    console.log(`✅ Inserted new vendor: "${vendor.name}"`);
                }
            }
        }

        console.log("\n🎉 Database sync completed successfully!");
    } catch (err) {
        console.error("\n❌ Error syncing vendors database:", err.message);
        process.exit(1);
    }
}

updateVendors();
