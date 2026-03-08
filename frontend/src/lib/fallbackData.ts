// Static fallback data used when the backend API is unavailable.
// When the API returns valid data, that takes priority over these defaults.

export interface FallbackProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number;
    primary_image_url: string;
    short_description: string;
    description: string;
    avg_rating: number;
    review_count: number;
    status: string;
    variants: { id: number; name: string; sku: string; price_override: null; stock_quantity: number }[];
    tags: { name: string }[];
}

export const fallbackProducts: FallbackProduct[] = [
    // ─── THOKKU (10 products, all 250g) ───
    {
        id: 1,
        name: 'Poondu Thokku',
        slug: 'poondu-thokku',
        price: 179,
        compare_at_price: 225,
        primary_image_url: '/images/products/Poondu Thokku (Garlic Mashed Pickle).jpg',
        short_description: 'Bold garlic mashed pickle.',
        description: '<p>Whole garlic cloves slow-cooked with tamarind, red chili, and cold-pressed sesame oil. A spicy, pungent thokku perfect with hot rice and curd rice.</p>',
        avg_rating: 4.7,
        review_count: 33,
        status: 'active',
        variants: [{ id: 1, name: '250g Jar', sku: 'PnT-250', price_override: null, stock_quantity: 45 }],
        tags: [{ name: 'Thokku' }, { name: 'Bestseller' }],
    },
    {
        id: 2,
        name: 'Karuveppilai Thokku',
        slug: 'karuveppilai-thokku',
        price: 179,
        compare_at_price: 225,
        primary_image_url: '/images/products/Karuveppilai Thokku (Curry Leaves Mashed Pickle).jpg',
        short_description: 'Flavor-packed curry leaves mashed pickle.',
        description: '<p>Fresh curry leaves ground and slow-cooked with tamarind, spices, and cold-pressed oil. Excellent for hair growth and digestion.</p>',
        avg_rating: 4.5,
        review_count: 28,
        status: 'active',
        variants: [{ id: 2, name: '250g Jar', sku: 'KVT-250', price_override: null, stock_quantity: 50 }],
        tags: [{ name: 'Thokku' }, { name: 'Bestseller' }],
    },
    {
        id: 3,
        name: 'Pavakai Thokku',
        slug: 'pavakai-thokku',
        price: 159,
        compare_at_price: 199,
        primary_image_url: '/images/products/Paakarkaai Thokku (Bitter Gourd Mashed Pickle).jpg',
        short_description: 'Sweet, sour, and mildly bitter gourd thokku.',
        description: '<p>Bitter gourd slow-cooked with tamarind, jaggery, and spices. A unique blend of sweet, sour, and bitter notes that tastes incredible with rice.</p>',
        avg_rating: 4.5,
        review_count: 27,
        status: 'active',
        variants: [{ id: 3, name: '250g Jar', sku: 'PT-250', price_override: null, stock_quantity: 40 }],
        tags: [{ name: 'Thokku' }, { name: 'Health' }],
    },
    {
        id: 4,
        name: 'Pirandai Thokku',
        slug: 'pirandai-thokku',
        price: 199,
        compare_at_price: 249,
        primary_image_url: '/images/products/Pirandai Thokku (Adamant Creeper Mashed Pickle).jpg',
        short_description: 'Bone-strengthening adamant creeper thokku.',
        description: '<p>Pirandai (Adamant Creeper) slow-cooked with tamarind and spices. Known in Siddha medicine for strengthening bones and improving calcium absorption.</p>',
        avg_rating: 4.5,
        review_count: 20,
        status: 'active',
        variants: [{ id: 4, name: '250g Jar', sku: 'PiT-250', price_override: null, stock_quantity: 30 }],
        tags: [{ name: 'Thokku' }, { name: 'Health' }],
    },
    {
        id: 5,
        name: 'Valaipoo Thokku',
        slug: 'valaipoo-thokku',
        price: 199,
        compare_at_price: 249,
        primary_image_url: '/images/products/Vazhaippu Thokku (Bannana Leaf Mashed Pickle).jpg',
        short_description: 'Traditional banana blossom thokku.',
        description: '<p>A classic South Indian condiment made from fresh banana blossoms, slow-cooked with mustard, fenugreek, and a secret blend of spices. Perfect with rice, dosa, or idli.</p>',
        avg_rating: 4.6,
        review_count: 25,
        status: 'active',
        variants: [{ id: 5, name: '250g Jar', sku: 'VZ-250', price_override: null, stock_quantity: 40 }],
        tags: [{ name: 'Thokku' }],
    },
    {
        id: 6,
        name: 'Thakkali Thokku',
        slug: 'thakkali-thokku',
        price: 159,
        compare_at_price: 199,
        primary_image_url: '/images/products/Thakkali Thokku (Tomato Mashed Pickle).jpg',
        short_description: 'Tangy tomato mashed pickle.',
        description: '<p>Ripe tomatoes slow-cooked to a thick, tangy paste with mustard, fenugreek, and aromatic spices. A versatile thokku that pairs beautifully with dosa, idli, and rice.</p>',
        avg_rating: 4.8,
        review_count: 48,
        status: 'active',
        variants: [{ id: 6, name: '250g Jar', sku: 'TT-250', price_override: null, stock_quantity: 55 }],
        tags: [{ name: 'Thokku' }, { name: 'Bestseller' }],
    },
    {
        id: 7,
        name: 'Vallarai Thokku',
        slug: 'vallarai-thokku',
        price: 179,
        compare_at_price: 225,
        primary_image_url: '/images/products/Vallarai Thokku (Centella  Brahmi Mashed Pickle).jpg',
        short_description: 'Nutritious brahmi leaves mashed pickle.',
        description: '<p>A healthy thokku made from fresh Vallarai (Centella) leaves, offering both medicinal benefits and a tangy, spicy flavor profile.</p>',
        avg_rating: 4.5,
        review_count: 21,
        status: 'active',
        variants: [{ id: 7, name: '250g Jar', sku: 'VAT-250', price_override: null, stock_quantity: 35 }],
        tags: [{ name: 'Thokku' }, { name: 'Health' }],
    },
    {
        id: 8,
        name: 'Mallithalai Thokku',
        slug: 'mallithalai-thokku',
        price: 159,
        compare_at_price: 199,
        primary_image_url: '/images/products/Mallithalai Thokku (Coriander Mashed Pickle).jpg',
        short_description: 'Fresh coriander mashed pickle.',
        description: '<p>A refreshing coriander thokku made with fresh coriander leaves, green chili, and traditional spices. Adds a vibrant, herby kick to any meal.</p>',
        avg_rating: 4.3,
        review_count: 15,
        status: 'active',
        variants: [{ id: 8, name: '250g Jar', sku: 'MT-250', price_override: null, stock_quantity: 25 }],
        tags: [{ name: 'Thokku' }],
    },
    {
        id: 9,
        name: 'Chinavangayam Thokku',
        slug: 'chinavangayam-thokku',
        price: 179,
        compare_at_price: 225,
        primary_image_url: '/images/products/Chinnavengayam Thokku (Shallot Mashed Pickle).jpg',
        short_description: 'Authentic shallot mashed pickle with rich flavors.',
        description: '<p>A flavorful South Indian delicacy made with fresh shallots, slow-cooked with tamarind and a blend of traditional spices. Perfect as a side for rice, idli, or dosa.</p>',
        avg_rating: 4.6,
        review_count: 24,
        status: 'active',
        variants: [{ id: 9, name: '250g Jar', sku: 'CT-250', price_override: null, stock_quantity: 45 }],
        tags: [{ name: 'Thokku' }, { name: 'Bestseller' }],
    },
    {
        id: 10,
        name: 'Kovakkai Thokku',
        slug: 'kovakkai-thokku',
        price: 179,
        compare_at_price: 225,
        primary_image_url: '/images/products/Kovakkai Thokku (Ivy Gourd Mashed Pickle).jpg',
        short_description: 'Tangy ivy gourd mashed pickle.',
        description: '<p>Fresh ivy gourd (kovakkai) slow-cooked with mustard, fenugreek, and traditional spices. A diabetic-friendly thokku with amazing flavors.</p>',
        avg_rating: 4.4,
        review_count: 18,
        status: 'active',
        variants: [{ id: 10, name: '250g Jar', sku: 'KK-250', price_override: null, stock_quantity: 30 }],
        tags: [{ name: 'Thokku' }, { name: 'Health' }],
    },
    // ─── URUKAI (3 products, all 250g) ───
    {
        id: 11,
        name: 'Lemon Urukai',
        slug: 'lemon-urukai',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Lime Pickle (Elumichai Oorugai).jpg',
        short_description: 'Zesty lemon pickle with a spicy punch.',
        description: '<p>Elumichai (lemon) marinated with rock salt, chili powder, and traditional spices. A zesty, tangy pickle that adds life to any South Indian meal.</p>',
        avg_rating: 4.7,
        review_count: 30,
        status: 'active',
        variants: [{ id: 11, name: '250g Jar', sku: 'LU-250', price_override: null, stock_quantity: 40 }],
        tags: [{ name: 'Urukai' }],
    },
    {
        id: 12,
        name: 'Narthangai Urukai',
        slug: 'narthangai-urukai',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Citron Pickle (Narthangai Oorugai).jpg',
        short_description: 'Aromatic citron pickle with tangy notes.',
        description: '<p>Narthangai (citron) marinated with mustard, fenugreek, and cold-pressed oil. A tangy, fragrant pickle that brings a burst of citrus to every meal.</p>',
        avg_rating: 4.6,
        review_count: 22,
        status: 'active',
        variants: [{ id: 12, name: '250g Jar', sku: 'NU-250', price_override: null, stock_quantity: 35 }],
        tags: [{ name: 'Urukai' }],
    },
    {
        id: 13,
        name: 'Maangai Urukai',
        slug: 'maangai-urukai',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Maanga Oorugai(Mango Pickle).jpg',
        short_description: 'Tangy and spicy traditional mango pickle.',
        description: '<p>Made with hand-picked raw mangoes, mustard, fenugreek, and cold-pressed gingelly oil. Sun-dried for days to achieve the perfect crunch and flavor.</p>',
        avg_rating: 4.9,
        review_count: 65,
        status: 'active',
        variants: [{ id: 13, name: '250g Jar', sku: 'MU-250', price_override: null, stock_quantity: 70 }],
        tags: [{ name: 'Urukai' }, { name: 'Bestseller' }],
    },
    // ─── PODI (14 products, all 150g) ───
    {
        id: 14,
        name: 'Idly Podi',
        slug: 'idly-podi',
        price: 99,
        compare_at_price: 129,
        primary_image_url: '/images/products/Idly Podi (Idli Spice Mix).jpg',
        short_description: 'Classic roasted spice powder for idli and dosa.',
        description: '<p>A quintessential South Indian breakfast companion. Roasted lentils and red chillies ground to a coarse, flavourful powder. Perfect with idli, dosa, and sesame oil.</p>',
        avg_rating: 4.7,
        review_count: 40,
        status: 'active',
        variants: [{ id: 14, name: '150g Jar', sku: 'IP-150', price_override: null, stock_quantity: 60 }],
        tags: [{ name: 'Podi' }, { name: 'Bestseller' }],
    },
    {
        id: 15,
        name: 'Paruppu Podi',
        slug: 'paruppu-podi',
        price: 99,
        compare_at_price: 129,
        primary_image_url: '/images/products/Paruppu Podi (Dal Powder or Dal Spice Mix).jpg',
        short_description: 'Classic dal spice mix for rice.',
        description: '<p>A staple South Indian comfort food made by roasting toor dal, roasted gram, and mild spices. Best enjoyed with hot steamed rice and a dollop of ghee.</p>',
        avg_rating: 4.8,
        review_count: 55,
        status: 'active',
        variants: [{ id: 15, name: '150g Jar', sku: 'PP-150', price_override: null, stock_quantity: 65 }],
        tags: [{ name: 'Podi' }, { name: 'Bestseller' }],
    },
    {
        id: 16,
        name: 'Poondu Podi',
        slug: 'poondu-podi',
        price: 109,
        compare_at_price: 139,
        primary_image_url: '/images/products/Poondu Podi (Garlic Powder or Garlic Spice Mix).jpg',
        short_description: 'Flavorful garlic spice mix.',
        description: '<p>A pungent and flavorful blend of roasted garlic, red chilies, and lentils. Perfect for spicing up your idlis, dosas, or plain rice.</p>',
        avg_rating: 4.7,
        review_count: 40,
        status: 'active',
        variants: [{ id: 16, name: '150g Jar', sku: 'PoP-150', price_override: null, stock_quantity: 45 }],
        tags: [{ name: 'Podi' }, { name: 'Bestseller' }],
    },
    {
        id: 17,
        name: 'Karuveppilai Podi',
        slug: 'karuveppilai-podi',
        price: 109,
        compare_at_price: 139,
        primary_image_url: '/images/products/Karuveppilai Podi (Curry Leaves Spice Mix or Curry Leaves Powder).jpg',
        short_description: 'Aromatic curry leaf powder rich in iron.',
        description: '<p>Fresh curry leaves dried and ground with urad dal, chana dal, and spices. Sprinkle on hot rice with a drizzle of ghee or use as a side for idli/dosa.</p>',
        avg_rating: 4.8,
        review_count: 52,
        status: 'active',
        variants: [{ id: 17, name: '150g Jar', sku: 'KVP-150', price_override: null, stock_quantity: 60 }],
        tags: [{ name: 'Podi' }, { name: 'Health' }],
    },
    {
        id: 18,
        name: 'Nilakadalai Podi',
        slug: 'nilakadalai-podi',
        price: 119,
        compare_at_price: 149,
        primary_image_url: '/images/products/Nilakadalai Podi (Groundnut  Spice Mix or (Groundnut  Powder).jpg',
        short_description: 'Crunchy groundnut spice mix.',
        description: '<p>Roasted peanuts ground with dried coconut, red chili, and garlic. A protein-rich powder that makes idli/dosa breakfast extra special.</p>',
        avg_rating: 4.7,
        review_count: 42,
        status: 'active',
        variants: [{ id: 18, name: '150g Jar', sku: 'NP-150', price_override: null, stock_quantity: 50 }],
        tags: [{ name: 'Podi' }, { name: 'Bestseller' }],
    },
    {
        id: 19,
        name: 'Ellu Podi',
        slug: 'ellu-podi',
        price: 129,
        compare_at_price: 159,
        primary_image_url: '/images/products/Ellu Podi (Black Sesame Spice Mix or Black Sesame Powder).jpg',
        short_description: 'Nutty black sesame spice mix.',
        description: '<p>Roasted black sesame seeds ground with lentils, dried chili, and a touch of asafoetida. Calcium-rich and incredibly flavorful when mixed with hot rice and ghee.</p>',
        avg_rating: 4.7,
        review_count: 35,
        status: 'active',
        variants: [{ id: 19, name: '150g Jar', sku: 'EP-150', price_override: null, stock_quantity: 40 }],
        tags: [{ name: 'Podi' }, { name: 'Health' }],
    },
    {
        id: 20,
        name: 'Kollu Podi',
        slug: 'kollu-podi',
        price: 119,
        compare_at_price: 149,
        primary_image_url: '/images/products/Kollu Podi ( Horse gram Spice Mix or Horse gram Powder).jpg',
        short_description: 'Nutritious horse gram spice mix.',
        description: '<p>Roasted horse gram blended with traditional spices. Known for its weight management properties, this podi is both healthy and delicious.</p>',
        avg_rating: 4.4,
        review_count: 22,
        status: 'active',
        variants: [{ id: 20, name: '150g Jar', sku: 'KP-150', price_override: null, stock_quantity: 45 }],
        tags: [{ name: 'Podi' }, { name: 'Health' }],
    },
    {
        id: 21,
        name: 'Murungai Podi',
        slug: 'murungai-podi',
        price: 129,
        compare_at_price: 159,
        primary_image_url: '/images/products/Murungai Keerai Podi (Moringa Spice Mix or (Moringa Powder).jpg',
        short_description: 'Super-food moringa spice mix.',
        description: '<p>Dried moringa leaves blended with lentils and spices. A powerhouse of vitamins and minerals, adding a healthy kick to your daily meals.</p>',
        avg_rating: 4.6,
        review_count: 31,
        status: 'active',
        variants: [{ id: 21, name: '150g Jar', sku: 'MKP-150', price_override: null, stock_quantity: 55 }],
        tags: [{ name: 'Podi' }, { name: 'Superfood' }, { name: 'Health' }],
    },
    {
        id: 22,
        name: 'Pirandai Podi',
        slug: 'pirandai-podi',
        price: 129,
        compare_at_price: 159,
        primary_image_url: '/images/products/Pirandai Podi (Veldt Grape Powder or Veldt Grape Spice Mix).jpg',
        short_description: 'Bone-strengthening veldt grape spice mix.',
        description: '<p>Pirandai (Adamant Creeper / Veldt grape) dried and roasted with lentils. Known in traditional medicine to strengthen bones and improve digestion.</p>',
        avg_rating: 4.4,
        review_count: 19,
        status: 'active',
        variants: [{ id: 22, name: '150g Jar', sku: 'PiP-150', price_override: null, stock_quantity: 35 }],
        tags: [{ name: 'Podi' }, { name: 'Health' }],
    },
    {
        id: 23,
        name: 'Vallarai Podi',
        slug: 'vallarai-podi',
        price: 129,
        compare_at_price: 159,
        primary_image_url: '/images/products/Vallarai Podi (Centella Powder or Centella Spice Mix ).jpg',
        short_description: 'Brain-boosting brahmi leaf powder.',
        description: '<p>Sun-dried and stone-ground Vallarai (Brahmi) leaves blended with dal and spices. Known for its cognitive boosting properties.</p>',
        avg_rating: 4.6,
        review_count: 35,
        status: 'active',
        variants: [{ id: 23, name: '150g Jar', sku: 'VAP-150', price_override: null, stock_quantity: 40 }],
        tags: [{ name: 'Podi' }, { name: 'Health' }],
    },
    {
        id: 24,
        name: 'Sambar Podi',
        slug: 'sambar-podi',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Sambar Podi (Sambar Powder).jpg',
        short_description: 'Traditional sambar powder blend.',
        description: '<p>A fragrant blend of roasted coriander, cumin, fenugreek, red chillies, and lentils. The heart of every South Indian sambar, freshly ground in small batches.</p>',
        avg_rating: 4.7,
        review_count: 38,
        status: 'active',
        variants: [{ id: 24, name: '150g Jar', sku: 'SP-150', price_override: null, stock_quantity: 50 }],
        tags: [{ name: 'Podi' }, { name: 'Bestseller' }],
    },
    {
        id: 25,
        name: 'Pulikulambu Podi',
        slug: 'pulikulambu-podi',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Pulikulambu Podi (Tamarind Curry Powder).jpg',
        short_description: 'Spice mix for tangy tamarind curry.',
        description: '<p>A carefully crafted spice blend for the beloved Tamil tamarind curry. Balanced heat, tang, and warmth for effortless authentic pulikulambu.</p>',
        avg_rating: 4.5,
        review_count: 20,
        status: 'active',
        variants: [{ id: 25, name: '150g Jar', sku: 'PuP-150', price_override: null, stock_quantity: 40 }],
        tags: [{ name: 'Podi' }],
    },
    {
        id: 26,
        name: 'Karikulambu Podi',
        slug: 'karikulambu-podi',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Karikulambu Podi (Black Curry Powder).jpg',
        short_description: 'Robust black curry spice mix.',
        description: '<p>A bold, deeply roasted spice blend for the iconic Tamil black curry. Smoky, robust character that brings authentic depth to this beloved everyday dish.</p>',
        avg_rating: 4.5,
        review_count: 18,
        status: 'active',
        variants: [{ id: 26, name: '150g Jar', sku: 'KKP-150', price_override: null, stock_quantity: 35 }],
        tags: [{ name: 'Podi' }],
    },
    {
        id: 27,
        name: 'Rasa Podi',
        slug: 'rasa-podi',
        price: 149,
        compare_at_price: 189,
        primary_image_url: '/images/products/Rasa Podi (Rasam Powder).jpg',
        short_description: 'Traditional rasam powder blend.',
        description: '<p>A classic pepper-forward rasam powder ground fresh with black pepper, cumin, coriander, and garlic. Makes preparing comforting South Indian rasam quick and easy.</p>',
        avg_rating: 4.6,
        review_count: 25,
        status: 'active',
        variants: [{ id: 27, name: '150g Jar', sku: 'RP-150', price_override: null, stock_quantity: 45 }],
        tags: [{ name: 'Podi' }],
    },
];

