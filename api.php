<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Fetch products from Fake Store API
$apiUrl = 'https://fakestoreapi.com/products';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// Optional: Disable SSL verification for local dev environments like XAMPP if they lack certificates
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch data from API']);
    exit;
}

curl_close($ch);

$products = json_decode($response, true);

if (!$products) {
    echo json_encode([]);
    exit;
}

// Filter out electronics and jewelery, keep only clothes
$filteredProducts = array_filter($products, function($product) {
    if (!isset($product['category'])) return false;
    
    $category = strtolower($product['category']);
    // Fake store API categories: "men's clothing", "women's clothing"
    return ($category === "men's clothing" || $category === "women's clothing");
});

$normalizedProducts = [];
foreach ($filteredProducts as $product) {
    $sizes = ['S', 'M', 'L', 'XL'];
    $colors = ['Beige', 'Black', 'White', 'Navy'];
    
    // Attempt to map category to "T-Shirts", "Outerwear", "Pants", "Dresses" if possible based on title
    // Just simple string matching to enrich the category
    $titleLower = strtolower($product['title']);
    $subCategory = 'T-Shirts'; // Default
    if (strpos($titleLower, 'jacket') !== false || strpos($titleLower, 'coat') !== false || strpos($titleLower, 'outerwear') !== false || strpos($titleLower, 'windbreaker') !== false) {
        $subCategory = 'Outerwear';
    } else if (strpos($titleLower, 'pants') !== false || strpos($titleLower, 'jeans') !== false) {
        $subCategory = 'Pants';
    } else if (strpos($titleLower, 'dress') !== false) {
        $subCategory = 'Dresses';
    } else if (strpos($titleLower, 'shirt') !== false || strpos($titleLower, 'top') !== false || strpos($titleLower, 'sleeve') !== false) {
        $subCategory = 'T-Shirts';
    }

    $normalizedProducts[] = [
        'id' => $product['id'],
        'name' => $product['title'], 
        'price' => (float) $product['price'],
        'category' => ucwords($product['category']),
        'subCategory' => $subCategory,
        'description' => $product['description'],
        'image' => $product['image'],
        'rating' => $product['rating']['rate'] ?? 4.5,
        'reviews' => $product['rating']['count'] ?? 120,
        'featured' => ($product['rating']['rate'] > 4.5),
        'newCollection' => ($product['id'] % 2 !== 0),
        'sizes' => $sizes,
        'colors' => $colors,
    ];
}

// Mock Kids Clothing
$kidsProducts = [
    [
        'id' => 101,
        'name' => "Boy's Striped Cotton T-Shirt",
        'price' => 15.99,
        'category' => "Kids' Clothing",
        'subCategory' => 'T-Shirts',
        'description' => "Comfortable and breathable striped t-shirt for kids.",
        'image' => 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.8,
        'reviews' => 45,
        'featured' => true,
        'newCollection' => true,
        'sizes' => ['2Y', '4Y', '6Y', '8Y'],
        'colors' => ['Blue', 'Red', 'White']
    ],
    [
        'id' => 102,
        'name' => "Girl's Summer Floral Dress",
        'price' => 24.50,
        'category' => "Kids' Clothing",
        'subCategory' => 'Dresses',
        'description' => "A cute floral print dress perfect for warm summer days.",
        'image' => 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'rating' => 4.7,
        'reviews' => 80,
        'featured' => false,
        'newCollection' => true,
        'sizes' => ['3Y', '5Y', '7Y'],
        'colors' => ['Pink', 'Yellow']
    ],
    [
        'id' => 103,
        'name' => "Kids' Winter Puffer Jacket",
        'price' => 45.00,
        'category' => "Kids' Clothing",
        'subCategory' => 'Outerwear',
        'description' => "Warm, water-resistant puffer jacket to keep your child cozy.",
        'image' => 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.9,
        'reviews' => 150,
        'featured' => true,
        'newCollection' => false,
        'sizes' => ['4Y', '6Y', '8Y', '10Y'],
        'colors' => ['Black', 'Navy', 'Olive']
    ],
    [
        'id' => 104,
        'name' => "Boy's Classic Denim Jeans",
        'price' => 22.00,
        'category' => "Kids' Clothing",
        'subCategory' => 'Pants',
        'description' => "Durable kids denim jeans for everyday play.",
        'image' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.6,
        'reviews' => 40,
        'featured' => false,
        'newCollection' => true,
        'sizes' => ['2Y', '4Y', '6Y', '8Y'],
        'colors' => ['Blue']
    ],
    [
        'id' => 105,
        'name' => "Men's Classic Chinos",
        'price' => 35.50,
        'category' => "Men's Clothing",
        'subCategory' => 'Pants',
        'description' => "Versatile chinos for a smart casual look.",
        'image' => 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.5,
        'reviews' => 110,
        'featured' => true,
        'newCollection' => false,
        'sizes' => ['S', 'M', 'L', 'XL'],
        'colors' => ['Beige', 'Navy', 'Olive']
    ],
    [
        'id' => 106,
        'name' => "Women's Elegant Evening Dress",
        'price' => 89.99,
        'category' => "Women's Clothing",
        'subCategory' => 'Dresses',
        'description' => "A stunning dress perfect for formal events.",
        'image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.9,
        'reviews' => 200,
        'featured' => true,
        'newCollection' => true,
        'sizes' => ['S', 'M', 'L'],
        'colors' => ['Black', 'Red']
    ],
    [
        'id' => 107,
        'name' => "Men's Windbreaker Jacket",
        'price' => 55.00,
        'category' => "Men's Clothing",
        'subCategory' => 'Outerwear',
        'description' => "Lightweight windbreaker for active days.",
        'image' => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.4,
        'reviews' => 85,
        'featured' => false,
        'newCollection' => true,
        'sizes' => ['M', 'L', 'XL'],
        'colors' => ['Grey', 'Black']
    ],
    [
        'id' => 108,
        'name' => "Girl's Cute Print T-Shirt",
        'price' => 12.99,
        'category' => "Kids' Clothing",
        'subCategory' => 'T-Shirts',
        'description' => "Soft cotton t-shirt with a fun print.",
        'image' => 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.8,
        'reviews' => 60,
        'featured' => false,
        'newCollection' => false,
        'sizes' => ['3Y', '5Y', '7Y'],
        'colors' => ['White', 'Pink']
    ],
    [
        'id' => 109,
        'name' => "Women's Cozy Outerwear Coat",
        'price' => 110.00,
        'category' => "Women's Clothing",
        'subCategory' => 'Outerwear',
        'description' => "Stay warm and stylish this season.",
        'image' => 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=600&auto=format&fit=crop',
        'rating' => 4.7,
        'reviews' => 140,
        'featured' => true,
        'newCollection' => false,
        'sizes' => ['S', 'M', 'L'],
        'colors' => ['Camel', 'Black']
    ]
];

$normalizedProducts = array_merge($normalizedProducts, $kidsProducts);

// Reset array indices
$normalizedProducts = array_values($normalizedProducts);

echo json_encode($normalizedProducts);
?>
