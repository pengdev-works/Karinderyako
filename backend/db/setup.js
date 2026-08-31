/**
 * KarinderyaKo — Setup Script
 * Applies schema then seeds demo data
 */
require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(/[&?]channel_binding=[^&]*/g, ''),
});

async function setup() {
  console.log('🔧 KarinderyaKo Setup\n');

  // 1. Apply schema
  console.log('📋 Applying schema...');
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('   ✅ Schema applied!\n');

  // 2. Clear existing demo data (keep structure)
  console.log('🗑️  Clearing old demo data...');
  await pool.query('DELETE FROM audit_logs');
  await pool.query('DELETE FROM favorites');
  await pool.query('DELETE FROM reviews');
  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM karinderyas');
  await pool.query('DELETE FROM applications');
  await pool.query('DELETE FROM users');
  console.log('   ✅ Cleared!\n');

  // 3. Create users
  console.log('👤 Creating demo users...');
  const hash = async (pw) => bcrypt.hash(pw, 10);

  const admin = await pool.query(
    `INSERT INTO users (name,email,password_hash,role,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['Admin Karinderya', 'admin@karinderyako.com', await hash('admin123'), 'ADMIN', '09000000001']
  );

  const owner1 = await pool.query(
    `INSERT INTO users (name,email,password_hash,role,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['Nena Santos', 'nena@karinderyako.com', await hash('owner123'), 'OWNER', '09171234567']
  );
  const owner2 = await pool.query(
    `INSERT INTO users (name,email,password_hash,role,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['Bebang Cruz', 'bebang@karinderyako.com', await hash('owner123'), 'OWNER', '09281234567']
  );
  const owner3 = await pool.query(
    `INSERT INTO users (name,email,password_hash,role,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['Mang Pedro', 'pedro@karinderyako.com', await hash('owner123'), 'OWNER', '09391234567']
  );

  const cust1 = await pool.query(
    `INSERT INTO users (name,email,password_hash,role,phone,address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    ['Maria Dela Cruz', 'maria@example.com', await hash('customer123'), 'CUSTOMER', '09501234567', '123 Poblacion St, Laang']
  );
  const cust2 = await pool.query(
    `INSERT INTO users (name,email,password_hash,role,phone,address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    ['Juan Reyes', 'juan@example.com', await hash('customer123'), 'CUSTOMER', '09611234567', '456 Rizal Ave, Poblacion']
  );
  console.log('   ✅ Users created!\n');

  const adminId = admin.rows[0].id;
  const o1Id = owner1.rows[0].id;
  const o2Id = owner2.rows[0].id;
  const o3Id = owner3.rows[0].id;
  const c1Id = cust1.rows[0].id;
  const c2Id = cust2.rows[0].id;

  // 4. Create karinderyas
  console.log('🍽️  Creating restaurants...');
  const k1 = await pool.query(
    `INSERT INTO karinderyas (owner_user_id,name,owner_name,email,phone,category,address,description,rating,review_count,delivery_fee,prep_time,app_status,verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
    [o1Id, "Ate Nena's Carinderia", 'Nena Santos', 'nena@karinderyako.com', '09171234567',
     'Filipino Food', 'Brgy. Poblacion, Laang, Abra',
     'Home-cooked Filipino comfort food since 1995. Specializing in traditional Ilocano dishes and daily ulam.',
     4.9, 128, 30, '15–25 min', 'APPROVED', true]
  );
  const k2 = await pool.query(
    `INSERT INTO karinderyas (owner_user_id,name,owner_name,email,phone,category,address,description,rating,review_count,delivery_fee,prep_time,app_status,verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
    [o2Id, "Aling Bebang's Kitchen", 'Bebang Cruz', 'bebang@karinderyako.com', '09281234567',
     'Lutong Bahay', 'Purok 3, Laang, Abra',
     'Budget-friendly homestyle meals for the whole family. Fresh ingredients daily.',
     4.7, 89, 25, '20–30 min', 'APPROVED', true]
  );
  const k3 = await pool.query(
    `INSERT INTO karinderyas (owner_user_id,name,owner_name,email,phone,category,address,description,rating,review_count,delivery_fee,prep_time,app_status,verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
    [o3Id, 'Abra Homemade Kitchen', 'Mang Pedro', 'pedro@karinderyako.com', '09391234567',
     'Ilocano Specialties', 'Barangay Proper, Laang, Abra',
     'Authentic Ilocano delicacies — pinakbet, bagnet, dinengdeng, and more.',
     4.8, 64, 35, '25–35 min', 'APPROVED', true]
  );
  const k4 = await pool.query(
    `INSERT INTO karinderyas (owner_user_id,name,owner_name,email,phone,category,address,description,rating,review_count,delivery_fee,prep_time,app_status,verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
    [o1Id, 'Silog Masters', 'Nena Santos', 'nena2@karinderyako.com', '09171234567',
     'Breakfast', 'Poblacion Market Area, Laang, Abra',
     'All-day silog meals: tapsilog, longsilog, tocilog and more. Best breakfast in town!',
     4.6, 45, 20, '10–15 min', 'APPROVED', true]
  );
  const k5 = await pool.query(
    `INSERT INTO karinderyas (owner_user_id,name,owner_name,email,phone,category,address,description,rating,review_count,delivery_fee,prep_time,app_status,verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
    [o2Id, 'BBQ ni Manong', 'Bebang Cruz', 'bbq@karinderyako.com', '09281234567',
     'Grilled & BBQ', 'Near Municipal Hall, Laang, Abra',
     'Freshly grilled isaw, pork barbecue, chicken, and barbeque rice meals. Best merienda!',
     4.5, 37, 30, '20–25 min', 'PENDING', false]
  );
  console.log('   ✅ Restaurants created!\n');

  const k1Id = k1.rows[0].id;
  const k2Id = k2.rows[0].id;
  const k3Id = k3.rows[0].id;
  const k4Id = k4.rows[0].id;
  const k5Id = k5.rows[0].id;

  // 5. Create products (menus)
  console.log('🍴 Creating menu items...');

  // Ate Nena's menu
  await pool.query(`INSERT INTO products (karinderya_id,name,description,price,category) VALUES
    ($1,'Adobo ng Manok','Classic chicken adobo — tender, savory, and perfectly marinated.',89,'Popular'),
    ($1,'Sinigang na Baboy','Sour tamarind soup with pork ribs and fresh vegetables.',105,'Popular'),
    ($1,'Pinakbet','Ilocano veggie medley with bagoong, ampalaya, talong, and squash.',79,'Ilocano'),
    ($1,'Kare-Kare','Rich peanut sauce stew with ox tripe and banana blossom.',135,'Popular'),
    ($1,'Dinuguan','Savory pork blood stew, best paired with puto.',89,'Special'),
    ($1,'Fried Bangus','Crispy marinated milkfish — a Filipino classic.',85,'Seafood'),
    ($1,'Plain Rice','Steaming hot white rice.',15,'Extras'),
    ($1,'Softdrinks','Coke, Royal, or Sprite (330ml).',25,'Drinks')`,
    [k1Id]);

  // Aling Bebang's menu
  await pool.query(`INSERT INTO products (karinderya_id,name,description,price,category) VALUES
    ($1,'Beef Caldereta','Tender beef in rich tomato and liver sauce.',115,'Popular'),
    ($1,'Chicken Tinola','Ginger-based chicken soup with papaya and chili leaves.',95,'Soups'),
    ($1,'Monggo Guisado','Sautéed mung bean stew with pork and malunggay.',75,'Budget Meals'),
    ($1,'Pritong Tilapia','Crispy deep-fried tilapia, served whole.',70,'Seafood'),
    ($1,'Tortang Talong','Eggplant omelette with minced pork.',65,'Budget Meals'),
    ($1,'Pancit Bihon','Stir-fried rice noodles with veggies and meat.',80,'Popular'),
    ($1,'Rice','Steamed white rice (1 cup).',15,'Extras')`,
    [k2Id]);

  // Abra Homemade Kitchen menu
  await pool.query(`INSERT INTO products (karinderya_id,name,description,price,category) VALUES
    ($1,'Bagnet','Crispy Ilocano deep-fried pork belly — the real deal.',150,'Ilocano Specialties'),
    ($1,'Pinakbet Ilocano','Traditional Ilocano pinakbet with fish bagoong.',85,'Ilocano Specialties'),
    ($1,'Dinengdeng','Light vegetable stew in fish bagoong broth.',75,'Ilocano Specialties'),
    ($1,'Igado','Ilocano pork and liver dish with vinegar and soy.',110,'Ilocano Specialties'),
    ($1,'Dinardaraan','Crispy blood stew, Ilocano style.',95,'Ilocano Specialties'),
    ($1,'Pakbet Rice','Fried rice mixed with pakbet goodness.',65,'Rice Meals'),
    ($1,'Basi','Traditional Ilocano sugarcane wine (small).',45,'Drinks')`,
    [k3Id]);

  // Silog Masters menu
  await pool.query(`INSERT INTO products (karinderya_id,name,description,price,category) VALUES
    ($1,'Tapsilog','Beef tapa, garlic rice, and sunny-side-up egg.',89,'Silog Meals'),
    ($1,'Longsilog','Pork longganisa, garlic rice, and egg.',79,'Silog Meals'),
    ($1,'Tocilog','Sweet cured tocino, garlic rice, and egg.',79,'Silog Meals'),
    ($1,'Bangsilog','Fried bangus, garlic rice, and egg.',85,'Silog Meals'),
    ($1,'Chicksilog','Fried chicken, garlic rice, and egg.',99,'Silog Meals'),
    ($1,'Cornsilog','Corned beef, garlic rice, and egg.',75,'Silog Meals'),
    ($1,'Hot Coffee','Freshly brewed barako coffee.',25,'Drinks'),
    ($1,'Milo','Hot Milo drink.',30,'Drinks')`,
    [k4Id]);

  // BBQ ni Manong menu
  await pool.query(`INSERT INTO products (karinderya_id,name,description,price,category) VALUES
    ($1,'Pork Barbecue (stick)','Juicy pork barbecue on a stick, grilled to perfection.',25,'BBQ'),
    ($1,'Chicken Barbecue','Marinated chicken leg quarter, charcoal-grilled.',75,'BBQ'),
    ($1,'Isaw (stick)','Grilled chicken intestines — street food classic.',15,'Street Food'),
    ($1,'Betamax','Grilled pork blood squares.',15,'Street Food'),
    ($1,'Barbeque Rice Meal','Rice + 2 pork BBQ sticks + sawsawan.',65,'Rice Meals'),
    ($1,'Banana Cue','Deep-fried caramelized saging na saba (3 pcs).',20,'Snacks')`,
    [k5Id]);

  console.log('   ✅ Menu items created!\n');

  // 6. Create sample orders
  console.log('📦 Creating sample orders...');
  const orderId1 = 'ORD-2026-00001';
  const orderId2 = 'ORD-2026-00002';

  await pool.query(
    `INSERT INTO orders (id,karinderya_id,karinderya_name,customer_user_id,customer_name,customer_phone,delivery_address,subtotal,delivery_fee,total_amount,payment_method,payment_status,order_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [orderId1, k1Id, "Ate Nena's Carinderia", c1Id, 'Maria Dela Cruz', '09501234567',
     '123 Poblacion St, Laang, Abra', 178, 30, 208, 'COD', 'PENDING (COD)', 'DELIVERED']
  );
  await pool.query(
    `INSERT INTO order_items (order_id,product_name,product_price,qty) VALUES ($1,$2,$3,$4),($1,$5,$6,$7)`,
    [orderId1, 'Adobo ng Manok', 89, 1, 'Sinigang na Baboy', 105, 1]
  );

  await pool.query(
    `INSERT INTO orders (id,karinderya_id,karinderya_name,customer_user_id,customer_name,customer_phone,delivery_address,subtotal,delivery_fee,total_amount,payment_method,payment_status,order_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [orderId2, k2Id, "Aling Bebang's Kitchen", c2Id, 'Juan Reyes', '09611234567',
     '456 Rizal Ave, Poblacion, Laang', 190, 25, 215, 'COD', 'PENDING (COD)', 'PREPARING']
  );
  await pool.query(
    `INSERT INTO order_items (order_id,product_name,product_price,qty) VALUES ($1,$2,$3,$4),($1,$5,$6,$7)`,
    [orderId2, 'Beef Caldereta', 115, 1, 'Pancit Bihon', 80, 1]
  );
  console.log('   ✅ Orders created!\n');

  // 7. Create reviews
  console.log('⭐ Creating reviews...');
  await pool.query(
    `INSERT INTO reviews (order_id,karinderya_id,user_id,customer_name,rating,comment) VALUES ($1,$2,$3,$4,$5,$6)`,
    [orderId1, k1Id, c1Id, 'Maria Dela Cruz', 5, 'Sobrang sarap! Parang lutong bahay talaga. Will definitely order again!']
  );
  await pool.query(
    `INSERT INTO reviews (order_id,karinderya_id,user_id,customer_name,rating,comment) VALUES ($1,$2,$3,$4,$5,$6)`,
    [orderId2, k2Id, c2Id, 'Juan Reyes', 4, 'Masarap at mabilis ang delivery. Sulit na sulit!']
  );
  console.log('   ✅ Reviews created!\n');

  console.log('🎉 Setup complete! Demo data summary:');
  console.log('   👤 Users: 1 admin, 2 owners (nena@, bebang@, pedro@), 2 customers (maria@, juan@)');
  console.log('   🍽️  Restaurants: 4 APPROVED + 1 PENDING');
  console.log('   🍴 Menu items: 37 products across all restaurants');
  console.log('   📦 Orders: 2 sample orders');
  console.log('   ⭐ Reviews: 2 reviews');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:    admin@karinderyako.com  / admin123');
  console.log('   Owner 1:  nena@karinderyako.com   / owner123');
  console.log('   Owner 2:  bebang@karinderyako.com / owner123');
  console.log('   Customer: maria@example.com       / customer123');
}

setup().catch(e => {
  console.error('❌ Setup error:', e.message);
  process.exit(1);
}).finally(() => pool.end());
