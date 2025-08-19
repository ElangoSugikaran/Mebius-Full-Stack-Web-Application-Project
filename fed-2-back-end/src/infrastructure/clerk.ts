import { clerkClient } from '@clerk/express';
import Customer from './db/entities/Customer';

export const syncClerkUserToDatabase = async (clerkUserId: string) => {
  try {
    console.log(`🔄 Syncing Clerk user ${clerkUserId} to database`);
    
    // Fetch user data from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    
    if (!clerkUser) {
      console.error(`❌ Clerk user ${clerkUserId} not found`);
      return null;
    }
    
    // Extract user information
    const userData = {
      clerkId: clerkUser.id,
      firstName: clerkUser.firstName || 'Guest',
      lastName: clerkUser.lastName || 'User',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl || '',
      lastLoginAt: new Date()
    };
    
    // Check if customer already exists
    let customer = await Customer.findOne({ clerkId: clerkUserId });
    
    if (customer) {
      // Update existing customer
      customer.firstName = userData.firstName;
      customer.lastName = userData.lastName;
      customer.email = userData.email;
      customer.imageUrl = userData.imageUrl;
      customer.lastLoginAt = userData.lastLoginAt;
      customer.isActive = true;
      
      await customer.save();
      console.log(`✅ Updated customer: ${customer.email}`);
    } else {
      // Create new customer
      customer = await Customer.create(userData);
      console.log(`✅ Created new customer: ${customer.email}`);
    }
    
    return customer;
    
  } catch (error) {
    console.error(`❌ Error syncing Clerk user ${clerkUserId}:`, error);
    return null;
  }
};