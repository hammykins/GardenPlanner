# Known Issues

## Dependencies

### leaflet-draw: `_flat` deprecation warning

**Issue:** Warning in console about deprecated use of `_flat` method:
```
Deprecated use of _flat, please use L.LineUtil.isFlat instead.
```

**Status:** Waiting for upstream fix in leaflet-draw
- This warning comes from leaflet-draw still using the deprecated `_flat` method
- Not a functional issue, just a deprecation warning
- Will be resolved when leaflet-draw updates to use `L.LineUtil.isFlat`

**Track Progress:**
- Issue on leaflet-draw GitHub repository
- Update leaflet-draw once a new version is released that fixes this

Last checked: August 29, 2025