export const fallbackCategories = [
    { id: 1, name: 'Thokku', slug: 'thokku', image_url: null, products_count: 10 },
    { id: 2, name: 'Urukai', slug: 'urukai', image_url: null, products_count: 3 },
    { id: 3, name: 'Podi', slug: 'podi', image_url: null, products_count: 14 },
];

export function resolveFallbackImage(productName?: string, productSlug?: string, productId?: number): string {
    if (!productName) {
        const index = (productId || 1) % fallbackProducts.length;
        return fallbackProducts[index]?.primary_image_url || '';
    }

    // Try exact slug or name
    let fallback = fallbackProducts.find(p => p.slug === productSlug || p.name === productName);

    // Try partial matching (e.g. "Karuveppilai Thokku (Curry)" matching "Karuveppilai Thokku")
    if (!fallback) {
        const searchName = productName.toLowerCase();
        fallback = fallbackProducts.find(p =>
            searchName.includes(p.name.toLowerCase()) ||
            searchName.includes(p.name.split(' ')[0].toLowerCase())
        );
    }

    if (fallback) {
        return fallback.primary_image_url;
    }

    // Deterministic fallback if absolutely no match
    const index = (productId || 1) % fallbackProducts.length;
    return fallbackProducts[index]?.primary_image_url || '';
}

