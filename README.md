# US Districts Autoupdate

GitHub action that creates a GeoJSON file
compiling all the federal Congressional districts from 
[unitedstates/districts](https://github.com/unitedstates/districts)
into a single FeatureCollection.

This GitHub action complements the [Hear Ye](https://hearye.us/)
app, featuring what your neighbors think of a piece of legislature
and to see if your representatives misrepresent their constituents.

---
### Usage

```yaml
uses: Andrew-Chen-Wang/district-autupdate@v1
with:
  path: ./districts.geojson # Required path to a GeoJSON file to save
```

There is an optional link option which allows you to specify
a specific archived zip file from the unitedstates/districts
repository. So long as it's a ZIP file with the same formats
as the original repository, you should be good to go.

---

### Credit and License

Created by [Andrew-Chen-Wang](https://github.com/Andrew-Chen-Wang)

The full license text can be found at the [LICENSE](./LICENSE) file

```text
Copyright 2021 Andrew Chen Wang

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
