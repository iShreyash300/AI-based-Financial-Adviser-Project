-- =========================================
-- AI FINANCIAL ADVISOR SEED DATA (6 MONTHS)
-- =========================================

-- =========================================
-- 1. USERS
-- =========================================

INSERT INTO users (business_name, owner_name, email, password_hash)
VALUES
('NovaTech Solutions', 'Aarav Mehta', 'aarav@novatech.com', 'hash1'),
('BrightMart Retail', 'Ishita Sharma', 'ishita@brightmart.com', 'hash2'),
('UrbanHive Agency', 'Rohan Patel', 'rohan@urbanhive.com', 'hash3'),
('GreenLeaf Foods', 'Meera Joshi', 'meera@greenleaf.com', 'hash4'),
('Skyline Logistics', 'Kunal Verma', 'kunal@skyline.com', 'hash5');


-- =========================================
-- 2. DEPARTMENTS (PER USER)
-- =========================================

INSERT INTO departments (user_id, department_type_id, department_name)
VALUES
-- User 1
(1, 1, 'Sales'),
(1, 2, 'Marketing'),
(1, 3, 'Operations'),
(1, 5, 'Finance'),

-- User 2
(2, 1, 'Retail Sales'),
(2, 2, 'Digital Marketing'),
(2, 3, 'Operations'),
(2, 4, 'Customer Support'),

-- User 3
(3, 2, 'Marketing'),
(3, 1, 'Sales'),
(3, 3, 'Operations'),
(3, 5, 'Finance'),

-- User 4
(4, 1, 'Sales'),
(4, 3, 'Production'),
(4, 5, 'Finance'),
(4, 4, 'Support'),

-- User 5
(5, 3, 'Logistics Ops'),
(5, 1, 'Client Sales'),
(5, 2, 'Marketing'),
(5, 5, 'Finance');


-- =========================================
-- 3. EXPENSE CATEGORIES (already inserted in schema)
-- =========================================


-- =========================================
-- 4. RANDOMIZED EXPENSES (6 MONTHS)
-- =========================================

-- USER 1 (15 expenses)
INSERT INTO expenses (user_id, department_id, category_id, title, amount, payment_method, expense_date, recurring_frequency)
VALUES
(1,1,1,'Meta Ads Campaign',12000,'upi','2026-01-10','monthly'),
(1,2,2,'AWS Hosting',8000,'bank_transfer','2026-01-15','monthly'),
(1,3,4,'Fuel Logistics',3000,'cash','2026-02-05','weekly'),
(1,1,6,'Staff Salaries',45000,'bank_transfer','2026-02-28','monthly'),
(1,2,9,'SaaS Tools',5000,'credit_card','2026-03-12','monthly'),
(1,3,5,'Machine Repair',7000,'cash','2026-03-20','one_time'),
(1,2,1,'Google Ads',15000,'upi','2026-04-10','monthly'),
(1,1,6,'Payroll',47000,'bank_transfer','2026-04-28','monthly'),
(1,3,8,'Inventory Purchase',20000,'upi','2026-05-05','variable'),
(1,2,2,'Cloud Upgrade',9000,'bank_transfer','2026-05-15','monthly'),
(1,1,4,'Office Fuel',2500,'cash','2026-05-20','weekly'),
(1,3,5,'Maintenance',6000,'cash','2026-06-10','one_time'),
(1,2,1,'Ad Scaling',18000,'upi','2026-06-18','monthly'),
(1,1,6,'Salary Bonus',50000,'bank_transfer','2026-06-28','monthly'),
(1,3,9,'Software Licenses',4000,'credit_card','2026-06-30','monthly'),

