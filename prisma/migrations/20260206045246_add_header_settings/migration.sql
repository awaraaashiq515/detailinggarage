-- CreateTable
CREATE TABLE "HeaderSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandName" TEXT NOT NULL DEFAULT 'Detailing',
    "brandNameAccent" TEXT NOT NULL DEFAULT 'Garage',
    "logoImageUrl" TEXT,
    "useLogo" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT NOT NULL DEFAULT '#e8a317',
    "accentColor" TEXT NOT NULL DEFAULT '#ff6b35',
    "textColor" TEXT NOT NULL DEFAULT '#6b7080',
    "navigationLinks" TEXT NOT NULL DEFAULT '[{"label":"Services","href":"#services","isExternal":false},{"label":"PDI","href":"/pdi","isExternal":false},{"label":"How It Works","href":"#how-it-works","isExternal":false},{"label":"About","href":"#about","isExternal":false},{"label":"Contact","href":"#contact","isExternal":false}]',
    "loginButtonText" TEXT NOT NULL DEFAULT 'Log In',
    "ctaButtonText" TEXT NOT NULL DEFAULT 'Get Started',
    "ctaButtonLink" TEXT NOT NULL DEFAULT '/register',
    "dashboardButtonText" TEXT NOT NULL DEFAULT 'Dashboard',
    "siteTitle" TEXT NOT NULL DEFAULT 'DetailingGarage – Premium Car Care',
    "siteDescription" TEXT NOT NULL DEFAULT 'All car services in one place. Book repairs, detailing, PDI inspections, and more.',
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
