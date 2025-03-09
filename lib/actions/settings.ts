"use server";

import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { systemSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Type for system setting update
interface SystemSettingUpdate {
  key: string;
  value: string;
  description?: string;
  updaterName: string;
}

// Default scoring weights
const DEFAULT_SCORING_WEIGHTS = {
  lead_time_check: 1,
  project_insight: 1,
  client_relationship: 1,
  expertise_alignment: 1,
  commercial_viability: 1,
  strategic_value: 1,
  resources: 1,
  other: 1,
};

// Default threshold for Go/No Go decision
const DEFAULT_GO_THRESHOLD = 3.0;

/**
 * Initialize system settings with defaults if they don't exist
 */
export async function initializeSystemSettings() {
  try {
    // Check if settings already exist
    const existingSettings = await db.query.systemSettings.findMany();
    
    if (existingSettings.length === 0) {
      // Create default settings for scoring weights
      await Promise.all(
        Object.entries(DEFAULT_SCORING_WEIGHTS).map(([criterion, weight]) =>
          db.insert(systemSettings).values({
            key: `weight_${criterion}`,
            value: weight.toString(),
            description: `Weight for ${criterion.replace('_', ' ')} criterion`,
          })
        )
      );
      
      // Create default threshold setting
      await db.insert(systemSettings).values({
        key: "go_threshold",
        value: DEFAULT_GO_THRESHOLD.toString(),
        description: "Minimum average score required for a Go decision",
      });
      
      // Create default manager passcode
      await db.insert(systemSettings).values({
        key: "manager_passcode",
        value: process.env.MANAGER_PASSCODE || "3360", // Use environment variable with fallback
        description: "Passcode for manager access",
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing system settings:", error);
    return { success: false, error: "Failed to initialize system settings" };
  }
}

/**
 * Get all system settings
 */
export async function getSystemSettings() {
  try {
    const settings = await db.query.systemSettings.findMany({
      orderBy: systemSettings.key,
    });
    
    return { success: true, settings };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return { success: false, error: "Failed to fetch system settings" };
  }
}

/**
 * Get a specific system setting by key
 */
export async function getSystemSetting(key: string) {
  try {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, key),
    });
    
    if (!setting) {
      return { success: false, error: "Setting not found" };
    }
    
    return { success: true, setting };
  } catch (error) {
    console.error(`Error fetching system setting ${key}:`, error);
    return { success: false, error: "Failed to fetch system setting" };
  }
}

/**
 * Update a system setting
 */
export async function updateSystemSetting(data: SystemSettingUpdate) {
  try {
    // Find or create the updater
    let updater = await db.query.users.findFirst({
      where: eq(users.name, data.updaterName),
    });

    if (!updater) {
      const [newUser] = await db
        .insert(users)
        .values({
          name: data.updaterName,
          role: "admin",
        })
        .returning();
      updater = newUser;
    }
    
    // Check if the setting exists
    const existingSetting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, data.key),
    });
    
    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db
        .update(systemSettings)
        .set({
          value: data.value,
          description: data.description || existingSetting.description,
          updatedById: updater.id,
        })
        .where(eq(systemSettings.key, data.key))
        .returning();
        
      revalidatePath("/admin/settings");
      return { success: true, setting: updatedSetting };
    } else {
      // Create new setting
      const [newSetting] = await db
        .insert(systemSettings)
        .values({
          key: data.key,
          value: data.value,
          description: data.description,
          updatedById: updater.id,
        })
        .returning();
        
      revalidatePath("/admin/settings");
      return { success: true, setting: newSetting };
    }
  } catch (error) {
    console.error("Error updating system setting:", error);
    return { success: false, error: "Failed to update system setting" };
  }
}

/**
 * Verify manager passcode
 */
export async function verifyManagerPasscode(passcode: string) {
  try {
    // First check against environment variable for better performance
    if (process.env.MANAGER_PASSCODE && passcode === process.env.MANAGER_PASSCODE) {
      return { success: true };
    }
    
    // Fallback to database check
    const setting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, "manager_passcode"),
    });
    
    if (!setting) {
      return { success: false, error: "Manager passcode not set" };
    }
    
    return { success: setting.value === passcode };
  } catch (error) {
    console.error("Error verifying manager passcode:", error);
    return { success: false, error: "Failed to verify manager passcode" };
  }
} 