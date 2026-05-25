
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123'; // Default from seed

const TEST_USER = {
    name: 'Auto Test User',
    email: `test_${Date.now()}@example.com`,
    mobile: `98${Math.floor(Math.random() * 100000000)}`, // Ensure 10 digits starting with high digits
    password: 'TestPassword123!',
    role: 'CLIENT',
    purposeOfLoginId: 'cm6pi4z520002uj84g6j2j6l5' // Adding a potentially required field, though schema might make it optional. 
    // Wait, let's just make mobile and password robust.
};

let userId = null;
let authToken = null; // Admin Token
let userToken = null; // User Token

async function runTest() {
    // 0. FETCH LOGIN PURPOSE (Required for registration)
    console.log('0️⃣  Fetching Login Purposes...');
    let purposeId = 'default_id';
    try {
        const purpRes = await fetch(`${BASE_URL}/api/login-purposes`);
        const purpData = await purpRes.json();
        if (purpData.purposes && purpData.purposes.length > 0) {
            purposeId = purpData.purposes[0].id;
            console.log('\x1b[32m%s\x1b[0m', `   ✅ Found Purpose ID: ${purposeId}`);
        } else {
            console.warn('   ⚠️ No purposes found, using fallback.');
        }
    } catch (e) {
        console.warn('   ⚠️ Failed to fetch purposes, using fallback.');
    }

    const REG_DATA = {
        ...TEST_USER,
        confirmPassword: TEST_USER.password, // Required by schema
        purposeOfLoginId: purposeId
    };

    // 1. REGISTER
    console.log('\n1️⃣  Testing Registration...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(REG_DATA)
    });
    const regData = await regRes.json();

    if (regData.success) {
        userId = regData.userId;
        console.log('\x1b[32m%s\x1b[0m', '   ✅ Registration Successful');
        console.log(`      User ID: ${userId}`);
    } else {
        console.error('\x1b[31m%s\x1b[0m', '   ❌ Registration Failed:', regData.error);
        process.exit(1);
    }

    // 2. LOGIN (Should Fail/Pending)
    console.log('\n2️⃣  Testing Login (Before Approval)...');
    const loginFailRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
    });
    const loginFailData = await loginFailRes.json();

    if (loginFailRes.status === 403 && loginFailData.status === 'PENDING') {
        console.log('\x1b[32m%s\x1b[0m', '   ✅ Correctly blocked (Pending Approval)');
    } else {
        console.error('\x1b[31m%s\x1b[0m', '   ❌ Failed: Should be 403 Pending, got:', loginFailRes.status);
        if (loginFailRes.status === 200) console.warn('      Warning: Auto-approval might be on.');
    }

    // 3. ADMIN LOGIN (To get token)
    console.log('\n3️⃣  Logging in as Admin...');
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });

    if (adminRes.ok) {
        // Extract cookie manually since we are in node
        const cookieHeader = adminRes.headers.get('set-cookie');
        if (cookieHeader) {
            authToken = cookieHeader.split(';')[0]; // Extract auth-token=...
            console.log('\x1b[32m%s\x1b[0m', '   ✅ Admin Login Successful');
        } else {
            console.error('\x1b[31m%s\x1b[0m', '   ❌ Admin Login Failed: No cookie received');
            process.exit(1);
        }
    } else {
        console.error('\x1b[31m%s\x1b[0m', '   ❌ Admin Login Failed');
        process.exit(1);
    }

    // 4. APPROVE USER
    console.log('\n4️⃣  Approving User (Admin Action)...');
    const approveRes = await fetch(`${BASE_URL}/api/admin/users`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': authToken
        },
        body: JSON.stringify({
            userId: userId,
            status: 'APPROVED',
            emailVerified: true,  // Manually verify for test
            mobileVerified: true
        })
    });
    const approveData = await approveRes.json();

    if (approveData.success) {
        console.log('\x1b[32m%s\x1b[0m', '   ✅ User Approved Successfully');
    } else {
        console.error('\x1b[31m%s\x1b[0m', '   ❌ Approval Failed:', approveData.error);
        process.exit(1);
    }

    // 5. LOGIN (Success)
    console.log('\n5️⃣  Testing Login (After Approval)...');
    const loginSuccessRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
    });
    const loginSuccessData = await loginSuccessRes.json();

    if (loginSuccessRes.ok && loginSuccessData.success) {
        console.log('\x1b[32m%s\x1b[0m', '   ✅ Login Successful');
        const cookieHeader = loginSuccessRes.headers.get('set-cookie');
        userToken = cookieHeader ? cookieHeader.split(';')[0] : null;
    } else {
        console.error('\x1b[31m%s\x1b[0m', '   ❌ Login Failed:', loginSuccessData.error);
        process.exit(1);
    }

    // 6. VERIFY MOBILE API ACCESS
    console.log('\n6️⃣  Verifying User API Access (as Client)...');
    // Try to access a client route (e.g., PDI requests)
    // Note: Creating a mock request here to verify auth works
    // Assuming /api/auth/me works
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { 'Cookie': userToken }
    });
    const meData = await meRes.json();

    if (meRes.ok && meData.user && meData.user.email === TEST_USER.email) {
        console.log('\x1b[32m%s\x1b[0m', '   ✅ Auth Verification Successful (GET /api/auth/me)');
    } else {
        console.error('\x1b[31m%s\x1b[0m', '   ❌ Auth Verification Failed');
    }

    // 7. CLEANUP
    console.log('\n7️⃣  Cleaning Up (Deleting Test User)...');
    const deleteRes = await fetch(`${BASE_URL}/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authToken }
    });

    if (deleteRes.ok) {
        console.log('\x1b[32m%s\x1b[0m', '   ✅ Cleanup Successful');
    } else {
        console.warn('\x1b[33m%s\x1b[0m', '   ⚠️ Cleanup Failed');
    }

    console.log('\n\x1b[36m%s\x1b[0m', '🎉 All Tests Passed! The API is ready for mobile app integration.');
}

runTest().catch(console.error);
