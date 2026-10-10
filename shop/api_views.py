from rest_framework import generics, status, permissions, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify
from django.db.models import Q, Sum, Count, Avg
from django.shortcuts import get_object_or_404
import random

from .models import (
    Category, Product, Coupon, Wishlist,
    Review, Order, OrderItem, ContactInquiry
)
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegisterSerializer, UserSerializer, UserAdminSerializer,
    ChangePasswordSerializer,
    CategorySerializer, CategoryCreateUpdateSerializer,
    ProductSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ReviewSerializer,
    WishlistSerializer,
    CouponSerializer, CouponCreateUpdateSerializer,
    OrderSerializer, OrderStatusUpdateSerializer,
    ContactInquirySerializer,
)


# ─────────────────────────────────────────────────────────────
# AUTHENTICATION VIEWS
# ─────────────────────────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns tokens + user info."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user account."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(views.APIView):
    """Change the authenticated user's password."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully.'})


class LogoutView(views.APIView):
    """Blacklist the refresh token on logout."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# CONTACT / SUPPORT
# ─────────────────────────────────────────────────────────────

class ContactSupportView(views.APIView):
    """Save contact inquiry to DB and return success."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactInquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Thank you! Your message has been received. Our support team will get back to you within 24 hours.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# CATEGORY VIEWS
# ─────────────────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.annotate(
        products_count_ann=Count('products', filter=Q(products__available=True))
    ).all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


# ─────────────────────────────────────────────────────────────
# PRODUCT VIEWS
# ─────────────────────────────────────────────────────────────

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(available=True).select_related('category')

        # Category filter
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        # Full-text search (name + description)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # Price range filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Sorting
        sort = self.request.query_params.get('sort')
        sort_map = {
            'price_asc':  'price',
            'price_desc': '-price',
            'newest':     '-created',
            'oldest':     'created',
            'name':       'name',
        }
        if sort in sort_map:
            queryset = queryset.order_by(sort_map[sort])

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(available=True).prefetch_related('reviews__user')
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class FeaturedProductsView(generics.ListAPIView):
    """Returns the 8 most recently added available products."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(available=True).order_by('-created')[:8]


class RelatedProductsView(generics.ListAPIView):
    """Returns up to 4 products in the same category, excluding current product."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id, available=True)
        return Product.objects.filter(
            category=product.category, available=True
        ).exclude(id=product_id)[:4]


# ─────────────────────────────────────────────────────────────
# REVIEW VIEWS
# ─────────────────────────────────────────────────────────────

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id, available=True)
        # If user already reviewed, update existing review instead of failing
        existing = Review.objects.filter(product=product, user=self.request.user).first()
        if existing:
            existing.rating = serializer.validated_data.get('rating', existing.rating)
            existing.comment = serializer.validated_data.get('comment', existing.comment)
            existing.save()
            serializer.instance = existing
            return
        serializer.save(user=self.request.user, product=product)


# ─────────────────────────────────────────────────────────────
# WISHLIST VIEWS
# ─────────────────────────────────────────────────────────────

class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Wishlist.objects.filter(
            user=self.request.user
        ).select_related('product__category')


class WishlistDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)


class WishlistToggleView(views.APIView):
    """Add product to wishlist if not present; remove if already there."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        wishlist_item = Wishlist.objects.filter(
            user=request.user, product=product
        ).first()
        if wishlist_item:
            wishlist_item.delete()
            return Response({'status': 'removed', 'in_wishlist': False})
        Wishlist.objects.create(user=request.user, product=product)
        return Response({'status': 'added', 'in_wishlist': True})


