from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import api_views

urlpatterns = [

    # ─────────────────────────────────────────────────────────
    # AUTH ENDPOINTS
    # ─────────────────────────────────────────────────────────
    path('auth/register/',          api_views.RegisterView.as_view(),              name='api_register'),
    path('auth/login/',             api_views.CustomTokenObtainPairView.as_view(), name='api_login'),
    path('auth/token/refresh/',     TokenRefreshView.as_view(),                    name='api_token_refresh'),
    path('auth/logout/',            api_views.LogoutView.as_view(),                name='api_logout'),
    path('auth/profile/',           api_views.UserProfileView.as_view(),           name='api_profile'),
    path('auth/change-password/',   api_views.ChangePasswordView.as_view(),        name='api_change_password'),

    # ─────────────────────────────────────────────────────────
    # CONTACT / SUPPORT
    # ─────────────────────────────────────────────────────────
    path('contact/',                api_views.ContactSupportView.as_view(),        name='api_contact'),

    # ─────────────────────────────────────────────────────────
    # CATEGORIES
    # ─────────────────────────────────────────────────────────
    path('categories/',             api_views.CategoryListView.as_view(),          name='api_categories'),

    # ─────────────────────────────────────────────────────────
    # PRODUCTS
    # ─────────────────────────────────────────────────────────
    path('products/',               api_views.ProductListView.as_view(),           name='api_products'),
    path('products/featured/',      api_views.FeaturedProductsView.as_view(),      name='api_featured_products'),
    path('products/<int:id>/',      api_views.ProductDetailView.as_view(),         name='api_product_detail'),
    path('products/<int:product_id>/related/',  api_views.RelatedProductsView.as_view(),   name='api_related_products'),
    path('products/<int:product_id>/reviews/',         api_views.ReviewCreateView.as_view(),      name='api_review_create'),
    path('products/<int:product_id>/reviews/create/',  api_views.ReviewCreateView.as_view(),      name='api_review_create_alt'),

    # ─────────────────────────────────────────────────────────
    # WISHLIST
    # ─────────────────────────────────────────────────────────
    path('wishlist/',                               api_views.WishlistListView.as_view(),     name='api_wishlist'),
    path('wishlist/<int:pk>/',                      api_views.WishlistDeleteView.as_view(),   name='api_wishlist_delete'),
    path('wishlist/toggle/<int:product_id>/',       api_views.WishlistToggleView.as_view(),   name='api_wishlist_toggle'),
    path('wishlist/status/<int:product_id>/',       api_views.WishlistStatusView.as_view(),   name='api_wishlist_status'),

    # ─────────────────────────────────────────────────────────
    # COUPONS
    # ─────────────────────────────────────────────────────────
    path('coupon/apply/',           api_views.ApplyCouponView.as_view(),           name='api_coupon_apply'),

    # ─────────────────────────────────────────────────────────
    # ORDERS
    # ─────────────────────────────────────────────────────────
    path('orders/create/',          api_views.OrderCreateView.as_view(),           name='api_order_create'),
    path('orders/my-orders/',       api_views.MyOrdersListView.as_view(),          name='api_my_orders'),
    path('orders/<int:id>/',        api_views.OrderDetailView.as_view(),           name='api_order_detail'),
    path('orders/<int:order_id>/cancel/', api_views.OrderCancelView.as_view(),     name='api_order_cancel'),

    # ─────────────────────────────────────────────────────────
    # ADMIN — STATISTICS
    # ─────────────────────────────────────────────────────────
    path('admin/stats/',            api_views.AdminDashboardStatsView.as_view(),   name='api_admin_stats'),

    # ADMIN — PRODUCTS
    path('admin/products/',         api_views.AdminProductListCreateView.as_view(),  name='api_admin_products'),
    path('admin/products/create/',  api_views.AdminProductListCreateView.as_view(),  name='api_admin_products_create'),
    path('admin/products/<int:id>/', api_views.AdminProductDetailView.as_view(),     name='api_admin_product_detail'),

    # ADMIN — ORDERS
    path('admin/orders/',           api_views.AdminOrderListView.as_view(),          name='api_admin_orders'),
    path('admin/orders/<int:id>/',  api_views.AdminOrderUpdateView.as_view(),        name='api_admin_order_update'),

    # ADMIN — CATEGORIES
    path('admin/categories/',       api_views.AdminCategoryListCreateView.as_view(), name='api_admin_categories'),
    path('admin/categories/<int:id>/', api_views.AdminCategoryDetailView.as_view(),  name='api_admin_category_detail'),

    # ADMIN — COUPONS
    path('admin/coupons/',          api_views.AdminCouponListCreateView.as_view(),   name='api_admin_coupons'),
    path('admin/coupons/<int:id>/', api_views.AdminCouponDetailView.as_view(),       name='api_admin_coupon_detail'),

    # ADMIN — USERS
    path('admin/users/',            api_views.AdminUserListView.as_view(),           name='api_admin_users'),
    path('admin/users/<int:id>/',   api_views.AdminUserDetailView.as_view(),         name='api_admin_user_detail'),

    # ADMIN — CONTACT INQUIRIES
    path('admin/inquiries/',        api_views.AdminContactInquiryListView.as_view(), name='api_admin_inquiries'),
    path('admin/inquiries/<int:id>/', api_views.AdminContactInquiryDetailView.as_view(), name='api_admin_inquiry_detail'),
]
