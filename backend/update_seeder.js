const fs = require('fs');

const thokku = [
    { name: 'Poondu Thokku', slug: 'poondu-thokku', price: 179, compare: 225, img: '/images/products/Poondu Thokku (Garlic Mashed Pickle).jpg', short: 'Bold garlic mashed pickle.', desc: '<p>Whole garlic cloves slow-cooked with tamarind, red chili, and cold-pressed sesame oil. A spicy, pungent thokku perfect with hot rice and curd rice.</p>', sku: 'PnT-250', stock: 45, tags: "['homemade', 'spicy', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Karuveppilai Thokku', slug: 'karuveppilai-thokku', price: 179, compare: 225, img: '/images/products/Karuveppilai Thokku (Curry Leaves Mashed Pickle).jpg', short: 'Flavor-packed curry leaves mashed pickle.', desc: '<p>Fresh curry leaves ground and slow-cooked with tamarind, spices, and cold-pressed oil. Excellent for hair growth and digestion.</p>', sku: 'KVT-250', stock: 50, tags: "['homemade', 'traditional', 'south-indian', 'healthy', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Pavakai Thokku', slug: 'pavakai-thokku', price: 159, compare: 199, img: '/images/products/Paakarkaai Thokku (Bitter Gourd Mashed Pickle).jpg', short: 'Sweet, sour, and mildly bitter gourd thokku.', desc: '<p>Bitter gourd slow-cooked with tamarind, jaggery, and spices. A unique blend of sweet, sour, and bitter notes that tastes incredible with rice.</p>', sku: 'PT-250', stock: 40, tags: "['homemade', 'traditional', 'healthy', 'vegetarian']", featured: false },
    { name: 'Pirandai Thokku', slug: 'pirandai-thokku', price: 199, compare: 249, img: '/images/products/Pirandai Thokku (Adamant Creeper Mashed Pickle).jpg', short: 'Bone-strengthening adamant creeper thokku.', desc: '<p>Pirandai (Adamant Creeper) slow-cooked with tamarind and spices. Known in Siddha medicine for strengthening bones and improving calcium absorption.</p>', sku: 'PiT-250', stock: 30, tags: "['homemade', 'healthy', 'vegetarian']", featured: true },
    { name: 'Valaipoo Thokku', slug: 'valaipoo-thokku', price: 199, compare: 249, img: '/images/products/Vazhaippu Thokku (Bannana Leaf Mashed Pickle).jpg', short: 'Traditional banana blossom thokku.', desc: '<p>A classic South Indian condiment made from fresh banana blossoms, slow-cooked with mustard, fenugreek, and a secret blend of spices. Perfect with rice, dosa, or idli.</p>', sku: 'VZ-250', stock: 40, tags: "['homemade', 'traditional', 'south-indian', 'vegetarian']", featured: false },
    { name: 'Thakkali Thokku', slug: 'thakkali-thokku', price: 159, compare: 199, img: '/images/products/Thakkali Thokku (Tomato Mashed Pickle).jpg', short: 'Tangy tomato mashed pickle.', desc: '<p>Ripe tomatoes slow-cooked to a thick, tangy paste with mustard, fenugreek, and aromatic spices. A versatile thokku that pairs beautifully with dosa, idli, and rice.</p>', sku: 'TT-250', stock: 55, tags: "['homemade', 'south-indian', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Vallarai Thokku', slug: 'vallarai-thokku', price: 179, compare: 225, img: '/images/products/Vallarai Thokku (Centella  Brahmi Mashed Pickle).jpg', short: 'Nutritious brahmi leaves mashed pickle.', desc: '<p>A healthy thokku made from fresh Vallarai (Centella) leaves, offering both medicinal benefits and a tangy, spicy flavor profile.</p>', sku: 'VAT-250', stock: 35, tags: "['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives']", featured: false },
    { name: 'Mallithalai Thokku', slug: 'mallithalai-thokku', price: 159, compare: 199, img: '/images/products/Mallithalai Thokku (Coriander Mashed Pickle).jpg', short: 'Fresh coriander mashed pickle.', desc: '<p>A refreshing coriander thokku made with fresh coriander leaves, green chili, and traditional spices. Adds a vibrant, herby kick to any meal.</p>', sku: 'MT-250', stock: 25, tags: "['homemade', 'vegetarian']", featured: false },
    { name: 'Chinavangayam Thokku', slug: 'chinavangayam-thokku', price: 179, compare: 225, img: '/images/products/Chinnavengayam Thokku (Shallot Mashed Pickle).jpg', short: 'Authentic shallot mashed pickle with rich flavors.', desc: '<p>A flavorful South Indian delicacy made with fresh shallots, slow-cooked with tamarind and a blend of traditional spices. Perfect as a side for rice, idli, or dosa.</p>', sku: 'CT-250', stock: 45, tags: "['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Kovakkai Thokku', slug: 'kovakkai-thokku', price: 179, compare: 225, img: '/images/products/Kovakkai Thokku (Ivy Gourd Mashed Pickle).jpg', short: 'Tangy ivy gourd mashed pickle.', desc: '<p>Fresh ivy gourd (kovakkai) slow-cooked with mustard, fenugreek, and traditional spices. A diabetic-friendly thokku with amazing flavors.</p>', sku: 'KK-250', stock: 30, tags: "['homemade', 'healthy', 'vegetarian']", featured: false },
];

const urukai = [
    { name: 'Lemon Urukai', slug: 'lemon-urukai', price: 149, compare: 189, img: '/images/products/Lime Pickle (Elumichai Oorugai).jpg', short: 'Zesty lemon pickle with a spicy punch.', desc: '<p>Elumichai (lemon) marinated with rock salt, chili powder, and traditional spices. A zesty, tangy pickle that adds life to any South Indian meal.</p>', sku: 'LU-250', stock: 40, tags: "['homemade', 'traditional', 'spicy', 'vegetarian']", featured: false },
    { name: 'Narthangai Urukai', slug: 'narthangai-urukai', price: 149, compare: 189, img: '/images/products/Citron Pickle (Narthangai Oorugai).jpg', short: 'Aromatic citron pickle with tangy notes.', desc: '<p>Narthangai (citron) marinated with mustard, fenugreek, and cold-pressed oil. A tangy, fragrant pickle that brings a burst of citrus to every meal.</p>', sku: 'NU-250', stock: 35, tags: "['homemade', 'traditional', 'vegetarian']", featured: false },
    { name: 'Maangai Urukai', slug: 'maangai-urukai', price: 149, compare: 189, img: '/images/products/Maanga Oorugai(Mango Pickle).jpg', short: 'Tangy and spicy traditional mango pickle.', desc: '<p>Made with hand-picked raw mangoes, mustard, fenugreek, and cold-pressed gingelly oil. Sun-dried for days to achieve the perfect crunch and flavor.</p>', sku: 'MU-250', stock: 70, tags: "['homemade', 'traditional', 'south-indian', 'spicy', 'no-preservatives', 'vegetarian', 'bestseller']", featured: true },
];

const podi = [
    { name: 'Idly Podi', slug: 'idly-podi', price: 99, compare: 129, img: '/images/products/Idly Podi (Idli Spice Mix).jpg', short: 'Classic roasted spice powder for idli and dosa.', desc: '<p>A quintessential South Indian breakfast companion. Roasted lentils and red chillies ground to a coarse, flavourful powder. Perfect with idli, dosa, and sesame oil.</p>', sku: 'IP-150', stock: 60, tags: "['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Paruppu Podi', slug: 'paruppu-podi', price: 99, compare: 129, img: '/images/products/Paruppu Podi (Dal Powder or Dal Spice Mix).jpg', short: 'Classic dal spice mix for rice.', desc: '<p>A staple South Indian comfort food made by roasting toor dal, roasted gram, and mild spices. Best enjoyed with hot steamed rice and a dollop of ghee.</p>', sku: 'PP-150', stock: 65, tags: "['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Poondu Podi', slug: 'poondu-podi', price: 109, compare: 139, img: '/images/products/Poondu Podi (Garlic Powder or Garlic Spice Mix).jpg', short: 'Flavorful garlic spice mix.', desc: '<p>A pungent and flavorful blend of roasted garlic, red chilies, and lentils. Perfect for spicing up your idlis, dosas, or plain rice.</p>', sku: 'PoP-150', stock: 45, tags: "['homemade', 'traditional', 'spicy', 'healthy', 'vegetarian', 'bestseller']", featured: false },
    { name: 'Karuveppilai Podi', slug: 'karuveppilai-podi', price: 109, compare: 139, img: '/images/products/Karuveppilai Podi (Curry Leaves Spice Mix or Curry Leaves Powder).jpg', short: 'Aromatic curry leaf powder rich in iron.', desc: '<p>Fresh curry leaves dried and ground with urad dal, chana dal, and spices. Sprinkle on hot rice with a drizzle of ghee or use as a side for idli/dosa.</p>', sku: 'KVP-150', stock: 60, tags: "['homemade', 'traditional', 'south-indian', 'healthy', 'vegetarian']", featured: true },
    { name: 'Nilakadalai Podi', slug: 'nilakadalai-podi', price: 119, compare: 149, img: '/images/products/Nilakadalai Podi (Groundnut  Spice Mix or (Groundnut  Powder).jpg', short: 'Crunchy groundnut spice mix.', desc: '<p>Roasted peanuts ground with dried coconut, red chili, and garlic. A protein-rich powder that makes idli/dosa breakfast extra special.</p>', sku: 'NP-150', stock: 50, tags: "['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Ellu Podi', slug: 'ellu-podi', price: 129, compare: 159, img: '/images/products/Ellu Podi (Black Sesame Spice Mix or Black Sesame Powder).jpg', short: 'Nutty black sesame spice mix.', desc: '<p>Roasted black sesame seeds ground with lentils, dried chili, and a touch of asafoetida. Calcium-rich and incredibly flavorful when mixed with hot rice and ghee.</p>', sku: 'EP-150', stock: 40, tags: "['homemade', 'traditional', 'healthy', 'vegetarian']", featured: false },
    { name: 'Kollu Podi', slug: 'kollu-podi', price: 119, compare: 149, img: '/images/products/Kollu Podi ( Horse gram Spice Mix or Horse gram Powder).jpg', short: 'Nutritious horse gram spice mix.', desc: '<p>Roasted horse gram blended with traditional spices. Known for its weight management properties, this podi is both healthy and delicious.</p>', sku: 'KP-150', stock: 45, tags: "['homemade', 'traditional', 'healthy', 'vegetarian']", featured: false },
    { name: 'Murungai Podi', slug: 'murungai-podi', price: 129, compare: 159, img: '/images/products/Murungai Keerai Podi (Moringa Spice Mix or (Moringa Powder).jpg', short: 'Super-food moringa spice mix.', desc: '<p>Dried moringa leaves blended with lentils and spices. A powerhouse of vitamins and minerals, adding a healthy kick to your daily meals.</p>', sku: 'MKP-150', stock: 55, tags: "['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives']", featured: true },
    { name: 'Pirandai Podi', slug: 'pirandai-podi', price: 129, compare: 159, img: '/images/products/Pirandai Podi (Veldt Grape Powder or Veldt Grape Spice Mix).jpg', short: 'Bone-strengthening veldt grape spice mix.', desc: '<p>Pirandai (Adamant Creeper / Veldt grape) dried and roasted with lentils. Known in traditional medicine to strengthen bones and improve digestion.</p>', sku: 'PiP-150', stock: 35, tags: "['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives']", featured: false },
    { name: 'Vallarai Podi', slug: 'vallarai-podi', price: 129, compare: 159, img: '/images/products/Vallarai Podi (Centella Powder or Centella Spice Mix ).jpg', short: 'Brain-boosting brahmi leaf powder.', desc: '<p>Sun-dried and stone-ground Vallarai (Brahmi) leaves blended with dal and spices. Known for its cognitive boosting properties.</p>', sku: 'VAP-150', stock: 40, tags: "['homemade', 'traditional', 'healthy', 'vegetarian', 'no-preservatives']", featured: false },
    { name: 'Sambar Podi', slug: 'sambar-podi', price: 149, compare: 189, img: '/images/products/Sambar Podi (Sambar Powder).jpg', short: 'Traditional sambar powder blend.', desc: '<p>A fragrant blend of roasted coriander, cumin, fenugreek, red chillies, and lentils. The heart of every South Indian sambar, freshly ground in small batches.</p>', sku: 'SP-150', stock: 50, tags: "['homemade', 'traditional', 'south-indian', 'vegetarian', 'bestseller']", featured: true },
    { name: 'Pulikulambu Podi', slug: 'pulikulambu-podi', price: 149, compare: 189, img: '/images/products/Pulikulambu Podi (Tamarind Curry Powder).jpg', short: 'Spice mix for tangy tamarind curry.', desc: '<p>A carefully crafted spice blend for the beloved Tamil tamarind curry. Balanced heat, tang, and warmth for effortless authentic pulikulambu.</p>', sku: 'PuP-150', stock: 40, tags: "['homemade', 'traditional', 'vegetarian']", featured: false },
    { name: 'Karikulambu Podi', slug: 'karikulambu-podi', price: 149, compare: 189, img: '/images/products/Karikulambu Podi (Black Curry Powder).jpg', short: 'Robust black curry spice mix.', desc: '<p>A bold, deeply roasted spice blend for the iconic Tamil black curry. Smoky, robust character that brings authentic depth to this beloved everyday dish.</p>', sku: 'KKP-150', stock: 35, tags: "['homemade', 'traditional', 'vegetarian']", featured: false },
    { name: 'Rasa Podi', slug: 'rasa-podi', price: 149, compare: 189, img: '/images/products/Rasa Podi (Rasam Powder).jpg', short: 'Traditional rasam powder blend.', desc: '<p>A classic pepper-forward rasam powder ground fresh with black pepper, cumin, coriander, and garlic. Makes preparing comforting South Indian rasam quick and easy.</p>', sku: 'RP-150', stock: 45, tags: "['homemade', 'traditional', 'vegetarian']", featured: false },
];

let phpArrayElements = '';

function genPHP(products, catIdStr, weight) {
    products.forEach(p => {
        const costPrice = p.price > 120 ? 80 : 50;
        phpArrayElements += `            [
                'category_id' => ${catIdStr},
                'name' => '${p.name.replace(/'/g, "\\'")}',
                'slug' => '${p.slug}',
                'sku' => '${p.sku.split('-')[0]}-000',
                'description' => '${p.desc.replace(/'/g, "\\'")}',
                'short_description' => '${p.short.replace(/'/g, "\\'")}',
                'price' => ${p.price}.00,
                'compare_price' => ${p.compare}.00,
                'cost_price' => ${costPrice}.00,
                'stock_quantity' => ${p.stock},
                'weight' => ${weight},
                'is_featured' => ${p.featured ? 'true' : 'false'},
                'tags' => ${p.tags},
                'image' => '${p.img}',
                'sku_variant' => '${p.sku}',
            ],\n`;
    });
}

genPHP(thokku, '$thokkuCatId', 0.25);
genPHP(urukai, '$pickleCatId', 0.25);
genPHP(podi, '$podiCatId', 0.15);

let phpCode = `        $products = [
${phpArrayElements}        ];`;

const filePath = 'database/seeders/ProductSeeder.php';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\$products\s*=\s*\[.*?(?=foreach \(\$products as \$productData\))/s;
content = content.replace(regex, phpCode + '\n\n        ');

// Need to update the generic sku mapping because we changed it above to map sku logic
const variantReplacementRegex = /'sku' => \$productData\['sku'\] \. '-200G',/s;
content = content.replace(variantReplacementRegex, "'sku' => \$productData['sku_variant'],");

// Need to remove sku_variant from insert array
const unsetRegex = /unset\(\$productData\['tags'\], \$productData\['image'\]\);/s;
content = content.replace(unsetRegex, "unset(\$productData['tags'], \$productData['image'], \$productData['sku_variant']);");

fs.writeFileSync(filePath, content);
console.log('Seeder products updated successfully.');
