import User from './src/models/User.js';
import Project from './src/models/Project.js';
import Issue from './src/models/Issue.js';
import TestCase from './src/models/TestCase.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create demo user
    const user = await User.create('demo@bugme.com', 'Demo@123', 'Demo User');
    console.log('✅ Demo user created:', user.id);

    // Create demo project
    const project = await Project.create(
      'E-commerce App',
      'Testing the new e-commerce platform',
      user.id
    );
    console.log('✅ Demo project created:', project.id);

    // Create demo issues
    const issue1 = await Issue.create(
      project.id,
      'Login page freezes on mobile',
      'When trying to login on mobile devices, the page becomes unresponsive after entering credentials.',
      'high',
      user.id
    );
    console.log('✅ Issue 1 created:', issue1.id);

    const issue2 = await Issue.create(
      project.id,
      'Cart total not calculating correctly',
      'The total price in the shopping cart shows incorrect amount when discount codes are applied.',
      'critical',
      user.id
    );
    console.log('✅ Issue 2 created:', issue2.id);

    // Create demo test cases
    const testCase1 = await TestCase.create(
      project.id,
      'Verify successful login with valid credentials',
      'Test user login functionality',
      [
        { step: 1, description: 'Navigate to login page' },
        { step: 2, description: 'Enter email: demo@bugme.com' },
        { step: 3, description: 'Enter password: Demo@123' },
        { step: 4, description: 'Click login button' },
      ],
      'User should be redirected to dashboard',
      user.id
    );
    console.log('✅ Test case 1 created:', testCase1.id);

    const testCase2 = await TestCase.create(
      project.id,
      'Verify cart calculation with discount',
      'Test discount code application',
      [
        { step: 1, description: 'Add items to cart' },
        { step: 2, description: 'Apply discount code' },
        { step: 3, description: 'Verify total calculation' },
      ],
      'Total should reflect the discount correctly',
      user.id
    );
    console.log('✅ Test case 2 created:', testCase2.id);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Email: demo@bugme.com');
    console.log('Password: Demo@123');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
