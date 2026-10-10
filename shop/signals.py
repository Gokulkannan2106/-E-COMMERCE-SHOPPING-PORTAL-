"""
Django signals for the shop app.
Currently handles post-order creation notifications and
pre-delete cleanup.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Order, OrderItem, Product


@receiver(post_save, sender=Order)
def log_order_creation(sender, instance, created, **kwargs):
    """Called whenever an Order is saved (created or updated)."""
    if created:
        # Future hook: send confirmation email, trigger inventory update, etc.
        pass


@receiver(post_delete, sender=OrderItem)
def restore_product_on_item_delete(sender, instance, **kwargs):
    """
    Future hook: restore stock count when an order item is removed.
    Requires a `stock` field on Product.
    """
    pass
