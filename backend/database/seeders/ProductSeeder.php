<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $adminUserId = DB::table('users')->insertGetId([
            'name' => 'Admin User',
            'email' => 'admin@dhanvanthiri.local',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'role' => 'super_admin',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('users')->insert([
            'name' => 'Store Manager',
            'email' => 'manager@dhanvanthiri.local',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'role' => 'admin',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ── Categories ───────────────────────────────────────────────
        $thokkuCatId = DB::table('categories')->insertGetId([
            'name' => 'Thokku',
            'slug' => 'thokku',
            'description' => 'Traditional South Indian thokku (chutney) varieties made with authentic recipes and pure ingredients.',
            'sort_order' => 1,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $pickleCatId = DB::table('categories')->insertGetId([
            'name' => 'Urukai',
            'slug' => 'urukai',
            'description' => 'Classic Tamil oorugai with bold tang, spice, and the familiar punch of traditional pickling.',
            'sort_order' => 2,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $podiCatId = DB::table('categories')->insertGetId([
            'name' => 'Podi',
            'slug' => 'podi',
            'description' => 'Traditional South Indian spice powders made from freshly ground ingredients – the perfect companion for rice, idli, and dosa.',
            'sort_order' => 3,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ── Tags ─────────────────────────────────────────────────────
        $tagIds = [];
        $tags = [
            'homemade' => 'Homemade',
            'traditional' => 'Traditional',
            'south-indian' => 'South Indian',
            'no-preservatives' => 'No Preservatives',
            'vegetarian' => 'Vegetarian',
            'healthy' => 'Healthy',
            'spicy' => 'Spicy',
        ];

        foreach ($tags as $slug => $name) {
            $tagIds[$slug] = DB::table('tags')->insertGetId([
                'name' => $name,
                'slug' => $slug,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── Products ─────────────────────────────────────────────────
        $products = [
            [
                'category_id' => $thokkuCatId,
                'name' => 'Poondu Thokku',
                'slug' => 'poondu-thokku',
                'sku' => 'PnT-000',
                'description' => '<p>Whole garlic cloves slow-cooked with tamarind, red chili, and cold-pressed sesame oil. A spicy, pungent thokku perfect with hot rice and curd rice.</p>',
                'short_description' => 'Bold garlic mashed pickle.',
                'price' => 179.00,
                'compare_price' => 225.00,
                'cost_price' => 80.00,
                'stock_quantity' => 45,
                'weight' => 0.25,
                'is_featured' => true,
                'tags' => ['homemade', 'spicy', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Poondu Thokku (Garlic Mashed Pickle).jpg',
                'sku_variant' => 'PnT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Karuveppilai Thokku',
                'slug' => 'karuveppilai-thokku',
                'sku' => 'KVT-000',
                'description' => '<p>Fresh curry leaves ground and slow-cooked with tamarind, spices, and cold-pressed oil. Excellent for hair growth and digestion.</p>',
                'short_description' => 'Flavor-packed curry leaves mashed pickle.',
                'price' => 179.00,
                'compare_price' => 225.00,
                'cost_price' => 80.00,
                'stock_quantity' => 50,
                'weight' => 0.25,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'healthy', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Karuveppilai Thokku (Curry Leaves Mashed Pickle).jpg',
                'sku_variant' => 'KVT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Pavakai Thokku',
                'slug' => 'pavakai-thokku',
                'sku' => 'PT-000',
                'description' => '<p>Bitter gourd slow-cooked with tamarind, jaggery, and spices. A unique blend of sweet, sour, and bitter notes that tastes incredible with rice.</p>',
                'short_description' => 'Sweet, sour, and mildly bitter gourd thokku.',
                'price' => 159.00,
                'compare_price' => 199.00,
                'cost_price' => 80.00,
                'stock_quantity' => 40,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian'],
                'image' => '/images/products/Paakarkaai Thokku (Bitter Gourd Mashed Pickle).jpg',
                'sku_variant' => 'PT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Pirandai Thokku',
                'slug' => 'pirandai-thokku',
                'sku' => 'PiT-000',
                'description' => '<p>Pirandai (Adamant Creeper) slow-cooked with tamarind and spices. Known in Siddha medicine for strengthening bones and improving calcium absorption.</p>',
                'short_description' => 'Bone-strengthening adamant creeper thokku.',
                'price' => 199.00,
                'compare_price' => 249.00,
                'cost_price' => 80.00,
                'stock_quantity' => 30,
                'weight' => 0.25,
                'is_featured' => true,
                'tags' => ['homemade', 'healthy', 'vegetarian'],
                'image' => '/images/products/Pirandai Thokku (Adamant Creeper Mashed Pickle).jpg',
                'sku_variant' => 'PiT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Valaipoo Thokku',
                'slug' => 'valaipoo-thokku',
                'sku' => 'VZ-000',
                'description' => '<p>A classic South Indian condiment made from fresh banana blossoms, slow-cooked with mustard, fenugreek, and a secret blend of spices. Perfect with rice, dosa, or idli.</p>',
                'short_description' => 'Traditional banana blossom thokku.',
                'price' => 199.00,
                'compare_price' => 249.00,
                'cost_price' => 80.00,
                'stock_quantity' => 40,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'south-indian', 'vegetarian'],
                'image' => '/images/products/Vazhaippu Thokku (Bannana Leaf Mashed Pickle).jpg',
                'sku_variant' => 'VZ-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Thakkali Thokku',
                'slug' => 'thakkali-thokku',
                'sku' => 'TT-000',
                'description' => '<p>Ripe tomatoes slow-cooked to a thick, tangy paste with mustard, fenugreek, and aromatic spices. A versatile thokku that pairs beautifully with dosa, idli, and rice.</p>',
                'short_description' => 'Tangy tomato mashed pickle.',
                'price' => 159.00,
                'compare_price' => 199.00,
                'cost_price' => 80.00,
                'stock_quantity' => 55,
                'weight' => 0.25,
                'is_featured' => true,
                'tags' => ['homemade', 'south-indian', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Thakkali Thokku (Tomato Mashed Pickle).jpg',
                'sku_variant' => 'TT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Vallarai Thokku',
                'slug' => 'vallarai-thokku',
                'sku' => 'VAT-000',
                'description' => '<p>A healthy thokku made from fresh Vallarai (Centella) leaves, offering both medicinal benefits and a tangy, spicy flavor profile.</p>',
                'short_description' => 'Nutritious brahmi leaves mashed pickle.',
                'price' => 179.00,
                'compare_price' => 225.00,
                'cost_price' => 80.00,
                'stock_quantity' => 35,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives'],
                'image' => '/images/products/Vallarai Thokku (Centella  Brahmi Mashed Pickle).jpg',
                'sku_variant' => 'VAT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Mallithalai Thokku',
                'slug' => 'mallithalai-thokku',
                'sku' => 'MT-000',
                'description' => '<p>A refreshing coriander thokku made with fresh coriander leaves, green chili, and traditional spices. Adds a vibrant, herby kick to any meal.</p>',
                'short_description' => 'Fresh coriander mashed pickle.',
                'price' => 159.00,
                'compare_price' => 199.00,
                'cost_price' => 80.00,
                'stock_quantity' => 25,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'vegetarian'],
                'image' => '/images/products/Mallithalai Thokku (Coriander Mashed Pickle).jpg',
                'sku_variant' => 'MT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Chinavangayam Thokku',
                'slug' => 'chinavangayam-thokku',
                'sku' => 'CT-000',
                'description' => '<p>A flavorful South Indian delicacy made with fresh shallots, slow-cooked with tamarind and a blend of traditional spices. Perfect as a side for rice, idli, or dosa.</p>',
                'short_description' => 'Authentic shallot mashed pickle with rich flavors.',
                'price' => 179.00,
                'compare_price' => 225.00,
                'cost_price' => 80.00,
                'stock_quantity' => 45,
                'weight' => 0.25,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Chinnavengayam Thokku (Shallot Mashed Pickle).jpg',
                'sku_variant' => 'CT-250',
            ],
            [
                'category_id' => $thokkuCatId,
                'name' => 'Kovakkai Thokku',
                'slug' => 'kovakkai-thokku',
                'sku' => 'KK-000',
                'description' => '<p>Fresh ivy gourd (kovakkai) slow-cooked with mustard, fenugreek, and traditional spices. A diabetic-friendly thokku with amazing flavors.</p>',
                'short_description' => 'Tangy ivy gourd mashed pickle.',
                'price' => 179.00,
                'compare_price' => 225.00,
                'cost_price' => 80.00,
                'stock_quantity' => 30,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'healthy', 'vegetarian'],
                'image' => '/images/products/Kovakkai Thokku (Ivy Gourd Mashed Pickle).jpg',
                'sku_variant' => 'KK-250',
            ],
            [
                'category_id' => $pickleCatId,
                'name' => 'Lemon Urukai',
                'slug' => 'lemon-urukai',
                'sku' => 'LU-000',
                'description' => '<p>Elumichai (lemon) marinated with rock salt, chili powder, and traditional spices. A zesty, tangy pickle that adds life to any South Indian meal.</p>',
                'short_description' => 'Zesty lemon pickle with a spicy punch.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 40,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'spicy', 'vegetarian'],
                'image' => '/images/products/Lime Pickle (Elumichai Oorugai).jpg',
                'sku_variant' => 'LU-250',
            ],
            [
                'category_id' => $pickleCatId,
                'name' => 'Narthangai Urukai',
                'slug' => 'narthangai-urukai',
                'sku' => 'NU-000',
                'description' => '<p>Narthangai (citron) marinated with mustard, fenugreek, and cold-pressed oil. A tangy, fragrant pickle that brings a burst of citrus to every meal.</p>',
                'short_description' => 'Aromatic citron pickle with tangy notes.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 35,
                'weight' => 0.25,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'vegetarian'],
                'image' => '/images/products/Citron Pickle (Narthangai Oorugai).jpg',
                'sku_variant' => 'NU-250',
            ],
            [
                'category_id' => $pickleCatId,
                'name' => 'Maangai Urukai',
                'slug' => 'maangai-urukai',
                'sku' => 'MU-000',
                'description' => '<p>Made with hand-picked raw mangoes, mustard, fenugreek, and cold-pressed gingelly oil. Sun-dried for days to achieve the perfect crunch and flavor.</p>',
                'short_description' => 'Tangy and spicy traditional mango pickle.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 70,
                'weight' => 0.25,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'spicy', 'no-preservatives', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Maanga Oorugai(Mango Pickle).jpg',
                'sku_variant' => 'MU-250',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Idly Podi',
                'slug' => 'idly-podi',
                'sku' => 'IP-000',
                'description' => '<p>A quintessential South Indian breakfast companion. Roasted lentils and red chillies ground to a coarse, flavourful powder. Perfect with idli, dosa, and sesame oil.</p>',
                'short_description' => 'Classic roasted spice powder for idli and dosa.',
                'price' => 99.00,
                'compare_price' => 129.00,
                'cost_price' => 50.00,
                'stock_quantity' => 60,
                'weight' => 0.15,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Idly Podi (Idli Spice Mix).jpg',
                'sku_variant' => 'IP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Paruppu Podi',
                'slug' => 'paruppu-podi',
                'sku' => 'PP-000',
                'description' => '<p>A staple South Indian comfort food made by roasting toor dal, roasted gram, and mild spices. Best enjoyed with hot steamed rice and a dollop of ghee.</p>',
                'short_description' => 'Classic dal spice mix for rice.',
                'price' => 99.00,
                'compare_price' => 129.00,
                'cost_price' => 50.00,
                'stock_quantity' => 65,
                'weight' => 0.15,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Paruppu Podi (Dal Powder or Dal Spice Mix).jpg',
                'sku_variant' => 'PP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Poondu Podi',
                'slug' => 'poondu-podi',
                'sku' => 'PoP-000',
                'description' => '<p>A pungent and flavorful blend of roasted garlic, red chilies, and lentils. Perfect for spicing up your idlis, dosas, or plain rice.</p>',
                'short_description' => 'Flavorful garlic spice mix.',
                'price' => 109.00,
                'compare_price' => 139.00,
                'cost_price' => 50.00,
                'stock_quantity' => 45,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'spicy', 'healthy', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Poondu Podi (Garlic Powder or Garlic Spice Mix).jpg',
                'sku_variant' => 'PoP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Karuveppilai Podi',
                'slug' => 'karuveppilai-podi',
                'sku' => 'KVP-000',
                'description' => '<p>Fresh curry leaves dried and ground with urad dal, chana dal, and spices. Sprinkle on hot rice with a drizzle of ghee or use as a side for idli/dosa.</p>',
                'short_description' => 'Aromatic curry leaf powder rich in iron.',
                'price' => 109.00,
                'compare_price' => 139.00,
                'cost_price' => 50.00,
                'stock_quantity' => 60,
                'weight' => 0.15,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'healthy', 'vegetarian'],
                'image' => '/images/products/Karuveppilai Podi (Curry Leaves Spice Mix or Curry Leaves Powder).jpg',
                'sku_variant' => 'KVP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Nilakadalai Podi',
                'slug' => 'nilakadalai-podi',
                'sku' => 'NP-000',
                'description' => '<p>Roasted peanuts ground with dried coconut, red chili, and garlic. A protein-rich powder that makes idli/dosa breakfast extra special.</p>',
                'short_description' => 'Crunchy groundnut spice mix.',
                'price' => 119.00,
                'compare_price' => 149.00,
                'cost_price' => 50.00,
                'stock_quantity' => 50,
                'weight' => 0.15,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Nilakadalai Podi (Groundnut  Spice Mix or (Groundnut  Powder).jpg',
                'sku_variant' => 'NP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Ellu Podi',
                'slug' => 'ellu-podi',
                'sku' => 'EP-000',
                'description' => '<p>Roasted black sesame seeds ground with lentils, dried chili, and a touch of asafoetida. Calcium-rich and incredibly flavorful when mixed with hot rice and ghee.</p>',
                'short_description' => 'Nutty black sesame spice mix.',
                'price' => 129.00,
                'compare_price' => 159.00,
                'cost_price' => 80.00,
                'stock_quantity' => 40,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian'],
                'image' => '/images/products/Ellu Podi (Black Sesame Spice Mix or Black Sesame Powder).jpg',
                'sku_variant' => 'EP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Kollu Podi',
                'slug' => 'kollu-podi',
                'sku' => 'KP-000',
                'description' => '<p>Roasted horse gram blended with traditional spices. Known for its weight management properties, this podi is both healthy and delicious.</p>',
                'short_description' => 'Nutritious horse gram spice mix.',
                'price' => 119.00,
                'compare_price' => 149.00,
                'cost_price' => 50.00,
                'stock_quantity' => 45,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian'],
                'image' => '/images/products/Kollu Podi ( Horse gram Spice Mix or Horse gram Powder).jpg',
                'sku_variant' => 'KP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Murungai Podi',
                'slug' => 'murungai-podi',
                'sku' => 'MKP-000',
                'description' => '<p>Dried moringa leaves blended with lentils and spices. A powerhouse of vitamins and minerals, adding a healthy kick to your daily meals.</p>',
                'short_description' => 'Super-food moringa spice mix.',
                'price' => 129.00,
                'compare_price' => 159.00,
                'cost_price' => 80.00,
                'stock_quantity' => 55,
                'weight' => 0.15,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives'],
                'image' => '/images/products/Murungai Keerai Podi (Moringa Spice Mix or (Moringa Powder).jpg',
                'sku_variant' => 'MKP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Pirandai Podi',
                'slug' => 'pirandai-podi',
                'sku' => 'PiP-000',
                'description' => '<p>Pirandai (Adamant Creeper / Veldt grape) dried and roasted with lentils. Known in traditional medicine to strengthen bones and improve digestion.</p>',
                'short_description' => 'Bone-strengthening veldt grape spice mix.',
                'price' => 129.00,
                'compare_price' => 159.00,
                'cost_price' => 80.00,
                'stock_quantity' => 35,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives'],
                'image' => '/images/products/Pirandai Podi (Veldt Grape Powder or Veldt Grape Spice Mix).jpg',
                'sku_variant' => 'PiP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Vallarai Podi',
                'slug' => 'vallarai-podi',
                'sku' => 'VAP-000',
                'description' => '<p>Sun-dried and stone-ground Vallarai (Brahmi) leaves blended with dal and spices. Known for its cognitive boosting properties.</p>',
                'short_description' => 'Brain-boosting brahmi leaf powder.',
                'price' => 129.00,
                'compare_price' => 159.00,
                'cost_price' => 80.00,
                'stock_quantity' => 40,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives'],
                'image' => '/images/products/Vallarai Podi (Centella Powder or Centella Spice Mix ).jpg',
                'sku_variant' => 'VAP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Sambar Podi',
                'slug' => 'sambar-podi',
                'sku' => 'SP-000',
                'description' => '<p>A fragrant blend of roasted coriander, cumin, fenugreek, red chillies, and lentils. The heart of every South Indian sambar, freshly ground in small batches.</p>',
                'short_description' => 'Traditional sambar powder blend.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 50,
                'weight' => 0.15,
                'is_featured' => true,
                'tags' => ['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller'],
                'image' => '/images/products/Sambar Podi (Sambar Powder).jpg',
                'sku_variant' => 'SP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Pulikulambu Podi',
                'slug' => 'pulikulambu-podi',
                'sku' => 'PuP-000',
                'description' => '<p>A carefully crafted spice blend for the beloved Tamil tamarind curry. Balanced heat, tang, and warmth for effortless authentic pulikulambu.</p>',
                'short_description' => 'Spice mix for tangy tamarind curry.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 40,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'vegetarian'],
                'image' => '/images/products/Pulikulambu Podi (Tamarind Curry Powder).jpg',
                'sku_variant' => 'PuP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Karikulambu Podi',
                'slug' => 'karikulambu-podi',
                'sku' => 'KKP-000',
                'description' => '<p>A bold, deeply roasted spice blend for the iconic Tamil black curry. Smoky, robust character that brings authentic depth to this beloved everyday dish.</p>',
                'short_description' => 'Robust black curry spice mix.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 35,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'vegetarian'],
                'image' => '/images/products/Karikulambu Podi (Black Curry Powder).jpg',
                'sku_variant' => 'KKP-150',
            ],
            [
                'category_id' => $podiCatId,
                'name' => 'Rasa Podi',
                'slug' => 'rasa-podi',
                'sku' => 'RP-000',
                'description' => '<p>A classic pepper-forward rasam powder ground fresh with black pepper, cumin, coriander, and garlic. Makes preparing comforting South Indian rasam quick and easy.</p>',
                'short_description' => 'Traditional rasam powder blend.',
                'price' => 149.00,
                'compare_price' => 189.00,
                'cost_price' => 80.00,
                'stock_quantity' => 45,
                'weight' => 0.15,
                'is_featured' => false,
                'tags' => ['homemade', 'traditional', 'vegetarian'],
                'image' => '/images/products/Rasa Podi (Rasam Powder).jpg',
                'sku_variant' => 'RP-150',
            ],
        ];

        foreach ($products as $productData) {
            $tagSlugs = $productData['tags'];
            $imageFile = $productData['image'];
            $skuVariant = $productData['sku_variant'];
            unset($productData['tags'], $productData['image'], $productData['sku_variant']);

            $productData['status'] = 'active';
            $productData['published_at'] = $now;
            $productData['meta_title'] = $productData['name'] . ' | Vainavi Goodies by Dhanvanthiri Foods';
            $productData['meta_description'] = $productData['short_description'];
            $productData['created_at'] = $now;
            $productData['updated_at'] = $now;

            $productId = DB::table('products')->insertGetId($productData);

            // Primary product image
            DB::table('product_images')->insert([
                'product_id' => $productId,
                'path' => $imageFile,
                'alt_text' => $productData['name'],
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Tag associations
            foreach ($tagSlugs as $tagSlug) {
                if (isset($tagIds[$tagSlug])) {
                    DB::table('product_tags')->insert([
                        'product_id' => $productId,
                        'tag_id' => $tagIds[$tagSlug],
                    ]);
                }
            }

            // Create default variant using the same base weight as the product
            DB::table('product_variants')->insert([
                'product_id' => $productId,
                'sku' => $skuVariant,
                'price' => null, // uses parent price
                'stock_quantity' => $productData['stock_quantity'],
                'weight' => $productData['weight'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── Shipping Zone & Method (India) ───────────────────────────
        $zoneId = DB::table('shipping_zones')->insertGetId([
            'name' => 'India',
            'countries' => json_encode(['IN']),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('shipping_methods')->insert([
            [
                'shipping_zone_id' => $zoneId,
                'name' => 'Standard Delivery',
                'description' => 'Delivered within 5-7 business days',
                'price' => 50.00,
                'min_delivery_days' => 5,
                'max_delivery_days' => 7,
                'min_order_free' => 499.00,
                'is_active' => true,
            ],
            [
                'shipping_zone_id' => $zoneId,
                'name' => 'Express Delivery',
                'description' => 'Delivered within 2-3 business days',
                'price' => 99.00,
                'min_delivery_days' => 2,
                'max_delivery_days' => 3,
                'min_order_free' => 999.00,
                'is_active' => true,
            ],
        ]);

        // ── Store Settings ───────────────────────────────────────────
        $settingsData = [
            ['group' => 'general', 'key' => 'store_name', 'value' => 'Vainavi Goodies', 'cast' => 'string'],
            ['group' => 'general', 'key' => 'store_tagline', 'value' => 'by Dhanvanthiri Foods – Traditional South Indian Pickles, Thokku & Podi', 'cast' => 'string'],
            ['group' => 'general', 'key' => 'store_email', 'value' => 'dhanvanthrifoods777@gmail.com', 'cast' => 'string'],
            ['group' => 'general', 'key' => 'store_phone', 'value' => '9445717977', 'cast' => 'string'],
            ['group' => 'general', 'key' => 'store_currency', 'value' => 'INR', 'cast' => 'string'],
            ['group' => 'general', 'key' => 'store_country', 'value' => 'IN', 'cast' => 'string'],
            ['group' => 'shipping', 'key' => 'free_shipping_threshold', 'value' => '499', 'cast' => 'integer'],
            ['group' => 'shipping', 'key' => 'default_weight_unit', 'value' => 'kg', 'cast' => 'string'],
            ['group' => 'payment', 'key' => 'gateway', 'value' => 'razorpay', 'cast' => 'string'],
            ['group' => 'payment', 'key' => 'cod_enabled', 'value' => '0', 'cast' => 'boolean'],
            ['group' => 'seo', 'key' => 'home_title', 'value' => 'Vainavi Goodies – Authentic South Indian Pickles & Thokku | Dhanvanthiri Foods', 'cast' => 'string'],
            ['group' => 'seo', 'key' => 'home_description', 'value' => 'Buy authentic handmade South Indian pickles and thokku online. Made with traditional recipes, pure gingelly oil, and no preservatives. Free delivery on orders above ₹499.', 'cast' => 'string'],
        ];

        foreach ($settingsData as $setting) {
            $setting['created_at'] = $now;
            $setting['updated_at'] = $now;
            DB::table('store_settings')->insert($setting);
        }

        // ── Homepage Banners ─────────────────────────────────────────
        DB::table('banners')->insert([
            [
                'name' => 'Hero Banner',
                'title' => 'Authentic South Indian Pickles & Thokku',
                'subtitle' => 'Handmade with love – Traditional recipes passed down through generations',
                'image' => 'banners/hero-banner.jpg',
                'cta_text' => 'Shop Now',
                'cta_url' => '/catalog',
                'position' => 'hero',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Free Shipping Banner',
                'title' => 'Free Delivery on Orders Above ₹499',
                'subtitle' => 'Pan India delivery – Fresh from our kitchen to your doorstep',
                'image' => 'banners/free-shipping-banner.jpg',
                'cta_text' => 'Order Now',
                'cta_url' => '/catalog',
                'position' => 'hero',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // ── FAQs ─────────────────────────────────────────────────────
        $faqs = [
            ['category' => 'Products', 'question' => 'Are your products homemade?', 'answer' => 'Yes! All our thokku and pickles are handmade in small batches using traditional recipes and methods passed down through generations.', 'sort_order' => 1],
            ['category' => 'Products', 'question' => 'Do you use preservatives?', 'answer' => 'No, we do not use any artificial preservatives, colors, or flavors. Our products are naturally preserved using salt, oil, and traditional techniques.', 'sort_order' => 2],
            ['category' => 'Products', 'question' => 'What oil do you use?', 'answer' => 'We use pure cold-pressed gingelly (sesame) oil in all our products, which is the traditional oil used in South Indian pickle making.', 'sort_order' => 3],
            ['category' => 'Products', 'question' => 'How long do the products last?', 'answer' => 'Our pickles and thokku have a shelf life of 6-12 months when stored properly in a cool, dry place. Always use a clean, dry spoon.', 'sort_order' => 4],
            ['category' => 'Shipping', 'question' => 'Do you deliver across India?', 'answer' => 'Yes, we deliver pan India. Standard delivery takes 5-7 business days, and express delivery takes 2-3 business days.', 'sort_order' => 1],
            ['category' => 'Shipping', 'question' => 'Is there free shipping?', 'answer' => 'Yes! We offer free standard shipping on all orders above ₹499.', 'sort_order' => 2],
            ['category' => 'Orders', 'question' => 'Can I cancel my order?', 'answer' => 'You can cancel your order before it is shipped. Once shipped, cancellation is not possible but you can initiate a return after delivery.', 'sort_order' => 1],
            ['category' => 'Orders', 'question' => 'What payment methods do you accept?', 'answer' => 'We accept all major credit/debit cards, UPI, net banking, and popular wallet payments through our secure Razorpay payment gateway.', 'sort_order' => 2],
        ];

        foreach ($faqs as $faq) {
            $faq['is_active'] = true;
            DB::table('faqs')->insert($faq);
        }

        // ── Navigation Menus ─────────────────────────────────────────
        $mainMenuId = DB::table('menus')->insertGetId([
            'name' => 'Main Navigation',
            'location' => 'header',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $menuItems = [
            ['menu_id' => $mainMenuId, 'label' => 'Home', 'url' => '/', 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $mainMenuId, 'label' => 'Thokku', 'url' => '/catalog?category=thokku', 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $mainMenuId, 'label' => 'Podi', 'url' => '/catalog?category=podi', 'sort_order' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $mainMenuId, 'label' => 'Pickles', 'url' => '/catalog?category=pickles', 'sort_order' => 4, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $mainMenuId, 'label' => 'About Us', 'url' => '/pages/about', 'sort_order' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $mainMenuId, 'label' => 'FAQ', 'url' => '/faq', 'sort_order' => 6, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $mainMenuId, 'label' => 'Contact', 'url' => '/pages/contact', 'sort_order' => 7, 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('menu_items')->insert($menuItems);

        $footerMenuId = DB::table('menus')->insertGetId([
            'name' => 'Footer Navigation',
            'location' => 'footer',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('menu_items')->insert([
            ['menu_id' => $footerMenuId, 'label' => 'Privacy Policy', 'url' => '/pages/privacy-policy', 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $footerMenuId, 'label' => 'Terms & Conditions', 'url' => '/pages/terms-and-conditions', 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $footerMenuId, 'label' => 'Refund Policy', 'url' => '/pages/refund-policy', 'sort_order' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $footerMenuId, 'label' => 'Shipping Policy', 'url' => '/pages/shipping-policy', 'sort_order' => 4, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── CMS Pages ────────────────────────────────────────────────
        // Note: author_id=1 assumes a seeded admin user exists
        $pages = [
            [
                'title' => 'About Us',
                'slug' => 'about',
                'content' => '<h2>About Us</h2>
<p>This website is operated by Dhanvanthrifoods, trading as Dhanvanthiri Foods.</p>
<h3>Registered / Business Address</h3>
<p>8444, MM CASTLE, KASPAPETTAI VILLAGE, AVALPOONDURAI, Erode, Tamil Nadu-638115</p>
<h3>Email</h3>
<p>dhanvanthrifoods777@gmail.com</p>
<h3>Phone / WhatsApp</h3>
<p>9445717977</p>
<h3>Additional numbers registered</h3>
<p>9699, 846</p>
<h3>GSTIN</h3>
<p>Not mentioned in the FSSAI license document</p>
<h3>FSSAI License / Registration No.</h3>
<p>12425007000670</p>',
                'excerpt' => 'About Dhanvanthiri Foods including registered address and compliance details.',
                'template' => 'default',
                'status' => 'published',
                'author_id' => $adminUserId,
                'meta_title' => 'About Us | Dhanvanthiri Foods',
                'meta_description' => 'About Dhanvanthiri Foods with registered address, contact details, and FSSAI registration number.',
                'published_at' => $now,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact',
                'content' => '<h2>Get in Touch</h2>
<p>We\'d love to hear from you! Whether you have a question about our products, need help with an order, or just want to say hello, feel free to reach out.</p>
<h3>Contact Information</h3>
<ul>
<li><strong>Email:</strong> dhanvanthrifoods777@gmail.com</li>
<li><strong>Phone / WhatsApp:</strong> 9445717977</li>
<li><strong>Additional numbers registered:</strong> 9699, 846</li>
<li><strong>Address:</strong> 8444, MM CASTLE, KASPAPETTAI VILLAGE, AVALPOONDURAI, Erode, Tamil Nadu-638115</li>
</ul>
<h3>Business Hours</h3>
<p>Monday - Saturday: 9:00 AM - 6:00 PM IST<br>Sunday: Closed</p>',
                'excerpt' => 'Contact Dhanvanthiri Foods for inquiries about products, orders, or wholesale partnerships.',
                'template' => 'default',
                'status' => 'published',
                'author_id' => $adminUserId,
                'meta_title' => 'Contact Us | Dhanvanthiri Foods',
                'meta_description' => 'Contact Dhanvanthiri Foods for product inquiries, order support, or partnership opportunities.',
                'published_at' => $now,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            ...require database_path('support/legal_pages.php'),
        ];

        foreach ($pages as $page) {
            DB::table('pages')->updateOrInsert(
                ['slug' => $page['slug']],
                array_merge([
                    'template' => 'default',
                    'status' => 'published',
                    'author_id' => $adminUserId,
                    'published_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $page)
            );
        }

        // ── Coupon ───────────────────────────────────────────────────
        DB::table('coupons')->insert([
            [
                'code' => 'WELCOME10',
                'type' => 'percent',
                'value' => 10.00,
                'min_order_amount' => 299.00,
                'max_discount_amount' => 100.00,
                'usage_limit' => 1000,
                'used_count' => 0,
                'per_user_limit' => 1,
                'starts_at' => $now,
                'expires_at' => $now->copy()->addMonths(6),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'FLAT50',
                'type' => 'fixed',
                'value' => 50.00,
                'min_order_amount' => 500.00,
                'max_discount_amount' => null,
                'usage_limit' => 500,
                'used_count' => 0,
                'per_user_limit' => 2,
                'starts_at' => $now,
                'expires_at' => $now->copy()->addMonths(3),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}



