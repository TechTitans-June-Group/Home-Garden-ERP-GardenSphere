import ContactMessage from '../models/ContactMessage.js';

const seedContact = async () => {
  const count = await ContactMessage.countDocuments();
  if (count > 0) {
    console.log(`Contact messages already exist (${count}). Skipping seed.`);
    return;
  }

  await ContactMessage.create({
    name: 'Ayesha Silva',
    email: 'customer@gardensphere.com',
    phone: '077 123 4567',
    subject: 'Product Availability',
    message: 'Do you have Grade A cherry tomatoes this week? I would like 3 KG.',
    status: 'New',
  });

  console.log('Contact messages seeded.');
};

export default seedContact;