export const fallbackFaqs = [
    { id: 1, question: 'Are your products preservative-free?', answer: 'Yes! All our pickles, thokku, and podi are 100% natural with zero chemical preservatives. We use traditional methods like sun-drying and cold-pressed oils to ensure a long shelf life naturally.', category: 'Products' },
    { id: 2, question: 'What oils do you use?', answer: 'We primarily use cold-pressed gingelly (sesame) oil and groundnut oil — the same oils used in traditional South Indian kitchens for generations.', category: 'Products' },
    { id: 3, question: 'How long do the pickles last?', answer: 'When stored in a cool, dry place with a clean, dry spoon, our pickles typically last 6–12 months. Podi and chutney powders last 3–6 months.', category: 'Products' },
    { id: 4, question: 'Do you ship across India?', answer: 'Yes, we deliver pan-India! Orders are typically dispatched within 1–2 business days. Delivery takes 3–7 days depending on your location.', category: 'Shipping' },
    { id: 5, question: 'Is there free shipping?', answer: 'We offer free shipping on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 applies.', category: 'Shipping' },
    { id: 6, question: 'Can I return or exchange a product?', answer: 'Due to the perishable nature of our products, we do not accept returns. However, if you receive a damaged or wrong product, we will happily replace it. Please contact us within 48 hours of delivery with photos.', category: 'Orders' },
    { id: 7, question: 'What payment methods do you accept?', answer: 'We accept UPI, credit/debit cards, net banking, and popular wallets like Paytm and PhonePe through our secure payment gateway.', category: 'Orders' },
    { id: 8, question: 'Are your products suitable for vegetarians?', answer: 'Absolutely! All Dhanvanthiri Foods products are 100% vegetarian and made in a vegetarian-only kitchen.', category: 'Products' },
];

