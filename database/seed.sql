-- =========================================
-- AI FINANCIAL ADVISOR
-- FINAL CLEAN SEED (NO CURRENCY)
-- 6-MONTH ML DATASET
-- =========================================



-- =========================================
-- 1. USERS
-- =========================================

INSERT INTO users (business_name, owner_name, email, password_hash)
VALUES
('TechNova Solutions', 'Aarav Mehta', 'aarav@technova.com', 'hash1'),
('StyleHub Fashion', 'Meera Shah', 'meera@stylehub.com', 'hash2'),
('FreshBite Foods', 'Rohan Desai', 'rohan@freshbite.com', 'hash3'),
('UrbanMart Retail', 'Kunal Verma', 'kunal@urbanmart.com', 'hash4'),
('EduSphere Academy', 'Priya Nair', 'priya@edusphere.com', 'hash5'),
('AutoDrive Services', 'Vikram Joshi', 'vikram@autodrive.com', 'hash6');



-- =========================================
-- 2. DEPARTMENTS
-- =========================================

INSERT INTO departments (user_id, department_name, department_type_id)
VALUES
(1,'Development',3),(1,'Marketing',2),(1,'Support',4),
(2,'Retail Ops',3),(2,'Advertising',2),(2,'Finance',5),
(3,'Kitchen Ops',3),(3,'Delivery',1),(3,'Admin',4),
(4,'Sales',1),(4,'Marketing',2),(4,'Inventory',3),
(5,'Courses',3),(5,'Digital Marketing',2),(5,'Support',4),
(6,'Operations',3),(6,'Customer Growth',2),(6,'Finance',5);



-- =========================================
-- 3. EXPENSE CATEGORIES
-- =========================================

INSERT INTO expense_categories (user_id, category_name, category_type)
VALUES
(1,'Cloud Hosting','operational'),
(1,'Ads Spend','variable'),
(2,'Instagram Ads','growth_marketing'),
(2,'Store Rent','fixed'),
(3,'Food Supply','operational'),
(3,'Fuel','variable'),
(4,'Inventory','operational'),
(5,'Servers','fixed'),
(6,'Maintenance','operational');



-- =========================================
-- 4. EXPENSES (ML TRAINING DATA)
-- =========================================

INSERT INTO expenses (
user_id, department_id, category_id,
title, description, amount,
payment_method, transaction_type,
expense_date, is_recurring, recurring_frequency
)
VALUES

-- TECHNOVA
(1,1,1,'AWS Cloud','Hosting',15000,'credit_card','essential','2026-01-01',true,'monthly'),
(1,2,2,'Google Ads','Marketing',8000,'upi','non_essential','2026-01-05',false,NULL),
(1,3,1,'Support Tools','Helpdesk',5000,'debit_card','essential','2026-02-01',true,'monthly'),
(1,1,1,'GitHub','Dev tools',3000,'credit_card','essential','2026-02-05',true,'monthly'),
(1,2,2,'LinkedIn Ads','Hiring',6000,'upi','non_essential','2026-02-10',false,NULL),
(1,1,1,'DB Hosting','Database',11000,'credit_card','essential','2026-03-05',true,'monthly'),
(1,3,1,'CRM Tool','Customer mgmt',7000,'debit_card','essential','2026-03-10',true,'monthly'),
(1,1,1,'Cloud Scaling','Upgrade',18000,'credit_card','essential','2026-04-01',true,'monthly'),
(1,2,2,'Meta Ads','Campaign',9000,'upi','non_essential','2026-04-05',false,NULL),
(1,3,1,'Security Tools','Firewall',6000,'debit_card','essential','2026-04-10',true,'monthly'),
(1,1,1,'API Services','Integrations',4000,'credit_card','essential','2026-05-01',true,'monthly'),
(1,2,2,'Recruitment Ads','Hiring',5000,'upi','non_essential','2026-05-10',false,NULL),
(1,1,1,'Data Backup','Storage',4500,'credit_card','essential','2026-05-15',true,'monthly'),
(1,3,1,'Monitoring Tool','System health',3500,'debit_card','essential','2026-05-20',true,'monthly'),
(1,2,2,'Brand Campaign','Awareness',7500,'upi','non_essential','2026-06-01',false,NULL),
(1,1,1,'Server Upgrade','Infra',20000,'credit_card','essential','2026-06-05',true,'monthly'),

