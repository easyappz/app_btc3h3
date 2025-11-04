from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_userprofile"),
    ]

    operations = [
        migrations.AlterField(
            model_name="listingimage",
            name="image",
            field=models.FileField(upload_to="listing_images/"),
        ),
    ]