export const fallbackBlogPosts = [
    {
        id: 1,
        title: 'The Art of Traditional Pickle Making',
        slug: 'art-of-traditional-pickle-making',
        excerpt: 'Discover the art of traditional South Indian pickle making, including ingredients, techniques, and preservation methods used for generations.',
        featured_image_url: '/images/blog/traditional-pickle-making.png',
        category: { name: 'Traditions', slug: 'traditions' },
        author: { name: 'Dhanvanthiri Kitchen' },
        reading_time: 5,
        published_at: '2025-12-15T10:00:00Z',
        meta_title: 'Traditional South Indian Pickle Making – Techniques, Ingredients & Tips',
        meta_description: 'Discover the art of traditional South Indian pickle making, including ingredients, techniques, and preservation methods used for generations.',
        body: `<h2>Introduction</h2>
<p>Traditional pickle making is an age-old culinary practice deeply rooted in South Indian households. Long before refrigeration became common, families relied on natural preservation techniques using <strong>salt, oil, and spices</strong> to store seasonal produce.</p>
<p>These homemade pickles were not only incredibly flavorful but also a beautiful way to celebrate tradition, agriculture, and local culture.</p>

<blockquote>"A meal without pickle is like a story without a soul. It brings the perfect balance of tang, spice, and comfort."</blockquote>

<h2>Choosing the Right Ingredients</h2>
<p>Fresh ingredients are the absolute foundation of authentic pickles. <em>Raw mangoes, lemons, gooseberries (amla), garlic, and ginger</em> are among the most commonly used heroes of the pickle jar.</p>
<p>High-quality, freshly roasted spices such as <strong>mustard seeds, fenugreek seeds, earthy turmeric, fiery red chili powder, and aromatic asafoetida (hing)</strong> provide the distinctive, mouth-watering flavor profile we all love.</p>

<h2>Why Oil and Salt Are Essential</h2>
<p>Salt and oil serve two critical, irreplaceable roles in traditional pickle making:</p>
<ul>
<li><strong>Salt:</strong> Acts as a natural dehydrator, removing excess moisture and preventing any bacterial growth.</li>
<li><strong>Cold-pressed Sesame Oil (Gingelly oil):</strong> Enhances the deep, nutty flavor while acting as a perfect seal to extend shelf life naturally.</li>
</ul>
<p>Together, they ensure that pickles remain safe and incredibly flavorful for months, even years.</p>

<h2>Sun Fermentation: The Traditional Method</h2>
<p>Sunlight plays a vital, almost magical role in the fermentation process. Pickle jars are often kept in direct sunlight for several days, allowing the ingredients, spices, and oils to blend and mature naturally under the warm sun.</p>
<p>This slow, deliberate fermentation process develops the <em>deep, complex, and punchy flavors</em> that define truly traditional South Indian pickles.</p>

<h2>Preserving Culture Through Food</h2>
<p>Traditional pickle making represents much more than just a cooking technique. It is a living, breathing cultural tradition that brings families together, sparking joy and preserving our culinary heritage across generations.</p>`
    },
    {
        id: 2,
        title: '5 Health Benefits of Curry Leaves You Didn\'t Know',
        slug: 'health-benefits-curry-leaves',
        excerpt: 'Learn the top health benefits of curry leaves including digestion support, hair growth, blood sugar control, and antioxidant properties.',
        featured_image_url: '/images/blog/curry-leaves-health.png',
        category: { name: 'Health & Wellness', slug: 'health-wellness' },
        author: { name: 'Dhanvanthiri Kitchen' },
        reading_time: 4,
        published_at: '2026-01-08T10:00:00Z',
        meta_title: '5 Health Benefits of Curry Leaves – Nutrition, Hair & Digestion Benefits',
        meta_description: 'Learn the top health benefits of curry leaves including digestion support, hair growth, blood sugar control, and antioxidant properties.',
        body: `<h2>Introduction</h2>
<p><em>Curry leaves (Karuveppilai)</em> are an absolute essential in South Indian cooking, instantly recognized by their distinctive, mouth-watering aroma and citrusy, earthy flavor.</p>
<p>However, these small green leaves offer far more than just culinary appeal. Packed to the brim with <strong>vitamins, powerful antioxidants, and medicinal compounds</strong>, curry leaves have been revered and used in traditional Ayurvedic medicine for centuries.</p>

<blockquote>"Curry leaves aren't just a garnish; they are a powerhouse of everyday wellness and traditional healing."</blockquote>

<h2>1. Rich Source of Antioxidants</h2>
<p>Curry leaves contain incredibly powerful antioxidants that protect the body from oxidative stress and free radical damage.</p>
<p>Regular consumption of these antioxidants contributes to <strong>significantly improved immunity</strong> and long-term overall wellness.</p>

<h2>2. Supports Healthy Digestion</h2>
<p>Curry leaves naturally stimulate digestive enzymes and help your digestive system function much more efficiently, breaking down food with ease.</p>
<p>They have traditionally been used to relieve <em>indigestion, bloating, and mild nausea</em>—making them the perfect addition to heavy meals.</p>

<h2>3. Helps Maintain Healthy Blood Sugar</h2>
<p>Modern studies suggest that curry leaves may naturally help regulate blood sugar levels. This makes them highly beneficial for individuals actively managing <strong>diabetes or overall metabolic health</strong>.</p>

<h2>4. Promotes Hair Growth and Scalp Health</h2>
<p>If you've ever wondered about the secret to thick, healthy hair, look no further. Curry leaves contain critical nutrients such as <strong>beta-carotene and vital proteins</strong> that strengthen hair follicles, prevent thinning, and actively promote hair growth.</p>
<p>Because of this, they are a primary, irreplaceable ingredient in traditional herbal hair oils.</p>

<h2>5. Supports Heart Health</h2>
<p>Curry leaves help actively reduce bad cholesterol levels and support overall cardiovascular health, keeping your heart functioning beautifully.</p>
<p>Their natural <em>anti-inflammatory properties</em> also contribute to improved blood circulation throughout the body.</p>

<h2>Conclusion</h2>
<p>Though small in size, curry leaves offer truly remarkable health benefits. Purposely including them in your daily diet—whether in <em>thokku, podi, or a simple tadka</em>—can contribute to improved digestion, stunning hair health, and vibrant overall wellness.</p>`
    },
    {
        id: 3,
        title: 'Perfect Pairings: What to Eat with Your Favourite Podi',
        slug: 'perfect-podi-pairings',
        excerpt: 'Discover the best foods to pair with South Indian podi including idli, dosa, rice with ghee, and creative modern snack ideas.',
        featured_image_url: '/images/blog/podi-pairings.png',
        category: { name: 'Recipes', slug: 'recipes' },
        author: { name: 'Dhanvanthiri Kitchen' },
        reading_time: 3,
        published_at: '2026-02-01T10:00:00Z',
        meta_title: 'Best Foods to Eat with Podi – Idli, Dosa, Rice & More',
        meta_description: 'Discover the best foods to pair with South Indian podi including idli, dosa, rice with ghee, and creative modern snack ideas.',
        body: `<h2>Introduction</h2>
<p><em>Podi</em>, often playfully and affectionately called <strong>"gunpowder,"</strong> is a beloved, deeply rooted South Indian condiment made from carefully dry-roasted lentils, vibrant red chilies, and aromatic spices.</p>
<p>Known for its bold, punchy flavor and incredible versatility, a good quality podi can instantly elevate the simplest of meals into something truly delicious and soul-satisfying.</p>

<blockquote>"A spoonful of podi, a drizzle of ghee, and hot rice—the ultimate trio of South Indian comfort food."</blockquote>

<h2>Idli with Podi</h2>
<p>Soft, pillowy steamed <em>idlis</em> generously coated or paired with golden sesame oil (gingelly) and spicy podi create one of the most iconic, undisputed champion combinations in South Indian cuisine.</p>
<p>The mild, fermented tang of the idli completely absorbs and complements the <strong>spicy, nutty crunch</strong> of the podi perfectly.</p>

<h2>Dosa with Podi</h2>
<p>A thin, crispy golden <em>dosa</em> sprinkled generously with podi and roasted to perfection with ghee is another immensely popular weekend pairing.</p>
<p>Many devoted dosa lovers exclusively crave <strong>"podi dosa,"</strong> where the spicy gunpowder is spread directly inside the dosa while cooking, creating a spicy, caramelized interior crust.</p>

<h2>Rice with Ghee and Podi</h2>
<p>Hot, naturally steamed white rice mixed immediately with a generous dollop of rich, fragrant ghee and Paruppu Podi is a comforting, deeply satisfying meal that requires practically <em>zero cooking effort</em>. It is the ultimate rainy day comfort food.</p>

<h2>Podi with Vegetable Dishes</h2>
<p>Podi can beautifully enhance and transform everyday vegetable stir-fries (poriyal), such as roasted baby potatoes, crunchy green beans, and sticky okra.</p>
<p>Sprinkling a spoonful of podi right at the end of cooking adds an instant <strong>depth, spice, and unique crunch</strong> to everyday meals.</p>

<h2>Modern, Crave-Worthy Snack Pairings</h2>
<p>Creative, modern cooks are now brilliantly using traditional podi to spice up contemporary snacks:</p>
<ul>
<li><strong>Podi Avocado Toast:</strong> A spicy South Indian twist on a modern brunch classic.</li>
<li><strong>Podi Popcorn:</strong> Tossed immediately after popping with a little melted butter.</li>
<li><strong>Podi Roasted Nuts:</strong> Cashews and peanuts tossed in ghee and podi for a fiery evening snack.</li>
</ul>
<p>These brilliant fusion ideas bring bold, traditional South Indian flavours seamlessly into contemporary, fast-paced kitchens.</p>

<h2>Conclusion</h2>
<p>Whether it's paired with <em>classic, traditional South Indian tiffins</em> or sprinkled over incredibly modern snacks, podi undeniably remains one of the most versatile, magical condiments in all of Indian cuisine.</p>`
    },
];

