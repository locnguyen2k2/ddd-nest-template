/*
  Warnings:

  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleFeaturePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOrganization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOrganizationRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AttributeCategory" AS ENUM ('RESOURCE', 'SUBJECT', 'ENVIRONMENT');

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_parent_role_id_fkey";

-- DropForeignKey
ALTER TABLE "RoleFeaturePermission" DROP CONSTRAINT "RoleFeaturePermission_created_by_fkey";

-- DropForeignKey
ALTER TABLE "RoleFeaturePermission" DROP CONSTRAINT "RoleFeaturePermission_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "RoleFeaturePermission" DROP CONSTRAINT "RoleFeaturePermission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "RoleFeaturePermission" DROP CONSTRAINT "RoleFeaturePermission_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserOrganization" DROP CONSTRAINT "UserOrganization_created_by_fkey";

-- DropForeignKey
ALTER TABLE "UserOrganization" DROP CONSTRAINT "UserOrganization_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "UserOrganization" DROP CONSTRAINT "UserOrganization_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserOrganizationRole" DROP CONSTRAINT "UserOrganizationRole_created_by_fkey";

-- DropForeignKey
ALTER TABLE "UserOrganizationRole" DROP CONSTRAINT "UserOrganizationRole_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserOrganizationRole" DROP CONSTRAINT "UserOrganizationRole_user_id_organization_id_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "department_id" UUID;

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RoleFeaturePermission";

-- DropTable
DROP TABLE "UserOrganization";

-- DropTable
DROP TABLE "UserOrganizationRole";

-- DropEnum
DROP TYPE "PermissionAction";

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID,
    "status" "AccessControlStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "context_attributes" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "status" "AccessControlStatus" NOT NULL DEFAULT 'ACTIVE',
    "context_attributes" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "organization_id" UUID NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attributes" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "description" TEXT,
    "label" TEXT,
    "category" "AttributeCategory",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clearance" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_user_id_organization_id_key" ON "Staff"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "Member_staff_id_project_id_key" ON "Member"("staff_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Department_organization_id_slug_key" ON "Department"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Attributes_entity_type_key_key" ON "Attributes"("entity_type", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_slug_key" ON "Subscription"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Clearance_level_key" ON "Clearance"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_slug_key" ON "Environment"("slug");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