class WishlistStatusView(views.APIView):
    """Check if a product is in the user's wishlist."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        in_wishlist = Wishlist.objects.filter(
            user=request.user, product_id=product_id
        ).exists()
        return Response({'in_wishlist': in_wishlist})


# ─────────────────────────────────────────────────────────────
# COUPON VIEWS
# ─────────────────────────────────────────────────────────────

class ApplyCouponView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip()
        if not code:
            return Response(
                {'valid': False, 'error': 'Please provide a coupon code.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        now = timezone.now()
        try:
            coupon = Coupon.objects.get(
                code__iexact=code,
                valid_from__lte=now,
                valid_to__gte=now,
                active=True,
            )
            return Response({
                'valid': True,
                'code': coupon.code,
                'discount': coupon.discount,
                'id': coupon.id,
            })
        except Coupon.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid or expired coupon code.'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ─────────────────────────────────────────────────────────────
# ORDER VIEWS
# ─────────────────────────────────────────────────────────────

class OrderCreateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        items_data = data.get('items', [])

        if not items_data:
            return Response(
                {'error': 'No items provided in the order.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate required address fields
        required_fields = ['first_name', 'last_name', 'email', 'address', 'postal_code', 'city']
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return Response(
                {'error': f'Missing required fields: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate & apply coupon
        coupon = None
        discount = 0
        coupon_id = data.get('coupon_id')
        if coupon_id:
            now = timezone.now()
            try:
                coupon = Coupon.objects.get(
                    id=coupon_id, active=True,
                    valid_from__lte=now, valid_to__gte=now
                )
                discount = coupon.discount
            except Coupon.DoesNotExist:
                return Response(
                    {'error': 'Coupon is invalid or has expired.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        user = request.user if request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            email=data.get('email', ''),
            address=data.get('address', ''),
            postal_code=data.get('postal_code', ''),
            city=data.get('city', ''),
            payment_method=data.get('payment_method', 'COD'),
            coupon=coupon,
            discount=discount,
            paid=False,
            status='Processing',
        )

        for item in items_data:
            product = get_object_or_404(Product, id=item.get('product_id'))
            qty = max(1, int(item.get('quantity', 1)))
            OrderItem.objects.create(
                order=order,
                product=product,
                price=product.price,
                quantity=qty,
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyOrdersListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items__product').order_by('-created')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        return Order.objects.all().prefetch_related('items__product')


class OrderCancelView(views.APIView):
    """Allow a user to cancel their own pending/processing order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        cancellable_statuses = ['Pending', 'Processing']
        if order.status not in cancellable_statuses:
            return Response(
                {'error': f'Cannot cancel an order with status "{order.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = 'Cancelled'
        order.save()
        return Response({'message': 'Order cancelled successfully.', 'status': 'Cancelled'})


# ─────────────────────────────────────────────────────────────
# ADMIN VIEWS
# ─────────────────────────────────────────────────────────────

class AdminDashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_users = User.objects.count()
        total_categories = Category.objects.count()

        paid_orders = Order.objects.filter(paid=True)
        total_revenue = sum(float(o.get_total_cost()) for o in paid_orders)

        # Orders by status breakdown
        status_breakdown = {}
        for s, _ in Order.STATUS_CHOICES:
            status_breakdown[s] = Order.objects.filter(status=s).count()

        # Recent 10 orders
        recent_orders = Order.objects.select_related('user').prefetch_related(
            'items__product'
        ).order_by('-created')[:10]

        # Top 5 best-selling products
        top_products = (
            OrderItem.objects
            .values('product__id', 'product__name', 'product__price')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:5]
        )

        return Response({
            'total_orders': total_orders,
            'total_products': total_products,
            'total_users': total_users,
            'total_categories': total_categories,
            'total_revenue': round(total_revenue, 2),
            'status_breakdown': status_breakdown,
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'top_products': list(top_products),
        })


# ── Admin: Product CRUD ─────────────────────────────────────

class AdminProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('category').order_by('-created')
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductSerializer
        return ProductCreateUpdateSerializer

    def perform_create(self, serializer):
        name = self.request.data.get('name', '')
        base_slug = slugify(name) or 'product'
        slug = f"{base_slug}-{random.randint(100, 9999)}"
        # Ensure unique slug
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{random.randint(100, 9999)}"
        serializer.save(slug=slug)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
    parser_classes = [MultiPartParser, FormParser, JSONParser]


# ── Admin: Order Management ────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Order.objects.select_related('user').prefetch_related(
            'items__product'
        ).order_by('-created')
        # Optional filters
        paid = self.request.query_params.get('paid')
        order_status = self.request.query_params.get('status')
        if paid is not None:
            queryset = queryset.filter(paid=paid.lower() == 'true')
        if order_status:
            queryset = queryset.filter(status=order_status)
        return queryset


class AdminOrderUpdateView(generics.UpdateAPIView):
    """Update order status and/or paid flag."""
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Return full order data after update
        return Response(OrderSerializer(instance).data)


# ── Admin: Category CRUD ───────────────────────────────────

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.annotate(
        products_count=Count('products')
    ).order_by('name')
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategorySerializer
        return CategoryCreateUpdateSerializer


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryCreateUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'


# ── Admin: Coupon CRUD ─────────────────────────────────────

class AdminCouponListCreateView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all().order_by('-valid_to')
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CouponSerializer
        return CouponCreateUpdateSerializer


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponCreateUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'


# ── Admin: User Management ─────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.annotate(
        orders_count=Count('order')
    ).order_by('-date_joined')
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'


# ── Admin: Contact Inquiries ────────────────────────────────

class AdminContactInquiryListView(generics.ListAPIView):
    queryset = ContactInquiry.objects.order_by('-created_at')
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.IsAdminUser]


class AdminContactInquiryDetailView(generics.RetrieveUpdateAPIView):
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
