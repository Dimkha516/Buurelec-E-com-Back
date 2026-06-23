-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_address" TEXT,
    "contact_city" TEXT,
    "contact_country" TEXT,
    "site_name" TEXT NOT NULL DEFAULT 'BuurElec',
    "site_tagline" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "whatsapp_number" TEXT,
    "tiktok_url" TEXT,
    "twitter_url" TEXT,
    "youtube_url" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "home_delivery_cost" DECIMAL(10,2) NOT NULL DEFAULT 2000,
    "pickup_delivery_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "default_tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
