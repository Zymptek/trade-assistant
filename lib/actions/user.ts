'use server'

import { getRedisClient, RedisWrapper } from '@/lib/redis/config'

// Define function to get Redis client
async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}

// Define the key format for user profile data
function getUserProfileKey(userId: string) {
  return `user:profile:${userId}`
}

// User profile TTL in seconds (30 days by default)
const USER_PROFILE_TTL = 30 * 24 * 60 * 60

// Interface for user profile data
export interface UserProfile {
  userId: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  country?: string
  role?: string
  organization?: string
  industry?: string
  jobTitle?: string
  tradeRegions?: string
  bio?: string
  preferences?: Record<string, any> | string // Can be string when serialized
  firstLoginAt?: string
  lastLoginAt?: string
  additionalInfo?: Record<string, any> | string // Can be string when serialized
  lastUpdatedAt?: string
  [key: string]: any // Allow for dynamic properties
}

/**
 * Get user profile data from Redis
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    console.warn('getUserProfile called with no userId')
    return null
  }

  try {
    const key = getUserProfileKey(userId)
    console.log(`Fetching profile for userId=${userId} with key=${key}`)
    
    const redis = await getRedis()
    const profile = await redis.hgetall<UserProfile>(key)
    
    if (!profile) {
      console.log(`No profile found for userId=${userId}`)
      return null
    }
    
    console.log(`Profile found for userId=${userId}:`, JSON.stringify(profile))
    
    // Parse any JSON string fields
    if (profile?.preferences && typeof profile.preferences === 'string') {
      try {
        profile.preferences = JSON.parse(profile.preferences) as Record<string, any>
      } catch (error) {
        profile.preferences = {}
      }
    }

    if (profile?.additionalInfo && typeof profile.additionalInfo === 'string') {
      try {
        profile.additionalInfo = JSON.parse(profile.additionalInfo) as Record<string, any>
      } catch (error) {
        profile.additionalInfo = {}
      }
    }

    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Save or update user profile data in Redis
 */
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  if (!profile.userId) {
    throw new Error('User ID is required')
  }

  try {
    const redis = await getRedis()
    
    // Stringify any object fields
    const profileToSave = { ...profile }
    
    if (profileToSave.preferences && typeof profileToSave.preferences === 'object') {
      profileToSave.preferences = JSON.stringify(profileToSave.preferences)
    }
    
    if (profileToSave.additionalInfo && typeof profileToSave.additionalInfo === 'object') {
      profileToSave.additionalInfo = JSON.stringify(profileToSave.additionalInfo)
    }
    
    const key = getUserProfileKey(profile.userId)
    console.log(`Saving profile for userId=${profile.userId} with key=${key}:`, JSON.stringify(profileToSave))
    
    await redis.hmset(key, profileToSave)
    
    return true
  } catch (error) {
    console.error('Error saving user profile:', error)
    return false
  }
}

/**
 * Update specific fields of user profile
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<boolean> {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    console.log(`Updating profile for userId=${userId} with updates:`, JSON.stringify(updates))
    
    // First get the existing profile
    const existingProfile = await getUserProfile(userId)
    const profile = existingProfile || { userId }
    
    // Merge updates with existing profile
    const updatedProfile = {
      ...profile,
      ...updates,
      // Always update the lastUpdatedAt timestamp
      lastUpdatedAt: new Date().toISOString()
    }
    
    console.log(`Merged profile for userId=${userId}:`, JSON.stringify(updatedProfile))
    
    return await saveUserProfile(updatedProfile)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

/**
 * Delete a user profile
 */
export async function deleteUserProfile(userId: string): Promise<boolean> {
  if (!userId) {
    return false
  }
  
  try {
    const redis = await getRedis()
    await redis.del(getUserProfileKey(userId))
    return true
  } catch (error) {
    console.error('Error deleting user profile:', error)
    return false
  }
}

/**
 * Track user login
 */
export async function trackUserLogin(
  userId: string, 
  userData: { name?: string; email?: string }
): Promise<void> {
  if (!userId) return
  
  try {
    const now = new Date().toISOString()
    const existingProfile = await getUserProfile(userId)
    
    if (!existingProfile) {
      // First login - create profile
      await saveUserProfile({
        userId,
        name: userData.name,
        email: userData.email,
        firstLoginAt: now,
        lastLoginAt: now
      })
    } else {
      // Update last login time
      await updateUserProfile(userId, {
        lastLoginAt: now,
        // Update name/email if they've changed
        ...(userData.name && { name: userData.name }),
        ...(userData.email && { email: userData.email })
      })
    }
  } catch (error) {
    console.error('Error tracking user login:', error)
  }
} 