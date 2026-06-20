from django.db import models


class VersatileImageField(models.ImageField):
    pass


class VersatileImageFieldFile:
    pass


class VersatileImageFileDescriptor:
    pass


class VersatileImageMixIn:
    pass


class FilterLibrary:
    pass


class SizedImage:
    pass


def get_resized_path(*args, **kwargs):
    return ""


def extend_tags(tags):
    def decorator(obj):
        return obj
    return decorator
