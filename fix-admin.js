const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Reset admin password to 'admin123'
  const hash = await bcrypt.hash('admin123', 12);
  await prisma.user.update({
    where: { email: 'superadmin@gmail.com' },
    data: {
      password: hash,
      status: 'APPROVED',
      emailVerified: true,
      mobileVerified: true
    }
  });
  console.log('✅ Admin password reset to: admin123');
  console.log('✅ Admin email: superadmin@gmail.com');

  // Create or fix OTP settings (disable OTP so login works without email verification)
  const existing = await prisma.oTPSettings.findFirst();
  if (!existing) {
    await prisma.oTPSettings.create({
      data: {
        emailOTPEnabled: false,
        mobileOTPEnabled: false,
        otpExpiryMinutes: 10
      }
    });
    console.log('✅ OTP settings created (OTP disabled)');
  } else {
    await prisma.oTPSettings.updateMany({
      data: {
        emailOTPEnabled: false,
        mobileOTPEnabled: false
      }
    });
    console.log('✅ OTP verification disabled');
  }

  console.log('\n🎉 Done! Login with:');
  console.log('   Email: superadmin@gmail.com');
  console.log('   Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