export const fallbackAboutPage = {
    title: 'About Dhanvanthiri Foods',
    meta_title: 'About Us - Dhanvanthiri Foods',
    meta_description: 'Learn about Dhanvanthiri Foods — a family-run brand bringing you authentic South Indian pickles, thokku, and podi made with love and tradition.',
    body: `
    <h2>Our Story</h2>
    <p>Dhanvanthiri Foods was born out of a simple desire — to share the authentic flavours of South Indian homemade pickles and condiments with the world. What started in a small kitchen with family recipes passed down over generations has grown into a brand loved by food enthusiasts across India.</p>

    <h2>Our Mission</h2>
    <p>We believe that good food starts with the best ingredients and traditional methods. Every jar of pickle, every bowl of thokku, and every spoonful of podi is made with:</p>
    <ul>
      <li><strong>100% natural ingredients</strong> — no preservatives, no artificial colours</li>
      <li><strong>Cold-pressed oils</strong> — gingelly and groundnut oil for authentic taste</li>
      <li><strong>Hand-picked spices</strong> — sourced directly from local farmers</li>
      <li><strong>Time-honoured recipes</strong> — perfected over generations</li>
    </ul>

    <h2>What Makes Us Special</h2>
    <p>At Dhanvanthiri Foods, we don't just make pickles — we preserve traditions. Each product is handcrafted in small batches to ensure quality and consistency. We sun-dry our ingredients, grind spices on traditional stone grinders, and use the same love and care that our grandmothers did.</p>

    <h2>Our Promise</h2>
    <p>Every Dhanvanthiri product reaches you fresh, flavourful, and made with integrity. We are committed to bringing the taste of home to your dining table, no matter where you are in India.</p>
  `,
};