-- USER 2 (15 expenses)
(2,5,6,'Retail Salaries',38000,'bank_transfer','2026-01-31','monthly'),
(2,6,1,'Instagram Ads',10000,'upi','2026-02-10','monthly'),
(2,7,2,'Shop Hosting POS',6000,'credit_card','2026-02-15','monthly'),
(2,8,5,'Store Rent',25000,'bank_transfer','2026-02-28','monthly'),
(2,5,4,'Fuel Delivery',3200,'cash','2026-03-05','weekly'),
(2,6,1,'Google Campaign',14000,'upi','2026-03-10','monthly'),
(2,7,9,'Software CRM',4500,'credit_card','2026-03-20','monthly'),
(2,8,5,'Warehouse Rent',26000,'bank_transfer','2026-04-01','monthly'),
(2,5,6,'Payroll',40000,'bank_transfer','2026-04-28','monthly'),
(2,6,1,'Festive Ads',20000,'upi','2026-05-10','monthly'),
(2,7,2,'Cloud Billing',7000,'credit_card','2026-05-15','monthly'),
(2,8,8,'Stock Purchase',22000,'upi','2026-05-25','variable'),
(2,5,4,'Fuel',3500,'cash','2026-06-05','weekly'),
(2,6,1,'Ad Boost',16000,'upi','2026-06-10','monthly'),
(2,7,9,'Subscriptions',5000,'credit_card','2026-06-18','monthly'),
(2,8,5,'Rent',27000,'bank_transfer','2026-06-28','monthly'),

-- USER 3 (12 expenses)
(3,9,1,'Brand Ads',13000,'upi','2026-01-12','monthly'),
(3,10,6,'Employee Payroll',42000,'bank_transfer','2026-02-28','monthly'),
(3,11,2,'Cloud Services',7000,'credit_card','2026-03-15','monthly'),
(3,12,5,'Office Rent',24000,'bank_transfer','2026-04-01','monthly'),
(3,9,1,'Campaign Boost',17000,'upi','2026-05-10','monthly'),
(3,10,4,'Transport Fuel',2800,'cash','2026-06-05','weekly'),
(3,11,9,'SaaS Tools',4500,'credit_card','2026-06-15','monthly'),
(3,12,5,'Warehouse Rent',26000,'bank_transfer','2026-06-25','monthly'),
(3,9,1,'Ad Scaling',19000,'upi','2026-06-30','monthly'),
(3,10,6,'Bonus',5000,'bank_transfer','2026-06-30','monthly'),
(3,11,2,'Cloud Upgrade',8000,'credit_card','2026-06-30','monthly'),
(3,12,5,'Rent',27000,'bank_transfer','2026-06-30','monthly'),



-- USER 4 (17 expenses)
(4,13,6,'Production Salary',39000,'bank_transfer','2026-01-28','monthly'),
(4,14,8,'Raw Material',21000,'upi','2026-02-10','variable'),
(4,15,5,'Finance Tools',5000,'credit_card','2026-03-18','monthly'),
(4,16,4,'Delivery Fuel',3000,'cash','2026-04-22','weekly'),
(4,13,6,'Payroll',41000,'bank_transfer','2026-05-28','monthly'),
(4,14,8,'Material Purchase',22000,'upi','2026-06-05','variable'),
(4,15,5,'Software Licenses',4500,'credit_card','2026-06-15','monthly'),
(4,16,4,'Fuel',3200,'cash','2026-06-25','weekly'),
(4,13,6,'Salary Bonus',5000,'bank_transfer','2026-06-30','monthly'),
(4,14,8,'Raw Material',23000,'upi','2026-06-30','variable'),
(4,15,5,'Finance Tools',5500,'credit_card','2026-06-30','monthly'),
(4,16,4,'Delivery Fuel',3500,'cash','2026-06-30','weekly'),
(4,13,6,'Salary Advance',3000,'bank_transfer','2026-01-15','one_time'),
(4,14,8,'Packaging Material',8500,'cash','2026-01-25','variable'),
(4,15,5,'Audit Fee',6000,'bank_transfer','2026-02-20','one_time'),
(4,16,4,'Vehicle Maintenance',4200,'cash','2026-03-12','one_time'),
(4,13,6,'Staff Incentive',7500,'upi','2026-04-10','one_time'),


-- USER 5 (10 expenses)
(5,17,2,'Logistics Software',6000,'credit_card','2026-01-15','monthly'),
(5,18,6,'Driver Salary',37000,'bank_transfer','2026-02-28','monthly'),
(5,19,1,'Client Ads',15000,'upi','2026-03-10','monthly'),
(5,20,4,'Fuel Trucks',5000,'cash','2026-04-05','weekly'),
(5,17,5,'Warehouse Rent',26000,'bank_transfer','2026-05-01','monthly'),
(5,18,6,'Payroll',39000,'bank_transfer','2026-05-28','monthly'),
(5,19,8,'Equipment Purchase',18500,'upi','2026-06-10','variable'),
(5,20,4,'Vehicle Maintenance',4200,'cash','2026-06-15','one_time'),
(5,17,9,'SaaS Tracking Tools',7500,'credit_card','2026-06-20','monthly'),
(5,18,6,'Salary Bonus',4500,'bank_transfer','2026-06-30','monthly'),