-- STYLEHUB
(2,4,4,'Mall Rent','Rent',50000,'bank_transfer','essential','2026-01-01',true,'monthly'),
(2,5,3,'Instagram Ads','Marketing',12000,'upi','non_essential','2026-01-04',false,NULL),
(2,4,4,'POS System','Billing',6000,'credit_card','essential','2026-02-10',true,'monthly'),
(2,5,3,'Influencer','Branding',15000,'upi','non_essential','2026-02-05',false,NULL),
(2,4,4,'Store Renovation','Interior',30000,'bank_transfer','essential','2026-03-01',false,NULL),
(2,5,3,'Google Ads','Campaign',14000,'upi','non_essential','2026-03-10',false,NULL),
(2,4,4,'Staff Salary','Payroll',45000,'bank_transfer','essential','2026-04-01',true,'monthly'),
(2,5,3,'Influencer Collab','Promo',20000,'upi','non_essential','2026-05-01',false,NULL),
(2,4,4,'Inventory Stock','Goods',55000,'bank_transfer','essential','2026-05-10',false,NULL),
(2,5,3,'Season Ads','Sales push',16000,'upi','non_essential','2026-06-01',false,NULL),
(2,4,4,'Logistics','Transport',10000,'cash','essential','2026-06-05',false,NULL),
(2,5,3,'Festival Campaign','Marketing',18000,'upi','non_essential','2026-06-10',false,NULL),
(2,4,4,'Warehouse Rent','Storage',42000,'bank_transfer','essential','2026-06-15',true,'monthly'),
(2,5,3,'Online Ads','Digital',13000,'upi','non_essential','2026-06-18',false,NULL),
(2,4,4,'Staff Bonus','Incentive',22000,'bank_transfer','essential','2026-06-20',false,NULL),

-- FRESHBITE
(3,7,5,'Vegetables','Supply',20000,'cash','essential','2026-01-02',true,'daily'),
(3,8,6,'Fuel','Delivery',6000,'cash','essential','2026-01-05',false,NULL),
(3,7,5,'Gas','Cooking',4000,'cash','essential','2026-01-10',true,'monthly'),
(3,7,5,'Bulk Veg','Supply',25000,'cash','essential','2026-03-02',true,'weekly'),
(3,7,5,'Spices','Kitchen',7000,'cash','essential','2026-02-01',true,'monthly'),
(3,8,6,'Packaging','Boxes',5000,'cash','essential','2026-02-05',false,NULL),
(3,7,5,'Market Supply','Stock',26000,'cash','essential','2026-04-01',true,'weekly'),
(3,8,6,'Vehicle Repair','Maintenance',8000,'cash','non_essential','2026-05-01',false,NULL),
(3,7,5,'Cold Storage','Electricity',9000,'cash','essential','2026-05-05',true,'monthly'),
(3,8,6,'Delivery Fee','Commission',3000,'cash','non_essential','2026-06-01',false,NULL),
(3,7,5,'Raw Material','Food prep',12000,'cash','essential','2026-06-05',false,NULL),
(3,8,6,'Staff Food','Allowance',4000,'cash','essential','2026-06-10',false,NULL),
(3,7,5,'Meat Supply','Stock',15000,'cash','essential','2026-06-12',false,NULL),
(3,8,6,'Delivery App','Platform fee',3500,'cash','non_essential','2026-06-14',false,NULL),
(3,7,5,'Kitchen Tools','Equipment',6000,'cash','essential','2026-06-16',false,NULL),
(3,8,6,'Cleaning','Hygiene',3000,'cash','essential','2026-06-18',false,NULL),
(3,7,5,'Oil Supply','Cooking',8000,'cash','essential','2026-06-20',false,NULL),
(3,8,6,'Misc','Operations',2000,'cash','non_essential','2026-06-22',false,NULL);

