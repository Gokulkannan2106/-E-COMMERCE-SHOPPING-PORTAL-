import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from shop.models import Category, Product, Coupon, Review

def seed():
    print("[INFO] Seeding database with expanded store catalog...")

    # 1. Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123', first_name='Admin', last_name='User')
        print("[SUCCESS] Superuser created: admin / admin123")
    else:
        print("[INFO] Superuser 'admin' already exists.")

    # 2. Demo Customer
    demo_user, created = User.objects.get_or_create(
        username='johndoe',
        defaults={
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe'
        }
    )
    if created:
        demo_user.set_password('password123')
        demo_user.save()
        print("[SUCCESS] Demo customer created: johndoe / password123")

    # 3. Categories
    categories_data = [
        {'name': 'Smartphones', 'slug': 'smartphones'},
        {'name': 'Laptops & Computers', 'slug': 'laptops'},
        {'name': 'Audio & Headphones', 'slug': 'audio'},
        {'name': 'Smart Watches', 'slug': 'smart-watches'},
        {'name': 'Gaming & Esports', 'slug': 'gaming'},
        {'name': 'Cameras & Drones', 'slug': 'cameras-drones'},
        {'name': 'Smart Home & Wearables', 'slug': 'smart-home'},
    ]

    cat_map = {}
    for c in categories_data:
        cat, _ = Category.objects.get_or_create(slug=c['slug'], defaults={'name': c['name']})
        cat_map[c['slug']] = cat
        print(f"[CATEGORY] {cat.name}")

    # 4. Products Catalog (25+ Products)
    products_data = [
        # Smartphones
        {
            'category': cat_map['smartphones'],
            'name': 'Nova Ultra 5G Pro (256GB - Titanium Gray)',
            'slug': 'nova-ultra-5g-pro',
            'price': 69999.00,
            'image_url': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
            'description': 'Flagship performance featuring 6.8-inch AMOLED 120Hz display, Snapdragon 8 Gen 3 processor, 200MP camera system, and ultra-fast 120W charging.',
            'available': True,
        },
        {
            'category': cat_map['smartphones'],
            'name': 'Aero Phone Minimalist (128GB - Frost White)',
            'slug': 'aero-phone-minimalist',
            'price': 34999.00,
            'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
            'description': 'Sleek glass back, clean OS interface, 50MP Sony sensor, and all-day battery life crafted for effortless productivity.',
            'available': True,
        },
        {
            'category': cat_map['smartphones'],
            'name': 'Eclipse Fold 4 Ultra Foldable',
            'slug': 'eclipse-fold-4-ultra',
            'price': 129999.00,
            'image_url': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
            'description': 'Revolutionary ultra-thin glass hinge, 7.6-inch dual OLED screen, multitasking split-screen powerhouse with S-Pen support.',
            'available': True,
        },
        {
            'category': cat_map['smartphones'],
            'name': 'Vortex Prime 5G (Midnight Black)',
            'slug': 'vortex-prime-5g',
            'price': 24999.00,
            'image_url': 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80',
            'description': 'High-value flagship killer with 108MP primary lens, Dimensity 8200 chipset, 5000mAh battery, and 67W Turbo Charger.',
            'available': True,
        },

        # Laptops & Computers
        {
            'category': cat_map['laptops'],
            'name': 'ZenithBook Pro 16 M-Max (32GB / 1TB SSD)',
            'slug': 'zenithbook-pro-16-m-max',
            'price': 149999.00,
            'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
            'description': 'Engineered for creators and engineers. 3.2K Liquid Retina XDR screen, 32GB Unified RAM, 1TB NVMe Gen4 SSD, and up to 22 hours of continuous battery.',
            'available': True,
        },
        {
            'category': cat_map['laptops'],
            'name': 'Titan Blade 14 Gaming Laptop RTX 4080',
            'slug': 'titan-blade-14-gaming-laptop',
            'price': 119999.00,
            'image_url': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
            'description': 'RTX 4080 GPU, AMD Ryzen 9 8945HS, 240Hz QHD OLED display, and advanced vapor chamber cooling in an ultra-slim aluminum chassis.',
            'available': True,
        },
        {
            'category': cat_map['laptops'],
            'name': 'AeroLite Carbon Ultrabook 13.3"',
            'slug': 'aerolite-carbon-ultrabook',
            'price': 74999.00,
            'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
            'description': 'Weighs under 990 grams with aerospace-grade carbon fiber body, Intel Core Ultra 7 processor, and stunning 400-nit matte anti-glare screen.',
            'available': True,
        },
        {
            'category': cat_map['laptops'],
            'name': 'StudioDesk 34" Curved OLED Monitor',
            'slug': 'studiodesk-34-curved-oled-monitor',
            'price': 59999.00,
            'image_url': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
            'description': 'Ultrawide 21:9 aspect ratio, 0.03ms instant response time, 99.3% DCI-P3 color accuracy, and 90W USB-C single cable power delivery.',
            'available': True,
        },

        # Audio & Headphones
        {
            'category': cat_map['audio'],
            'name': 'Aura Studio ANC Noise Cancelling Headphones',
            'slug': 'aura-studio-anc-headphones',
            'price': 18999.00,
            'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            'description': 'Industry-leading Active Noise Cancellation with spatial audio, high-resolution 40mm beryllium drivers, and 45-hour battery playtime.',
            'available': True,
        },
        {
            'category': cat_map['audio'],
            'name': 'Pulse Wave True Wireless Earbuds Pro',
            'slug': 'pulse-wave-true-wireless-earbuds',
            'price': 7999.00,
            'image_url': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
            'description': 'Crystal clear audio calls with 6-mic beamforming, IPX7 waterproof rating, low-latency gaming mode, and wireless Qi charging case.',
            'available': True,
        },
        {
            'category': cat_map['audio'],
            'name': 'SoundSphere 360 Portable Bluetooth Speaker',
            'slug': 'soundsphere-360-portable-speaker',
            'price': 5499.00,
            'image_url': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
            'description': 'Immersive 360-degree room-filling acoustic sound, dual passive radiators, 20 hours battery life, and IP67 dust/water resistance.',
            'available': True,
        },
        {
            'category': cat_map['audio'],
            'name': 'HiFi Studio Condenser USB Microphone',
            'slug': 'hifi-studio-condenser-mic',
            'price': 8499.00,
            'image_url': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
            'description': 'Broadcast quality 24-bit/192kHz recording with four pickup patterns (Cardioid, Omnidirectional, Bidirectional, Stereo) and zero-latency monitoring.',
            'available': True,
        },

        # Smart Watches
        {
            'category': cat_map['smart-watches'],
            'name': 'Apex Horizon Smartwatch Elite (Titanium)',
            'slug': 'apex-horizon-smartwatch-elite',
            'price': 24999.00,
            'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            'description': 'Titanium casing, sapphire crystal display, dual-frequency GPS, ECG monitor, SpO2 sensor, and offline topographic maps.',
            'available': True,
        },
        {
            'category': cat_map['smart-watches'],
            'name': 'Vibe Active Fit Tracker (Ocean Blue)',
            'slug': 'vibe-active-fit-tracker',
            'price': 4999.00,
            'image_url': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80',
            'description': 'Ultra-lightweight fitness band with 120+ workout modes, sleep staging tracker, continuous heart rate, and 14-day battery reserve.',
            'available': True,
        },
        {
            'category': cat_map['smart-watches'],
            'name': 'Chronos Rugged Military GPS Watch',
            'slug': 'chronos-rugged-military-watch',
            'price': 19999.00,
            'image_url': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
            'description': 'Built to US Military Standard 810H for thermal, shock, and water resistance up to 100 meters. Includes barometric altimeter and compass.',
            'available': True,
        },

        # Gaming & Esports
        {
            'category': cat_map['gaming'],
            'name': 'CyberStrike Mechanical Wireless Keyboard RGB',
            'slug': 'cyberstrike-mechanical-wireless-keyboard',
            'price': 8999.00,
            'image_url': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            'description': 'Hot-swappable tactile switches, per-key RGB backlighting, aircraft-grade aluminum top plate, and Bluetooth 5.2 / 2.4GHz wireless.',
            'available': True,
        },
        {
            'category': cat_map['gaming'],
            'name': 'HyperShift Optical Precision 30K Mouse',
            'slug': 'hypershift-optical-precision-mouse',
            'price': 4499.00,
            'image_url': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
            'description': '30,000 DPI optical sensor, ultra-light 58g honeycomb shell, optical mouse switches rated for 90 million clicks.',
            'available': True,
        },
        {
            'category': cat_map['gaming'],
            'name': 'Nexus Wireless Controller Pro with Hall Effect Sticks',
            'slug': 'nexus-wireless-controller-pro',
            'price': 5999.00,
            'image_url': 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80',
            'description': 'Zero stick drift Hall Effect electromagnetic sensors, customizable rear paddles, mechanical microswitch face buttons, and multi-platform support.',
            'available': True,
        },
        {
            'category': cat_map['gaming'],
            'name': 'Vanguard 7.1 Surround Gaming Headset',
            'slug': 'vanguard-71-surround-gaming-headset',
            'price': 6999.00,
            'image_url': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            'description': '50mm tuned neodymium drivers with THX Spatial audio, detachable noise-cancelling microphone, and cooling gel-infused ear cushions.',
            'available': True,
        },

        # Cameras & Drones
        {
            'category': cat_map['cameras-drones'],
            'name': 'Lumix Pro 4K Mirrorless Cinema Camera',
            'slug': 'lumix-pro-4k-mirrorless-camera',
            'price': 89999.00,
            'image_url': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
            'description': 'Full-frame 24.2MP sensor, 4K 60p 10-bit internal recording, dual native ISO, and 5-axis in-body image stabilization.',
            'available': True,
        },
        {
            'category': cat_map['cameras-drones'],
            'name': 'SkyPhantom 4K Folding GPS Drone',
            'slug': 'skyphantom-4k-folding-drone',
            'price': 42999.00,
            'image_url': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
            'description': '3-axis mechanical gimbal with 4K HDR camera, 38-minute extended flight time, omnidirectional obstacle sensing, and 12km video transmission.',
            'available': True,
        },
        {
            'category': cat_map['cameras-drones'],
            'name': 'ActionCam Go 4K Waterproof Action Camera',
            'slug': 'actioncam-go-4k-waterproof',
            'price': 16999.00,
            'image_url': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
            'description': 'Rugged waterproof to 18 meters without case, HyperSmooth digital stabilization, dual color touchscreens, and 8x slow-motion video.',
            'available': True,
        },

        # Smart Home & Wearables
        {
            'category': cat_map['smart-home'],
            'name': 'Aura Glow Smart Ambient LED Bar (2-Pack)',
            'slug': 'aura-glow-smart-ambient-led-bar',
            'price': 3999.00,
            'image_url': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
            'description': '16 million color combinations, music synchronization mode, voice control via Alexa & Google Assistant, and app scheduling.',
            'available': True,
        },
        {
            'category': cat_map['smart-home'],
            'name': 'HomeHub 10" Smart Touch Display & Speaker',
            'slug': 'homehub-10-smart-touch-display',
            'price': 12999.00,
            'image_url': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
            'description': 'Centralized smart home control center with HD display, stereo speakers, built-in security camera with privacy shutter, and voice assistant.',
            'available': True,
        },
        {
            'category': cat_map['smart-home'],
            'name': 'PureAir Ultra HEPA Smart Air Purifier',
            'slug': 'pureair-ultra-hepa-smart-purifier',
            'price': 14999.00,
            'image_url': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
            'description': '3-stage True HEPA filtration capturing 99.97% of airborne particles down to 0.3 microns, real-time AQI display, and quiet sleep mode.',
            'available': True,
        }
    ]

    for p in products_data:
        prod, created = Product.objects.update_or_create(
            slug=p['slug'],
            defaults={
                'category': p['category'],
                'name': p['name'],
                'price': p['price'],
                'image_url': p['image_url'],
                'description': p['description'],
                'available': p['available']
            }
        )
        status_txt = "Created" if created else "Updated"
        print(f"[PRODUCT {status_txt}] {prod.name} (Rs {prod.price})")

        # 5. Reviews
        if not prod.reviews.exists():
            Review.objects.create(
                product=prod,
                user=demo_user,
                rating=5,
                comment="Absolutely extraordinary quality! Fast delivery and exceeded all my expectations."
            )

    # 6. Coupons
    now = timezone.now()
    coupons = [
        {'code': 'WELCOME20', 'discount': 20, 'valid_from': now - timedelta(days=1), 'valid_to': now + timedelta(days=365)},
        {'code': 'MEGA50', 'discount': 50, 'valid_from': now - timedelta(days=1), 'valid_to': now + timedelta(days=365)},
        {'code': 'FESTIVE10', 'discount': 10, 'valid_from': now - timedelta(days=1), 'valid_to': now + timedelta(days=365)},
        {'code': 'SUPERTECH30', 'discount': 30, 'valid_from': now - timedelta(days=1), 'valid_to': now + timedelta(days=365)},
    ]

    for c in coupons:
        coup, _ = Coupon.objects.update_or_create(
            code=c['code'],
            defaults={
                'discount': c['discount'],
                'valid_from': c['valid_from'],
                'valid_to': c['valid_to'],
                'active': True
            }
        )
        print(f"[COUPON] {coup.code} ({coup.discount}% off)")

    print("[SUCCESS] Expanded catalog seeding completed successfully!")

if __name__ == '__main__':
    seed()
