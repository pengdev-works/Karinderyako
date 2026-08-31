/**
 * KarinderyaKo — Database Seed Script
 * Populates Neon PostgreSQL with authentic food businesses and menus in Poblacion, Laang, Abra
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

let dbUrl = (process.env.DATABASE_URL || '').replace('&channel_binding=require', '').replace('?channel_binding=require', '');

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  console.log('🌱 Connecting to Neon PostgreSQL...');

  try {
    await client.connect();
    console.log('  └─ Connected!');

    // 1. Create default passwords
    const ownerHash = await bcrypt.hash('owner123', 10);
    const customerHash = await bcrypt.hash('customer123', 10);
    const riderHash = await bcrypt.hash('rider123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    // 2. Ensure Schema Exists
    const fs = require('fs');
    const path = require('path');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('  └─ Schema created/verified');

    // 3. Clear existing data
    await client.query(`
      TRUNCATE TABLE order_items, reviews, favorites, orders, products, karinderyas, applications, users, audit_logs RESTART IDENTITY CASCADE;
    `);
    console.log('  └─ Existing tables truncated');

    // 4. Insert Demo Users
    const usersRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone, address)
      VALUES
        ('Aling Nena',             'owner@karinderyako.ph',        $1, 'OWNER',    '09171234567', 'Poblacion, Laang, Abra'),
        ('Abra Kitchen Manager',  'abra.kitchen@karinderyako.ph', $1, 'OWNER',    '09182345678', 'Poblacion, Laang, Abra'),
        ('Mang Inasal Manager',   'manginasal@karinderyako.ph',   $1, 'OWNER',    '09193456789', 'Poblacion, Laang, Abra'),
        ('KFC Manager',           'kfc.laang@karinderyako.ph',     $1, 'OWNER',    '09204567890', 'Poblacion, Laang, Abra'),
        ('Aling Bebang',           'bebang@karinderyako.ph',        $1, 'OWNER',    '09215678901', 'Poblacion, Laang, Abra'),
        ('Juan Dela Cruz',        'customer@karinderyako.ph',     $2, 'CUSTOMER', '09178889900', 'Zone 2, Poblacion, Laang, Abra'),
        ('Mark Busa',             'rider@karinderyako.ph',        $3, 'RIDER',    '09179990011', 'Poblacion, Laang, Abra'),
        ('Platform Admin',        'admin@karinderyako.ph',        $4, 'ADMIN',    '09170001122', 'Poblacion, Laang, Abra')
      RETURNING id, email, role;
    `, [ownerHash, customerHash, riderHash, adminHash]);

    const usersMap = {};
    usersRes.rows.forEach(u => { usersMap[u.email] = u.id; });
    console.log('  └─ Demo users inserted');

    // 5. Insert Food Businesses (Karinderyas)
    const karinderyaRes = await client.query(`
      INSERT INTO karinderyas 
        (owner_user_id, name, owner_name, email, phone, category, address, description, photo, logo, status, app_status, rating, review_count, delivery_fee, prep_time, operating_hours)
      VALUES
        (
          $1,
          'Ate Nena''s Karinderya',
          'Aling Nena',
          'owner@karinderyako.ph',
          '09171234567',
          'Filipino Food',
          'Poblacion Main Street, Laang, Abra',
          'Serving freshly cooked homemade Ilocano dishes, sizzling silog meals, and traditional favorites daily.',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
          'open',
          'APPROVED',
          4.8,
          124,
          30.00,
          '20–30 min',
          '7:00 AM - 8:00 PM'
        ),
        (
          $2,
          'Abra Homemade Kitchen',
          'Abra Kitchen Manager',
          'abra.kitchen@karinderyako.ph',
          '09182345678',
          'Filipino Food',
          'Zone 3, Poblacion, Laang, Abra',
          'Authentic local Abra home recipes, crispy bagnet dishes, creamy pastas, and refreshing desserts.',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
          'open',
          'APPROVED',
          4.9,
          88,
          25.00,
          '25–35 min',
          '8:00 AM - 9:00 PM'
        ),
        (
          $3,
          'Mang Inasal - Poblacion Branch',
          'Mang Inasal Manager',
          'manginasal@karinderyako.ph',
          '09193456789',
          'Chicken',
          'Market Highway, Poblacion, Laang, Abra',
          'Famous charcoal-grilled chicken inasal, pork barbecue, and savory palabok noodles.',
          'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
          'open',
          'APPROVED',
          4.7,
          210,
          35.00,
          '15–25 min',
          '9:00 AM - 9:00 PM'
        ),
        (
          $4,
          'KFC Poblacion Laang',
          'KFC Manager',
          'kfc.laang@karinderyako.ph',
          '09204567890',
          'Burgers',
          'Commercial Center, Poblacion, Laang, Abra',
          'World famous finger lickin'' good original recipe fried chicken, burgers, and sides.',
          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
          'open',
          'APPROVED',
          4.6,
          150,
          40.00,
          '20–30 min',
          '10:00 AM - 10:00 PM'
        ),
        (
          $5,
          'Aling Bebang''s Carinderia & Grill',
          'Aling Bebang',
          'bebang@karinderyako.ph',
          '09215678901',
          'Noodles',
          'Riverside Street, Poblacion, Laang, Abra',
          'Special pancit canton, sizzling sisig, crispy dinuguan, and refreshing drinks.',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=200&q=80',
          'open',
          'APPROVED',
          4.8,
          95,
          25.00,
          '20–30 min',
          '6:00 AM - 7:00 PM'
        )
      RETURNING id, name;
    `, [
      usersMap['owner@karinderyako.ph'],
      usersMap['abra.kitchen@karinderyako.ph'],
      usersMap['manginasal@karinderyako.ph'],
      usersMap['kfc.laang@karinderyako.ph'],
      usersMap['bebang@karinderyako.ph']
    ]);

    const kMap = {};
    karinderyaRes.rows.forEach(k => { kMap[k.name] = k.id; });
    console.log('  └─ Food businesses inserted');

    // 6. Insert Menu Items (Products)
    await client.query(`
      INSERT INTO products (karinderya_id, name, description, price, category, photo, available)
      VALUES
        -- Ate Nena's Karinderya Menu
        ($1, 'Chicken Silog', 'Crispy golden fried chicken served with garlic sinangag rice and fried egg.', 99.00, 'Silog Meals', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80', TRUE),
        ($1, 'Pork Sisig Rice Bowl', 'Savory sizzling pork sisig topped with fried egg, green chili, and calamansi.', 120.00, 'Sisig', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80', TRUE),
        ($1, 'Pork Sinigang na Sampalok', 'Classic sour tamarind broth with tender pork ribs, kangkong, and radish.', 140.00, 'Rice Meals', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80', TRUE),
        ($1, 'Crispy Lumpiang Shanghai (6pcs)', 'Hand-rolled pork spring rolls cooked extra crispy, served with sweet dipping sauce.', 85.00, 'Popular', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80', TRUE),
        ($1, 'Special Beef Pares with Clear Soup', 'Tender braised sweet garlic beef served with hot clear bone broth and garlic fried rice.', 110.00, 'Rice Meals', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80', TRUE),
        ($1, 'Cold Sago''t Gulaman', 'Traditional iced beverage with brown sugar syrup, tapioca pearls, and jelly.', 35.00, 'Drinks', 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=500&q=80', TRUE),

        -- Abra Homemade Kitchen Menu
        ($2, 'Special Pinakbet with Bagnet', 'Authentic Ilocano local vegetable medley cooked in shrimp paste, topped with crispy pork bagnet.', 160.00, 'Popular', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80', TRUE),
        ($2, 'Cheesy Filipino Spaghetti', 'Sweet style tomato meat sauce spaghetti loaded with sliced hotdogs and melted cheddar.', 89.00, 'Pasta', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281293?auto=format&fit=crop&w=500&q=80', TRUE),
        ($2, 'Rich Beef Caldereta', 'Hearty tomato beef stew simmered with liver spread, potatoes, bell peppers, and cheese.', 165.00, 'Rice Meals', 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=500&q=80', TRUE),
        ($2, 'Tapsilog Special', 'Marinated garlic beef tapa served with fragrant sinangag rice, sunny egg, and vinegar dip.', 115.00, 'Silog Meals', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80', TRUE),
        ($2, 'Homemade Special Halo-Halo', 'Shaved ice with sweetened bananas, jackfruit, leche flan, ube halaya, and evaporated milk.', 65.00, 'Desserts', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80', TRUE),

        -- Mang Inasal Menu
        ($3, 'PM1 Chicken Inasal Pecho (Breast)', 'Juicy charcoal-grilled chicken inasal breast served with unli chicken oil and hot rice.', 149.00, 'Chicken', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80', TRUE),
        ($3, 'PM2 Chicken Inasal Paa (Thigh)', 'Grilled chicken thigh quarter marinated in citrus, lemongrass, and annatto oil.', 139.00, 'Chicken', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80', TRUE),
        ($3, 'Pork BBQ Skewers (3 Sticks)', 'Sweet soy marinated Filipino pork barbecue skewers grilled over hot coals.', 105.00, 'Popular', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=500&q=80', TRUE),
        ($3, 'Special Palabok Noodles', 'Thick rice noodles tossed in savory shrimp gravy, topped with chicharon, egg, and spring onion.', 95.00, 'Pasta', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80', TRUE),

        -- KFC Menu
        ($4, '2pc Original Recipe Chicken Combo', '2 pieces of secret 11 herbs & spices fried chicken, signature gravy, and steamed rice.', 195.00, 'Chicken', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80', TRUE),
        ($4, 'Zinger Burger Meal', 'Spicy crispy chicken thigh fillet with lettuce and mayo in a toasted sesame bun.', 165.00, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', TRUE),
        ($4, 'KFC Famous Bowl', 'Creamy mashed potato layered with sweet corn, popcorn chicken bites, and hot gravy.', 115.00, 'Popular', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80', TRUE),

        -- Aling Bebang's Menu
        ($5, 'Pancit Canton Bihon Combo', 'Stir-fried egg and rice noodles loaded with sliced pork, chicken liver, and fresh vegetables.', 90.00, 'Noodles', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80', TRUE),
        ($5, 'Crispy Dinuguan with Puto', 'Rich savory pork blood stew cooked with green chilis, served with steamed white puto cakes.', 110.00, 'Popular', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80', TRUE),
        ($5, 'Tocilog', 'Sweet cured pork tocino fried to perfection, served with garlic rice and fried egg.', 95.00, 'Silog Meals', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80', TRUE),
        ($5, 'Fresh Buko Pandan Juice', 'Chilled coconut water infused with pandan flavor and tender young coconut strips.', 40.00, 'Drinks', 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=500&q=80', TRUE)
    `, [
      kMap["Ate Nena's Karinderya"],
      kMap['Abra Homemade Kitchen'],
      kMap['Mang Inasal - Poblacion Branch'],
      kMap['KFC Poblacion Laang'],
      kMap["Aling Bebang's Carinderia & Grill"]
    ]);
    console.log('  └─ Menu products inserted');

    // 7. Seed Sample Order & Review
    const ateNenaId = kMap["Ate Nena's Karinderya"];
    const customerId = usersMap['customer@karinderyako.ph'];

    const sampleOrderRes = await client.query(`
      INSERT INTO orders (
        id, karinderya_id, karinderya_name, customer_user_id, customer_name, customer_phone,
        delivery_address, landmark, delivery_notes, subtotal, delivery_fee, total_amount,
        payment_method, payment_status, order_status
      )
      VALUES (
        'KK-102938', $1, 'Ate Nena''s Karinderya', $2, 'Juan Dela Cruz', '09178889900',
        'Zone 2, Poblacion, Laang, Abra', 'Near Brgy Hall', 'Please call when at the gate',
        318.00, 30.00, 348.00, 'COD', 'PENDING (COD)', 'ACCEPTED'
      )
      RETURNING id;
    `, [ateNenaId, customerId]);

    const orderId = sampleOrderRes.rows[0].id;

    await client.query(`
      INSERT INTO order_items (order_id, product_name, product_price, qty, notes)
      VALUES
        ($1, 'Chicken Silog', 99.00, 2, 'Extra garlic rice'),
        ($1, 'Pork Sisig Rice Bowl', 120.00, 1, 'Less spicy please');
    `, [orderId]);

    await client.query(`
      INSERT INTO reviews (order_id, karinderya_id, user_id, customer_name, rating, comment, reply, reply_at)
      VALUES (
        $1, $2, $3, 'Juan Dela Cruz', 5,
        'Super sarap ng Chicken Silog and Sisig! Fast delivery here in Poblacion.',
        'Salamat po Sir Juan! Sa uulitin po!', NOW()
      );
    `, [orderId, ateNenaId, customerId]);
    console.log('  └─ Sample order & review created');

    // 8. Audit Log
    await client.query(`
      INSERT INTO audit_logs (user_role, action, details, status)
      VALUES ('SYSTEM', 'DATABASE_SEEDED', 'Seeded Karinderya Ko food delivery marketplace data for Poblacion, Laang, Abra', 'SUCCESS');
    `);

    console.log('================================================');
    console.log('✅ Karinderya Ko Database Successfully Seeded!');
    console.log('================================================');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await client.end();
  }
}

seed();
