
## Live 3D preview behavior

- Selecting **Pahari Painting** maps the selected historical artwork image onto the framed 3D artwork surface.
- Selecting **Indian Pottery** switches the preview to a 3D clay vessel with an earthy finish and decorative bands.
- Selecting **Kashmiri Pashmina** switches the preview to a softly folded 3D textile form and maps the pashmina reference photo onto that cloth surface; it does not leave a framed painting in the preview.
- Palette selection lightly tints the surface, frame finish updates the frame, material updates surface response, and width/height sliders change the model proportions.
- The selected art reference image is loaded from Wikimedia Commons over the internet. The reference gallery and 3D texture therefore require an internet connection.

### Preview reliability update

The 3D preview now loads heritage photos without suspending or crashing the WebGL scene. If Wikimedia is unreachable or a particular image URL fails, the preview keeps a locally generated textile/art fallback texture instead of turning the entire scene black. When the reference image loads successfully, it replaces the fallback automatically.