-- URBANMART
(4,10,NULL,'Store Rent','Rent',60000,'bank_transfer','essential','2026-01-01',true,'monthly'),
(4,11,NULL,'Facebook Ads','Marketing',15000,'upi','non_essential','2026-01-05',true,'monthly'),
(4,12,NULL,'Inventory Stock','Goods',90000,'upi','essential','2026-01-10',false,NULL),
(4,12,NULL,'Warehouse Rent','Storage',40000,'bank_transfer','essential','2026-02-01',true,'monthly'),
(4,11,NULL,'Instagram Ads','Campaign',16000,'upi','non_essential','2026-03-01',false,NULL),
(4,10,NULL,'Staff Bonus','Incentive',25000,'bank_transfer','essential','2026-04-01',false,NULL),
(4,12,NULL,'Security','Guard',12000,'cash','essential','2026-05-01',true,'monthly'),
(4,11,NULL,'Season Ads','Promo',18000,'upi','non_essential','2026-05-10',false,NULL),
(4,12,NULL,'Stock Purchase','Inventory',95000,'upi','essential','2026-06-01',false,NULL),
(4,10,NULL,'Logistics','Transport',14000,'cash','essential','2026-06-05',false,NULL),
(4,11,NULL,'Digital Ads','Growth',20000,'upi','non_essential','2026-06-10',false,NULL),
(4,12,NULL,'Packaging','Operations',8000,'cash','essential','2026-06-12',false,NULL),
(4,10,NULL,'Utilities','Electricity',11000,'cash','essential','2026-06-14',false,NULL),
(4,11,NULL,'Influencer Ads','Branding',22000,'upi','non_essential','2026-06-16',false,NULL),
(4,12,NULL,'Repair','Maintenance',9000,'cash','essential','2026-06-18',false,NULL),
(4,10,NULL,'Staff Salary','Payroll',50000,'bank_transfer','essential','2026-06-20',true,'monthly'),
(4,11,NULL,'Online Ads','E-commerce',17000,'upi','non_essential','2026-06-22',false,NULL),
(4,12,NULL,'Misc Ops','Operations',6000,'cash','non_essential','2026-06-24',false,NULL);

-- EDUSPHERE
(5,13,NULL,'Hosting','Platform',20000,'credit_card','essential','2026-01-01',true,'monthly'),
(5,14,NULL,'Ads','Marketing',25000,'upi','non_essential','2026-01-03',true,'monthly'),
(5,15,NULL,'Salaries','Staff',40000,'bank_transfer','essential','2026-01-10',true,'monthly'),
(5,13,NULL,'Platform Upgrade','Server',22000,'credit_card','essential','2026-02-01',true,'monthly'),
(5,14,NULL,'YouTube Ads','Campaign',18000,'upi','non_essential','2026-03-01',false,NULL),
(5,15,NULL,'Teacher Salary','Payroll',60000,'bank_transfer','essential','2026-04-01',true,'monthly'),
(5,13,NULL,'Zoom License','Tools',8000,'credit_card','essential','2026-05-01',true,'monthly'),
(5,14,NULL,'Webinars','Events',12000,'upi','non_essential','2026-05-10',false,NULL),
(5,15,NULL,'Content Team','Staff',30000,'bank_transfer','essential','2026-06-01',true,'monthly'),
(5,13,NULL,'Hosting Upgrade','Infra',25000,'credit_card','essential','2026-06-05',true,'monthly'),
(5,14,NULL,'Marketing Push','Ads',20000,'upi','non_essential','2026-06-10',false,NULL),
(5,15,NULL,'Course Materials','Content',15000,'bank_transfer','essential','2026-06-12',false,NULL),
(5,13,NULL,'Server Backup','Data',9000,'credit_card','essential','2026-06-14',true,'monthly'),
(5,14,NULL,'SEO Tools','Growth',11000,'upi','non_essential','2026-06-16',false,NULL),
(5,15,NULL,'Freelancers','Support',18000,'bank_transfer','essential','2026-06-18',false,NULL),
(5,13,NULL,'Platform Security','Infra',14000,'credit_card','essential','2026-06-20',true,'monthly'),(5,14,NULL,'Brand Ads','Awareness',16000,'upi','non_essential','2026-06-22',false,NULL);

-- AUTODRIVE
(6,16,NULL,'Garage Rent','Facility',30000,'bank_transfer','essential','2026-01-01',true,'monthly'),
(6,17,NULL,'Ads','Marketing',12000,'upi','non_essential','2026-01-04',true,'monthly'),
(6,18,NULL,'Repair','Maintenance',25000,'cash','essential','2026-01-10',false,NULL),
(6,16,NULL,'Spare Parts','Inventory',15000,'cash','essential','2026-02-01',false,NULL),
(6,17,NULL,'Google Ads','Lead gen',10000,'upi','non_essential','2026-03-01',true,'monthly'),
(6,18,NULL,'Mechanic Salary','Staff',30000,'bank_transfer','essential','2026-04-01',true,'monthly'),
(6,16,NULL,'Equipment','Tools',20000,'cash','essential','2026-05-01',false,NULL),
(6,17,NULL,'Instagram Ads','Growth',14000,'upi','non_essential','2026-05-10',false,NULL),
(6,18,NULL,'Workshop Upgrade','Infra',18000,'cash','essential','2026-06-01',false,NULL),
(6,16,NULL,'Vehicle Parts','Stock',22000,'cash','essential','2026-06-05',false,NULL),
(6,17,NULL,'Digital Ads','Marketing',16000,'upi','non_essential','2026-06-10',false,NULL),
(6,18,NULL,'Insurance','Safety',12000,'bank_transfer','essential','2026-06-12',true,'yearly'),
(6,16,NULL,'Fuel Supply','Operations',9000,'cash','essential','2026-06-14',false,NULL),
(6,17,NULL,'Local Ads','Promotion',8000,'upi','non_essential','2026-06-16',false,NULL),
(6,18,NULL,'Staff Bonus','Incentive',20000,'bank_transfer','essential','2026-06-18',false,NULL),
(6,16,NULL,'Cleaning','Maintenance',5000,'cash','essential','2026-06-20',false,NULL);



