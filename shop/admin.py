from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Product, Order, OrderItem,
    Coupon, Wishlist, Review, ContactInquiry
)


# ─────────────────────────────────────────────────────────────
# CATEGORY
# ─────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'product_count']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


# ─────────────────────────────────────────────────────────────
# PRODUCT
# ─────────────────────────────────────────────────────────────

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'price', 'available',
        'preview_image', 'created', 'updated'
    ]
    list_filter = ['available', 'category', 'created', 'updated']
    list_editable = ['price', 'available']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    readonly_fields = ['created', 'updated', 'preview_image']
    ordering = ['-created']
    fieldsets = (
        ('Basic Info', {
            'fields': ('category', 'name', 'slug', 'description', 'price', 'available')
        }),
        ('Images', {
            'fields': ('image', 'image_url', 'preview_image')
        }),
        ('Timestamps', {
            'fields': ('created', 'updated'),
            'classes': ('collapse',)
        }),
    )

    def preview_image(self, obj):
        url = obj.get_image_url
        if url:
            return format_html('<img src="{}" style="height:50px; border-radius:4px;" />', url)
        return '—'
    preview_image.short_description = 'Preview'


# ─────────────────────────────────────────────────────────────
# ORDER
# ─────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0
    readonly_fields = ['price', 'get_cost_display']

    def get_cost_display(self, obj):
        return f'₹{obj.get_cost():.2f}'
    get_cost_display.short_description = 'Line Total'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'full_name', 'email', 'city',
        'status', 'paid', 'payment_method',
        'total_display', 'created'
    ]
    list_filter = ['paid', 'status', 'payment_method', 'created', 'updated']
    list_editable = ['status', 'paid']
    search_fields = ['first_name', 'last_name', 'email', 'address']
    readonly_fields = ['created', 'updated', 'razorpay_order_id', 'razorpay_payment_id']
    inlines = [OrderItemInline]
    ordering = ['-created']

    def full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'
    full_name.short_description = 'Customer'

    def total_display(self, obj):
        return f'₹{obj.get_total_cost():.2f}'
    total_display.short_description = 'Total'


# ─────────────────────────────────────────────────────────────
# COUPON
# ─────────────────────────────────────────────────────────────

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'discount', 'active', 'valid_from', 'valid_to', 'usage_count'
    ]
    list_filter = ['active', 'valid_from', 'valid_to']
    list_editable = ['active']
    search_fields = ['code']
    ordering = ['-valid_to']

    def usage_count(self, obj):
        return obj.orders.count()
    usage_count.short_description = 'Times Used'


# ─────────────────────────────────────────────────────────────
# REVIEW
# ─────────────────────────────────────────────────────────────

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'short_comment', 'created']
    list_filter = ['rating', 'created']
    search_fields = ['comment', 'user__username', 'product__name']
    ordering = ['-created']
    readonly_fields = ['created']

    def short_comment(self, obj):
        return obj.comment[:60] + ('…' if len(obj.comment) > 60 else '')
    short_comment.short_description = 'Comment'


# ─────────────────────────────────────────────────────────────
# WISHLIST
# ─────────────────────────────────────────────────────────────

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'added_date']
    list_filter = ['added_date']
    search_fields = ['user__username', 'product__name']
    ordering = ['-added_date']


# ─────────────────────────────────────────────────────────────
# CONTACT INQUIRY
# ─────────────────────────────────────────────────────────────

@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'resolved', 'created_at']
    list_filter = ['resolved', 'created_at']
    list_editable = ['resolved']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
