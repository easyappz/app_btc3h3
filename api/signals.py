from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count

from .models import Review, SellerStats, Message, Conversation


def _recalculate_seller_stats(seller_id: int) -> None:
    agg = Review.objects.filter(seller_id=seller_id).aggregate(
        rating_avg=Avg("rating"), rating_count=Count("id")
    )
    stats, _ = SellerStats.objects.get_or_create(seller_id=seller_id)
    stats.rating_avg = float(agg["rating_avg"]) if agg["rating_avg"] is not None else 0.0
    stats.rating_count = int(agg["rating_count"] or 0)
    stats.save(update_fields=["rating_avg", "rating_count", "updated_at"])


@receiver(post_save, sender=Review)
def on_review_saved(sender, instance: Review, **kwargs):
    _recalculate_seller_stats(instance.seller_id)


@receiver(post_delete, sender=Review)
def on_review_deleted(sender, instance: Review, **kwargs):
    _recalculate_seller_stats(instance.seller_id)


@receiver(post_save, sender=Message)
def on_message_saved(sender, instance: Message, created: bool, **kwargs):
    # Update conversation's last_message_at whenever new message appears
    if created:
        Conversation.objects.filter(id=instance.conversation_id).update(last_message_at=instance.created_at)
