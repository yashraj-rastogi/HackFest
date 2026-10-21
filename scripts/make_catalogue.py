import json
import os

os.makedirs('src/catalogue', exist_ok=True)

kirana_items = [
    # Staples (15)
    ('sugar', 'staples', '🍬', 'चीनी', 'Sugar', 'Cheeni', ['shakkar', 'sakkar', 'sugar', 'cheeni', 'meetha'], 'g', 1000, [250, 500, 1000, 2000, 5000], 5000, 50000),
    ('atta_sharbati', 'staples', '🌾', 'आटा (शरबती)', 'Wheat Flour (Atta)', 'Atta Sharbati', ['aata', 'atta', 'gehu ka aata', 'wheat flour'], 'g', 5000, [1000, 2000, 5000, 10000], 10000, 50000),
    ('atta_chakki', 'staples', '🌾', 'चक्की आटा', 'Chakki Atta', 'Chakki Atta', ['chakki aata', 'aashirvaad aata', 'atta'], 'g', 5000, [1000, 2000, 5000, 10000], 10000, 50000),
    ('maida', 'staples', '🍚', 'मैदा', 'All Purpose Flour (Maida)', 'Maida', ['refined flour', 'maida'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('sooji', 'staples', '🌾', 'सूजी / रवा', 'Semolina (Sooji)', 'Sooji Rawa', ['suji', 'rawa', 'rava', 'semolina'], 'g', 500, [250, 500, 1000], 2000, 20000),
    ('besan', 'staples', '🟡', 'बेसन', 'Gram Flour (Besan)', 'Besan', ['chana aata', 'besan', 'gram flour'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('rice_basmati', 'staples', '🍚', 'बासमती चावल', 'Basmati Rice', 'Basmati Chawal', ['basmati chawal', 'rice', 'chawal'], 'g', 1000, [500, 1000, 2000, 5000], 5000, 30000),
    ('rice_kolam', 'staples', '🍚', 'कोलम चावल', 'Kolam / Regular Rice', 'Kolam Chawal', ['kolam chawal', 'chawal', 'regular rice'], 'g', 1000, [1000, 2000, 5000, 10000], 10000, 50000),
    ('poha', 'staples', '🥣', 'पोहा', 'Flattened Rice (Poha)', 'Poha', ['chuda', 'chivda', 'poha', 'aval'], 'g', 500, [250, 500, 1000], 2000, 20000),
    ('sabudana', 'staples', '⚪', 'साबूदाना', 'Tapioca Pearls (Sabudana)', 'Sabudana', ['sago', 'sabudana', 'vrat ka chawal'], 'g', 500, [250, 500, 1000], 1500, 15000),
    ('salt_tata', 'staples', '🧂', 'टाटा नमक', 'Tata Salt', 'Tata Namak', ['namak', 'salt', 'tata namak'], 'g', 1000, [1000, 2000], 4000, 25000),
    ('salt_sendha', 'staples', '🧂', 'सेंधा नमक', 'Rock Salt (Sendha Namak)', 'Sendha Namak', ['rock salt', 'lahori namak', 'vrat namak'], 'g', 500, [250, 500, 1000], 1000, 10000),
    ('salt_kala', 'staples', '🧂', 'काला नमक', 'Black Salt', 'Kala Namak', ['black salt', 'kala namak'], 'g', 250, [100, 250, 500], 500, 5000),
    ('jaggery_gur', 'staples', '🟤', 'गुड़', 'Jaggery (Gur)', 'Gud', ['gur', 'gud', 'jaggery'], 'g', 1000, [500, 1000, 2000], 3000, 20000),
    ('dalia', 'staples', '🌾', 'दलिया', 'Broken Wheat (Dalia)', 'Daliya', ['dalia', 'broken wheat', 'lapsi'], 'g', 500, [250, 500, 1000], 1500, 15000),

    # Oil & Ghee (10)
    ('mustard_oil', 'oil_ghee', '🟡', 'सरसों का तेल', 'Mustard Oil', 'Sarson Tel', ['sarson tel', 'mustard oil', 'kachi ghani'], 'ml', 1000, [500, 1000, 2000, 5000], 5000, 15000),
    ('refined_oil_fortune', 'oil_ghee', '🌻', 'रिफाइंड तेल (फॉर्च्यून)', 'Refined Sunflower Oil', 'Refined Tel Fortune', ['refined tel', 'sunflower oil', 'fortune oil'], 'ml', 1000, [500, 1000, 2000, 5000], 5000, 15000),
    ('soyabean_oil', 'oil_ghee', '🌱', 'सोयाबीन तेल', 'Soyabean Oil', 'Soyabean Tel', ['soyabean oil', 'tel'], 'ml', 1000, [1000, 2000, 5000], 3000, 15000),
    ('groundnut_oil', 'oil_ghee', '🥜', 'मूंगफली तेल', 'Groundnut Oil', 'Moongphali Tel', ['peanut oil', 'groundnut oil', 'sing tel'], 'ml', 1000, [1000, 2000, 5000], 2000, 15000),
    ('desi_ghee_amul', 'oil_ghee', '🧈', 'अमूल देसी घी', 'Amul Desi Ghee', 'Amul Desi Ghee', ['amul ghee', 'ghee', 'desi ghee'], 'ml', 1000, [200, 500, 1000], 2000, 12000),
    ('desi_ghee_patanjali', 'oil_ghee', '🧈', 'पतंजलि गाय घी', 'Patanjali Cow Ghee', 'Patanjali Cow Ghee', ['patanjali ghee', 'cow ghee', 'ghee'], 'ml', 1000, [200, 500, 1000], 2000, 12000),
    ('dalda_vanaspati', 'oil_ghee', '🥫', 'डालडा वनस्पति', 'Vanaspati Ghee (Dalda)', 'Dalda Ghee', ['dalda', 'vanaspati'], 'ml', 500, [500, 1000], 1000, 10000),
    ('til_oil', 'oil_ghee', '🪔', 'तिल का तेल (पूजा)', 'Sesame / Puja Oil', 'Til Tel Puja', ['til tel', 'pooja oil', 'sesame oil'], 'ml', 500, [200, 500, 1000], 1000, 10000),
    ('coconut_oil_edible', 'oil_ghee', '🥥', 'नारियल तेल (खाने का)', 'Edible Coconut Oil', 'Nariyal Tel Khana', ['coconut oil', 'nariyal tel'], 'ml', 500, [200, 500, 1000], 1000, 10000),
    ('olive_oil', 'oil_ghee', '🫒', 'जैतून का तेल', 'Olive Oil', 'Jaitun Tel', ['olive oil', 'figaro'], 'ml', 500, [250, 500], 500, 5000),

    # Pulses & Dal (12)
    ('dal_toor', 'pulses', '🟡', 'अरहर / तूर दाल', 'Toor Dal (Arhar)', 'Arhar / Toor Dal', ['toor dal', 'arhar dal', 'tuvar dal'], 'g', 1000, [250, 500, 1000, 2000], 3000, 30000),
    ('dal_moong_dhuli', 'pulses', '🟡', 'मूंग धुली दाल', 'Moong Dal (Yellow)', 'Moong Dhuli Dal', ['moong dhuli', 'yellow moong'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('dal_moong_chilka', 'pulses', '🟢', 'मूंग छिलका दाल', 'Moong Dal Chilka', 'Moong Chilka Dal', ['moong chilka', 'green moong split'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('dal_chana', 'pulses', '🟡', 'चना दाल', 'Chana Dal', 'Chana Dal', ['chana dal', 'bengal gram dal'], 'g', 1000, [500, 1000, 2000], 3000, 30000),
    ('dal_urad_dhuli', 'pulses', '⚪', 'उड़द धुली दाल', 'Urad Dal White', 'Urad Dhuli Dal', ['urad dhuli', 'white urad'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('dal_urad_kali', 'pulses', '⚫', 'उड़द काली साबुत', 'Urad Dal Whole Black', 'Urad Kali Dal', ['urad kali', 'maa ki dal', 'black urad'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('dal_masoor_malka', 'pulses', '🟠', 'मलका मसूर दाल', 'Masoor Dal (Orange)', 'Malka Masoor Dal', ['masoor dal', 'malka dal', 'red lentil'], 'g', 1000, [500, 1000, 2000], 3000, 25000),
    ('chole_kabuli', 'pulses', '🟤', 'काबुली चना (छोले)', 'Kabuli Chana (Chickpeas)', 'Kabuli Chole', ['kabuli chana', 'chole', 'safed chana'], 'g', 1000, [500, 1000, 2000], 3000, 30000),
    ('kala_chana', 'pulses', '🟤', 'काला चना', 'Black Chana', 'Kala Chana', ['black gram', 'desi chana', 'kala chana'], 'g', 1000, [500, 1000, 2000], 3000, 30000),
    ('rajma_chitra', 'pulses', '🫘', 'राजमा चित्रा', 'Rajma Chitra (Kidney Beans)', 'Rajma Chitra', ['rajma', 'red kidney beans'], 'g', 500, [250, 500, 1000], 2000, 25000),
    ('rajma_red', 'pulses', '🫘', 'लाल राजमा (कश्मीरी)', 'Red Rajma Kashmiri', 'Lal Rajma', ['kashmiri rajma', 'red rajma'], 'g', 500, [250, 500, 1000], 1500, 20000),
    ('soya_chunks', 'pulses', '🧆', 'सोयाबीन बड़ी (Nutrela)', 'Soya Chunks Nutrela', 'Soyabean Badi', ['soya chunks', 'nutrela', 'soya badi'], 'g', 200, [100, 200, 500], 1000, 10000),

    # Spices & Condiments (15)
    ('haldi_powder', 'spices', '🟡', 'हल्दी पाउडर', 'Turmeric Powder (Haldi)', 'Haldi Powder', ['turmeric', 'haldi', 'haldi powder'], 'g', 200, [100, 200, 500], 1000, 10000),
    ('mirchi_powder', 'spices', '🔴', 'लाल मिर्च पाउडर', 'Red Chilli Powder', 'Lal Mirchi Powder', ['mirchi', 'lal mirch', 'chilli powder'], 'g', 200, [100, 200, 500], 1000, 10000),
    ('dhaniya_powder', 'spices', '🟢', 'धनिया पाउडर', 'Coriander Powder (Dhaniya)', 'Dhaniya Powder', ['dhaniya', 'coriander powder'], 'g', 200, [100, 200, 500], 1000, 10000),
    ('jeera_whole', 'spices', '🟤', 'जीरा साबुत', 'Cumin Seeds (Jeera)', 'Jeera Sabut', ['cumin', 'jeera', 'zeera'], 'g', 100, [50, 100, 250, 500], 500, 5000),
    ('garam_masala', 'spices', '🟤', 'गरम मसाला (MDH)', 'Garam Masala (MDH)', 'Garam Masala MDH', ['garam masala', 'mdh masala', 'spices'], 'g', 100, [50, 100, 250], 400, 4000),
    ('sabzi_masala', 'spices', '🟤', 'सब्ज़ी मसाला', 'Sabzi Masala', 'Sabzi Masala', ['sabji masala', 'kitchen king', 'everest'], 'g', 100, [50, 100, 200], 400, 4000),
    ('chaat_masala', 'spices', '🟤', 'चाट मसाला (Catch)', 'Chaat Masala', 'Chaat Masala Catch', ['chaat masala', 'catch masala'], 'g', 100, [50, 100], 300, 3000),
    ('hing', 'spices', '🟡', 'हींग (Catch/Bandhani)', 'Asafoetida (Hing)', 'Hing Catch', ['hing', 'asafoetida', 'bandhani hing'], 'g', 50, [25, 50, 100], 200, 2000),
    ('kali_mirch', 'spices', '⚫', 'काली मिर्च साबुत', 'Black Pepper Whole', 'Kali Mirch Sabut', ['black pepper', 'kali mirch'], 'g', 50, [25, 50, 100], 200, 2000),
    ('laung_cloves', 'spices', '🟤', 'लौंग', 'Cloves (Laung)', 'Laung Cloves', ['cloves', 'laung', 'lavang'], 'g', 50, [25, 50, 100], 200, 2000),
    ('elaichi_chhoti', 'spices', '🟢', 'छोटी इलायची (हरी)', 'Green Cardamom (Elaichi)', 'Chhoti Elaichi', ['cardamom', 'green elaichi', 'chhoti elaichi'], 'g', 25, [10, 25, 50], 100, 1000),
    ('dalchini', 'spices', '🪵', 'दालचीनी', 'Cinnamon Sticks (Dalchini)', 'Dalchini', ['cinnamon', 'dalchini'], 'g', 50, [25, 50, 100], 200, 2000),
    ('methi_dana', 'spices', '🟡', 'मेथी दाना', 'Fenugreek Seeds (Methi)', 'Methi Dana', ['methi', 'fenugreek'], 'g', 100, [50, 100, 250], 300, 3000),
    ('sarson_rai', 'spices', '⚫', 'राई / काली सरसों', 'Mustard Seeds (Rai)', 'Rai Sarson', ['rai', 'mustard seeds', 'sarson'], 'g', 100, [50, 100, 250], 300, 3000),
    ('amchur_powder', 'spices', '🟤', 'आमचूर पाउडर', 'Dry Mango Powder (Amchur)', 'Amchur Powder', ['amchur', 'dry mango powder', 'khatai'], 'g', 100, [50, 100, 200], 300, 3000),

    # Snacks & Instant (12)
    ('maggi_single', 'snacks', '🍜', 'मैगी नूडल्स (छोटा)', 'Maggi 2-Minute Noodles', 'Maggi Noodles Chhota', ['maggi', 'noodles', 'maggi packet'], 'pcs', 1, [1, 2, 4, 6, 12], 24, 96),
    ('maggi_4pack', 'snacks', '🍜', 'मैगी 4-पैक', 'Maggi 4-Pack Family', 'Maggi 4 Pack', ['maggi family pack', 'maggi 4 pack'], 'pcs', 1, [1, 2, 4], 6, 24),
    ('kurkure_masala', 'snacks', '🍿', 'कुरकुरे मसाला मंची', 'Kurkure Masala Munch', 'Kurkure Masala Munch', ['kurkure', 'namkeen', 'chips'], 'pcs', 1, [1, 2, 5, 10], 15, 60),
    ('lays_classic_salted', 'snacks', '🥔', 'लेज सॉल्टेड (नीला)', 'Lay\'s Classic Salted Blue', 'Lays Salted Blue', ['lays', 'potato chips', 'lays blue'], 'pcs', 1, [1, 2, 5, 10], 15, 60),
    ('lays_magic_masala', 'snacks', '🥔', 'लेज मैजिक मसाला (हरा)', 'Lay\'s Magic Masala Green', 'Lays Masala Green', ['lays green', 'magic masala', 'lays'], 'pcs', 1, [1, 2, 5, 10], 15, 60),
    ('bingo_mad_angles', 'snacks', '🔺', 'बिंगो मैड एंगल्स', 'Bingo Mad Angles Achaari', 'Bingo Mad Angles', ['bingo', 'mad angles', 'triangle chips'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('bhujia_haldiram', 'snacks', '🥨', 'हल्दीराम भुजिया सेव', 'Haldiram Aloo Bhujia 200g', 'Haldiram Aloo Bhujia', ['aloo bhujia', 'bhujia', 'haldiram namkeen'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('khatta_meetha_haldiram', 'snacks', '🥨', 'हल्दीराम खट्टा मीठा', 'Haldiram Khatta Meetha 200g', 'Haldiram Khatta Meetha', ['khatta meetha', 'haldiram namkeen'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('navratan_bikaji', 'snacks', '🥨', 'बीकाजी नवरतन मिक्स', 'Bikaji Navratan Mixture', 'Bikaji Navratan Mix', ['navratan mix', 'bikaji namkeen'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('moong_dal_namkeen', 'snacks', '🟡', 'हल्दीराम मूंग दाल', 'Haldiram Salted Moong Dal', 'Haldiram Moong Dal', ['moong dal namkeen', 'haldiram'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('roasted_chana_namkeen', 'snacks', '🟤', 'भुना चना (छिलका उतरा)', 'Roasted Chana Pack', 'Bhuna Chana Namkeen', ['bhuna chana', 'roasted gram'], 'g', 250, [100, 250, 500], 1000, 10000),
    ('peanut_chikki', 'snacks', '🥜', 'मूंगफली चिक्की / पट्टी', 'Peanut Chikki Bar', 'Moongphali Chikki', ['chikki', 'gud patti', 'peanut bar'], 'pcs', 1, [1, 2, 5, 10], 20, 100),

    # Biscuits & Bakery (12)
    ('parle_g_small', 'biscuits', '🍪', 'पारले-जी (₹5/₹10)', 'Parle-G Glucose Biscuit', 'Parle-G Biscuit', ['parle g', 'glucose biscuit', 'chai biscuit'], 'pcs', 1, [1, 2, 5, 10, 24], 24, 144),
    ('good_day_butter', 'biscuits', '🍪', 'गुड डे बटर (Britannia)', 'Britannia Good Day Butter', 'Good Day Butter', ['good day', 'butter biscuit', 'britannia'], 'pcs', 1, [1, 2, 5, 10], 15, 60),
    ('good_day_cashew', 'biscuits', '🍪', 'गुड डे काजू', 'Good Day Cashew', 'Good Day Kaju', ['good day kaju', 'cashew biscuit'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('marie_gold', 'biscuits', '🍪', 'मैरी गोल्ड (Britannia)', 'Britannia Marie Gold', 'Marie Gold Biscuit', ['marie gold', 'chai biscuit', 'sugar free biscuit'], 'pcs', 1, [1, 2, 5], 12, 48),
    ('monaco_salted', 'biscuits', '🍪', 'मोनाको सॉल्टेड', 'Parle Monaco Salted', 'Monaco Salted', ['monaco', 'salted biscuit'], 'pcs', 1, [1, 2, 5], 12, 48),
    ('krackjack', 'biscuits', '🍪', 'क्रैकजैक मीठा-नमकीन', 'Parle Krackjack Sweet & Salty', 'Krackjack Biscuit', ['krackjack', 'sweet salty biscuit'], 'pcs', 1, [1, 2, 5], 12, 48),
    ('oreo_vanilla', 'biscuits', '🍪', 'ओरियो वैनिला क्रीम', 'Cadbury Oreo Vanilla Cream', 'Oreo Vanilla Cream', ['oreo', 'cream biscuit', 'chocolate biscuit'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('bourbon_britannia', 'biscuits', '🍫', 'बॉर्बन चॉकलेट क्रीम', 'Britannia Bourbon Chocolate', 'Bourbon Chocolate', ['bourbon', 'chocolate cream'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('hide_and_seek', 'biscuits', '🍫', 'हाइड एंड सीक (Parle)', 'Parle Hide & Seek Choco Chip', 'Hide and Seek Biscuit', ['hide and seek', 'choco chip'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('rusk_britannia', 'biscuits', '🍞', 'टोस्ट / रस्क (Britannia)', 'Britannia Toastea Premium Rusk', 'Britannia Rusk Toast', ['rusk', 'toast', 'chai toast', 'sooji rusk'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('bread_white', 'biscuits', '🍞', 'सफेद ब्रेड (स्लाइस)', 'White Sliced Bread', 'White Bread Slice', ['bread', 'sandwich bread', 'pav bread'], 'pcs', 1, [1, 2, 3], 6, 20),
    ('cream_roll', 'biscuits', '🥐', 'क्रीम रोल (बेकरी)', 'Bakery Cream Roll', 'Bakery Cream Roll', ['cream roll', 'puff roll'], 'pcs', 1, [1, 2, 4], 10, 40),

    # Beverages & Tea/Coffee (10)
    ('tea_red_label', 'beverages', '☕', 'रेड लेबल चाय (Brooke Bond)', 'Brooke Bond Red Label Tea', 'Red Label Chai', ['chai patti', 'tea', 'red label chai'], 'g', 250, [100, 250, 500, 1000], 1000, 10000),
    ('tea_tata_tea_gold', 'beverages', '☕', 'टाटा टी गोल्ड', 'Tata Tea Gold', 'Tata Tea Gold', ['tata tea', 'tata gold', 'chai patti'], 'g', 250, [100, 250, 500], 1000, 10000),
    ('tea_taj_mahal', 'beverages', '☕', 'ताज महल चाय पत्ती', 'Taj Mahal Premium Tea', 'Taj Mahal Chai', ['taj mahal tea', 'premium tea'], 'g', 250, [100, 250, 500], 500, 5000),
    ('coffee_nescafe_pouch', 'beverages', '☕', 'नेस्कैफे कॉफी (₹2/₹10 पाउच)', 'Nescafe Classic Sachet', 'Nescafe Coffee Pouch', ['nescafe', 'coffee pouch', 'instant coffee'], 'pcs', 1, [1, 2, 5, 10, 20], 30, 120),
    ('coffee_nescafe_jar', 'beverages', '☕', 'नेस्कैफे जार 50g', 'Nescafe Classic Jar 50g', 'Nescafe Jar 50g', ['coffee jar', 'nescafe classic'], 'pcs', 1, [1, 2], 4, 16),
    ('horlicks_classic', 'beverages', '🥛', 'हॉर्लिक्स माल्ट 500g', 'Horlicks Classic Malt Refill', 'Horlicks Malt Refill', ['horlicks', 'health drink', 'malt'], 'pcs', 1, [1, 2], 4, 16),
    ('bournvita', 'beverages', '🥛', 'बॉर्नविटा चॉकलेट 500g', 'Cadbury Bournvita Jar', 'Bournvita Jar', ['bournvita', 'chocolate drink'], 'pcs', 1, [1, 2], 4, 16),
    ('roohafza', 'beverages', '🌹', 'रूह अफ़ज़ा शर्बत (Hamdard)', 'Hamdard Rooh Afza 750ml', 'Rooh Afza Sharbat', ['roohafza', 'gulab sharbat', 'summer drink'], 'ml', 750, [750, 1500], 1500, 9000),
    ('glucose_d', 'beverages', '⚡', 'ग्लूकोज-डी 500g', 'Dabur Glucose-D Orange/Regular', 'Glucose D Dabur', ['glucose d', 'glucon d', 'energy drink'], 'pcs', 1, [1, 2, 3], 6, 24),
    ('rasna_orange', 'beverages', '🍊', 'रसना ऑरेंज इंस्टेंट', 'Rasna Instant Fruit Drink', 'Rasna Orange Pack', ['rasna', 'orange drink'], 'pcs', 1, [1, 2, 5], 10, 40),

    # Dairy & Cold (6)
    ('milk_amul_taaza', 'dairy', '🥛', 'अमूल ताज़ा दूध (500ml)', 'Amul Taaza Toned Milk', 'Amul Taaza Doodh', ['doodh', 'milk', 'amul taaza', 'toned milk'], 'ml', 500, [500, 1000, 1500, 2000], 4000, 20000),
    ('milk_amul_gold', 'dairy', '🥛', 'अमूल गोल्ड फुल क्रीम (500ml)', 'Amul Gold Full Cream Milk', 'Amul Gold Doodh', ['amul gold', 'full cream milk', 'gold doodh'], 'ml', 500, [500, 1000, 1500, 2000], 4000, 20000),
    ('curd_amul_masti', 'dairy', '🥣', 'अमूल मस्ती दही (400g)', 'Amul Masti Dahi Pouch', 'Amul Masti Dahi', ['dahi', 'curd', 'amul dahi'], 'g', 400, [400, 800, 1200], 2000, 12000),
    ('butter_amul_100g', 'dairy', '🧈', 'अमूल बटर (100g टिक्की)', 'Amul Salted Butter 100g', 'Amul Butter 100g', ['butter', 'makhan', 'amul butter'], 'pcs', 1, [1, 2, 3, 5], 10, 40),
    ('paneer_fresh_amul', 'dairy', '🧀', 'अमूल ताजा पनीर (200g)', 'Amul Fresh Paneer 200g', 'Amul Fresh Paneer', ['paneer', 'cottage cheese'], 'pcs', 1, [1, 2, 4], 6, 24),
    ('chaas_amul', 'dairy', '🥛', 'अमूल छाछ / मट्ठा (500ml)', 'Amul Spiced Buttermilk (Chaas)', 'Amul Chaas Buttermilk', ['chaas', 'mattha', 'buttermilk'], 'ml', 500, [500, 1000, 2000], 3000, 15000),

    # Personal Care & Hygiene (10)
    ('soap_dettol', 'personal_care', '🧼', 'डेटॉल ओरिजिनल साबुन', 'Dettol Original Bath Soap', 'Dettol Sabun Original', ['dettol soap', 'bath soap', 'sabun'], 'pcs', 1, [1, 2, 4, 8], 12, 48),
    ('soap_lifebuoy', 'personal_care', '🧼', 'लाइफबॉय लाल साबुन', 'Lifebuoy Total Soap', 'Lifebuoy Lal Sabun', ['lifebuoy', 'red soap', 'sabun'], 'pcs', 1, [1, 2, 4, 8], 12, 48),
    ('soap_lux', 'personal_care', '🧼', 'लक्स रोज़ साबुन', 'Lux Rose Bath Soap', 'Lux Rose Sabun', ['lux soap', 'beauty soap'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('toothpaste_colgate', 'personal_care', '🪥', 'कोलगेट स्ट्रॉन्ग टीथ 100g', 'Colgate Strong Teeth 100g', 'Colgate Strong Teeth', ['colgate', 'toothpaste', 'dant manjan'], 'pcs', 1, [1, 2, 3], 8, 36),
    ('toothpaste_sensodyne', 'personal_care', '🪥', 'सेंसोडाइन टूथपेस्ट', 'Sensodyne Daily Care', 'Sensodyne Toothpaste', ['sensodyne', 'sensitive toothpaste'], 'pcs', 1, [1, 2], 4, 16),
    ('shampoo_clinic_plus', 'personal_care', '🧴', 'क्लिनिक प्लस शैम्पू पाउच (₹1)', 'Clinic Plus Sachet', 'Clinic Plus Pouch', ['clinic plus', 'shampoo sachet', 'pouch'], 'pcs', 1, [1, 5, 10, 20, 50], 50, 250),
    ('shampoo_head_shoulders', 'personal_care', '🧴', 'हेड एंड शोल्डर्स 72ml', 'Head & Shoulders Anti-Dandruff', 'Head and Shoulders Bottle', ['head and shoulders', 'dandruff shampoo'], 'pcs', 1, [1, 2], 4, 16),
    ('hair_oil_parachute', 'personal_care', '🥥', 'पैराशूट नारियल तेल 100ml', 'Parachute Pure Coconut Oil', 'Parachute Nariyal Tel', ['parachute', 'hair oil', 'coconut oil blue bottle'], 'ml', 100, [100, 200, 500], 500, 3000),
    ('hair_oil_bajaj_almond', 'personal_care', '🌰', 'बजाज बादाम ड्रॉप्स 100ml', 'Bajaj Almond Drops Hair Oil', 'Bajaj Badam Drops', ['bajaj almond', 'badam tel', 'hair oil'], 'ml', 100, [100, 200], 400, 2000),
    ('sanitary_pads_whisper', 'personal_care', '🌸', 'व्हिस्पर चॉइस विंग्स (6 पैड)', 'Whisper Choice Wings 6 Pads', 'Whisper Choice Wings', ['whisper', 'sanitary pad', 'stayfree'], 'pcs', 1, [1, 2, 4], 8, 32),

    # Household & Cleaning (10)
    ('surf_excel_quick_wash', 'household', '🧺', 'सर्फ एक्सेल क्विक वॉश 1kg', 'Surf Excel Quick Wash 1kg', 'Surf Excel Powder 1kg', ['surf excel', 'detergent powder', 'washing powder'], 'g', 1000, [500, 1000, 2000], 3000, 20000),
    ('ghadi_detergent', 'household', '🧺', 'घड़ी डिटर्जेंट पाउडर 1kg', 'Ghadi Detergent Powder 1kg', 'Ghadi Powder 1kg', ['ghadi powder', 'detergent powder', 'sasta surf'], 'g', 1000, [500, 1000, 2000, 3000], 5000, 30000),
    ('rin_soap_bar', 'household', '🧼', 'रिन कपड़े धोने का साबुन', 'Rin Fabric Bar (250g)', 'Rin Kapde Sabun', ['rin bar', 'washing soap', 'rin sabun'], 'pcs', 1, [1, 2, 4, 8], 15, 60),
    ('vim_dishwash_bar', 'household', '🍋', 'विम बर्तन साबुन (₹10/₹20)', 'Vim Dishwash Bar', 'Vim Bartan Sabun Bar', ['vim bar', 'bartan sabun', 'dishwash'], 'pcs', 1, [1, 2, 4, 8], 20, 80),
    ('vim_liquid_gel', 'household', '🍋', 'विम जेल लिक्विड (250ml)', 'Vim Dishwash Gel 250ml', 'Vim Liquid Gel', ['vim liquid', 'dishwash gel'], 'ml', 250, [250, 500], 1000, 6000),
    ('harpic_toilet_cleaner', 'household', '🚽', 'हार्पिक टॉयलेट क्लीनर 500ml', 'Harpic Power Plus 500ml', 'Harpic Toilet Cleaner', ['harpic', 'toilet cleaner', 'blue bottle'], 'ml', 500, [500, 1000], 1500, 9000),
    ('lyzol_floor_cleaner', 'household', '🧴', 'लाइज़ोल पोछा फिनाइल 500ml', 'Lizol Disinfectant Surface Cleaner', 'Lizol Floor Cleaner', ['lizol', 'floor cleaner', 'pocha phenyl'], 'ml', 500, [500, 1000], 1500, 9000),
    ('all_out_refill', 'household', '🦟', 'ऑल आउट मच्छर रीफिल', 'All Out Mosquito Liquid Refill', 'All Out Refill', ['all out', 'machhar liquid', 'good knight'], 'pcs', 1, [1, 2, 3], 8, 32),
    ('agarbatti_cycle', 'household', '🪔', 'साइकिल अगरबत्ती (धूप)', 'Cycle Pure Agarbatti 3-in-1', 'Cycle Agarbatti Dhoop', ['agarbatti', 'dhoop', 'puja samagri', 'cycle'], 'pcs', 1, [1, 2, 5], 15, 60),
    ('matchbox_cheeta', 'household', '🔥', 'माचिस का बंडल (10 डिब्बी)', 'Safety Matches Bundle (10 Box)', 'Machis Bundle 10 Box', ['machis', 'matchbox', 'aag'], 'pcs', 1, [1, 2, 5], 10, 50)
]

stationery_items = [
    # Stationery Paper (20)
    ('classmate_notebook_ruled', 'stationery_paper', '📓', 'क्लासमेट कॉपी (सिंगल लाइन 172p)', 'Classmate Notebook Ruled 172p', 'Classmate Copy Ruled', ['copy', 'notebook', 'classmate copy', 'register'], 'pcs', 1, [1, 2, 4, 6], 12, 60),
    ('classmate_notebook_unruled', 'stationery_paper', '📓', 'क्लासमेट प्लेन कॉपी 172p', 'Classmate Notebook Plain Unruled', 'Classmate Copy Plain', ['plain copy', 'unruled notebook'], 'pcs', 1, [1, 2, 4], 8, 40),
    ('register_long_ruled', 'stationery_paper', '📋', 'लॉन्ग रजिस्टर (रूलदार 200p)', 'Long Register Ruled 200p', 'Long Register Ruled', ['register', 'bada register', 'office register'], 'pcs', 1, [1, 2, 4], 10, 50),
    ('drawing_book_a4', 'stationery_paper', '🎨', 'ड्राइंग बुक (A4)', 'Drawing Book A4 Plain', 'Drawing Book A4', ['drawing book', 'art book', 'sketch book'], 'pcs', 1, [1, 2, 3], 6, 30),
    ('scrap_book_colored', 'stationery_paper', '📒', 'स्क्रैप बुक रंगीन', 'Scrap Book Color Pages', 'Scrap Book Colored', ['scrap book', 'activity book'], 'pcs', 1, [1, 2], 5, 25),
    ('practical_file_physics', 'stationery_paper', '📂', 'प्रैक्टिकल फाइल (इंटरलीव्ड)', 'Practical Record File Interleaved', 'Practical File Copy', ['practical file', 'lab record'], 'pcs', 1, [1, 2, 4], 8, 40),
    ('a4_copier_paper_ream', 'stationery_paper', '📄', 'A4 फोटोकॉपी पेपर (JK Copier रीम)', 'JK Copier A4 Paper 500 Sheets', 'JK Copier A4 Paper', ['a4 paper', 'photocopy paper', 'jk copier', 'xerox paper'], 'pcs', 1, [1, 2, 5], 5, 20),
    ('sticky_notes_yellow', 'stationery_paper', '📝', 'स्टिकी नोट्स (पीले)', 'Sticky Notes Yellow 3x3', 'Sticky Notes Yellow', ['sticky notes', 'post it'], 'pcs', 1, [1, 2, 4], 6, 24),
    ('exam_pad_clip', 'stationery_paper', '📋', 'एग्जाम क्लिप बोर्ड / पैड', 'Exam Writing Clip Board', 'Exam Board Clip Pad', ['exam pad', 'clip board', 'writing pad'], 'pcs', 1, [1, 2], 5, 20),
    ('graph_book_10mm', 'stationery_paper', '📐', 'ग्राफ कॉपी (10mm)', 'Graph Notebook 10mm', 'Graph Copy', ['graph book', 'graph paper copy'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('envelope_yellow_a4', 'stationery_paper', '✉️', 'पीला लिफाफा (A4)', 'Yellow Document Envelope A4', 'A4 Peela Lifafa', ['lifafa', 'envelope', 'document cover'], 'pcs', 1, [1, 5, 10, 20], 30, 150),
    ('envelope_white_small', 'stationery_paper', '✉️', 'सफेद छोटा लिफाफा (मनी)', 'Small White Letter Envelope', 'Chhota Lifafa White', ['lifafa', 'money envelope'], 'pcs', 1, [5, 10, 20, 50], 50, 250),
    ('chart_paper_assorted', 'stationery_paper', '📜', 'चार्ट पेपर (रंगीन)', 'Chart Paper Colored Sheet', 'Chart Paper Sheet', ['chart paper', 'project sheet'], 'pcs', 1, [1, 2, 5, 10], 20, 100),
    ('glaze_paper_pack', 'stationery_paper', '✨', 'ग्लेज़ पेपर पैकेट (क्राफ्ट)', 'Glaze Craft Paper Multi Pack', 'Glaze Paper Pack', ['glaze paper', 'origami paper', 'craft paper'], 'pcs', 1, [1, 2, 5], 10, 50),
    ('carbon_paper_blue', 'stationery_paper', '📑', 'कार्बन पेपर (नीला)', 'Kores Blue Carbon Paper Sheet', 'Carbon Paper Blue', ['carbon paper', 'kores carbon'], 'pcs', 1, [1, 5, 10], 20, 100),
    ('dairy_note_pocket', 'stationery_paper', '📓', 'पॉकेट डायरी', 'Pocket Mini Notebook Diary', 'Pocket Diary', ['pocket dairy', 'chhoti diary'], 'pcs', 1, [1, 2], 5, 25),
    ('spiral_notebook_a5', 'stationery_paper', '🌀', 'स्पाइरल नोटबुक (A5)', 'Spiral Bound Notebook A5', 'Spiral Copy A5', ['spiral copy', 'spiral register'], 'pcs', 1, [1, 2, 4], 6, 24),
    ('project_paper_ruled', 'stationery_paper', '📄', 'प्रोजेक्ट पेपर (एक तरफ लाइन)', 'One Side Ruled Project Sheets Pack', 'Project Paper Sheet Pack', ['project paper', 'assignment sheet'], 'pcs', 1, [1, 2, 5], 10, 50),
    ('folder_plastic_l_shape', 'stationery_paper', '📁', 'प्लास्टिक L-शेप फोल्डर', 'Plastic L-Type Document Folder', 'Plastic Folder File', ['file', 'folder', 'l folder', 'document file'], 'pcs', 1, [1, 2, 5], 15, 60),
    ('cobra_spring_file', 'stationery_paper', '📁', 'कोबरा स्प्रिंग फाइल', 'Cobra Spring Lever File', 'Cobra Spring File', ['cobra file', 'spring file', 'office file'], 'pcs', 1, [1, 2, 5], 12, 48),

    # Stationery Writing & Tools (20)
    ('pen_cello_butterflow', 'stationery_writing', '🖊️', 'सेलो बटरफ्लो बॉल पेन (नीला)', 'Cello Butterflow Blue Ball Pen', 'Cello Butterflow Pen Blue', ['ball pen', 'cello pen', 'butterflow', 'blue pen'], 'pcs', 1, [1, 2, 5, 10], 20, 100),
    ('pen_cello_butterflow_black', 'stationery_writing', '🖊️', 'सेलो बटरफ्लो (काला पेन)', 'Cello Butterflow Black Ball Pen', 'Cello Butterflow Pen Black', ['black pen', 'butterflow black'], 'pcs', 1, [1, 2, 5], 10, 50),
    ('pen_octane_gel_blue', 'stationery_writing', '🖋️', 'क्लासमेट ऑक्टेन जेल पेन (नीला)', 'Classmate Octane Gel Pen Blue', 'Octane Gel Pen Blue', ['gel pen', 'octane', 'classmate pen'], 'pcs', 1, [1, 2, 5], 15, 60),
    ('pen_octane_gel_black', 'stationery_writing', '🖋️', 'क्लासमेट ऑक्टेन जेल पेन (काला)', 'Classmate Octane Gel Pen Black', 'Octane Gel Pen Black', ['black gel pen', 'octane black'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('pen_reynolds_045', 'stationery_writing', '🖊️', 'रेनॉल्ड्स 045 ट्रेडिशनल पेन', 'Reynolds 045 Fine Carbure Ball Pen', 'Reynolds 045 Pen', ['reynolds 045', 'sasta ball pen'], 'pcs', 1, [1, 2, 5, 10], 25, 100),
    ('pen_use_and_throw', 'stationery_writing', '🖊️', 'यूज एंड थ्रो पेन (₹3/₹5)', 'Use and Throw Ball Pen', 'Use and Throw Pen', ['use and throw', 'sasta pen'], 'pcs', 1, [1, 5, 10, 20], 30, 150),
    ('pencil_apsara_platinum', 'stationery_writing', '✏️', 'अप्सरा प्लैटिनम पेंसिल (पैकेट)', 'Apsara Platinum Extra Dark Pencils (10pk)', 'Apsara Platinum Pencil Pack', ['apsara pencil', 'pencil pack', 'extra dark'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('pencil_natraj_classic', 'stationery_writing', '✏️', 'नटराज पेंसिल (10 पीस डिब्बी)', 'Natraj 621 Red Black Pencils (10pk)', 'Natraj Pencil Dibbi', ['natraj pencil', 'red black pencil'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('eraser_apsara_non_dust', 'stationery_writing', '🧼', 'अप्सरा नॉन-डस्ट रबर (इरेज़र)', 'Apsara Non Dust Eraser', 'Apsara Rubber Eraser', ['rubber', 'eraser', 'apsara rubber'], 'pcs', 1, [1, 2, 5, 10], 20, 80),
    ('sharpener_apsara', 'stationery_writing', '🔪', 'कटर / शार्पनर (अप्सरा)', 'Apsara Long Point Sharpener', 'Apsara Cuttar Sharpener', ['sharpener', 'cuttar', 'pencil sharpener'], 'pcs', 1, [1, 2, 5, 10], 20, 80),
    ('scale_camlin_15cm', 'stationery_writing', '📏', 'कैमलिन प्लास्टिक स्केल 15cm', 'Camlin Plastic Ruler 15cm', 'Camlin Scale 15cm', ['scale', 'ruler', 'foot', 'patari'], 'pcs', 1, [1, 2, 4], 12, 48),
    ('scale_steel_30cm', 'stationery_writing', '📏', 'स्टील फुटा 30cm (1 फुट)', 'Stainless Steel Ruler 30cm (12inch)', 'Steel Scale 30cm', ['steel scale', 'steel ruler', 'foot scale'], 'pcs', 1, [1, 2], 5, 20),
    ('fevistick_8g', 'stationery_writing', '🧴', 'फेविस्टिक गोंद (8g)', 'Pidilite Fevistik Glue Stick 8g', 'Fevistick Gond 8g', ['fevistick', 'glue stick', 'gond'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('fevicol_mr_50g', 'stationery_writing', '🧴', 'फेविकोल MR क्राफ्ट गोंद 50g', 'Pidilite Fevicol MR Squeeze 50g', 'Fevicol MR Gond 50g', ['fevicol', 'white glue', 'craft glue'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('scissors_student_small', 'stationery_writing', '✂️', 'स्टूडेंट कैंची (छोटी)', 'Student Craft Safety Scissors', 'Student Kainchi Small', ['scissor', 'kainchi', 'scissors'], 'pcs', 1, [1, 2], 4, 16),
    ('geometry_box_camlin', 'stationery_writing', '📐', 'कैमलिन ज्यामिति बॉक्स (कंपास)', 'Camlin Scholar Geometry Box', 'Camlin Geometry Box', ['geometry box', 'compass box', 'prakar'], 'pcs', 1, [1, 2], 4, 16),
    ('crayons_doms_12shade', 'stationery_writing', '🖍️', 'डोम्स वैक्स क्रायॉन (12 शेड)', 'Doms Plastic Crayons 12 Shades', 'Doms Crayon Color', ['crayon', 'wax color', 'drawing color'], 'pcs', 1, [1, 2, 4], 6, 24),
    ('sketch_pens_luxor_12', 'stationery_writing', '🖌️', 'लक्सर स्केच पेन (12 रंग)', 'Luxor Color Sketch Pens 12pk', 'Luxor Sketch Pen 12 Color', ['sketch pen', 'marker color'], 'pcs', 1, [1, 2, 4], 6, 24),
    ('permanent_marker_camlin', 'stationery_writing', '🖊️', 'कैमलिन परमानेंट मार्कर (काला)', 'Camlin Permanent Marker Black', 'Camlin Permanent Marker Black', ['marker', 'permanent marker', 'black marker'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('whiteboard_marker_blue', 'stationery_writing', '🖊️', 'व्हाइटबोर्ड मार्कर (नीला)', 'Camlin Whiteboard Marker Blue', 'Whiteboard Marker Blue', ['whiteboard marker', 'board marker'], 'pcs', 1, [1, 2, 4], 8, 32)
]

hardware_items = [
    # Hardware Fasteners & Consumables (15)
    ('screw_wood_1inch', 'hardware_fasteners', '🔩', 'लकड़ी का पेंच 1 इंच (पैकेट)', 'Wood Screws 1 Inch (Pack of 25)', 'Lakdi Pech 1 Inch', ['screw', 'wood screw', 'pech'], 'pcs', 1, [1, 2, 5, 10], 10, 50),
    ('screw_drywall_1.5inch', 'hardware_fasteners', '🔩', 'ड्राइवॉल काला पेच 1.5 इंच', 'Drywall Black Screws 1.5 Inch (25pk)', 'Drywall Pech 1.5 Inch', ['black screw', 'drywall screw', 'pech'], 'pcs', 1, [1, 2, 5], 10, 50),
    ('nail_wire_2inch', 'hardware_fasteners', '🔨', 'तार की कील 2 इंच (दीवार)', 'Wire Nails 2 Inch (Kheel)', 'Tar Kheel 2 Inch', ['kheel', 'nail', 'lohe ki kheel', 'wall nail'], 'g', 250, [100, 250, 500, 1000], 1000, 10000),
    ('nail_concrete_1.5inch', 'hardware_fasteners', '🔨', 'कंक्रीट स्टील कील 1.5 इंच', 'Concrete Hardened Steel Nails (10pk)', 'Concrete Steel Kheel', ['concrete nail', 'steel kheel'], 'pcs', 1, [1, 2, 5], 10, 50),
    ('gitti_wall_plug_6mm', 'hardware_fasteners', '🧱', 'प्लास्टिक गिट्टी 6mm (पैकेट)', 'Plastic Wall Plugs / Rawl Gitti 6mm (20pk)', 'Plastic Gitti 6mm Pack', ['gitti', 'wall plug', 'rawl plug'], 'pcs', 1, [1, 2, 5], 15, 60),
    ('teflon_tape_plumbing', 'hardware_fasteners', '🚰', 'टेफ्लॉन टेप (नल फिटिंग)', 'PTFE Teflon Thread Seal Tape', 'Teflon Tape Nal Fit', ['teflon tape', 'thread seal', 'water tape'], 'pcs', 1, [1, 2, 5], 12, 48),
    ('m_seal_epoxy_regular', 'hardware_fasteners', '🧪', 'एम-सील रेगुलर (90g)', 'Pidilite M-Seal Regular Epoxy Putty', 'M Seal Regular Pack', ['m seal', 'epoxy', 'leakage seal'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('fevikwik_1g', 'hardware_fasteners', '⚡', 'फेविक्विक ₹5 (इंस्टेंट गोंद)', 'Pidilite Fevikwik Instant Adhesive 1g', 'Fevikwik 1g Chhota', ['fevikwik', 'instant glue', 'super glue'], 'pcs', 1, [1, 2, 5, 10], 25, 100),
    ('araldite_standard_36g', 'hardware_fasteners', '🧪', 'एराल्डाइट स्टैंडर्ड (इपॉक्सी जोड़)', 'Araldite Standard Epoxy Adhesive 36g', 'Araldite Jod 36g', ['araldite', 'epoxy glue'], 'pcs', 1, [1, 2], 4, 16),
    ('insulation_tape_steelgrip', 'hardware_fasteners', '🔌', 'इन्सुलेशन टेप काला (Steelgrip)', 'Steelgrip PVC Electrical Insulation Tape', 'Black Insulation Tape', ['electrical tape', 'wire tape', 'black tape'], 'pcs', 1, [1, 2, 5], 15, 60),
    ('sandpaper_regmar_120', 'hardware_fasteners', '📄', 'रेगमार / सैंडपेपर 120 नंबर', 'Emery Sandpaper Sheet 120 Grit', 'Regmar Sheet 120 No', ['regmar', 'sandpaper', 'emery paper'], 'pcs', 1, [1, 2, 5], 10, 50),
    ('hex_nut_bolt_quarter', 'hardware_fasteners', '🔩', 'नट-बोल्ट 1/4 x 1 इंच', 'Hex Nut and Bolt Set 1/4 x 1 inch (10pk)', 'Nut Bolt Set 1/4 Inch', ['nut bolt', 'bolt nut'], 'pcs', 1, [1, 2, 5], 10, 40),
    ('washer_flat_quarter', 'hardware_fasteners', '⭕', 'वाशर 1/4 इंच (पैकेट)', 'Flat MS Washers 1/4 inch (25pk)', 'Washer 1/4 Inch Pack', ['washer', 'flat washer'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('cable_tie_zip_8inch', 'hardware_fasteners', '🔗', 'केबल टाई / ज़िप टाई 8 इंच (50 पीस)', 'Nylon Cable Zip Ties 8 Inch (50pk)', 'Cable Tie Zip Tie Pack', ['cable tie', 'zip tie'], 'pcs', 1, [1, 2], 5, 20),
    ('wd40_spray_32g', 'hardware_fasteners', '🛢️', 'WD-40 जंगरोधी स्प्रे (32g)', 'WD-40 Multi-Use Rust Spray 32g', 'WD40 Spray 32g', ['wd40', 'rust spray', 'lubricant'], 'pcs', 1, [1, 2], 4, 16),

    # Electrical & Tools (15)
    ('bulb_led_9w_philips', 'electrical', '💡', 'फिलिप्स 9W LED बल्ब', 'Philips 9-Watt LED Bulb B22', 'Philips 9W LED Bulb', ['led bulb', 'bulb', 'philips bulb', '9w led'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('bulb_led_12w_syska', 'electrical', '💡', 'सिस्का 12W LED बल्ब', 'Syska 12-Watt LED Bulb B22', 'Syska 12W LED Bulb', ['syska bulb', '12w led', 'bada bulb'], 'pcs', 1, [1, 2, 3], 6, 24),
    ('switch_modular_6a_anchor', 'electrical', '🔘', 'एंकर रोमा 6A स्विच', 'Anchor Roma Modular 6A 1-Way Switch', 'Anchor Roma 6A Switch', ['switch', 'anchor switch', 'roma switch', 'light switch'], 'pcs', 1, [1, 2, 5], 12, 48),
    ('socket_modular_6a_anchor', 'electrical', '🔌', 'एंकर रोमा 6A सॉकेट', 'Anchor Roma 6A 3-Pin Socket', 'Anchor Roma 6A Socket', ['socket', 'plug socket', '3 pin socket'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('plug_top_3pin_16a', 'electrical', '🔌', '16A पावर प्लग टॉप (गीजर/AC)', '16A Heavy 3-Pin Power Plug Top', '16A Power Plug Top', ['power plug', '16a plug', 'geyser plug'], 'pcs', 1, [1, 2], 6, 24),
    ('plug_top_3pin_6a', 'electrical', '🔌', '6A 3-पिन प्लग टॉप', '6A Standard 3-Pin Plug Top', '6A Plug Top', ['plug top', '3 pin plug'], 'pcs', 1, [1, 2, 4], 10, 40),
    ('tester_electrical_taparia', 'electrical', '⚡', 'टपारिया लाइन टेस्टर 500V', 'Taparia Line Voltage Neon Tester 500V', 'Taparia Line Tester', ['tester', 'line tester', 'current tester'], 'pcs', 1, [1, 2], 5, 20),
    ('screwdriver_taparia_two_in_one', 'hardware_tools', '🪛', 'टपारिया टू-इन-वन पेचकस', 'Taparia 2-in-1 Reversible Screwdriver', 'Taparia Two in One Pechkas', ['pechkas', 'screwdriver', 'taparia screwdriver'], 'pcs', 1, [1, 2], 4, 16),
    ('pliers_taparia_combination', 'hardware_tools', '🔧', 'टपारिया प्लास 8 इंच', 'Taparia Combination Pliers 8 Inch', 'Taparia Plaas 8 Inch', ['plaas', 'pliers', 'cutting pliers'], 'pcs', 1, [1, 2], 4, 16),
    ('hammer_claw_steel_half_kg', 'hardware_tools', '🔨', 'हथौड़ा आधा किलो (स्टील)', 'Claw Hammer 500g Hardened Steel', 'Hathauda Half KG', ['hathoda', 'hammer', 'kheel nikalne wala hathoda'], 'pcs', 1, [1, 2], 3, 12),
    ('measuring_tape_freemans_3m', 'hardware_tools', '📏', 'फ्रीमैन नापने का फीता (3 मीटर)', 'Freemans Steel Measuring Tape 3m', 'Freemans Feeta 3m', ['feeta', 'measuring tape', 'inch tape'], 'pcs', 1, [1, 2], 5, 20),
    ('cutter_knife_snap_off', 'hardware_tools', '🔪', 'कटर चाकू (स्नैप-ऑफ ब्लेड)', 'Snap-Off Utility Cutter Knife', 'Cutter Chaku Knife', ['cutter', 'utility knife', 'box cutter'], 'pcs', 1, [1, 2, 4], 8, 32),
    ('spanner_adjustable_taparia_8', 'hardware_tools', '🔧', 'सिलाई रिंच 8 इंच (Adjustable)', 'Taparia 8 Inch Adjustable Spanner', 'Silai Rinch 8 Inch', ['rinch', 'spanner', 'adjustable spanner'], 'pcs', 1, [1, 2], 3, 12),
    ('wire_copper_1sqmm_havells', 'electrical', '〰️', 'हैवेल्स कॉपर वायर 1 sq.mm (मीटर)', 'Havells 1.0 sq.mm Single Core Wire (m)', 'Havells 1mm Copper Wire Meter', ['wire', 'copper wire', 'bijli tar'], 'pcs', 1, [1, 5, 10, 20], 30, 100),
    ('multipin_universal_adapter', 'electrical', '🔌', 'मल्टीपिन सॉकेट अडैप्टर (3-way)', 'Universal 3-Way Multi-Plug Adapter', 'Multipin Universal Adapter', ['multi plug', 'multipin', 'universal adapter'], 'pcs', 1, [1, 2, 4], 8, 32)
]

def format_pack(items_tuple, pack_name):
    items = []
    for item in items_tuple:
        key, cat, emoji, hi, en, hinglish, aliases, unit, default_qty, chips, min_qty, pack_size = item
        items.append({
            'id': f'{pack_name}.{key}',
            'pack': pack_name,
            'category': cat,
            'emoji': emoji,
            'names': {'hi': hi, 'en': en, 'hinglish': hinglish},
            'aliases': aliases,
            'baseUnit': unit,
            'defaultSaleQty': default_qty,
            'chips': chips,
            'minQty': min_qty,
            'packSize': pack_size
        })
    return items

with open('src/catalogue/kirana.json', 'w', encoding='utf-8') as f:
    json.dump(format_pack(kirana_items, 'kirana'), f, ensure_ascii=False, indent=2)

with open('src/catalogue/stationery.json', 'w', encoding='utf-8') as f:
    json.dump(format_pack(stationery_items, 'stationery'), f, ensure_ascii=False, indent=2)

with open('src/catalogue/hardware.json', 'w', encoding='utf-8') as f:
    json.dump(format_pack(hardware_items, 'hardware'), f, ensure_ascii=False, indent=2)

print(f'Done: Kirana={len(kirana_items)}, Stationery={len(stationery_items)}, Hardware={len(hardware_items)}')
