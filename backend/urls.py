"""
URL configuration for backend project.
API routes are handled by Django REST Framework.
All other routes are forwarded to the React SPA (single-page app).
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from .views import react_app

urlpatterns = [
    # Django admin panel (accessible at /django-admin/ so /admin is reserved for React Merchant Dashboard)
    path('django-admin/', admin.site.urls),

    # REST API — all endpoints under /api/
    path('api/', include('shop.api_urls')),

    # Legacy Django template routes (moved under /legacy/ to prevent routing conflicts with React SPA)
    path('legacy/cart/', include('cart.urls', namespace='cart')),
    path('legacy/shop/', include('shop.urls', namespace='shop')),

    # ─── React SPA catch-all ─────────────────────────────────
    # Serves index.html for all frontend routes:
    # (e.g. /, /shop, /product/1, /cart, /checkout, /orders, /wishlist, /profile, /contact, /login, /register, /admin)
    re_path(r'^(?!api/|django-admin/|legacy/|static/|media/).*$', react_app),
]

# Serve uploaded media files and static files in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'staticfiles')
