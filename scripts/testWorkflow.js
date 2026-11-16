import http from "http";

const API_HOST = "localhost";
const API_PORT = 5000;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );

    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log("=== KhojoBangla FULL WORKFLOW & REJECTION/RESUBMIT VERIFICATION ===");

  // 1. Superadmin Login
  console.log("\n1. Testing Superadmin Login (/api/admin/login)...");
  const adminRes = await request(
    { path: "/api/admin/login", method: "POST" },
    { email: "admin@khojobangla.com", password: "Admin@KhojoBangla2026!" }
  );
  const adminToken = adminRes.data.token;
  console.log("✓ Superadmin token acquired.");

  // 2. User Login
  console.log("\n2. Logging in as Seller (seller.vikram@khojobangla.com)...");
  const userRes = await request(
    { path: "/api/auth/login", method: "POST" },
    { email: "seller.vikram@khojobangla.com", password: "SellerPassword123!" }
  );
  const userToken = userRes.data.token;
  console.log("✓ Seller token acquired.");

  // 3. Create Ad to be rejected
  console.log("\n3. Submitting ad that will be rejected (/api/advertisements)...");
  const createRes = await request(
    {
      path: "/api/advertisements",
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
    },
    {
      title: "Suspicious Low Price iPhone 15 Pro",
      description: "Selling for very cheap price, contact immediately on external WhatsApp number.",
      price: 15000,
      category: "mobiles",
      condition: "Used",
      images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"],
      location: { city: "Dhaka", state: "Dhaka Division" },
    }
  );

  const adToReject = createRes.data.advertisement;
  console.log(`✓ Ad created with ID: ${adToReject._id}, Status: ${adToReject.status}`);

  // 4. Superadmin Rejects Ad with Reason
  console.log("\n4. Superadmin rejects ad with reason (/api/admin/advertisements/:id/reject)...");
  const rejectRes = await request(
    {
      path: `/api/admin/advertisements/${adToReject._id}/reject`,
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    { reason: "Unrealistic pricing and prohibited external WhatsApp redirect in description." }
  );

  if (rejectRes.status !== 200) {
    throw new Error(`Rejection failed: ${JSON.stringify(rejectRes.data)}`);
  }
  console.log("✓ Superadmin rejection successful:", rejectRes.data.message);

  // 5. Verify Seller Sees Ad as Rejected with Reason
  console.log("\n5. Checking Seller's Advertisements list (/api/advertisements/my)...");
  const myAdsRes = await request({
    path: "/api/advertisements/my",
    method: "GET",
    headers: { Authorization: `Bearer ${userToken}` },
  });

  const rejectedAd = myAdsRes.data.advertisements?.find((a) => a._id === adToReject._id);
  if (!rejectedAd || rejectedAd.status !== "rejected") {
    throw new Error("REJECTION FAULT: Ad status is not 'rejected' in seller's dashboard!");
  }
  console.log(`✓ VERIFIED: Ad status is 'rejected' with reason: "${rejectedAd.rejectionReason}"`);

  // 6. Seller Updates & Resubmits Ad
  console.log("\n6. Seller edits details & resubmits ad (/api/advertisements/:id)...");
  const updateRes = await request(
    {
      path: `/api/advertisements/${adToReject._id}`,
      method: "PUT",
      headers: { Authorization: `Bearer ${userToken}` },
    },
    {
      title: "Apple iPhone 15 Pro 128GB Blue Titanium Genuine",
      price: 110000,
      description: "Updated genuine listing. Includes original bill, 95% battery health, meet in person in Kathmandu.",
    }
  );

  if (updateRes.status !== 200) {
    throw new Error(`Update failed: ${JSON.stringify(updateRes.data)}`);
  }
  const resubmittedAd = updateRes.data.advertisement;
  console.log(`✓ Resubmission message: "${updateRes.data.message}"`);
  console.log(`✓ Status after resubmission: "${resubmittedAd.status}" (MANDATORY: Must reset to 'pending')`);
  console.log(`✓ Rejection reason cleared: "${resubmittedAd.rejectionReason || "None"}"`);

  if (resubmittedAd.status !== "pending") {
    throw new Error(`RESUBMISSION FAULT: Ad status was '${resubmittedAd.status}', expected 'pending'!`);
  }

  // 7. Verify Superadmin sees it back under pending review
  console.log("\n7. Verifying Superadmin sees resubmitted ad under Pending list (/api/admin/advertisements?status=pending)...");
  const adminPendingRes = await request({
    path: "/api/admin/advertisements?status=pending",
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const isInPendingQueue = adminPendingRes.data.advertisements?.some((a) => a._id === adToReject._id);
  if (!isInPendingQueue) {
    throw new Error("QUEUE FAULT: Resubmitted ad did not appear in admin pending queue!");
  }
  console.log("✓ VERIFIED: Resubmitted advertisement is back in the Superadmin Pending Moderation queue!");

  console.log("\n=======================================================");
  console.log("✅ COMPLETE LIFECYCLE (CREATE -> REJECT -> EDIT -> RESUBMIT) VERIFIED!");
  console.log("=======================================================\n");
}

runTest().catch((err) => {
  console.error("Test Failed:", err);
  process.exit(1);
});

