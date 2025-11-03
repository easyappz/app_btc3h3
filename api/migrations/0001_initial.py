from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Make',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=64, unique=True)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=128, unique=True)),
                ('region', models.CharField(blank=True, default='', max_length=128)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='CarModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='models', to='api.make')),
            ],
            options={'ordering': ['make__name', 'name']},
        ),
        migrations.AddIndex(
            model_name='carmodel',
            index=models.Index(fields=['make', 'name'], name='idx_carmodel_make_name'),
        ),
        migrations.AlterUniqueTogether(
            name='carmodel',
            unique_together={('make', 'name')},
        ),
        migrations.CreateModel(
            name='Listing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.PositiveSmallIntegerField(db_index=True)),
                ('price', models.DecimalField(db_index=True, decimal_places=2, max_digits=12)),
                ('mileage', models.PositiveIntegerField(db_index=True)),
                ('transmission', models.CharField(choices=[('MANUAL', 'Manual'), ('AUTO', 'Automatic'), ('CVT', 'CVT'), ('ROBOT', 'Robot')], db_index=True, max_length=10)),
                ('fuel', models.CharField(choices=[('GASOLINE', 'Gasoline'), ('DIESEL', 'Diesel'), ('HYBRID', 'Hybrid'), ('ELECTRIC', 'Electric')], db_index=True, max_length=10)),
                ('body', models.CharField(choices=[('SEDAN', 'Sedan'), ('HATCHBACK', 'Hatchback'), ('SUV', 'SUV'), ('COUPE', 'Coupe'), ('WAGON', 'Wagon'), ('PICKUP', 'Pickup'), ('VAN', 'Van')], db_index=True, max_length=10)),
                ('drive', models.CharField(choices=[('FWD', 'FWD'), ('RWD', 'RWD'), ('AWD', 'AWD')], db_index=True, max_length=10)),
                ('condition', models.CharField(choices=[('NEW', 'New'), ('USED', 'Used')], db_index=True, max_length=10)),
                ('color', models.CharField(db_index=True, max_length=32)),
                ('owners_count', models.PositiveSmallIntegerField(db_index=True, default=0)),
                ('vin', models.CharField(blank=True, db_index=True, max_length=32, null=True)),
                ('title', models.CharField(db_index=True, max_length=140)),
                ('description', models.TextField(blank=True, default='')),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], db_index=True, default='PENDING', max_length=10)),
                ('rejection_reason', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('car_model', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='listings', to='api.carmodel')),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='listings', to='api.location')),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='listings', to='api.make')),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='listings', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(
            model_name='listing',
            index=models.Index(fields=['make', 'car_model', 'year', 'price'], name='idx_listing_core'),
        ),
        migrations.AddIndex(
            model_name='listing',
            index=models.Index(fields=['status', 'created_at'], name='idx_listing_status_created'),
        ),
        migrations.AddConstraint(
            model_name='listing',
            constraint=models.CheckConstraint(check=Q(('price__gte', 0)), name='chk_listing_price_gte_0'),
        ),
        migrations.AddConstraint(
            model_name='listing',
            constraint=models.CheckConstraint(check=Q(('mileage__gte', 0)), name='chk_listing_mileage_gte_0'),
        ),
        migrations.AddConstraint(
            model_name='listing',
            constraint=models.CheckConstraint(check=Q(('year__gte', 1900)), name='chk_listing_year_gte_1900'),
        ),
        migrations.AddConstraint(
            model_name='listing',
            constraint=models.CheckConstraint(check=Q(('owners_count__gte', 0)), name='chk_listing_owners_gte_0'),
        ),
        migrations.CreateModel(
            name='ListingImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='listing_images/')),
                ('order', models.PositiveIntegerField(db_index=True, default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('listing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='api.listing')),
            ],
            options={'ordering': ['listing', 'order', 'id']},
        ),
        migrations.AlterUniqueTogether(
            name='listingimage',
            unique_together={('listing', 'order')},
        ),
        migrations.CreateModel(
            name='Favorite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('listing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorited_by', to='api.listing')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorites', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(
            model_name='favorite',
            index=models.Index(fields=['user', 'listing'], name='idx_fav_user_listing'),
        ),
        migrations.AlterUniqueTogether(
            name='favorite',
            unique_together={('user', 'listing')},
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField(db_index=True)),
                ('text', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews_written', to=settings.AUTH_USER_MODEL)),
                ('listing', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviews', to='api.listing')),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews_received', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(
            model_name='review',
            index=models.Index(fields=['seller', 'rating'], name='idx_review_seller_rating'),
        ),
        migrations.AddIndex(
            model_name='review',
            index=models.Index(fields=['author', 'seller'], name='idx_review_author_seller'),
        ),
        migrations.AddConstraint(
            model_name='review',
            constraint=models.CheckConstraint(check=Q(('rating__gte', 1)) & Q(('rating__lte', 5)), name='chk_review_rating_1_5'),
        ),
        migrations.CreateModel(
            name='SellerStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating_avg', models.FloatField(default=0.0)),
                ('rating_count', models.PositiveIntegerField(default=0)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('seller', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='seller_stats', to=settings.AUTH_USER_MODEL)),
            ],
            options={'verbose_name_plural': 'Seller stats'},
        ),
        migrations.AddIndex(
            model_name='sellerstats',
            index=models.Index(fields=['rating_avg', 'rating_count'], name='idx_sellerstats_rating'),
        ),
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('last_message_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('buyer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations_as_buyer', to=settings.AUTH_USER_MODEL)),
                ('listing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations', to='api.listing')),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations_as_seller', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-last_message_at', '-created_at']},
        ),
        migrations.AddIndex(
            model_name='conversation',
            index=models.Index(fields=['seller', 'buyer', 'listing'], name='idx_conv_triplet'),
        ),
        migrations.AddConstraint(
            model_name='conversation',
            constraint=models.UniqueConstraint(condition=Q(('is_active', True)), fields=('seller', 'buyer', 'listing'), name='uniq_active_conversation'),
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('read_at', models.DateTimeField(blank=True, db_index=True, null=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to=settings.AUTH_USER_MODEL)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.conversation')),
            ],
            options={'ordering': ['created_at', 'id']},
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['conversation', 'created_at'], name='idx_msg_conv_created'),
        ),
    ]
