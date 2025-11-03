import django_filters
from django.db.models import Q

from .models import Listing


class ListingFilter(django_filters.FilterSet):
    year_min = django_filters.NumberFilter(field_name="year", lookup_expr="gte")
    year_max = django_filters.NumberFilter(field_name="year", lookup_expr="lte")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    mileage_max = django_filters.NumberFilter(field_name="mileage", lookup_expr="lte")
    owners_count_max = django_filters.NumberFilter(field_name="owners_count", lookup_expr="lte")
    make = django_filters.CharFilter(field_name="make__name", lookup_expr="iexact")
    model = django_filters.CharFilter(field_name="car_model__name", lookup_expr="iexact")
    transmission = django_filters.CharFilter(field_name="transmission", lookup_expr="iexact")
    fuel = django_filters.CharFilter(field_name="fuel", lookup_expr="iexact")
    body = django_filters.CharFilter(field_name="body", lookup_expr="iexact")
    drive = django_filters.CharFilter(field_name="drive", lookup_expr="iexact")
    color = django_filters.CharFilter(field_name="color", lookup_expr="iexact")
    location = django_filters.CharFilter(field_name="location__name", lookup_expr="icontains")

    q = django_filters.CharFilter(method="filter_q")

    class Meta:
        model = Listing
        fields = []

    def filter_q(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(title__icontains=value) | Q(description__icontains=value))