-- =========================================
-- 5. REVENUE (6 MONTH TREND)
-- =========================================

INSERT INTO revenue (user_id, department_id, source, description, amount, revenue_date)
VALUES

(1,1,'Services','Revenue',120000,'2026-01-10'),
(1,1,'Services','Revenue',125000,'2026-02-10'),
(1,1,'Services','Revenue',132000,'2026-03-10'),
(1,1,'Services','Revenue',140000,'2026-04-10'),
(1,1,'Services','Revenue',148000,'2026-05-10'),
(1,1,'Services','Revenue',155000,'2026-06-10'),

(2,4,'Retail','Revenue',90000,'2026-01-10'),
(2,4,'Retail','Revenue',85000,'2026-02-10'),
(2,4,'Retail','Revenue',110000,'2026-03-10'),
(2,4,'Retail','Revenue',140000,'2026-04-10'),
(2,4,'Retail','Revenue',160000,'2026-05-10'),
(2,4,'Retail','Revenue',150000,'2026-06-10'),

(3,7,'Food','Revenue',80000,'2026-01-10'),
(3,7,'Food','Revenue',82000,'2026-02-10'),
(3,7,'Food','Revenue',85000,'2026-03-10'),
(3,7,'Food','Revenue',87000,'2026-04-10'),
(3,7,'Food','Revenue',90000,'2026-05-10'),
(3,7,'Food','Revenue',92000,'2026-06-10'),

(4,10,'Retail','Revenue',100000,'2026-01-10'),
(4,10,'Retail','Revenue',105000,'2026-02-10'),
(4,10,'Retail','Revenue',110000,'2026-03-10'),
(4,10,'Retail','Revenue',120000,'2026-04-10'),
(4,10,'Retail','Revenue',130000,'2026-05-10'),
(4,10,'Retail','Revenue',145000,'2026-06-10'),

(5,13,'Education','Revenue',110000,'2026-01-10'),
(5,13,'Education','Revenue',120000,'2026-02-10'),
(5,13,'Education','Revenue',130000,'2026-03-10'),
(5,13,'Education','Revenue',145000,'2026-04-10'),
(5,13,'Education','Revenue',160000,'2026-05-10'),
(5,13,'Education','Revenue',175000,'2026-06-10'),

(6,16,'Services','Revenue',95000,'2026-01-10'),
(6,16,'Services','Revenue',98000,'2026-02-10'),
(6,16,'Services','Revenue',100000,'2026-03-10'),
(6,16,'Services','Revenue',102000,'2026-04-10'),
(6,16,'Services','Revenue',105000,'2026-05-10'),
(6,16,'Services','Revenue',108000,'2026-06-10');



-- =========================================
-- 6. BUDGETS (6 MONTH PLANNING)
-- =========================================

INSERT INTO budgets (user_id, department_id, budget_month, budget_year, amount)
VALUES

(1,1,1,2026,200000),(1,1,2,2026,205000),(1,1,3,2026,210000),
(1,1,4,2026,215000),(1,1,5,2026,220000),(1,1,6,2026,230000),

(2,4,1,2026,150000),(2,4,2,2026,155000),(2,4,3,2026,160000),
(2,4,4,2026,180000),(2,4,5,2026,200000),(2,4,6,2026,210000),

(3,7,1,2026,100000),(3,7,2,2026,102000),(3,7,3,2026,105000),
(3,7,4,2026,108000),(3,7,5,2026,110000),(3,7,6,2026,115000),

(4,10,1,2026,180000),(4,10,2,2026,185000),(4,10,3,2026,190000),
(4,10,4,2026,200000),(4,10,5,2026,210000),(4,10,6,2026,220000),

(5,13,1,2026,160000),(5,13,2,2026,165000),(5,13,3,2026,170000),
(5,13,4,2026,180000),(5,13,5,2026,190000),(5,13,6,2026,200000),

(6,16,1,2026,140000),(6,16,2,2026,142000),(6,16,3,2026,145000),
(6,16,4,2026,148000),(6,16,5,2026,150000),(6,16,6,2026,155000);