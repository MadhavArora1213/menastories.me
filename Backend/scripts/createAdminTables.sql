-- Create admin-related tables manually to avoid Sequelize sync issues

-- Create Permissions table
CREATE TABLE IF NOT EXISTS "Permissions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Roles table
CREATE TABLE IF NOT EXISTS "Roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "accessLevel" INTEGER DEFAULT 1,
  "isAdmin" BOOLEAN DEFAULT false,
  "canManageUsers" BOOLEAN DEFAULT false,
  "canManageRoles" BOOLEAN DEFAULT false,
  "rolePermissions" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Admins table
CREATE TABLE IF NOT EXISTS "Admins" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "roleId" UUID REFERENCES "Roles"("id"),
  "isActive" BOOLEAN DEFAULT true,
  "isAccountLocked" BOOLEAN DEFAULT false,
  "lastLoginAt" TIMESTAMP WITH TIME ZONE,
  "loginAttempts" INTEGER DEFAULT 0,
  "lockoutUntil" TIMESTAMP WITH TIME ZONE,
  "mfaEnabled" BOOLEAN DEFAULT false,
  "mfaSecret" VARCHAR(255),
  "mfaBackupCodes" JSONB DEFAULT '[]',
  "passwordResetToken" VARCHAR(255),
  "passwordResetExpires" TIMESTAMP WITH TIME ZONE,
  "profileImage" VARCHAR(255),
  "phoneNumber" VARCHAR(255),
  "department" VARCHAR(255),
  "permissions" JSONB DEFAULT '{}',
  "preferences" JSONB DEFAULT '{"theme":"light","language":"en","timezone":"UTC","notifications":{"email":true,"system":true,"security":true}}',
  "createdBy" UUID REFERENCES "Admins"("id"),
  "updatedBy" UUID REFERENCES "Admins"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AdminLoginLogs table
CREATE TABLE IF NOT EXISTS "AdminLoginLogs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" UUID REFERENCES "Admins"("id"),
  "action" VARCHAR(50) NOT NULL,
  "ipAddress" VARCHAR(255) NOT NULL,
  "userAgent" TEXT,
  "location" JSONB DEFAULT '{"country": null, "region": null, "city": null}',
  "deviceInfo" JSONB DEFAULT '{"browser": null, "browserVersion": null, "os": null, "device": null}',
  "endpoint" VARCHAR(255),
  "method" VARCHAR(10),
  "requestData" JSONB,
  "responseStatus" INTEGER,
  "errorMessage" TEXT,
  "sessionId" VARCHAR(255),
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "isSuspicious" BOOLEAN DEFAULT false,
  "riskScore" DECIMAL(3,2) DEFAULT 0.00
);

-- Create RolePermissions junction table
CREATE TABLE IF NOT EXISTS "RolePermissions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roleId" UUID NOT NULL REFERENCES "Roles"("id") ON DELETE CASCADE,
  "permissionId" UUID NOT NULL REFERENCES "Permissions"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("roleId", "permissionId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON "Admins"("email");
CREATE INDEX IF NOT EXISTS idx_admins_role_id ON "Admins"("roleId");
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON "Admins"("isActive");
CREATE INDEX IF NOT EXISTS idx_admins_last_login ON "Admins"("lastLoginAt");

CREATE INDEX IF NOT EXISTS idx_admin_login_logs_admin_id ON "AdminLoginLogs"("adminId");
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_action ON "AdminLoginLogs"("action");
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_timestamp ON "AdminLoginLogs"("timestamp");
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_ip ON "AdminLoginLogs"("ipAddress");
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_suspicious ON "AdminLoginLogs"("isSuspicious");
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_risk_score ON "AdminLoginLogs"("riskScore");

CREATE INDEX IF NOT EXISTS idx_permissions_name ON "Permissions"("name");

CREATE INDEX IF NOT EXISTS idx_roles_name ON "Roles"("name");
CREATE INDEX IF NOT EXISTS idx_roles_access_level ON "Roles"("accessLevel");

-- Insert basic permissions
INSERT INTO "Permissions" ("id", "name", "description") VALUES
('perm-001', 'system.full_access', 'Full system access'),
('perm-002', 'users.manage', 'Manage users'),
('perm-003', 'content.manage', 'Manage content'),
('perm-004', 'categories.manage', 'Manage categories'),
('perm-005', 'tags.manage', 'Manage tags'),
('perm-006', 'newsletter.manage', 'Manage newsletter'),
('perm-007', 'analytics.view', 'View analytics')
ON CONFLICT ("id") DO NOTHING;

-- Insert Master Admin role
INSERT INTO "Roles" ("id", "name", "description", "accessLevel", "isAdmin", "canManageUsers", "canManageRoles", "rolePermissions") VALUES
('role-001', 'Master Admin', 'Full system control, user management, site configuration', 10, true, true, true, '{"system": ["full_access"], "users": ["manage"], "content": ["manage"], "categories": ["manage"], "tags": ["manage"], "newsletter": ["manage"], "analytics": ["view"]}')
ON CONFLICT ("id") DO NOTHING;

-- Insert default admin user (password: Admin123!)
-- Note: In production, you should hash the password properly
INSERT INTO "Admins" ("id", "email", "password", "name", "roleId", "isActive", "department") VALUES
('admin-001', 'admin@magazinewebsite.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZQjzHq', 'Master Administrator', 'role-001', true, 'System Administration')
ON CONFLICT ("id") DO NOTHING;

-- Assign permissions to Master Admin role
INSERT INTO "RolePermissions" ("roleId", "permissionId")
SELECT 'role-001', "id" FROM "Permissions"
ON CONFLICT ("roleId", "permissionId") DO NOTHING;