-- =========================================
-- 5. REVENUE (SEASONAL + GROWTH TREND)
-- =========================================

INSERT INTO revenue (user_id, department_id, source, amount, revenue_date)
VALUES


-- USER 1 (SaaS / Tech - volatile growth)
(1,1,'Product Sales',64200,'2026-01-31'),
(1,1,'Product Sales',71850,'2026-02-28'),
(1,1,'Product Sales',69020,'2026-03-31'),
(1,1,'Product Sales',91500,'2026-04-30'),
(1,1,'Product Sales',107300,'2026-05-31'),
(1,1,'Product Sales',123800,'2026-06-30'),

-- USER 2 (Retail - seasonal + festival spikes)
(2,5,'Retail Sales',53800,'2026-01-31'),
(2,5,'Retail Sales',61200,'2026-02-28'),
(2,5,'Retail Sales',57450,'2026-03-31'),
(2,5,'Retail Sales',79200,'2026-04-30'),  -- festive boost
(2,5,'Retail Sales',81500,'2026-05-31'),
(2,5,'Retail Sales',93400,'2026-06-30'),

-- USER 3 (Agency / Service Contracts - stable but fluctuating)
(3,9,'Service Contracts',70500,'2026-01-31'),
(3,9,'Service Contracts',74200,'2026-02-28'),
(3,9,'Service Contracts',71800,'2026-03-31'),
(3,9,'Service Contracts',86100,'2026-04-30'),
(3,9,'Service Contracts',89750,'2026-05-31'),
(3,9,'Service Contracts',103900,'2026-06-30'),

-- USER 4 (Food business - demand + weather sensitivity)
(4,13,'Food Sales',58800,'2026-01-31'),
(4,13,'Food Sales',66200,'2026-02-28'),
(4,13,'Food Sales',61500,'2026-03-31'),
(4,13,'Food Sales',84200,'2026-04-30'),  -- summer spike
(4,13,'Food Sales',87300,'2026-05-31'),
(4,13,'Food Sales',99750,'2026-06-30'),

-- USER 5 (Logistics - fuel + demand shocks)
(5,17,'Logistics Services',76800,'2026-01-31'),
(5,17,'Logistics Services',79200,'2026-02-28'),
(5,17,'Logistics Services',77400,'2026-03-31'),
(5,17,'Logistics Services',94800,'2026-04-30'),
(5,17,'Logistics Services',111200,'2026-05-31'),
(5,17,'Logistics Services',126500,'2026-06-30');


-- =========================================
-- 6. BUDGETS (REALISTIC + CONTROLLED VARIATION)
-- =========================================

INSERT INTO budgets (user_id, department_id, budget_month, budget_year, amount)
VALUES

-- USER 1 (Tech SaaS - aggressive scaling budgets)
(1,1,1,2026,79500),
(1,1,2,2026,84200),
(1,1,3,2026,91800),
(1,1,4,2026,96300),
(1,1,5,2026,101500),
(1,1,6,2026,109800),

-- USER 2 (Retail - seasonal optimism)
(2,5,1,2026,60200),
(2,5,2,2026,64850),
(2,5,3,2026,70300),
(2,5,4,2026,76800),   -- festive expectation boost
(2,5,5,2026,81200),
(2,5,6,2026,84600),

-- USER 3 (Agency - stable planned growth)
(3,9,1,2026,74200),
(3,9,2,2026,79800),
(3,9,3,2026,85300),
(3,9,4,2026,89200),
(3,9,5,2026,95800),
(3,9,6,2026,100600),

-- USER 4 (Food business - cost sensitive planning)
(4,13,1,2026,64200),
(4,13,2,2026,70500),
(4,13,3,2026,74800),
(4,13,4,2026,81200),
(4,13,5,2026,85600),
(4,13,6,2026,90200),

-- USER 5 (Logistics - fuel & demand adjusted)
(5,17,1,2026,81200),
(5,17,2,2026,84500),
(5,17,3,2026,89700),
(5,17,4,2026,95200),
(5,17,5,2026,100400),
(5,17,6,2026,110800);