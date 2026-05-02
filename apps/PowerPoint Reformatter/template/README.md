# Mays PowerPoint Template

`mays-template.pptx` is the 2024 Mays PowerPoint template Hari shared. It is
the canonical reference for slide masters, theme colors, and layout choices
used by the PowerPoint Reformatter app.

The template's theme is named "Aggie Maroon". The reformatter does NOT load
this file at request time. Instead it generates a new deck from scratch via
`pptxgenjs`, applying the Mays brand contract (Aggie Maroon `#500000`,
Oswald headings, Work Sans body, sharp 0px corners). We chose to generate
from scratch rather than reuse the template masters because pptxgenjs has
limited support for layout-master inheritance and we need precise control
over every shape, color, and font on the output deck. The template stays
checked in for two reasons:

1. It is the visual reference any future iteration should match.
2. A later version of the reformatter may parse the template's masters or
   embed the template's logos directly.

The full source PowerPoint is in `apps/PowerPoint Reformatter/uploads/` at
runtime (gitignored). Outputs land in `data/pptx-outputs/` (also
gitignored).
