#!/usr/bin/env python
import os
import sys
import types

# Comprehensive monkeypatch for versatileimagefield to avoid libmagic dependency
import compat

versatileimagefield_mod = types.ModuleType('versatileimagefield')
versatileimagefield_mod.__path__ = []
fields_mod = types.ModuleType('versatileimagefield.fields')
files_mod = types.ModuleType('versatileimagefield.files')
mixins_mod = types.ModuleType('versatileimagefield.mixins')
datastructures_mod = types.ModuleType('versatileimagefield.datastructures')
sizedimage_mod = types.ModuleType('versatileimagefield.datastructures.sizedimage')
utils_mod = types.ModuleType('versatileimagefield.utils')

fields_mod.VersatileImageField = compat.VersatileImageField
fields_mod.VersatileImageFieldFile = compat.VersatileImageFieldFile
fields_mod.VersatileImageFileDescriptor = compat.VersatileImageFileDescriptor
files_mod.VersatileImageFieldFile = compat.VersatileImageFieldFile
files_mod.VersatileImageFileDescriptor = compat.VersatileImageFileDescriptor
mixins_mod.VersatileImageMixIn = compat.VersatileImageMixIn
datastructures_mod.FilterLibrary = compat.FilterLibrary
sizedimage_mod.SizedImage = compat.SizedImage
utils_mod.get_resized_path = lambda *a, **kw: ''

sys.modules['versatileimagefield'] = versatileimagefield_mod
sys.modules['versatileimagefield.fields'] = fields_mod
sys.modules['versatileimagefield.files'] = files_mod
sys.modules['versatileimagefield.mixins'] = mixins_mod
sys.modules['versatileimagefield.datastructures'] = datastructures_mod
sys.modules['versatileimagefield.datastructures.sizedimage'] = sizedimage_mod
sys.modules['versatileimagefield.utils'] = utils_mod

# Monkeypatch drf_spectacular.utils.extend_tags (removed in newer versions)
import drf_spectacular.utils
drf_spectacular.utils.extend_tags = compat.extend_tags


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