export interface FallbackPage {
    title: string;
    excerpt?: string;
    effective_date?: string;
    meta_title: string;
    meta_description: string;
    body: string;
}

export const fallbackPagesBySlug: Record<string, FallbackPage> = {
    about: fallbackAboutPage,
    'privacy-policy': {
        title: 'Privacy Policy',
        excerpt: 'How Dhanvanthiri Foods collects, uses, shares, stores, and protects customer information across orders, support, and website usage.',
        effective_date: '2026-03-08',
        meta_title: 'Privacy Policy | Dhanvanthiri Foods',
        meta_description: 'Learn what data Dhanvanthiri Foods collects, why it is collected, how it is shared, and how customers can request correction or deletion.',
        body: `
        <h2>Overview</h2>
        <p>This Privacy Policy explains how Dhanvanthiri Foods collects, uses, stores, and shares personal information when you browse our website, place an order, contact us, or otherwise interact with our business.</p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Name, mobile number, email address, and account details</li>
          <li>Shipping and billing address</li>
          <li>Order history, payment status, and support messages</li>
          <li>Technical data such as IP address, device details, and pages visited</li>
        </ul>
        <h2>How We Use It</h2>
        <p>We use this information to process orders, support deliveries, respond to customer issues, prevent fraud, and comply with legal obligations.</p>
        <h2>Sharing and Retention</h2>
        <p>We may share required information with payment providers, courier partners, hosting vendors, and service providers that help us operate the store. We retain information only as long as reasonably needed for service, compliance, and dispute handling.</p>
        <h2>Your Rights</h2>
        <p>You may request correction, deletion where legally permitted, or withdrawal of optional marketing consent by contacting us.</p>
        <h2>Privacy Contact</h2>
        <p>Email: <a href="mailto:dhanvanthrifoods777@gmail.com">dhanvanthrifoods777@gmail.com</a><br />Phone: <a href="tel:+919445717977">9445717977</a></p>
      `,
    },
    'terms-and-conditions': {
        title: 'Terms & Conditions',
        excerpt: 'Website usage rules, pricing, payment terms, order acceptance, prohibited conduct, and customer support obligations for Dhanvanthiri Foods.',
        effective_date: '2026-03-08',
        meta_title: 'Terms & Conditions | Dhanvanthiri Foods',
        meta_description: 'Read the website usage, pricing, payment, order acceptance, intellectual property, and liability terms for Dhanvanthiri Foods.',
        body: `
        <h2>Overview</h2>
        <p>These Terms &amp; Conditions explain the rules for using the Dhanvanthiri Foods website and buying products from us.</p>
        <h2>Business Details</h2>
        <p>Dhanvanthrifoods, trading as Dhanvanthiri Foods, operates this website. Email: <a href="mailto:dhanvanthrifoods777@gmail.com">dhanvanthrifoods777@gmail.com</a>. Phone: <a href="tel:+919445717977">9445717977</a>.</p>
        <h2>Pricing, Payments, and Orders</h2>
        <p>All prices are shown in INR unless otherwise stated. Orders are subject to stock availability, payment verification, and serviceability. We may reject or cancel orders affected by pricing errors, fraud checks, or address issues.</p>
        <h2>User Responsibilities</h2>
        <p>You agree to provide accurate details, use valid payment methods, and not misuse the website or its ordering systems.</p>
        <h2>Prohibited Use</h2>
        <ul>
          <li>No unlawful, fraudulent, or abusive website use</li>
          <li>No scraping, hacking, bot abuse, or misleading orders</li>
          <li>No copying or reuse of site content without permission</li>
        </ul>
        <h2>Liability and Jurisdiction</h2>
        <p>Liability is limited to the value paid for the relevant order, subject to law. These terms are governed by Indian law and the courts of Erode, Tamil Nadu.</p>
      `,
    },
    'refund-policy': {
        title: 'Refund / Return / Cancellation Policy',
        excerpt: 'Rules for order cancellation, refund eligibility, replacement requests, proof requirements, and non-returnable food product scenarios.',
        effective_date: '2026-03-08',
        meta_title: 'Refund Policy | Dhanvanthiri Foods',
        meta_description: 'Read Dhanvanthiri Foods rules for cancellation before dispatch, refund eligibility, replacement support, proof requirements, and refund timelines.',
        body: `
        <h2>Overview</h2>
        <p>Because our products are food items, return and refund handling must balance customer fairness with product safety and hygiene.</p>
        <h2>Cancellation Before Dispatch</h2>
        <p>Orders may be cancelled only before they are packed or handed over for dispatch.</p>
        <h2>Eligible Support Scenarios</h2>
        <ul>
          <li>Wrong item</li>
          <li>Missing item</li>
          <li>Damaged, leaking, or tampered package</li>
          <li>Expired product at delivery</li>
        </ul>
        <h2>Reporting Window and Proof</h2>
        <p>Please report issues within 48 hours of delivery with the order number, clear package photos, and product photos. An unboxing video is recommended where available.</p>
        <h2>Refund Timeline</h2>
        <p>Approved refunds are generally initiated within 5 to 10 business days to the original payment method.</p>
      `,
    },
    'shipping-policy': {
        title: 'Shipping Policy',
        excerpt: 'Delivery coverage, processing timelines, shipping charges, failed delivery handling, and reporting steps for damaged or missing items.',
        effective_date: '2026-03-08',
        meta_title: 'Shipping Policy | Dhanvanthiri Foods',
        meta_description: 'Review delivery coverage, order processing time, shipping charges, courier delay handling, and support steps for Dhanvanthiri Foods orders.',
        body: `
        <h2>Overview</h2>
        <p>This Shipping Policy explains how Dhanvanthiri Foods processes, dispatches, and delivers orders across India.</p>
        <h2>Delivery Coverage</h2>
        <p>We currently deliver across India, subject to courier serviceability and the accuracy of the shipping address provided at checkout.</p>
        <h2>Order Processing Time</h2>
        <p>Most orders are processed within 1 to 3 business days after successful payment confirmation.</p>
        <h2>Estimated Delivery Windows</h2>
        <ul>
          <li>Metro cities: usually 2 to 5 business days</li>
          <li>Other cities and towns: usually 3 to 7 business days</li>
          <li>Remote locations: usually 5 to 10 business days</li>
        </ul>
        <h2>Shipping Charges and Delivery Issues</h2>
        <p>Shipping charges, if any, are shown at checkout. Please report damaged, tampered, wrong, or missing items within 48 hours of delivery with supporting photos.</p>
      `,
    },
};

export function getFallbackPageBySlug(slug?: string | null): FallbackPage | null {
    if (!slug) {
        return null;
    }

    return fallbackPagesBySlug[slug] ?? null;
}
