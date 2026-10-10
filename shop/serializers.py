from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Category, Product, Coupon, Wishlist, Review, Order, OrderItem, ContactInquiry


# ─────────────────────────────────────────────────────────────
# AUTH SERIALIZERS
# ─────────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Embeds username, email, first_name, is_staff into the JWT payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Append user info to login response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_staff': self.user.is_staff,
        }
        return data


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm'
        )
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError(
                {"email": "A user with this email already exists."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'date_joined', 'last_login'
        )
        read_only_fields = ('is_staff', 'date_joined', 'last_login')


class UserAdminSerializer(serializers.ModelSerializer):
    """Full user serializer for admin user management."""
    orders_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_active', 'date_joined', 'last_login', 'orders_count'
        )
        read_only_fields = ('date_joined', 'last_login', 'orders_count')

    def get_orders_count(self, obj):
        return obj.order_set.count()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "New password fields didn't match."}
            )
        return attrs


# ─────────────────────────────────────────────────────────────
# CATEGORY & PRODUCT SERIALIZERS
# ─────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'products_count')


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'product', 'user', 'user_name', 'user_full_name',
            'rating', 'comment', 'created'
        )
        read_only_fields = ('user', 'created', 'product')

    def get_user_full_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full or obj.user.username


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'category_name', 'category_slug',
            'name', 'slug', 'image', 'image_url', 'description',
            'price', 'available', 'created', 'updated',
            'average_rating', 'reviews_count'
        )

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            try:
                url = obj.image.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                pass
        if obj.image_url:
            return obj.image_url
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 0.0

    def get_reviews_count(self, obj):
        return obj.reviews.count()


class ProductDetailSerializer(ProductSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ('reviews',)


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'id', 'category', 'name', 'slug', 'image', 'image_url',
            'description', 'price', 'available'
        )
        extra_kwargs = {
            'slug': {'required': False},
            'image': {'required': False},
        }


# ─────────────────────────────────────────────────────────────
# WISHLIST SERIALIZERS
# ─────────────────────────────────────────────────────────────

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'product_id', 'added_date')


# ─────────────────────────────────────────────────────────────
# COUPON SERIALIZERS
# ─────────────────────────────────────────────────────────────

class CouponSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    usage_count = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = (
            'id', 'code', 'discount', 'active',
            'valid_from', 'valid_to', 'is_expired', 'usage_count'
        )

    def get_is_expired(self, obj):
        from django.utils import timezone
        return timezone.now() > obj.valid_to

    def get_usage_count(self, obj):
        return obj.orders.count()


class CouponCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount', 'active', 'valid_from', 'valid_to')


# ─────────────────────────────────────────────────────────────
# ORDER SERIALIZERS
# ─────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()
    product_slug = serializers.ReadOnlyField(source='product.slug')
    cost = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id', 'product', 'product_name', 'product_slug',
            'product_image', 'price', 'quantity', 'cost'
        )

    def get_product_image(self, obj):
        if obj.product.image:
            try:
                return obj.product.image.url
            except Exception:
                pass
        if obj.product.image_url:
            return obj.product.image_url
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

    def get_cost(self, obj):
        return float(obj.get_cost())


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    coupon_code = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_name',
            'first_name', 'last_name', 'email',
            'address', 'postal_code', 'city',
            'created', 'updated',
            'paid', 'status', 'payment_method',
            'razorpay_order_id', 'razorpay_payment_id',
            'coupon', 'coupon_code', 'discount',
            'items', 'total_cost'
        )
        read_only_fields = (
            'user', 'paid', 'razorpay_order_id', 'razorpay_payment_id',
            'discount', 'created', 'updated'
        )

    def get_total_cost(self, obj):
        return float(obj.get_total_cost())

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return f"{obj.first_name} {obj.last_name}".strip() or "Guest"

    def get_coupon_code(self, obj):
        return obj.coupon.code if obj.coupon else None


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """Used by admins to update order status and paid flag."""
    class Meta:
        model = Order
        fields = ('status', 'paid')


# ─────────────────────────────────────────────────────────────
# CONTACT INQUIRY SERIALIZER
# ─────────────────────────────────────────────────────────────

class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ('id', 'name', 'email', 'subject', 'message', 'created_at', 'resolved')
        read_only_fields = ('id', 'created_at', 'resolved')
